from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Post, Comment, Follow
from schemas import UserResponse, UpdateUser
from auth import get_current_user, sanitize_user

router = APIRouter(prefix="/api", tags=["users"])

@router.get("/users/{user_id}", response_model=dict)
async def get_user_profile(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get a user's profile by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return sanitize_user(user)

@router.put("/user/profile", response_model=dict)
async def update_user_profile(
    user_data: UpdateUser,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the current user's profile"""
    # Update user fields
    update_dict = user_data.model_dump(exclude_unset=True)
    
    # Map camelCase to snake_case
    field_mapping = {
        "firstName": "first_name",
        "lastName": "last_name",
        "profileImageUrl": "profile_image_url",
        "weightClass": "weight_class",
        "yearsTraining": "years_training",
        "ageDivision": "age_division"
    }
    
    for key, value in update_dict.items():
        snake_key = field_mapping.get(key, key)
        setattr(current_user, snake_key, value)
    
    db.commit()
    db.refresh(current_user)
    
    return sanitize_user(current_user)

@router.get("/users/{user_id}/followers")
async def get_followers(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get a user's followers"""
    follows = db.query(Follow).filter(Follow.following_id == user_id).all()
    follower_ids = [f.follower_id for f in follows]
    followers = db.query(User).filter(User.id.in_(follower_ids)).all()
    return [sanitize_user(user) for user in followers]

@router.get("/users/{user_id}/following")
async def get_following(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get users that a user is following"""
    follows = db.query(Follow).filter(Follow.follower_id == user_id).all()
    following_ids = [f.following_id for f in follows]
    following = db.query(User).filter(User.id.in_(following_ids)).all()
    return [sanitize_user(user) for user in following]

@router.post("/users/{user_id}/follow")
async def follow_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Follow a user"""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot follow yourself"
        )
    
    # Check if target user exists
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if already following
    existing_follow = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.following_id == user_id
    ).first()
    
    if existing_follow:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already following this user"
        )
    
    # Create follow
    new_follow = Follow(follower_id=current_user.id, following_id=user_id)
    db.add(new_follow)
    
    # Update counts
    current_user.following_count += 1
    target_user.followers_count += 1
    
    db.commit()
    
    return {"message": "Successfully followed user"}

@router.delete("/users/{user_id}/follow")
async def unfollow_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unfollow a user"""
    # Check if target user exists
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    follow = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.following_id == user_id
    ).first()
    
    if not follow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not following this user"
        )
    
    # Delete follow
    db.delete(follow)
    
    # Update counts
    current_user.following_count -= 1
    target_user.followers_count -= 1
    
    db.commit()
    
    return {"message": "Successfully unfollowed user"}

@router.get("/users/{user_id}/stats")
async def get_user_stats(
    user_id: str,
    season: str = None,
    db: Session = Depends(get_db)
):
    """Get a user's competition statistics"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Return basic stats (can be enhanced with season-specific stats)
    return {
        "userId": user.id,
        "competitions": user.competitions,
        "wins": user.wins,
        "losses": user.losses,
        "winRate": round(user.wins / max(user.competitions, 1) * 100, 2) if user.competitions > 0 else 0
    }
