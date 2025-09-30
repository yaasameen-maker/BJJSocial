from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime

# ============= Authentication Schemas =============
class RegisterUser(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., min_length=1, alias="firstName")
    last_name: str = Field(..., min_length=1, alias="lastName")

    class Config:
        populate_by_name = True

class LoginUser(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)

# ============= User Schemas =============
class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = Field(None, alias="firstName")
    last_name: Optional[str] = Field(None, alias="lastName")
    profile_image_url: Optional[str] = Field(None, alias="profileImageUrl")
    belt: Optional[str] = "White"
    stripes: Optional[int] = 0
    weight: Optional[str] = None
    weight_class: Optional[str] = Field(None, alias="weightClass")
    school: Optional[str] = None
    instructor: Optional[str] = None
    years_training: Optional[str] = Field(None, alias="yearsTraining")
    competitions: Optional[int] = 0
    wins: Optional[int] = 0
    losses: Optional[int] = 0
    bio: Optional[str] = None
    location: Optional[str] = None
    age_division: Optional[str] = Field(None, alias="ageDivision")
    gender: Optional[str] = None
    followers_count: Optional[int] = Field(0, alias="followersCount")
    following_count: Optional[int] = Field(0, alias="followingCount")
    posts_count: Optional[int] = Field(0, alias="postsCount")

    class Config:
        populate_by_name = True
        from_attributes = True

class UserResponse(UserBase):
    id: str
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")

class UpdateUser(BaseModel):
    first_name: Optional[str] = Field(None, alias="firstName")
    last_name: Optional[str] = Field(None, alias="lastName")
    profile_image_url: Optional[str] = Field(None, alias="profileImageUrl")
    belt: Optional[str] = None
    stripes: Optional[int] = None
    weight: Optional[str] = None
    weight_class: Optional[str] = Field(None, alias="weightClass")
    school: Optional[str] = None
    instructor: Optional[str] = None
    years_training: Optional[str] = Field(None, alias="yearsTraining")
    bio: Optional[str] = None
    location: Optional[str] = None
    age_division: Optional[str] = Field(None, alias="ageDivision")
    gender: Optional[str] = None

    class Config:
        populate_by_name = True

# ============= Post Schemas =============
class InsertPost(BaseModel):
    content: str
    type: str = "general"
    location: Optional[str] = None
    image_urls: Optional[List[str]] = Field(default_factory=list, alias="imageUrls")

    class Config:
        populate_by_name = True

class PostResponse(BaseModel):
    id: str
    user_id: str = Field(..., alias="userId")
    content: str
    type: str
    location: Optional[str]
    image_urls: List[str] = Field(default_factory=list, alias="imageUrls")
    likes: int
    shares: int
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")
    user: UserResponse

    class Config:
        populate_by_name = True
        from_attributes = True

# ============= Comment Schemas =============
class InsertComment(BaseModel):
    post_id: str = Field(..., alias="postId")
    content: str

    class Config:
        populate_by_name = True

class CommentResponse(BaseModel):
    id: str
    post_id: str = Field(..., alias="postId")
    user_id: str = Field(..., alias="userId")
    content: str
    created_at: datetime = Field(..., alias="createdAt")
    user: UserResponse

    class Config:
        populate_by_name = True
        from_attributes = True

# ============= Tournament Schemas =============
class InsertTournament(BaseModel):
    name: str
    date: datetime
    location: Optional[str] = None
    is_gi: bool = Field(True, alias="isGi")
    ruleset: str = "IBJJF"
    tier: str = "LOCAL"

    class Config:
        populate_by_name = True

class TournamentResponse(BaseModel):
    id: str
    name: str
    date: datetime
    location: Optional[str]
    is_gi: bool = Field(..., alias="isGi")
    ruleset: str
    tier: str
    organizer_id: str = Field(..., alias="organizerId")
    created_at: datetime = Field(..., alias="createdAt")
    organizer: UserResponse

    class Config:
        populate_by_name = True
        from_attributes = True

