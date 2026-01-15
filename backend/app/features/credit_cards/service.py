from sqlalchemy.orm import Session
from features.credit_cards.models import CreditCard
from features.credit_cards.schemas import CreditCardCreate

def get_credit_cards(db: Session, user_id: int):
    return db.query(CreditCard).filter(CreditCard.user_id == user_id).all()

def get_credit_card(db: Session, credit_card_id: int, user_id: int):
    return db.query(CreditCard).filter(CreditCard.id == credit_card_id, CreditCard.user_id == user_id).first()

def create_credit_card(db: Session, card: CreditCardCreate, user_id: int):
    db_card = CreditCard(**card.model_dump(), user_id=user_id)
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card

def delete_credit_card(db: Session, credit_card_id: int, user_id: int):
    card = get_credit_card(db, credit_card_id, user_id)
    if card:
        db.delete(card)
        db.commit()
    return card

