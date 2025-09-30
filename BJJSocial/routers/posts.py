from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models import User, Post, Comment, Like
from ..schemas import InsertPost, PostResponse, InsertComment, CommentResponse
from ..auth import get_current_user, get_current_user_optional, sanitize_user

router = APIRouter(prefix="/api", tags=["posts"])

@router.post("/posts", status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: InsertPost,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new post"""
    new_post = Post(
        user_id=current_user.id,
        content=post_data.content,
        type=post_data.type,
        location=post_data.location,
        image_urls=post_data.image_urls or []
    )
    
    db.add(new_post)
    current_user.posts_count += 1
    db.commit()
    db.refresh(new_post)
    
    # Return post with user data
    return {
        **post_data.model_dump(),
        "id": new_post.id,
        "userId": new_post.user_id,
        "likes": new_post.likes,
        "shares": new_post.shares,
        "createdAt": new_post.created_at.isoformat(),
        "updatedAt": new_post.updated_at.isoformat(),
        "user": sanitize_user(current_user)
    }

@router.get("/posts")
async def get_posts(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    type: Optional[str] = None,
    user_id: Optional[str] = Query(None, alias="userId"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get posts with pagination and filters"""
    query = db.query(Post)
    
    if type:
        query = query.filter(Post.type == type)
    if user_id:
        query = query.filter(Post.user_id == user_id)
    
    posts = query.order_by(Post.created_at.desc()).offset(offset).limit(limit).all()
    
    # Load users for all posts
    result = []
    for post in posts:
        user = db.query(User).filter(User.id == post.user_id).first()
        result.append({
            "id": post.id,
            "userId": post.user_id,
            "content": post.content,
            "type": post.type,
            "location": post.location,
            "imageUrls": post.image_urls or [],
            "likes": post.likes,
            "shares": post.shares,
            "createdAt": post.created_at.isoformat(),
            "updatedAt": post.updated_at.isoformat(),
            "user": sanitize_user(user) if user else None
        })
    
    return result

@router.post("/posts/{post_id}/like")
async def like_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like a post"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if already liked
    existing_like = db.query(Like).filter(
        Like.post_id == post_id,
        Like.user_id == current_user.id
    ).first()
    
    if existing_like:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already liked this post"
        )
    
    # Create like
    new_like = Like(post_id=post_id, user_id=current_user.id)
    db.add(new_like)
    post.likes += 1
    db.commit()
    
    return {"message": "Post liked successfully"}

@router.delete("/posts/{post_id}/like")
async def unlike_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unlike a post"""
    like = db.query(Like).filter(
        Like.post_id == post_id,
        Like.user_id == current_user.id
    ).first()
    
    if not like:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Like not found"
        )
    
    post = db.query(Post).filter(Post.id == post_id).first()
    if post:
        post.likes -= 1
    
    db.delete(like)
    db.commit()
    
    return {"message": "Post unliked successfully"}

@router.post("/posts/{post_id}/comments", status_code=status.HTTP_201_CREATED)
async def create_comment(
    post_id: str,
    comment_data: InsertComment,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a comment on a post"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    new_comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        content=comment_data.content
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return {
        "id": new_comment.id,
        "postId": new_comment.post_id,
        "userId": new_comment.user_id,
        "content": new_comment.content,
        "createdAt": new_comment.created_at.isoformat(),
        "user": sanitize_user(current_user)
    }

@router.get("/posts/{post_id}/comments")
async def get_post_comments(
    post_id: str,
    db: Session = Depends(get_db)
):
    """Get comments for a post"""
    comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.desc()).all()
    
    result = []
    for comment in comments:
        user = db.query(User).filter(User.id == comment.user_id).first()
        result.append({
            "id": comment.id,
            "postId": comment.post_id,
            "userId": comment.user_id,
            "content": comment.content,
            "createdAt": comment.created_at.isoformat(),
            "user": sanitize_user(user) if user else None
        })
    
    return result
