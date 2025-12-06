from google import genai
from utils.database_models import (
    get_chat_messages,
    format_for_gemini,
    save_message
)
from utils.ai_client import gemini



class ChatAgent:
    """
    Handles regular conversational messages inside a project.
    Reads history from MongoDB, responds with context (ChatGPT-like).
    """
    def convert_messages_to_text(self, messages):
        lines = []
        for m in messages:
            role = "User" if m["role"] == "user" else "Assistant"
            lines.append(f"{role}: {m['content']}")
        return "\n".join(lines)
    
    
    def respond(self, project_id: str, user_message: str):

        # 1. Fetch previous project messages
        history = get_chat_messages(project_id)

        # 2. Convert to ChatML format
        formatted = format_for_gemini(history)
        
        # 3. Append the new user message
        conversation_text = self.convert_messages_to_text(formatted)
        print("Conversation so far:\n", conversation_text)
        # 5. Call Gemini
        resp = gemini.models.generate_content(
            model="gemini-2.0-flash",
            contents=conversation_text
        )

        reply = resp.text.strip()
        print("Gemini reply:", reply)
        # 5. Save assistant message in DB
        save_message(project_id, "assistant", reply, "chat")

        return reply
