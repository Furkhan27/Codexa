from fastapi import APIRouter, HTTPException
from utils.database_models import get_user_chats

router = APIRouter(prefix="/projects")

@router.get("/{user_id}")
def list_projects(user_id: str):
    """
    Return all projects created by a user.
    """
    projects = get_user_chats(user_id)

    return {
        "ok": True,
        "count": len(projects),
        "projects": projects
    }
