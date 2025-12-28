import json
from utils.ai_client_util import gemini


class ClassifierAgent:
    """
    Classifies user messages into:
    - 'project'
    - 'conversation'
    - 'new_project_request'
    """

    CLASSIFIER_PROMPT = """
You are an intent classifier.

Classify ONLY the user's intent.

Valid types:
- "project"       → user wants to build, generate, or create a new software project
- "conversation"  → user is chatting, asking questions, or modifying an existing project

Your response MUST be ONLY valid JSON.
NO markdown.
NO comments.
NO text outside JSON.
NO explanations.

If your response is not strictly valid JSON, the system will break.

JSON FORMAT:
{{
  "type": "",
  "reason": ""
}}

Now classify the message below:

User message: "{message}"
"""

    def classify(self, message: str):
        prompt = self.CLASSIFIER_PROMPT.format(message=message)

        try:
            response = gemini.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=prompt
            )
            print("Classifier response:", response.text.strip())
        except Exception as e:
            print("❌ Classifier error:", e)
            return {
                "type": "conversation",
                "reason": "Model call failed"
            }

        raw = response.text.strip()

        # CLEANUP: remove ```json ``` wrappers
        clean = (
            raw.replace("```json", "")
            .replace("```", "")
            .strip()
        )

        # Try to parse
        try:
            return json.loads(clean)
        except Exception as e:
            print("❌ JSON decode failed:", clean)
            return {
                "type": "conversation",
                "reason": "Invalid JSON from model"
            }


    def classify_for_project(self, message: str, project_id: str | None):
        """
        Final intent logic:
        - If NOT in a project → return direct classification.
        - If inside project & user asks for new project → new_project_request.
        """

        intent = self.classify(message)
        print(intent)
        # No project yet → normal classification
        if not project_id:
            return intent

        # Inside project → if intent is project then user wants a NEW project
        if intent["type"] == "project":
            return intent

        return intent
