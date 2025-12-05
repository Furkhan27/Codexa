from utils.database import projects_col, messages_col
from datetime import datetime
from bson import ObjectId


# ---------- PROJECTS ----------

def create_project(user_id: str, title: str, description: str):
    project = {
        "user_id": user_id,
        "title": title,
        "description": description,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    res = projects_col.insert_one(project)
    return str(res.inserted_id)

def get_user_projects(user_id: str):
    cursor = projects_col.find({"user_id": user_id}).sort("created_at", -1)

    projects = []
    for p in cursor:
        p["_id"] = str(p["_id"])
        projects.append(p)

    return projects

def get_project(project_id: str):
    project = projects_col.find_one({"_id": ObjectId(project_id)})
    if not project:
        return None
    
    project["_id"] = str(project["_id"])
    return project


def update_project_timestamp(project_id: str):
    projects_col.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": {"updated_at": datetime.utcnow()}}
    )



# ---------- CHAT MESSAGES ----------
def convert_messages_to_text(messages):
    lines = []
    for m in messages:
        role = "User" if m["role"] == "user" else "Assistant"
        lines.append(f"{role}: {m['content']}")
    return "\n".join(lines)

def save_message(project_id: str, role: str, content: str, agent: str = None):
    msg = {
        "project_id": project_id,
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

from utils.database import messages_col
from bson import ObjectId

def get_project_messages(project_id: str):
    try:
        msgs = list(
            messages_col.find({"project_id": project_id})
                        .sort("timestamp", 1)  # oldest → newest
        )

        # Convert ObjectId → string
        for m in msgs:
            m["_id"] = str(m["_id"])
        
        return msgs

    except Exception as e:
        print("Error loading messages:", e)
        return None
