from fastapi import APIRouter, HTTPException
from models.schemas import ChatPayload
from agents.ChatAgent import ChatAgent
from agents.ClassifierAgent import ClassifierAgent
from agents.ProjectPipeline import ProjectPipeline
from utils.database_models import (
    create_chat,
    save_message,
    get_chat_messages
)
from utils.database_models import get_chat_messages
from utils.ai_client import gemini as client
import json

router = APIRouter(prefix="/chat")

chat_agent = ChatAgent()
classifier = ClassifierAgent()
pipeline = ProjectPipeline()

import json

def get_title_from_message(message: str):
    prompt = f"""
    Your name is CODEXA.
    Generate a short title for this message:

    "{message}"

    Respond ONLY in valid JSON like this:
    {{"title": "Your generated title"}}
    """

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    raw = response.text.strip()

    # Remove code fences if Gemini returns them
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        data = json.loads(raw)
        title = data.get("title", "").strip()
        print("Generated title:", title)
        if title:
            return title[:60]   # Limit to 60 chars
    except Exception as e:
        print("JSON Parse Error:", e, "Raw:", raw)

    return "Untitled Project"



@router.post("/")
def chat(payload: ChatPayload):

    user_message = payload.message.strip()
    user_id = payload.user_id
    chat_id = payload.chat_id
    print("Received chat payload:", payload)
    # ---------- Create new project if none exists ----------
    if not chat_id:
        chat_id = create_chat(
            user_id=user_id,
            title=get_title_from_message(user_message),
            description=user_message
        )

    # ---------- Save User Message ----------
    save_message(chat_id, "user", user_message)

    # ---------- Classify Intent ----------
    intent = classifier.classify_for_project(user_message, chat_id)
    # ---------- PROJECT PIPELINE ----------
    if intent["type"] == "project":
        
        pipeline_result = pipeline.run(chat_id, user_message)
        print("Pipeline Result:", pipeline_result)
        # Store final message returned to the frontend
        final_reply = "Project Creation completed successfully."

        save_message(
            chat_id,
            role="assistant",
            content=final_reply,
            agent="pipeline"
        )

        return {
            "ok": True,
            "type": "project",
            "chat_id": chat_id,
            "code": pipeline_result["code"],
            "title": pipeline_result["title"],
            "pipeline_output": pipeline_result,
            "reply": final_reply,
            "messages": get_chat_messages(chat_id)
        }

    # ---------- CONVERSATIONAL MODE ----------
    reply = chat_agent.respond(chat_id, user_message)

    return {
        "ok": True,
        "type": "conversation",
        "chat_id": chat_id,
        "reply": reply,
        "messages": get_chat_messages(chat_id)
    }



@router.get("/{chat_id}")
def get_chat_history(chat_id: str):
    """
    Fetch all chat messages for a specific project.
    """
    messages = get_chat_messages(chat_id)

    if messages is None:
        raise HTTPException(status_code=404, detail="Project not found")

    return {
        "ok": True,
        "chat_id": chat_id,
        "messages": messages
    }


