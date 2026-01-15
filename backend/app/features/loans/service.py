from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from fastapi import HTTPException
from features.loans.models import Loan
from features.loans import schemas
from features.credit_cards.service import get_credit_card, get_credit_cards
from features.transactions.models import Transaction 
from features.categories.models import Category
from datetime import datetime

def get_loans(db: Session, user_id: int):
    return db.query(Loan).filter(Loan.user_id == user_id, Loan.deleted_at.is_(None)).all()

def get_loan(db: Session, loan_id: int, user_id: int):
    return db.query(Loan).filter(
        Loan.id == loan_id, 
        Loan.user_id == user_id, 
        Loan.deleted_at.is_(None)
    ).first()

def create_loan(db: Session, loan: schemas.LoanCreate, user_id: int):
    db_loan = Loan(**loan.model_dump(), user_id=user_id)
    db.add(db_loan)
    db.commit()
    db.refresh(db_loan)
    return db_loan

def delete_loan(db: Session, loan_id: int, user_id: int):
    loan = get_loan(db, loan_id, user_id)
    if loan:
        loan.deleted_at = func.now()
        db.add(loan)
        db.commit()
        db.refresh(loan)
    return loan

def update_loan_card(db: Session, loan_id: int, card_id: int, user_id: int):
    loan = get_loan(db, loan_id, user_id)
    if not loan:
        return None
    
    card = get_credit_card(db, card_id, user_id)
    if not card:
        return None

    loan.used_credit_card = card_id
    loan.interest_rate = card.interest_rate
    
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan

def repay_loan(db: Session, loan_id: int, repayment: schemas.LoanRepayment, user_id: int):
    loan = get_loan(db, loan_id, user_id)
    if not loan:
        return None
    
    # 1. Update Loan Principal
    # Ensure we don't go below zero
    new_principal = float(loan.principal) - repayment.amount
    if new_principal < 0:
         new_principal = 0 
    
    loan.principal = new_principal

    # 2. Create Transaction
    # Find the category id for "Pagamento de dívidas".
    from features.categories.models import Category
    debt_category = db.query(Category).filter(Category.name == "Pagamento de dívidas").first()
    category_id = debt_category.id if debt_category else None

    transaction = Transaction(
        user_id=user_id,
        description=repayment.description or f"Pagamento de Empréstimo: {loan.name}",
        amount=min(loan.principal, repayment.amount), # Ensure we don't overpay
        type="expense",
        payment_method="Deposito à ordem", # Fixed spelling to match init_db.sql constraint
        date=repayment.date,
        category_id=category_id # Use the ID, not the name
    )
    
    db.add(loan)
    db.add(transaction)
    db.commit()
    db.refresh(loan)
    return loan


def correct_loan_balance(db: Session, loan_id: int, correction: schemas.LoanCorrection, user_id: int):
    loan = get_loan(db, loan_id, user_id)
    if not loan:
        return None
    
    loan.principal = correction.new_balance
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan

def credit_card_balances(db:Session, user_id: int):
    credit_cards = get_credit_cards(db, user_id)

    resume = {}
    for card in credit_cards:
        current_balance = db.query(func.sum(Loan.principal)).filter(
            Loan.used_credit_card == card.id,
            Loan.user_id == user_id,
            Loan.deleted_at.is_(None)
        ).scalar() or 0.0
        resume[card.id] = float(current_balance)
    
    return schemas.CreditCardBalances(resume=resume)



def credit_card_balance(db: Session, credit_card_id: int, user_id: int):
    current_balance = db.query(func.sum(Loan.principal)).filter(
        Loan.used_credit_card == credit_card_id,
        Loan.user_id == user_id,
        Loan.deleted_at.is_(None)
    ).scalar() or 0.0
    return schemas.LoanBalance(balance=current_balance)

def credit_card_balance_repayment(db: Session, credit_card_id: int, user_id: int, repayment: schemas.LoanRepayment):
    repayment_amount = abs(repayment.amount)
    current_credit_card_balance = credit_card_balance(db, credit_card_id, user_id)
    credit_card = get_credit_card(db, credit_card_id, user_id)

    if repayment_amount > current_credit_card_balance.balance:
        repayment_amount = current_credit_card_balance.balance
        
    # Get active loans for this card, oldest first
    loans = db.query(Loan).filter(
            Loan.used_credit_card == credit_card_id,
            Loan.user_id == user_id,
            Loan.deleted_at.is_(None),
            Loan.principal > 0
    ).order_by(Loan.start_date.asc(), Loan.created_at.asc()).all()
    
    amount_to_reduce = repayment_amount
    for loan in loans:
        if amount_to_reduce <= 0:
            break
            
        if loan.principal >= amount_to_reduce:
            # This loan covers the reduction
            loan.principal = float(loan.principal) - amount_to_reduce
            amount_to_reduce = 0
            db.add(loan)
        else:
            # This loan is fully paid off, but we still need to reduce more
            amount_to_reduce -= float(loan.principal)
            loan.principal = 0
            db.add(loan)
    
    # 2. Create Transaction
    # Find the category id for "Pagamento de dívidas".
    debt_category = db.query(Category).filter(Category.name == "Pagamento de dívidas").first()
    category_id = debt_category.id if debt_category else None

    transaction = Transaction(
        user_id=user_id,
        description=f"Pagamento de Cartão de Crédito: {credit_card.name}",
        amount=min(repayment_amount, repayment.amount),
        type="expense",
        payment_method="Deposito à ordem", 
        date=repayment.date,
        category_id=category_id 
    )
    
    db.add(transaction)
    db.commit()

    return schemas.LoanBalance(balance=credit_card_balance(db, credit_card_id, user_id).balance)

def correct_credit_card_balance(db: Session, credit_card_id: int, correction: schemas.CreditCardBalanceCorrection, user_id: int):
    # 1. Calculate current total balance for this card
    current_balance_data = credit_card_balance(db, credit_card_id, user_id)
    
    current_balance = current_balance_data.balance
    target_balance = correction.balance
    diff = target_balance - current_balance

    # 2. Handle Increase (Debt went up)
    if diff > 0:
        loan_create = schemas.LoanCreate(
            name=f"Acerto de Saldo (+): {correction.description or 'Ajuste Manual'}",
            principal=diff,
            interest_rate=0,
            start_date=correction.date,
            end_date=correction.date,
            total_installments=1,
            used_credit_card=credit_card_id,
            user_id=user_id
        )
        create_loan(db, loan_create, user_id)
        return credit_card_balance(db, credit_card_id, user_id)

    # 3. Handle Decrease (Debt went down - "Repayment")
    elif diff < 0:
        amount_to_repay = abs(diff)
        repayment = schemas.LoanRepayment(
            amount=amount_to_repay,
            date=correction.date,
            description=f"Acerto de Saldo (-): {correction.description or 'Ajuste Manual'}"
        )
        return credit_card_balance_repayment(db, credit_card_id, user_id, repayment)

    # If diff is 0, nothing to do
    return credit_card_balance(db, credit_card_id, user_id)