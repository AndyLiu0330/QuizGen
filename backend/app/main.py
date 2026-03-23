from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import materials, sessions, quizzes

app = FastAPI(title="QuizGen API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(materials.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(quizzes.router, prefix="/api")
