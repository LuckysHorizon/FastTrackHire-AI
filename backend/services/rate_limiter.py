import time
import asyncio
from collections import deque
from fastapi import HTTPException
from typing import Dict, Tuple

class RateLimiter:
    def __init__(self):
        self.windows: Dict[Tuple[str, str], deque] = {}
        self.lock = asyncio.Lock()
        
        # Define limits
        self.limits = {
            "generate_question": (1, 30),  # (max_requests, window_seconds)
            "run_code": (5, 60),
            "submit_code": (2, 300),
            "groq_global": (20, 60)
        }

    async def check_limit(self, user_id: str, action: str):
        async with self.lock:
            now = time.time()
            
            # Check Global Groq Limit first if applicable
            if action in ["generate_question", "submit_code"]:
                await self._verify_window("global", "groq_global", now)
            
            # Check User Action Limit
            await self._verify_window(user_id, action, now)

    async def _verify_window(self, key_id: str, action: str, now: float):
        limit, window_size = self.limits[action]
        key = (key_id, action)
        
        if key not in self.windows:
            self.windows[key] = deque()
            
        window = self.windows[key]
        
        # Clean up expired timestamps
        while window and window[0] <= now - window_size:
            window.popleft()
            
        if len(window) >= limit:
            reset_in = int(window[0] + window_size - now)
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Rate limit exceeded",
                    "action": action,
                    "reset_in_seconds": reset_in,
                    "limit": limit
                },
                headers={
                    "Retry-After": str(reset_in),
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0"
                }
            )
            
        window.append(now)

rate_limiter = RateLimiter()
