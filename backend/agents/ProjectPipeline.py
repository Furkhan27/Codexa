import json
import re
from utils.database_models import save_message
from utils.ai_client import gemini as client
from agents.developer import DeveloperAgent
from agents.planner import PlannerAgent
from agents.debugger import DebuggerAgent

class ProjectPipeline:
    """
    Runs the 3-agent flow:
    Planner -> Developer -> Debugger
    """

    # ------------ JSON Extractor (IMPORTANT) ---------------
    def extract_json(self, text: str):
        if not text or not text.strip():
            return None

        clean = (
            text.replace("```json", "")
                .replace("```", "")
                .strip()
        )

        match = re.search(r"\{.*\}", clean, re.DOTALL)
        if not match:
            return None

        try:
            return json.loads(match.group(0))
        except:
            return None


    # ------------------- PIPELINE MANAGER -------------------
    def run(self, project_id: str, user_message: str):

        # 1. PLANNER
        plan = PlannerAgent().plan(user_message)
        save_message(project_id, "assistant", json.dumps(plan, indent=2), "planner")
        print(f"Planner generated steps:\n{(plan["title"])}\n")
        # 2. DEVELOPER
        dev = DeveloperAgent().generate_project(plan["title"], plan["steps"], user_message)
        print(f"Developer generated code at: {dev}\n")
        save_message(project_id, "assistant", json.dumps(dev["code"]), "developer")
        
        # 3. DEBUGGER
        dbg = DebuggerAgent().debug(dev["file_path"])

        return {
            "plan": plan["steps"],
            "title": plan["title"],
            "code": dev["code"],
            "code_path": dev["file_path"],
            "debugger_output": dbg
        }