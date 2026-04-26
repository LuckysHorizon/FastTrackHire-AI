import os
import json
from groq import Groq
from typing import Dict, Any, List
from fastapi import HTTPException

class GroqCodingService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=self.api_key) if self.api_key else None
        self.model = "llama-3.1-8b-instant"

    async def generate_coding_question(self, resume_text: str, company: str, language: str) -> Dict[str, Any]:
        if not self.client:
            raise HTTPException(500, "Groq client not configured")

        system_prompt = f"""You are a senior technical interviewer at {company}. 
You create coding challenges calibrated to {company}'s interview bar.
You MUST respond with ONLY valid JSON. No markdown fences, no explanation, no text outside the JSON object.
The JSON must be parseable by Python's json.loads() directly."""

        user_prompt = f"""Candidate Resume (abbreviated): {resume_text[:1500]}
Target Company: {company}
Language: {language}

Create a medium-difficulty coding problem. Return this EXACT JSON structure:

{{
  "title": "Descriptive Problem Title",
  "difficulty": "medium",
  "topic_tags": ["Arrays", "HashMap"],
  "estimated_minutes": 25,
  "problem_statement": "## Problem\\n\\nGiven an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\\n\\n### Example 1\\n```\\nInput: nums = [2,7,11,15], target = 9\\nOutput: [0,1]\\nExplanation: nums[0] + nums[1] = 2 + 7 = 9\\n```\\n\\n### Example 2\\n```\\nInput: nums = [3,2,4], target = 6\\nOutput: [1,2]\\n```\\n\\n### Constraints\\n- 2 <= nums.length <= 10^4\\n- -10^9 <= nums[i] <= 10^9",
  "function_signature": {{
    "python": "def solution(nums, target):",
    "javascript": "function solution(nums, target) {{",
    "java": "public int[] solution(int[] nums, int target) {{",
    "cpp": "vector<int> solution(vector<int>& nums, int target) {{",
    "go": "func solution(nums []int, target int) []int {{"
  }},
  "boilerplate": {{
    "python": "import sys\\nfrom typing import List\\n\\ndef solution(nums, target):\\n    # Your code here\\n    pass\\n\\n# Read input\\nif __name__ == '__main__':\\n    line1 = input().split()\\n    nums = list(map(int, line1))\\n    target = int(input())\\n    result = solution(nums, target)\\n    print(result)",
    "javascript": "const readline = require('readline');\\nconst rl = readline.createInterface({{ input: process.stdin }});\\nconst lines = [];\\nrl.on('line', l => lines.push(l));\\nrl.on('close', () => {{\\n    const nums = lines[0].split(' ').map(Number);\\n    const target = parseInt(lines[1]);\\n    console.log(solution(nums, target));\\n}});\\n\\nfunction solution(nums, target) {{\\n    // Your code here\\n}}",
    "java": "import java.util.*;\\nimport java.io.*;\\n\\npublic class Main {{\\n    public static void main(String[] args) {{\\n        Scanner sc = new Scanner(System.in);\\n        String[] parts = sc.nextLine().split(\\\" \\\");\\n        int[] nums = new int[parts.length];\\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\\n        int target = sc.nextInt();\\n        System.out.println(Arrays.toString(solution(nums, target)));\\n    }}\\n\\n    public static int[] solution(int[] nums, int target) {{\\n        // Your code here\\n        return new int[]{{}};\\n    }}\\n}}",
    "cpp": "#include <iostream>\\n#include <vector>\\n#include <sstream>\\nusing namespace std;\\n\\nvector<int> solution(vector<int>& nums, int target) {{\\n    // Your code here\\n    return {{}};\\n}}\\n\\nint main() {{\\n    string line;\\n    getline(cin, line);\\n    istringstream iss(line);\\n    vector<int> nums;\\n    int x;\\n    while (iss >> x) nums.push_back(x);\\n    cin >> x;\\n    auto res = solution(nums, x);\\n    for (int i = 0; i < res.size(); i++) cout << res[i] << (i+1<res.size()? \\\" \\\" : \\\"\\\");\\n    cout << endl;\\n    return 0;\\n}}",
    "go": "package main\\n\\nimport (\\n    \\"fmt\\"\\n    \\"bufio\\"\\n    \\"os\\"\\n    \\"strconv\\"\\n    \\"strings\\"\\n)\\n\\nfunc solution(nums []int, target int) []int {{\\n    // Your code here\\n    return nil\\n}}\\n\\nfunc main() {{\\n    reader := bufio.NewReader(os.Stdin)\\n    line, _ := reader.ReadString('\\\\n')\\n    parts := strings.Fields(strings.TrimSpace(line))\\n    nums := make([]int, len(parts))\\n    for i, p := range parts {{ nums[i], _ = strconv.Atoi(p) }}\\n    line2, _ := reader.ReadString('\\\\n')\\n    target, _ := strconv.Atoi(strings.TrimSpace(line2))\\n    fmt.Println(solution(nums, target))\\n}}"
  }},
  "visible_test_cases": [
    {{
      "id": 1,
      "description": "Basic case",
      "input_raw": "2 7 11 15\\n9",
      "expected_output": "[0, 1]",
      "explanation": "nums[0] + nums[1] = 2 + 7 = 9"
    }},
    {{
      "id": 2,
      "description": "Another basic case",
      "input_raw": "3 2 4\\n6",
      "expected_output": "[1, 2]",
      "explanation": "nums[1] + nums[2] = 2 + 4 = 6"
    }},
    {{
      "id": 3,
      "description": "Edge case",
      "input_raw": "3 3\\n6",
      "expected_output": "[0, 1]",
      "explanation": "Both elements are the same"
    }}
  ],
  "hidden_test_cases": [
    {{
      "id": 4,
      "input_raw": "1 5 3 7 2\\n8",
      "expected_output": "[0, 3]"
    }},
    {{
      "id": 5,
      "input_raw": "-1 -2 -3 -4 -5\\n-8",
      "expected_output": "[2, 4]"
    }}
  ],
  "hints": [
    "Think about how to reduce the lookup time for complement values.",
    "A hash map can store values you've already seen.",
    "For each element, check if target - element exists in the map."
  ],
  "optimal_approach": "Use a hash map to store each number's index. For each element, check if target - element exists in the map.",
  "time_complexity": "O(N)",
  "space_complexity": "O(N)"
}}

IMPORTANT RULES:
1. The boilerplate MUST include stdin/stdout handling so Judge0 can execute it
2. input_raw uses newlines (\\n) to separate lines of input
3. expected_output must EXACTLY match what stdout prints (including brackets, spaces)
4. Generate 3 visible test cases and 2-3 hidden test cases
5. Make the problem relevant to {company}'s typical interview style
6. Do NOT copy the example above - create a UNIQUE problem
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            result = json.loads(response.choices[0].message.content)
            
            # Validate required fields
            required = ["title", "difficulty", "problem_statement", "boilerplate", "visible_test_cases"]
            for field in required:
                if field not in result:
                    raise HTTPException(500, f"Generated question missing field: {field}")
            
            return result
        except json.JSONDecodeError as e:
            raise HTTPException(500, f"Failed to parse Groq response as JSON: {str(e)}")
        except Exception as e:
            raise HTTPException(500, f"Error generating question: {str(e)}")

    async def evaluate_submission(
        self,
        question_title: str,
        user_code: str,
        language: str,
        test_results: List[Any],
        time_taken_seconds: int
    ) -> Dict[str, Any]:
        
        if not self.client:
            raise HTTPException(500, "Groq client not configured")

        passed_count = len([r for r in test_results if r.passed])
        total_count = len(test_results)
        
        system_prompt = """You are a senior staff engineer at a top tech company conducting a rigorous code review.
