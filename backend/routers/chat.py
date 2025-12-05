from fastapi import APIRouter, HTTPException
from models.schemas import ChatPayload
from agents.ChatAgent import ChatAgent
from agents.ClassifierAgent import ClassifierAgent
from agents.ProjectPipeline import ProjectPipeline
from utils.database_models import (
    create_project,
    save_message,
    get_project_messages
)
from utils.database_models import get_project_messages
from utils.ai_client import gemini as client


router = APIRouter(prefix="/chat")

chat_agent = ChatAgent()
classifier = ClassifierAgent()
pipeline = ProjectPipeline()

def get_title_from_message(message: str):
    # Simple heuristic to extract a title from the user message
    prompt = "Extract a concise project title from the following message:\n" + message
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )   
    title = response.text.strip()
    if title:   
        first_line = title.split("\n")[0]   
        return first_line[:50]  # Limit to 50 characters
    return "Untitled Project"


@router.post("/")
def chat(payload: ChatPayload):

    user_message = payload.message.strip()
    user_id = payload.user_id
    project_id = payload.project_id

    # ---------- Create new project if none exists ----------
    if not project_id:
        project_id = create_project(
            user_id=user_id,
            title=get_title_from_message(user_message),
            description=user_message
        )

    # ---------- Save User Message ----------
    save_message(project_id, "user", user_message)

    # ---------- Classify Intent ----------
    intent = classifier.classify_for_project(user_message, project_id)
    # ---------- PROJECT PIPELINE ----------
    if intent["type"] == "project":
        
        pipeline_result = pipeline.run(project_id, user_message)
        print("Pipeline Result:", pipeline_result)
        # Store final message returned to the frontend
        final_reply = "Project Creation completed successfully."

        save_message(
            project_id,
            role="assistant",
            content=final_reply,
            agent="pipeline"
        )

        return {
            "ok": True,
            "type": "project",
            "project_id": project_id,
            "code": pipeline_result["code"],
            "title": pipeline_result["title"],
            "pipeline_output": pipeline_result,
            "reply": final_reply,
            "messages": get_project_messages(project_id)
        }

    # ---------- CONVERSATIONAL MODE ----------
    reply = chat_agent.respond(project_id, user_message)

    return {
        "ok": True,
        "type": "conversation",
        "project_id": project_id,
        "reply": reply,
        "messages": get_project_messages(project_id)
    }



@router.get("/{project_id}")
def get_chat_history(project_id: str):
    """
    Fetch all chat messages for a specific project.
    """
    messages = get_project_messages(project_id)

    if messages is None:
        raise HTTPException(status_code=404, detail="Project not found")

    return {
        "ok": True,
        "project_id": project_id,
        "messages": messages
    }


