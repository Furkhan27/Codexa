from fastapi import FastAPI
from routers.auth import router as auth_router
from routers.chat import router as chat_router
from routers.projects import router as projects_router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:5173"] for security
    allow_credentials=True,
    allow_methods=["*"],  # <-- IMPORTANT: allows OPTIONS
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(projects_router)
