from utils.database_util import chats_col, messages_col, projects_col
from datetime import datetime
from bson import ObjectId



# ---------- CHATS ----------

def create_chat(user_id: str, title: str, description: str):
    chat = {
        "user_id": user_id,
        "title": title,
        "description": description,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    res = chats_col.insert_one(chat)
    return str(res.inserted_id)

def get_user_chats(user_id: str):
    cursor = chats_col.find({"user_id": user_id}).sort("created_at", -1)

    chats = []
    for p in cursor:
        p["_id"] = str(p["_id"])
        chats.append(p)

    return chats



def update_project_timestamp(chat_id: str):
    chats_col.update_one(
        {"_id": ObjectId(chat_id)},
        {"$set": {"updated_at": datetime.utcnow()}}
    )



# ---------- CHAT MESSAGES ----------
def convert_messages_to_text(messages):
    lines = []
    for m in messages:
        role = "User" if m["role"] == "user" else "Assistant"
        lines.append(f"{role}: {m['content']}")
    return "\n".join(lines)

def save_message(chat_id: str, role: str, content: str, agent: str = None):
    msg = {
        "chat_id": chat_id,
        "role": role,              # "user" or "assistant"
        "content": content,
        "agent": agent,            # optional: planner / developer / debugger / chat
        "created_at": datetime.utcnow()
    }

    messages_col.insert_one(msg)
    return True

def format_for_gemini(messages):
    formatted = []

    for m in messages:
        formatted.append({
            "role": m["role"],
            "content": m["content"]
        })

    return formatted



def get_chat_messages(chat_id: str):
    try:
        msgs = list(
            messages_col.find(
                {"chat_id": chat_id}
            ).sort("created_at", 1)
        )
        print(f"Loaded {len(msgs)} messages for chat_id {chat_id}") 

        for m in msgs:
            m["_id"] = str(m["_id"])

        return msgs

    except Exception as e:
        print("Error loading messages:", e)
        return []


# ---------- PROJECTS ----------
def save_project(user_id: str, title: str, description: str, chat_id:str,plan:dict=None):
    project = {
    "user_id": user_id,
    "title": title,
    "description": description,
    "plan": plan,                     # planner steps (optional but useful)
    "chat_id": chat_id,               # link chat ↔ project
    "status": "generated",            # generated | editing | completed
    "project_type": "fullstack",      # frontend | backend | fullstack
    "created_at": datetime.utcnow(),
    "updated_at": datetime.utcnow()

    }

    res = projects_col.insert_one(project)
    print("Saved project with ID:", str(res.inserted_id))
    return str(res.inserted_id)



def get_user_projects(user_id: str):
    cursor = projects_col.find({"user_id": user_id}).sort("created_at", -1)

    projects = []
    for p in cursor:
        p["_id"] = str(p["_id"])
        projects.append(p)

    return projects