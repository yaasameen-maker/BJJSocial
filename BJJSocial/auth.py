from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status, Request
from typing import Optional
from .models import User
from .database import get_db

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get a user by email"""
    return db.query(User).filter(User.email == email).first()

def sanitize_user(user: User) -> dict:
    """Remove password from user object"""
    user_dict = {
        "id": user.id,
        "email": user.email,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "profileImageUrl": user.profile_image_url,
        "belt": user.belt,
        "stripes": user.stripes,
        "weight": user.weight,
        "weightClass": user.weight_class,
        "school": user.school,
        "instructor": user.instructor,
        "yearsTraining": user.years_training,
        "competitions": user.competitions,
        "wins": user.wins,
        "losses": user.losses,
        "bio": user.bio,
        "location": user.location,
        "ageDivision": user.age_division,
        "gender": user.gender,
        "followersCount": user.followers_count,
        "followingCount": user.following_count,
        "postsCount": user.posts_count,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
        "updatedAt": user.updated_at.isoformat() if user.updated_at else None,
    }
    return user_dict

async def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """Get the current authenticated user from session"""
    user_id = request.session.get("user_id")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

async def get_current_user_optional(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    """Get the current authenticated user from session (optional)"""
    user_id = request.session.get("user_id")
    
    if not user_id:
        return None
    
    user = db.query(User).filter(User.id == user_id).first()
    return user
