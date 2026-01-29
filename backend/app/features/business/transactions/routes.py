from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from core.db import get_db
from features.business.transactions import service, schemas
from features.users.models import User
from features.auth.service import get_current_user
from features.business.members.service import check_member_role

router = APIRouter()

@router.get("/", response_model=list[schemas.BusinessTransactionResponse])
def list_transactions(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_member_role(db, business_id, current_user.id, ['owner', 'admin', 'member', 'viewer'])
    return service.get_transactions(db, business_id)

@router.post("/", response_model=schemas.BusinessTransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    business_id: int,
    transaction: schemas.BusinessTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_member_role(db, business_id, current_user.id, ['owner', 'admin', 'member'])
    return service.create_transaction(db, business_id, transaction, current_user.id)

@router.delete("/{transaction_id}", response_model=schemas.BusinessTransactionResponse)
def delete_transaction(
    business_id: int,
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_member_role(db, business_id, current_user.id, ['owner', 'admin', 'member'])
    return service.delete_transaction(db, transaction_id, business_id, current_user.id)
