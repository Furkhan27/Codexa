from fastapi import FastAPI
from routers.auth_router import router as auth_router
from routers.chat_router import router as chat_router
from routers.projects_router import router as projects_router
from routers.project_files_router import router as files_router
from fastapi.middleware.cors import CORSMiddleware
from routers.preview import router as preview_router
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
app.include_router(files_router)
app.include_router(preview_router)