# ============= Match Schemas =============
class InsertMatch(BaseModel):
    tournament_id: str = Field(..., alias="tournamentId")
    round: str
    belt: str
    weight_class: str = Field(..., alias="weightClass")
    age_division: Optional[str] = Field(None, alias="ageDivision")
    gender: str
    competitor_a_id: str = Field(..., alias="competitorAId")
    competitor_b_id: str = Field(..., alias="competitorBId")
    winner_id: Optional[str] = Field(None, alias="winnerId")
    method: Optional[str] = None
    submission_type: Optional[str] = Field(None, alias="submissionType")
    points_a: Optional[int] = Field(0, alias="pointsA")
    points_b: Optional[int] = Field(0, alias="pointsB")
    advantages_a: Optional[int] = Field(0, alias="advantagesA")
    advantages_b: Optional[int] = Field(0, alias="advantagesB")
    penalties_a: Optional[int] = Field(0, alias="penaltiesA")
    penalties_b: Optional[int] = Field(0, alias="penaltiesB")
    duration_sec: Optional[int] = Field(None, alias="durationSec")
    result_final: Optional[bool] = Field(False, alias="resultFinal")

    class Config:
        populate_by_name = True

class FinalizeMatch(BaseModel):
    winner_id: Optional[str] = Field(None, alias="winnerId")
    method: Optional[str] = None
    submission_type: Optional[str] = Field(None, alias="submissionType")
    points_a: Optional[int] = Field(None, alias="pointsA")
    points_b: Optional[int] = Field(None, alias="pointsB")
    advantages_a: Optional[int] = Field(None, alias="advantagesA")
    advantages_b: Optional[int] = Field(None, alias="advantagesB")
    penalties_a: Optional[int] = Field(None, alias="penaltiesA")
    penalties_b: Optional[int] = Field(None, alias="penaltiesB")
    duration_sec: Optional[int] = Field(None, alias="durationSec")

    class Config:
        populate_by_name = True

class MatchResponse(BaseModel):
    id: str
    tournament_id: str = Field(..., alias="tournamentId")
    round: str
    belt: str
    weight_class: str = Field(..., alias="weightClass")
    age_division: Optional[str] = Field(None, alias="ageDivision")
    gender: str
    competitor_a_id: str = Field(..., alias="competitorAId")
    competitor_b_id: str = Field(..., alias="competitorBId")
    winner_id: Optional[str] = Field(None, alias="winnerId")
    method: Optional[str]
    submission_type: Optional[str] = Field(None, alias="submissionType")
    points_a: int = Field(..., alias="pointsA")
    points_b: int = Field(..., alias="pointsB")
    advantages_a: int = Field(..., alias="advantagesA")
    advantages_b: int = Field(..., alias="advantagesB")
    penalties_a: int = Field(..., alias="penaltiesA")
    penalties_b: int = Field(..., alias="penaltiesB")
    duration_sec: Optional[int] = Field(None, alias="durationSec")
    result_final: bool = Field(..., alias="resultFinal")
    awarded_winner_pts: int = Field(..., alias="awardedWinnerPts")
    awarded_loser_pts: int = Field(..., alias="awardedLoserPts")
    created_at: datetime = Field(..., alias="createdAt")
    competitor_a: UserResponse = Field(..., alias="competitorA")
    competitor_b: UserResponse = Field(..., alias="competitorB")
    winner: Optional[UserResponse] = None

    class Config:
        populate_by_name = True
        from_attributes = True

# ============= Leaderboard Schemas =============
class LeaderboardResponse(BaseModel):
    id: str
    season: str
    ruleset: str
    is_gi: bool = Field(..., alias="isGi")
    belt: str
    weight_class: str = Field(..., alias="weightClass")
    age_division: str = Field(..., alias="ageDivision")
    gender: str
    user_id: str = Field(..., alias="userId")
    points: int
    submissions: int
    wins: int
    losses: int
    last_updated: datetime = Field(..., alias="lastUpdated")
    user: UserResponse

    class Config:
        populate_by_name = True
        from_attributes = True
