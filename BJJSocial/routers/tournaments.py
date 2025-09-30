from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from ..database import get_db
from ..models import User, Tournament, Match
from ..schemas import InsertTournament, TournamentResponse, InsertMatch, FinalizeMatch, MatchResponse
from ..auth import get_current_user, sanitize_user

router = APIRouter(prefix="/api", tags=["tournaments"])

# ============= Tournament Routes =============

@router.post("/tournaments", status_code=status.HTTP_201_CREATED)
async def create_tournament(
    tournament_data: InsertTournament,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new tournament"""
    new_tournament = Tournament(
        organizer_id=current_user.id,
        name=tournament_data.name,
        date=tournament_data.date,
        location=tournament_data.location,
        is_gi=tournament_data.is_gi,
        ruleset=tournament_data.ruleset,
        tier=tournament_data.tier
    )
    
    db.add(new_tournament)
    db.commit()
    db.refresh(new_tournament)
    
    return {
        "id": new_tournament.id,
        "name": new_tournament.name,
        "date": new_tournament.date.isoformat(),
        "location": new_tournament.location,
        "isGi": new_tournament.is_gi,
        "ruleset": new_tournament.ruleset,
        "tier": new_tournament.tier,
        "organizerId": new_tournament.organizer_id,
        "createdAt": new_tournament.created_at.isoformat(),
        "organizer": sanitize_user(current_user)
    }

@router.get("/tournaments")
async def get_tournaments(
    q: Optional[str] = None,
    ruleset: Optional[str] = None,
    is_gi: Optional[bool] = Query(None, alias="isGi"),
    season: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get tournaments with filters"""
    query = db.query(Tournament)
    
    if q:
        query = query.filter(Tournament.name.ilike(f"%{q}%"))
    if ruleset:
        query = query.filter(Tournament.ruleset == ruleset)
    if is_gi is not None:
        query = query.filter(Tournament.is_gi == is_gi)
    if season:
        # Filter by year
        year = int(season)
        query = query.filter(db.func.extract('year', Tournament.date) == year)
    
    tournaments = query.order_by(Tournament.date.desc()).all()
    
    # Load organizers
    result = []
    for tournament in tournaments:
        organizer = db.query(User).filter(User.id == tournament.organizer_id).first()
        result.append({
            "id": tournament.id,
            "name": tournament.name,
            "date": tournament.date.isoformat(),
            "location": tournament.location,
            "isGi": tournament.is_gi,
            "ruleset": tournament.ruleset,
            "tier": tournament.tier,
            "organizerId": tournament.organizer_id,
            "createdAt": tournament.created_at.isoformat(),
            "organizer": sanitize_user(organizer) if organizer else None
        })
    
    return result

@router.get("/tournaments/{tournament_id}")
async def get_tournament(
    tournament_id: str,
    db: Session = Depends(get_db)
):
    """Get a tournament by ID"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    organizer = db.query(User).filter(User.id == tournament.organizer_id).first()
    
    return {
        "id": tournament.id,
        "name": tournament.name,
        "date": tournament.date.isoformat(),
        "location": tournament.location,
        "isGi": tournament.is_gi,
        "ruleset": tournament.ruleset,
        "tier": tournament.tier,
        "organizerId": tournament.organizer_id,
        "createdAt": tournament.created_at.isoformat(),
        "organizer": sanitize_user(organizer) if organizer else None
    }

# ============= Match Routes =============

@router.post("/tournaments/{tournament_id}/matches", status_code=status.HTTP_201_CREATED)
async def create_match(
    tournament_id: str,
    match_data: InsertMatch,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a match in a tournament"""
    # Verify tournament exists and user is organizer
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    if tournament.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tournament organizers can create matches"
        )
    
    # Create match
    new_match = Match(
        tournament_id=tournament_id,
        round=match_data.round,
        belt=match_data.belt,
        weight_class=match_data.weight_class,
        age_division=match_data.age_division,
        gender=match_data.gender,
        competitor_a_id=match_data.competitor_a_id,
        competitor_b_id=match_data.competitor_b_id
    )
    
    db.add(new_match)
    db.commit()
    db.refresh(new_match)
    
    return {"id": new_match.id, "message": "Match created successfully"}

@router.get("/tournaments/{tournament_id}/matches")
async def get_tournament_matches(
    tournament_id: str,
    db: Session = Depends(get_db)
):
    """Get all matches for a tournament"""
    matches = db.query(Match).filter(Match.tournament_id == tournament_id).all()
    
    result = []
    for match in matches:
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
            "winner": sanitize_user(winner) if winner else None
        })
    
    return result

@router.post("/matches/{match_id}/result")
async def submit_match_result(
    match_id: str,
    result_data: FinalizeMatch,
    awarded_winner_pts: Optional[int] = Query(None, alias="awardedWinnerPts"),
    awarded_loser_pts: Optional[int] = Query(None, alias="awardedLoserPts"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit match result (organizer only)"""
    # Find match and verify authorization
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found"
        )
    
    tournament = db.query(Tournament).filter(Tournament.id == match.tournament_id).first()
    if not tournament or tournament.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tournament organizers can submit match results"
        )
    
    # Update match with result
    if result_data.winner_id:
        match.winner_id = result_data.winner_id
    if result_data.method:
        match.method = result_data.method
    if result_data.submission_type:
        match.submission_type = result_data.submission_type
    if result_data.points_a is not None:
        match.points_a = result_data.points_a
    if result_data.points_b is not None:
        match.points_b = result_data.points_b
    if result_data.advantages_a is not None:
        match.advantages_a = result_data.advantages_a
    if result_data.advantages_b is not None:
        match.advantages_b = result_data.advantages_b
    if result_data.penalties_a is not None:
        match.penalties_a = result_data.penalties_a
    if result_data.penalties_b is not None:
        match.penalties_b = result_data.penalties_b
    if result_data.duration_sec is not None:
        match.duration_sec = result_data.duration_sec
    
    if awarded_winner_pts is not None:
        match.awarded_winner_pts = awarded_winner_pts
    if awarded_loser_pts is not None:
        match.awarded_loser_pts = awarded_loser_pts
    
    match.result_final = True
    
    db.commit()
    
    return {"message": "Match result submitted successfully"}
