import json
from utils.database_models_util import save_message
from agents.developer_agent import DeveloperAgent
from agents.planner_agent import PlannerAgent
from agents.debugger_agent import DebuggerAgent


class ProjectPipeline:
  

    def run(self, chat_id: str, user_message: str):

        # -------------------------
        # 1️⃣ PLANNER
        # -------------------------
        planner = PlannerAgent()
        plan = planner.plan(user_message)

        if not plan or "steps" not in plan:
            raise RuntimeError("Planner failed")

        save_message(
            chat_id,
            role="assistant",
            content=json.dumps(plan, indent=2),
            agent="planner"
        )

        print(f"🧠 Planner generated title: {plan['title']}")

        # -------------------------
        # 2️⃣ DEVELOPER
        # -------------------------
        developer = DeveloperAgent()
        project_json = developer.generate_project(
            plan["title"],
            plan["steps"],
            user_message
        )

        if not project_json or "structure" not in project_json:
            raise RuntimeError("Developer failed")

        save_message(
            chat_id,
            role="assistant",
            content="Generated multi-folder full-stack project",
            agent="developer"
        )

      

        # -------------------------
        # 3️⃣ DEBUGGER
        # -------------------------
        debugger = DebuggerAgent(verbose=True)
        is_valid = debugger.validate(project_json)

        save_message(
            chat_id,
            role="assistant",
            content=f"Debugger validation result: {is_valid}",
            agent="debugger"
        )


        # -------------------------
        # 4️⃣ RETURN RESULT
        # -------------------------
        return {
            "ok": is_valid,
            "type": "project",
            "chat_id": chat_id,
            "title": plan["title"],
            "plan": plan["steps"],
            "project": project_json
        }
