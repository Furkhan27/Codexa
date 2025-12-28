import json
from google.genai import types
from dotenv import load_dotenv
from utils.ai_client_util import gemini as client

load_dotenv()


class DeveloperAgent:
    """
    Generates a multi-folder, full-stack project:
    - Frontend: React + TypeScript (TSX)
    - Backend: FastAPI (Python)
    - Database: MongoDB
    Returns STRICT JSON only.
    """

    def __init__(self, model_name="gemini-3-pro-preview"):
        self.client = client
        self.model_name = model_name

    def _parse_llm_output(self, raw):
       

        import re

        # ✅ Already parsed
        if isinstance(raw, dict):
            return raw

        # ❌ Unexpected type
        if not isinstance(raw, str):
            raise TypeError(f"Unexpected LLM output type: {type(raw)}")

        raw = raw.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()

        # Check for balanced curly braces before parsing
        def braces_balanced(s):
            return s.count('{') == s.count('}')

        # Try direct parse first
        if braces_balanced(raw):
            try:
                return json.loads(raw)
            except json.JSONDecodeError:
                pass
        else:
            print("❌ LLM output has unbalanced curly braces. Likely incomplete JSON.")
            raise ValueError("LLM output is incomplete or truncated. Please try again or reduce output size.")

        # Try to extract first JSON object using regex
        json_match = re.search(r'\{[\s\S]*\}', raw)
        if json_match:
            json_str = json_match.group(0)
            if not braces_balanced(json_str):
                print("❌ Extracted JSON string has unbalanced braces. Likely incomplete JSON.")
                raise ValueError("Extracted JSON is incomplete or truncated. Please try again or reduce output size.")
            try:
                return json.loads(json_str)
            except json.JSONDecodeError as e:
                print("❌ Regex-extracted JSON still invalid:", e)
                print("Extracted JSON string:\n", json_str)

        # 🔥 Fix common LLM escape issues (\' etc.)
        cleaned = raw.replace("\\'", "'")
        if braces_balanced(cleaned):
            try:
                return json.loads(cleaned)
            except json.JSONDecodeError as e:
                print("❌ All attempts to parse LLM output as JSON failed:", e)
                print("Raw output:\n", raw)
                raise e
        else:
            print("❌ Cleaned LLM output has unbalanced curly braces. Likely incomplete JSON.")
            raise ValueError("LLM output is incomplete or truncated after cleaning. Please try again or reduce output size.")

    def _generate_json(self, prompt: str) -> dict:
        config = types.GenerateContentConfig(
            temperature=0.2,
            max_output_tokens=100000,
        )

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=config,
        )

        raw = getattr(response, "text", None)

        if raw is None:
            raise RuntimeError("LLM returned no text output")

        try:
            return self._parse_llm_output(raw)
        except Exception as e:
            print("❌ Failed to parse JSON from DeveloperAgent")
            print("Raw output:\n", raw)
            raise e

    def generate_project(self, project_name: str, steps: list, user_message: str):
        print("🧑‍💻 DeveloperAgent generating full-stack project...")

        prompt = f"""
You are a senior full-stack engineer and product developer.

You behave like:
- Lovable.dev
- Bolt.new
- Google AI Studio (Code generation mode)

Your mindset:
- You think in terms of real products, not demos
- You generate the MINIMUM number of files required to build a complete, working product
- Every file you generate must have a clear purpose
- You avoid unnecessary abstraction
- You follow real-world best practices
- You assume another developer will run this project immediately
- You assume the project will be executed automatically without manual fixes

Decision rules:
- Do NOT over-engineer
- Do NOT create unused files
- Do NOT repeat logic
- Prefer clarity over cleverness
- Prefer fewer files over many files (but never fewer than required)
- Prefer stability over novelty

You are confident, opinionated, and precise.
You think like a platform engineer, not a tutorial author.

Your task is to generate a REAL, PRODUCTION-READY,
MULTI-FOLDER FULL-STACK SOFTWARE PROJECT.

USER IDEA:
{user_message}

PROJECT PLAN:
"""
        for step in steps:
            prompt += f"- {step}\n"
        prompt += """
STRICT REQUIREMENTS (DO NOT VIOLATE):

================================================
GENERAL RULES:
================================================
- Generate REAL, runnable code
- NO placeholders
- NO inline CSS
- NO Tailwind CSS
- NO Create React App
- NO Next.js
- NO explanations
- NO markdown
- NO comments
- RETURN ONLY VALID JSON
- Assume the code will be executed immediately after generation

================================================
FRONTEND REQUIREMENTS (VERY STRICT):
================================================
- Framework: React 18 + Vite
- Language: TypeScript (TSX)
- Backend Port: 7979
- Styling: Plain external CSS files ONLY
- Entry file: src/main.tsx (Vite standard)
- Functional components only
- Clean and realistic UI (via CSS files only)

DEPENDENCY STABILITY RULES (NON-NEGOTIABLE):
- NEVER use "latest", "^", "~", or loose semver ranges
- ALL dependencies MUST be pinned to exact versions
- Use only stable, widely adopted versions
- Avoid experimental, beta, or recently released versions
- Avoid unnecessary build tools, polyfills, or Babel plugins
- Minimize transitive dependencies

REACT + VITE SAFE BASELINE (FOLLOW THIS):
- react: 18.2.0
- react-dom: 18.2.0
- vite: 5.0.x (stable)
- @vitejs/plugin-react: 4.x (stable)
- @types/react: pinned
- @types/react-dom: pinned

Do NOT add extra frontend dependencies unless absolutely required.

================================================
FRONTEND STRUCTURE (MUST MATCH EXACTLY):
================================================
frontend/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.node.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── components/
    └── pages/

================================================
BACKEND REQUIREMENTS:
================================================
- Language: Python
- Framework: FastAPI
- Database: MongoDB (motor or pymongo)
- Proper API routing
- Proper project structure
- Entry point MUST be backend/main.py with `app = FastAPI()`
- Backend must be runnable without modification

================================================
BACKEND STRUCTURE (MUST MATCH):
================================================
backend/
├── main.py
├── requirements.txt
├── app/
│   ├── __init__.py
│   ├── database.py
│   ├── models.py
│   ├── routes.py
│   └── schemas.py

================================================
OUTPUT FORMAT (VERY IMPORTANT):
================================================
RETURN ONLY VALID JSON IN THIS EXACT FORMAT:

{
    "project_type": "fullstack",
    "structure": [
        {
            "type": "folder",
            "name": "frontend",
            "children": []
        },
        {
            "type": "folder",
            "name": "backend",
            "children": []
        }
    ]
}

RULES FOR FILES ARRAY:
- Every required file must be included
- Each file must contain FULL, VALID code
- File paths must be valid (no spaces, no special characters)
- CSS must be in .css files ONLY
- The project MUST run without manual dependency fixes
"""


        project_json = self._generate_json(prompt)

        # ✅ Sanity check
        if not isinstance(project_json, dict):
            raise RuntimeError("DeveloperAgent output is not a JSON object")

        if "structure" not in project_json:
            raise RuntimeError("DeveloperAgent output missing 'structure'")

        return project_json
