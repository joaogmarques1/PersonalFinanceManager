from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core.db import get_db
from features.auth.service import get_current_user
from features.users.models import User
from features.credit_cards import schemas, service
from features.credit_cards.analytics_service import CreditCardsAnalyticsService
from features.credit_cards.recommendation_service import RecommendationService

router = APIRouter()

@router.get("/analytics")
def get_credit_cards_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return CreditCardsAnalyticsService.get_analytics(db, current_user.id)

@router.post("/", response_model=schemas.CreditCardRead, status_code=status.HTTP_201_CREATED)
def create_credit_card(
    card: schemas.CreditCardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.create_credit_card(db, card, current_user.id)

@router.get("/", response_model=List[schemas.CreditCardRead])
def read_credit_cards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_credit_cards(db, current_user.id)

@router.get("/{card_id}", response_model=schemas.CreditCardRead)
def read_credit_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    card = service.get_credit_card(db, card_id, current_user.id)
    if not card:
        raise HTTPException(status_code=404, detail="Credit card not found")
    return card

@router.delete("/{card_id}")
def delete_credit_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    card = service.delete_credit_card(db, card_id, current_user.id)
    if not card:
        raise HTTPException(status_code=404, detail="Credit card not found")
    return {"message": "Credit card deleted successfully"}
@router.get("/recommendations/repayment")
def get_repayment_recommendations(
    amount: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return RecommendationService.get_repayment_recommendations(db, current_user.id, amount)

@router.get("/recommendations/purchase")
def get_purchase_recommendations(
    amount: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return RecommendationService.get_purchase_recommendations(db, current_user.id, amount)
