import re
import os
import time
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("❌ GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=api_key)


class PlannerAgent:
    """
    Generates step-by-step project plans using Gemini API.
    Includes retry + backoff for model overload (503) and safe fallbacks.
    """

    def __init__(
        self,
        model_name="gemini-2.5-flash-lite",
        max_output_tokens=2000,
        max_retries=3,
        retry_delays=(2, 5, 10),  # seconds
    ):
        self.model_name = model_name
        self.client = client
        self.max_output_tokens = max_output_tokens
        self.max_retries = max_retries
        self.retry_delays = retry_delays

    # --------------------------------------------------
    # TITLE EXTRACTION
    # --------------------------------------------------
    def extract_title(self, raw_text: str) -> str:
        if not raw_text:
            return "Untitled Project"

        patterns = [
            r"\*\*Project Title[:\- ]*(.*?)\*\*",
            r"Project Title[:\- ]*(.*)",
            r"Title[:\- ]*(.*)",
        ]

        for pattern in patterns:
            m = re.search(pattern, raw_text, re.IGNORECASE)
            if m:
                return m.group(1).strip()

        m = re.search(r"\*\*(.*?)\*\*", raw_text)
        if m:
            candidate = m.group(1).strip()
            if not re.match(r"^\d+[\.\)]", candidate):
                return candidate

        for line in raw_text.splitlines():
            if line.strip():
                return line.strip()

        return "Untitled Project"

    # --------------------------------------------------
    # RESPONSE TEXT EXTRACTION
    # --------------------------------------------------
    def _extract_text_from_response(self, response) -> str | None:
        if not response:
            return None

        text = getattr(response, "text", None)
        if text and text.strip():
            return text.strip()

        candidates = getattr(response, "candidates", [])
        if candidates:
            content = getattr(candidates[0], "content", None)
            if content:
                parts = getattr(content, "parts", [])
                combined = "".join(
                    getattr(p, "text", "") for p in parts if getattr(p, "text", None)
                ).strip()
                if combined:
                    return combined

        return None

    # --------------------------------------------------
    # STEP CLEANING
    # --------------------------------------------------
    def _clean_steps(self, raw_text: str) -> list[str]:
        if not raw_text:
            return []

        steps = []
        for line in raw_text.splitlines():
            line = line.strip()
            if not line:
                continue

            clean = re.sub(r"^(\d+[\.\)]|\-|\*|\•)\s*", "", line)
            clean = re.sub(r"[*_#>`~]", "", clean).strip()
            if clean:
                steps.append(clean)

        return steps

    # --------------------------------------------------
    # MAIN PLANNING FUNCTION (WITH RETRY + BACKOFF)
    # --------------------------------------------------
    def plan(self, request: str):
        print(f"🤔 Creating plan for: '{request}'")

        prompt = (
            "You are an expert software architect. Break a medium-sized software project "
            "into clear, sequential, and actionable steps.\n"
            "Each step should represent a meaningful development milestone.\n"
            "Return only numbered steps, one per line — no explanations.\n\n"
            f"Project idea: {request}\n"
            "Also create a clear project title.\n"
        )

        config = types.GenerateContentConfig(
            temperature=0.3,
            max_output_tokens=self.max_output_tokens,
        )

        last_error = None

        for attempt in range(self.max_retries):
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=config,
                )

                raw_text = self._extract_text_from_response(response)
                if not raw_text:
                    raise RuntimeError("Empty response from model")

                title = self.extract_title(raw_text)
                steps = self._clean_steps(raw_text)

                if not steps:
                    raise RuntimeError("No valid steps extracted")

                print("📌 Extracted Title:", title)
                return {
                    "title": title,
                    "steps": steps,
                }

            except Exception as e:
                error_str = str(e)
                last_error = error_str

                # 🔹 Detect model overload / unavailable
                if "503" in error_str or "UNAVAILABLE" in error_str:
                    print(
                        f"⚠️ Model overloaded (attempt {attempt + 1}/{self.max_retries}). "
                        "Retrying..."
                    )
                    if attempt < self.max_retries - 1:
                        time.sleep(self.retry_delays[attempt])
                        continue
                    else:
                        break

                # 🔹 Other errors → do not retry blindly
                print(f"❌ Planner error: {error_str}")
                break

        # --------------------------------------------------
        # SAFE FALLBACK
        # --------------------------------------------------
        print("⚠️ Planner failed. Using fallback plan.")
        print("Last error:", last_error)

        return {
            "title": "Generic Software Project",
            "steps": [
                "Define project requirements",
                "Design system architecture",
                "Set up backend structure",
                "Implement core backend features",
                "Build frontend interface",
                "Connect frontend with backend",
                "Test and debug the application",
                "Prepare the project for deployment",
            ],
        }
