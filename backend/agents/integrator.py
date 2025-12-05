from agents.planner import PlannerAgent
from agents.developer import DeveloperAgent
from agents.debugger import DebuggerAgent

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
