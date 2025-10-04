from sqlalchemy import (
    Boolean, Column, Integer, String, Text, DateTime, ForeignKey,
    Index, UniqueConstraint, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from datetime import datetime
import uuid

from database import Base

# Helper function for UUID generation
def generate_uuid():
    return str(uuid.uuid4())

# Sessions table (required for authentication)
class Session(Base):
    __tablename__ = "sessions"
    
    sid = Column(String, primary_key=True)
    sess = Column(JSON, nullable=False)
    expire = Column(DateTime, nullable=False, index=True)
    
    __table_args__ = (
        Index('IDX_session_expire', 'expire'),
    )

# Users table
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    first_name = Column("first_name", String)
    last_name = Column("last_name", String)
    profile_image_url = Column("profile_image_url", String)
    
    # BJJ-specific fields
    belt = Column(String, default="White")
    stripes = Column(Integer, default=0)
    weight = Column(String)
    weight_class = Column("weight_class", String)
    school = Column(String)
    instructor = Column(String)
    years_training = Column("years_training", String)
    competitions = Column(Integer, default=0)
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    bio = Column(Text)
    location = Column(String)
    age_division = Column("age_division", String)
    gender = Column(String)
    
    # Social stats
    followers_count = Column("followers_count", Integer, default=0)
    following_count = Column("following_count", Integer, default=0)
    posts_count = Column("posts_count", Integer, default=0)
    
    created_at = Column("created_at", DateTime, default=func.now())
    updated_at = Column("updated_at", DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    posts = relationship("Post", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="user", cascade="all, delete-orphan")
    
    followers = relationship(
        "Follow",
        foreign_keys="[Follow.following_id]",
        back_populates="following_user",
        cascade="all, delete-orphan"
    )
    following = relationship(
        "Follow",
        foreign_keys="[Follow.follower_id]",
        back_populates="follower_user",
        cascade="all, delete-orphan"
    )
    
    tournaments = relationship("Tournament", back_populates="organizer")
    leaderboard_entries = relationship("Leaderboard", back_populates="user", cascade="all, delete-orphan")

# Posts table
class Post(Base):
    __tablename__ = "posts"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column("user_id", String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    type = Column(String, nullable=False, default="general")
    location = Column(String)
    image_urls = Column("image_urls", JSON, default=list)
    likes = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    created_at = Column("created_at", DateTime, default=func.now())
    updated_at = Column("updated_at", DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    post_likes = relationship("Like", back_populates="post", cascade="all, delete-orphan")

# Comments table
class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    post_id = Column("post_id", String, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column("user_id", String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column("created_at", DateTime, default=func.now())
    
    # Relationships
    post = relationship("Post", back_populates="comments")
    user = relationship("User", back_populates="comments")

# Likes table
class Like(Base):
    __tablename__ = "likes"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    post_id = Column("post_id", String, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column("user_id", String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column("created_at", DateTime, default=func.now())
    
    # Relationships
    post = relationship("Post", back_populates="post_likes")
    user = relationship("User", back_populates="likes")

# Follows table
class Follow(Base):
    __tablename__ = "follows"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    follower_id = Column("follower_id", String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    following_id = Column("following_id", String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column("created_at", DateTime, default=func.now())
    
    # Relationships
    follower_user = relationship("User", foreign_keys=[follower_id], back_populates="following")
    following_user = relationship("User", foreign_keys=[following_id], back_populates="followers")

# Tournaments table
class Tournament(Base):
    __tablename__ = "tournaments"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    location = Column(String)
    is_gi = Column("is_gi", Boolean, nullable=False, default=True)
    ruleset = Column(String, nullable=False, default="IBJJF")
    tier = Column(String, nullable=False, default="LOCAL")
    organizer_id = Column("organizer_id", String, ForeignKey("users.id"), nullable=False)
    created_at = Column("created_at", DateTime, default=func.now())
    
    # Relationships
    organizer = relationship("User", back_populates="tournaments")
    matches = relationship("Match", back_populates="tournament", cascade="all, delete-orphan")

# Matches table
class Match(Base):
    __tablename__ = "matches"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    tournament_id = Column("tournament_id", String, ForeignKey("tournaments.id", ondelete="CASCADE"), nullable=False)
    round = Column(String, nullable=False)
    belt = Column(String, nullable=False)
    weight_class = Column("weight_class", String, nullable=False)
    age_division = Column("age_division", String)
    gender = Column(String, nullable=False)
    competitor_a_id = Column("competitor_a_id", String, ForeignKey("users.id"), nullable=False)
    competitor_b_id = Column("competitor_b_id", String, ForeignKey("users.id"), nullable=False)
    winner_id = Column("winner_id", String, ForeignKey("users.id"))
    method = Column(String)
    submission_type = Column("submission_type", String)
    points_a = Column("points_a", Integer, default=0)
    points_b = Column("points_b", Integer, default=0)
    advantages_a = Column("advantages_a", Integer, default=0)
    advantages_b = Column("advantages_b", Integer, default=0)
    penalties_a = Column("penalties_a", Integer, default=0)
    penalties_b = Column("penalties_b", Integer, default=0)
    duration_sec = Column("duration_sec", Integer)
    result_final = Column("result_final", Boolean, default=False)
    awarded_winner_pts = Column("awarded_winner_pts", Integer, default=0)
    awarded_loser_pts = Column("awarded_loser_pts", Integer, default=0)
    created_at = Column("created_at", DateTime, default=func.now())
    
    # Relationships
    tournament = relationship("Tournament", back_populates="matches")
    competitor_a = relationship("User", foreign_keys=[competitor_a_id])
    competitor_b = relationship("User", foreign_keys=[competitor_b_id])
    winner = relationship("User", foreign_keys=[winner_id])

# Leaderboard table
class Leaderboard(Base):
    __tablename__ = "leaderboard"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    season = Column(String, nullable=False)
    ruleset = Column(String, nullable=False)
    is_gi = Column("is_gi", Boolean, nullable=False)
    belt = Column(String, nullable=False)
    weight_class = Column("weight_class", String, nullable=False)
    age_division = Column("age_division", String, nullable=False, default="UNSPECIFIED")
    gender = Column(String, nullable=False)
    user_id = Column("user_id", String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    points = Column(Integer, default=0)
    submissions = Column(Integer, default=0)
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    last_updated = Column("last_updated", DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="leaderboard_entries")
    
    # Unique constraint
    __table_args__ = (
        UniqueConstraint(
            'user_id', 'season', 'ruleset', 'is_gi', 'belt', 
            'weight_class', 'age_division', 'gender',
            name='unique_leaderboard_entry'
        ),
    )
