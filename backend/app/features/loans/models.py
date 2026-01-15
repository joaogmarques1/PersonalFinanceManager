from sqlalchemy import Column, Integer, Numeric, String, Date, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.db import Base

class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    principal = Column(Numeric(10,2), nullable=False)
    used_credit_card = Column(Integer, ForeignKey("credit_cards.id", ondelete="SET NULL"), nullable=True)
    interest_rate = Column(Numeric(5,2))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    total_installments = Column(Integer)
    created_at = Column(TIMESTAMP, server_default=func.now())
    deleted_at = Column(TIMESTAMP, nullable=True)

    credit_card = relationship("features.credit_cards.models.CreditCard", back_populates="loans")