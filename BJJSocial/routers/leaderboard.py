from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import Optional
from database import get_db
from models import User, Leaderboard, Match, Tournament
from schemas import LeaderboardResponse
from auth import sanitize_user

router = APIRouter(prefix="/api", tags=["leaderboard"])

@router.get("/leaderboard")
async def get_leaderboard(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    ruleset: Optional[str] = None,
    is_gi: Optional[bool] = Query(None, alias="isGi"),
    belt: Optional[str] = None,
    weight_class: Optional[str] = Query(None, alias="weightClass"),
    age_division: Optional[str] = Query(None, alias="ageDivision"),
    gender: Optional[str] = None,
    season: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get leaderboard with filters and pagination"""
    offset = (page - 1) * limit
    
    query = db.query(Leaderboard)
    
    if ruleset:
        query = query.filter(Leaderboard.ruleset == ruleset)
    if is_gi is not None:
        query = query.filter(Leaderboard.is_gi == is_gi)
    if belt:
        query = query.filter(Leaderboard.belt == belt)
    if weight_class:
        query = query.filter(Leaderboard.weight_class == weight_class)
    if age_division:
        query = query.filter(Leaderboard.age_division == age_division)
    if gender:
        query = query.filter(Leaderboard.gender == gender)
    if season:
        query = query.filter(Leaderboard.season == season)
    
    entries = query.order_by(Leaderboard.points.desc()).offset(offset).limit(limit).all()
    
    result = []
    for entry in entries:
        user = db.query(User).filter(User.id == entry.user_id).first()
        result.append({
            "id": entry.id,
            "season": entry.season,
            "ruleset": entry.ruleset,
            "isGi": entry.is_gi,
            "belt": entry.belt,
            "weightClass": entry.weight_class,
            "ageDivision": entry.age_division,
            "gender": entry.gender,
            "userId": entry.user_id,
            "points": entry.points,
            "submissions": entry.submissions,
            "wins": entry.wins,
            "losses": entry.losses,
            "lastUpdated": entry.last_updated.isoformat(),
            "user": sanitize_user(user) if user else None
        })
    
    return {
        "data": result,
        "page": page,
        "limit": limit,
        "hasMore": len(entries) == limit
    }

@router.get("/users/{user_id}/leaderboard")
async def get_user_leaderboard_entries(
    user_id: str,
    season: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get a user's leaderboard entries"""
    query = db.query(Leaderboard).filter(Leaderboard.user_id == user_id)
    
    if season:
        query = query.filter(Leaderboard.season == season)
    
    entries = query.all()
    
    user = db.query(User).filter(User.id == user_id).first()
    
    result = []
    for entry in entries:
        result.append({
            "id": entry.id,
            "season": entry.season,
            "ruleset": entry.ruleset,
            "isGi": entry.is_gi,
            "belt": entry.belt,
            "weightClass": entry.weight_class,
            "ageDivision": entry.age_division,
            "gender": entry.gender,
            "userId": entry.user_id,
            "points": entry.points,
            "submissions": entry.submissions,
            "wins": entry.wins,
            "losses": entry.losses,
            "lastUpdated": entry.last_updated.isoformat(),
            "user": sanitize_user(user) if user else None
        })
    
    return result

@router.get("/users/{user_id}/matches")
async def get_user_matches(
    user_id: str,
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get a user's recent matches"""
    # Get matches where user is either competitor
    matches = db.query(Match).filter(
        (Match.competitor_a_id == user_id) | (Match.competitor_b_id == user_id)
    ).order_by(Match.created_at.desc()).limit(limit).all()
    
    result = []
    for match in matches:
        tournament = db.query(Tournament).filter(Tournament.id == match.tournament_id).first()
        comp_a = db.query(User).filter(User.id == match.competitor_a_id).first()
        comp_b = db.query(User).filter(User.id == match.competitor_b_id).first()
        winner = db.query(User).filter(User.id == match.winner_id).first() if match.winner_id else None
        
        result.append({
            "id": match.id,
            "tournamentId": match.tournament_id,
            "round": match.round,
            "belt": match.belt,
            "weightClass": match.weight_class,
            "ageDivision": match.age_division,
            "gender": match.gender,
            "competitorAId": match.competitor_a_id,
            "competitorBId": match.competitor_b_id,
            "winnerId": match.winner_id,
            "method": match.method,
            "submissionType": match.submission_type,
            "pointsA": match.points_a,
            "pointsB": match.points_b,
            "advantagesA": match.advantages_a,
            "advantagesB": match.advantages_b,
            "penaltiesA": match.penalties_a,
            "penaltiesB": match.penalties_b,
            "durationSec": match.duration_sec,
            "resultFinal": match.result_final,
            "awardedWinnerPts": match.awarded_winner_pts,
            "awardedLoserPts": match.awarded_loser_pts,
            "createdAt": match.created_at.isoformat(),
            "competitorA": sanitize_user(comp_a) if comp_a else None,
            "competitorB": sanitize_user(comp_b) if comp_b else None,
            "winner": sanitize_user(winner) if winner else None,
            "tournament": {
                "id": tournament.id,
                "name": tournament.name,
                "date": tournament.date.isoformat(),
                "ruleset": tournament.ruleset,
                "isGi": tournament.is_gi
            } if tournament else None
        })
    
    return result

@router.get("/schools/{school}/leaderboard")
async def get_school_leaderboard(
    school: str,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    ruleset: Optional[str] = None,
    is_gi: Optional[bool] = Query(None, alias="isGi"),
    belt: Optional[str] = None,
    weight_class: Optional[str] = Query(None, alias="weightClass"),
    age_division: Optional[str] = Query(None, alias="ageDivision"),
    gender: Optional[str] = None,
    season: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get leaderboard for a specific school"""
    offset = (page - 1) * limit
    
    # Get users from the school
    school_users = db.query(User).filter(User.school == school).all()
    user_ids = [u.id for u in school_users]
    
    if not user_ids:
        return {
            "data": [],
            "page": page,
            "limit": limit,
            "school": school,
            "hasMore": False
        }
    
    query = db.query(Leaderboard).filter(Leaderboard.user_id.in_(user_ids))
    
    if ruleset:
        query = query.filter(Leaderboard.ruleset == ruleset)
    if is_gi is not None:
        query = query.filter(Leaderboard.is_gi == is_gi)
    if belt:
        query = query.filter(Leaderboard.belt == belt)
    if weight_class:
        query = query.filter(Leaderboard.weight_class == weight_class)
    if age_division:
        query = query.filter(Leaderboard.age_division == age_division)
    if gender:
        query = query.filter(Leaderboard.gender == gender)
    if season:
        query = query.filter(Leaderboard.season == season)
    
    entries = query.order_by(Leaderboard.points.desc()).offset(offset).limit(limit).all()
    
    result = []
    for entry in entries:
        user = db.query(User).filter(User.id == entry.user_id).first()
        result.append({
            "id": entry.id,
            "season": entry.season,
            "ruleset": entry.ruleset,
            "isGi": entry.is_gi,
            "belt": entry.belt,
            "weightClass": entry.weight_class,
            "ageDivision": entry.age_division,
            "gender": entry.gender,
            "userId": entry.user_id,
            "points": entry.points,
            "submissions": entry.submissions,
            "wins": entry.wins,
            "losses": entry.losses,
            "lastUpdated": entry.last_updated.isoformat(),
            "user": sanitize_user(user) if user else None
        })
    
    return {
        "data": result,
        "page": page,
        "limit": limit,
        "school": school,
        "hasMore": len(entries) == limit
    }

@router.get("/schools/rankings")
async def get_school_rankings(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    season: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get school-wide rankings"""
    offset = (page - 1) * limit
    
    # Aggregate points by school
    query = db.query(
        User.school,
        func.sum(Leaderboard.points).label('total_points'),
        func.count(func.distinct(Leaderboard.user_id)).label('athlete_count')
    ).join(Leaderboard, User.id == Leaderboard.user_id).filter(User.school.isnot(None))
    
    if season:
        query = query.filter(Leaderboard.season == season)
    
    school_rankings = query.group_by(User.school).order_by(func.sum(Leaderboard.points).desc()).offset(offset).limit(limit).all()
    
    result = []
    for school, total_points, athlete_count in school_rankings:
        result.append({
            "school": school,
            "totalPoints": int(total_points) if total_points else 0,
            "athleteCount": int(athlete_count) if athlete_count else 0
        })
    
    return {
        "data": result,
        "page": page,
        "limit": limit,
        "hasMore": len(school_rankings) == limit
    }
