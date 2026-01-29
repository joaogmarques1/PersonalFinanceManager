from sqlalchemy.orm import Session
from features.business.transactions import models, schemas
from features.business.members.service import check_member_role
from fastapi import HTTPException, status
from typing import Optional
from datetime import datetime

def get_transactions(db: Session, business_id: int):
    return db.query(models.BusinessTransaction).filter(
        models.BusinessTransaction.business_id == business_id
    ).all()

def create_transaction(db: Session, business_id: int, transaction: schemas.BusinessTransactionCreate, user_id: int):
    new_tx = models.BusinessTransaction(
        business_id=business_id,
        user_id=user_id,
        **transaction.model_dump()
    )
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    return new_tx

def delete_transaction(db: Session, transaction_id: int, business_id: int, user_id: int):
    transaction = db.query(models.BusinessTransaction).filter(
        models.BusinessTransaction.id == transaction_id,
        models.BusinessTransaction.business_id == business_id,
        models.BusinessTransaction.deleted_at == None
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Permission check:
    # Allow deletion if user is the creator OR if user is owner/admin
    if transaction.user_id != user_id:
        # If not the creator, must be owner or admin
        check_member_role(db, business_id, user_id, ['owner', 'admin'])

    transaction.deleted_at = datetime.now()
    db.commit()
    return transaction