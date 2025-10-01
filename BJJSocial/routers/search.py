
from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Post, Tournament

router = APIRouter()

@router.get("/api/search")
async def search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    # Search for users, posts, and tournaments
    users = db.query(User).filter(User.firstName.contains(q) | User.lastName.contains(q)).all()
    posts = db.query(Post).filter(Post.content.contains(q)).all()
    tournaments = db.query(Tournament).filter(Tournament.name.contains(q)).all()

    results = []
    for user in users:
        results.append({
            "id": user.id,
            "type": "user",
            "title": f"{user.firstName} {user.lastName}",
            "description": user.bio or ""
        })
    for post in posts:
        results.append({
            "id": post.id,
            "type": "post",
            "title": f"Post by {post.author.firstName}",
            "description": post.content
        })
    for tournament in tournaments:
        results.append({
            "id": tournament.id,
            "type": "tournament",
            "title": tournament.name,
            "description": tournament.description or ""
        })

    return {"results": results}