You MUST respond with ONLY valid JSON. No markdown, no text outside the JSON."""
        
        user_prompt = f"""Evaluate this coding submission:

Problem: {question_title}
Language: {language}
Time Taken: {time_taken_seconds // 60}m {time_taken_seconds % 60}s
Test Results: {passed_count}/{total_count} passed

Submitted Code:
```{language}
{user_code}
```

Return this EXACT JSON structure:
{{
  "overall_score": <0-100>,
  "correctness_score": <0-40 based on test pass rate>,
  "quality_score": <0-30 based on code readability, naming, structure>,
  "efficiency_score": <0-20 based on algorithmic efficiency>,
  "time_score": <0-10 based on completion speed>,
  "verdict": "Accepted" or "Partial" or "Wrong Answer" or "Time Limit",
  "summary": "2-3 sentence evaluation of the solution",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "complexity_analysis": {{
    "user_time": "O(?)",
    "user_space": "O(?)",
    "is_optimal": true/false,
    "explanation": "Brief analysis"
  }}
}}

Scoring guidelines:
- correctness_score: ({passed_count}/{total_count}) * 40
- If all tests pass, minimum overall_score should be 60
- If no tests pass, maximum overall_score should be 30
- Be fair but rigorous
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            result = json.loads(response.choices[0].message.content)
            
            # Ensure required fields with defaults
            defaults = {
                "overall_score": 0, "correctness_score": 0, "quality_score": 0,
                "efficiency_score": 0, "time_score": 0, "verdict": "Error",
                "summary": "Evaluation completed.", "strengths": [], "improvements": [],
                "complexity_analysis": {"user_time": "N/A", "user_space": "N/A", "is_optimal": False}
            }
            for k, v in defaults.items():
                if k not in result:
                    result[k] = v
                    
            return result
        except Exception as e:
            # Return a fallback evaluation instead of crashing
            return {
                "overall_score": int((passed_count / max(total_count, 1)) * 60),
                "correctness_score": int((passed_count / max(total_count, 1)) * 40),
                "quality_score": 10, "efficiency_score": 5, "time_score": 5,
                "verdict": "Accepted" if passed_count == total_count else "Partial",
                "summary": f"Passed {passed_count}/{total_count} test cases. AI evaluation unavailable.",
                "strengths": ["Code submitted successfully"],
                "improvements": ["AI evaluation service error - manual review recommended"],
                "complexity_analysis": {"user_time": "N/A", "user_space": "N/A", "is_optimal": False}
            }

groq_coding_service = GroqCodingService()
