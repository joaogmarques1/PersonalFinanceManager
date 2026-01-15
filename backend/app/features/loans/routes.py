from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core.db import get_db
from features.auth.service import get_current_user
from features.users.models import User
from features.loans import schemas, service
from features.loans.analytics_service import LoansAnalyticsService

router = APIRouter()

@router.get("/analytics")
def get_loans_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return LoansAnalyticsService.get_analytics(db, current_user.id)

@router.post("/", response_model=schemas.LoanRead, status_code=status.HTTP_201_CREATED)
def create_loan(
    loan: schemas.LoanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.create_loan(db, loan, current_user.id)

@router.get("/", response_model=List[schemas.LoanRead])
def read_loans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_loans(db, current_user.id)

@router.get("/{loan_id}", response_model=schemas.LoanRead)
def read_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    loan = service.get_loan(db, loan_id, current_user.id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    return loan

@router.delete("/{loan_id}")
def delete_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    loan = service.delete_loan(db, loan_id, current_user.id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    return {"message": "Loan deleted successfully"}

@router.patch("/{loan_id}/link-card", response_model=schemas.LoanRead)
def link_card_to_loan(
    loan_id: int,
    update_data: schemas.LoanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if update_data.used_credit_card is None:
         raise HTTPException(status_code=400, detail="Credit Card ID required")

    loan = service.update_loan_card(db, loan_id, update_data.used_credit_card, current_user.id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    return loan

@router.post("/{loan_id}/repayment", response_model=schemas.LoanRead)
def repay_loan(
    loan_id: int,
    repayment: schemas.LoanRepayment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    loan = service.repay_loan(db, loan_id, repayment, current_user.id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    return loan

@router.post("/{loan_id}/correct-balance", response_model=schemas.LoanRead)
def correct_loan_balance(
    loan_id: int,
    correction: schemas.LoanCorrection,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    loan = service.correct_loan_balance(db, loan_id, correction, current_user.id)
    if not loan:
         raise HTTPException(status_code=404, detail="Loan not found")
    return loan

@router.get("/credit-card/{card_id}/balance", response_model=schemas.LoanBalance)
def get_credit_card_balance(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.credit_card_balance(db, card_id, current_user.id)

@router.get("/credit-cards/balances", response_model=schemas.CreditCardBalances)
def get_credit_card_balances(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.credit_card_balances(db, current_user.id)




@router.post("/credit-card/{card_id}/repay", response_model=schemas.LoanBalance)
def repay_credit_card_balance(
    card_id: int,
    repayment: schemas.LoanRepayment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.credit_card_balance_repayment(db, card_id, current_user.id, repayment)

@router.post("/credit-card/{card_id}/correct-balance", response_model=schemas.LoanBalance)
def correct_credit_card_balance(
    card_id: int,
    correction: schemas.CreditCardBalanceCorrection,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Using 'loan' variable name for consistent return check, though logic returns correction object or loan
    result = service.correct_credit_card_balance(db, card_id, correction, current_user.id)
    if not result:
         raise HTTPException(status_code=404, detail="Credit Card not found or other error")
    return result