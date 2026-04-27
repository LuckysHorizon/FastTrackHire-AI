import os
import logging
import httpx
import asyncio
import base64
from typing import List
from pydantic import BaseModel

logger = logging.getLogger("fasttrack.judge0")

class TestCase(BaseModel):
    id: int
    input_raw: str
    expected_output: str
    is_hidden: bool = False
    description: str = ""
    explanation: str = ""

class TestCaseResult(BaseModel):
    test_case_id: int
    passed: bool
    actual_output: str = ""
    expected_output: str
    input_raw: str = ""
    runtime_ms: float = None
    memory_kb: float = None
    status: str
    stderr: str = ""
    is_hidden: bool = False

class Judge0Service:
    def __init__(self):
        self.api_url = os.getenv("JUDGE0_API_URL", "https://server-production-d08e.up.railway.app")
        self.api_key = os.getenv("JUDGE0_API_KEY", "")
        self.timeout = int(os.getenv("JUDGE0_TIMEOUT", "15"))

        self.headers = {"Content-Type": "application/json"}
        if self.api_key:
            self.headers["X-RapidAPI-Key"] = self.api_key
            self.headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com"

        logger.info(f"Judge0 configured: {self.api_url}")

    async def run_test_cases(
        self,
        source_code: str,
        language_id: int,
        test_cases: List[TestCase],
    ) -> List[TestCaseResult]:

        semaphore = asyncio.Semaphore(3)

        async with httpx.AsyncClient(timeout=60.0) as client:
            tasks = [
                self._run_single_test(client, semaphore, source_code, language_id, tc)
                for tc in test_cases
            ]
            return await asyncio.gather(*tasks)

    async def _run_single_test(
        self,
        client: httpx.AsyncClient,
        semaphore: asyncio.Semaphore,
        source_code: str,
        language_id: int,
        test_case: TestCase,
    ) -> TestCaseResult:

        async with semaphore:
            payload = {
                "source_code": base64.b64encode(source_code.encode()).decode(),
                "language_id": language_id,
                "stdin": base64.b64encode(test_case.input_raw.encode()).decode(),
                "expected_output": base64.b64encode(test_case.expected_output.strip().encode()).decode(),
                "cpu_time_limit": self.timeout,
                "memory_limit": 256000,
            }

            # Retry up to 2 times on transient failures
            for attempt in range(3):
                try:
                    response = await client.post(
                        f"{self.api_url}/submissions?base64_encoded=true&wait=true&fields=stdout,stderr,status,time,memory,compile_output",
                        json=payload,
                        headers=self.headers,
                        timeout=self.timeout + 15,
                    )

                    if response.status_code in [200, 201]:
                        break
                    elif response.status_code >= 500 and attempt < 2:
                        logger.warning(f"Judge0 returned {response.status_code}, retrying (attempt {attempt + 1})")
                        await asyncio.sleep(1 * (attempt + 1))
                        continue
                    else:
                        return self._error_result(test_case, f"Judge0 HTTP {response.status_code}: {response.text[:200]}")

                except httpx.TimeoutException:
                    if attempt < 2:
                        logger.warning(f"Judge0 timeout, retrying (attempt {attempt + 1})")
                        await asyncio.sleep(1 * (attempt + 1))
                        continue
                    return self._error_result(test_case, "Execution timed out after retries")
                except httpx.ConnectError:
                    if attempt < 2:
                        await asyncio.sleep(1 * (attempt + 1))
                        continue
                    return self._error_result(test_case, "Could not connect to Judge0 service")
                except Exception as e:
                    logger.error(f"Judge0 unexpected error: {e}")
                    return self._error_result(test_case, str(e))

            try:
                data = response.json()
            except Exception:
                return self._error_result(test_case, "Invalid response from Judge0")

            status_desc = data.get("status", {}).get("description", "Unknown")
            actual_output = self._decode(data.get("stdout")).strip()
            expected_clean = test_case.expected_output.strip()
            passed = self._compare_output(actual_output, expected_clean)

            return TestCaseResult(
                test_case_id=test_case.id,
                passed=passed,
                actual_output=actual_output,
                expected_output=expected_clean,
                input_raw=test_case.input_raw,
                runtime_ms=float(data.get("time", 0)) * 1000 if data.get("time") else None,
                memory_kb=data.get("memory"),
                status="Accepted" if passed else status_desc,
                stderr=self._decode(data.get("stderr") or data.get("compile_output") or ""),
                is_hidden=test_case.is_hidden,
            )

    def _compare_output(self, actual: str, expected: str) -> bool:
        """Smart comparison that handles whitespace differences."""
        if actual == expected:
            return True

        def normalize(s):
            lines = [line.strip() for line in s.strip().splitlines()]
            while lines and not lines[-1]:
                lines.pop()
            return "\n".join(lines)

        return normalize(actual) == normalize(expected)

    def _decode(self, data: str) -> str:
        if not data:
            return ""
        try:
            return base64.b64decode(data).decode().strip()
        except Exception:
            return str(data).strip()

    def _error_result(self, test_case: TestCase, error: str) -> TestCaseResult:
        return TestCaseResult(
            test_case_id=test_case.id,
            passed=False,
            expected_output=test_case.expected_output,
            input_raw=test_case.input_raw,
            status="Runtime Error",
            stderr=error,
            is_hidden=test_case.is_hidden,
        )

    def get_language_id(self, language: str) -> int:
        mapping = {
            "python": 71,
            "javascript": 63,
            "java": 62,
            "cpp": 54,
            "go": 60,
        }
        return mapping.get(language.lower(), 71)

judge0_service = Judge0Service()
