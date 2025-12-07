import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("❌ GEMINI_API_KEY is missing from environment variables!")

# Correct client initialization
gemini = genai.Client(api_key=API_KEY)

res = gemini.models._generate_content(
    model="gemini-2.0-flash",
    contents="Hello, Gemini!"
)

print("Gemini client initialized successfully", res)
