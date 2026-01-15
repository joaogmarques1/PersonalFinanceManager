from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from features.transactions import models, schemas


def get_transactions(db: Session, user_id: int):
    return db.query(models.Transaction).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.deleted_at.is_(None)
    ).all()


def get_transaction(db: Session, transaction_id: int, user_id: int):
    return (
        db.query(models.Transaction)
        .filter(models.Transaction.id == transaction_id)
        .filter(models.Transaction.user_id == user_id)
        .filter(models.Transaction.deleted_at.is_(None))
        .first()
    )


def create_transaction(db: Session, transaction: schemas.TransactionCreate, user_id: int):
    db_tx = models.Transaction(**transaction.model_dump(), user_id=user_id)
    db.add(db_tx)
    
    # Check for Credit Card usage
    if transaction.payment_method == "Cartão de crédito":
        # Create an unlinked Loan
        from features.loans.models import Loan
        
        loan = Loan(
            user_id=user_id,
            name=f"Despesa CC: {transaction.description or 'Sem descrição'}",
            principal=transaction.amount,
            start_date=transaction.date,
            used_credit_card=None, # To be linked later
            interest_rate=None,        # As requested
            total_installments=1       # Default to 1-time full payment
        )
        db.add(loan)

    db.commit()
    db.refresh(db_tx)
    return db_tx


def delete_transaction(db: Session, transaction_id: int, user_id: int):
    tx = get_transaction(db, transaction_id, user_id)
    if tx:
        tx.deleted_at = func.now()
        db.add(tx)
        db.commit()
        db.refresh(tx)
    if tx.payment_method == "Cartão de crédito":
        from features.loans.models import Loan
        
        # Heuristic: Find one matching unlinked loan to delete
        loan_to_delete = db.query(Loan).filter(
            Loan.user_id == tx.user_id,
            Loan.name == f"Despesa CC: {tx.description or 'Sem descrição'}",
            Loan.principal == tx.amount,
            Loan.start_date == tx.date,
            Loan.deleted_at.is_(None)
        ).first()

        if loan_to_delete:
            loan_to_delete.deleted_at = func.now()
            db.add(loan_to_delete)
            db.commit()
    return tx