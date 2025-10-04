from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import RegisterUser, LoginUser, UserResponse
from auth import hash_password, verify_password, get_user_by_email, sanitize_user, get_current_user

router = APIRouter(prefix="/api", tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    request: Request,
    user_data: RegisterUser,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    # Check if user already exists
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    new_user = User(
        email=user_data.email,
        password=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Set session
    request.session["user_id"] = new_user.id
    
    # Return sanitized user (without password)
    return sanitize_user(new_user)

@router.post("/login")
async def login(
    request: Request,
    credentials: LoginUser,
    db: Session = Depends(get_db)
):
    """Login with email and password"""
    # Find user by email
    user = get_user_by_email(db, credentials.email)
    
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Set session
    request.session["user_id"] = user.id
    
    # Return sanitized user (without password)
    return sanitize_user(user)

@router.post("/logout")
async def logout(request: Request):
    """Logout the current user"""
    request.session.clear()
    return {"message": "Logged out successfully"}

@router.get("/auth/user")
async def get_auth_user(
    current_user: User = Depends(get_current_user)
):
    """Get the currently authenticated user"""
    return sanitize_user(current_user)
