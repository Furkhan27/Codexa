from agents.planner_agent import PlannerAgent
from agents.developer_agent import DeveloperAgent
from agents.debugger_agent import DebuggerAgent

class Integrator:
    def generate_project(self, name: str):
        planner = PlannerAgent()
        steps = planner.plan(name)

        developer = DeveloperAgent()
        code = developer.generate(steps)

        debugger = DebuggerAgent()
        ok = debugger.validate(code)

        return {
            "steps": steps,
            "code": code,
            "valid": ok
        }
