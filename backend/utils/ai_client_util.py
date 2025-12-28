import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("❌ GEMINI_API_KEY is missing from .env file")

gemini = genai.Client(api_key=API_KEY)

print("✅ Gemini client initialized successfully")
