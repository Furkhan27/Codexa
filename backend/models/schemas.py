from pydantic import BaseModel
from typing import Optional


class Signup(BaseModel):
    """
    Payload for creating a new user.
    """
    name: str
    email: str
    password: str
    confirm_password: str


class Login(BaseModel):
    """
    Payload for logging in an existing user.
    """
    email: str
    password: str


class ChatPayload(BaseModel):
    """
    Payload for sending a chat message.
    project_id is Optional because new projects start with None.
    """
    user_id: str
    project_id: Optional[str]  # None = create a new project
    message: str


class GeneratePayload(BaseModel):
    """
    Payload for generating a new project manually (if needed).
    """
    user_id: str
    project_name: str
    description: Optional[str] = None
