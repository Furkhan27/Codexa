from fastapi import APIRouter, HTTPException
from models.schemas import ChatPayload
from agents.chat_agent import ChatAgent
from agents.classifier_agent import ClassifierAgent
from agents.project_pipeline_agent import ProjectPipeline
from utils.database_models_util import (
    create_chat,
    save_message,
    get_user_chats,
    get_chat_messages,
    save_project
)
from utils.ai_client_util import gemini as client
import json
from utils.file_utils import save_files   # NEW (flat file saver)


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
        model="gemini-2.5-flash-lite",
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
    # print("Received chat payload:", payload)
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
    print("Classified Intent:", intent)
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

        project_id = save_project(
            user_id=user_id,
            title=pipeline_result["title"],
            description=user_message,
            chat_id=chat_id,
            plan = pipeline_result["plan"],
        )
        
        project_json = pipeline_result["project"]
        
          # -------------------------
        # 💾 SAVE GENERATED FILES (NEW)
        # -------------------------
        save_files(
            project_id=project_id,
            structure=project_json["structure"]
        )
        
        return {
            "ok": True,
            "type": "project",
            "chat_id": chat_id,
            "project_id": project_id,
            "title": pipeline_result["title"],
            "reply": final_reply,
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


@router.get("/get-chats/{user_id}")
def get_user_all_chats(user_id: str):
    """
    Fetch all chats for a specific user.
    """
    chats = get_user_chats(user_id)

    return {
        "ok": True,
        "user_id": user_id,
        "chats": chats
    }       

