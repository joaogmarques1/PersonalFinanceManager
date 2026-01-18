from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.db import get_db
from features.transactions import service, schemas
from features.transactions.analytics_service import TransactionAnalyticsService
from features.transactions.analytics_schemas import AnalyticsResponse, SpendingByCategoryResponse
from datetime import date
from fastapi import Query
from features.auth.service import get_current_user
from features.users.models import User


router = APIRouter()

@router.get("/", response_model=list[schemas.Transaction])
def list_transactions(
    sort_by: str = Query("date", enum=["date", "created_at"]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    
    return service.get_transactions(db, current_user.id, sort_by)

@router.get("/{transaction_id}", response_model=schemas.Transaction)
def get_transaction(
    transaction_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tx = service.get_transaction(db, transaction_id, current_user.id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx

@router.post("/", response_model=schemas.Transaction)
def create_transaction(
    transaction: schemas.TransactionCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.create_transaction(db, transaction, current_user.id)

@router.delete("/{transaction_id}", response_model=schemas.Transaction)
def delete_transaction(
    transaction_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tx = service.delete_transaction(db, transaction_id, current_user.id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx

@router.get("/analytics/monthly-summary", response_model=AnalyticsResponse)
def get_transactions_monthly_summary(
    start_date: date = Query(...),
    end_date: date = Query(...),
    category_id: int = Query(None),
    exclude_credit_card: bool = Query(False),
    exclude_card_repayment: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return TransactionAnalyticsService.get_monthly_summary(
        db, current_user.id, start_date, end_date, category_id, exclude_credit_card, exclude_card_repayment
    )

@router.get("/analytics/spending-by-category", response_model=SpendingByCategoryResponse)
def get_transactions_spending_by_category(
    start_date: date = Query(...),
    end_date: date = Query(...),
    category_id: int = Query(None),
    exclude_credit_card: bool = Query(False),
    exclude_card_repayment: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return TransactionAnalyticsService.get_spending_by_category(
        db, current_user.id, start_date, end_date, category_id, exclude_credit_card, exclude_card_repayment
    )