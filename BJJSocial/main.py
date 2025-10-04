import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from .routers import auth, users, posts, tournaments, leaderboard, search
from .database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="BJJ Social Platform API")

# Add session middleware
SECRET_KEY = os.getenv("SESSION_SECRET", "your-secret-key-change-in-production")
app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY,
    session_cookie="bjj_session",
    max_age=30 * 24 * 60 * 60,  # 30 days
    same_site="lax",
    https_only=False  # Set to True in production with HTTPS
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(tournaments.router)
app.include_router(leaderboard.router)
app.include_router(search.router)

@app.get("/")
async def root():
    return {"message": "BJJ Social Platform API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
