from sqlalchemy import Column, Integer, Numeric, String, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import relationship
from core.db import Base

class CreditCard(Base):
    __tablename__ = "credit_cards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    credit_card_limit = Column(Numeric(10, 2), nullable=False)
    interest_rate = Column(Numeric(5, 2))
    created_at = Column(TIMESTAMP, server_default=func.now())

    loans = relationship("Loan", back_populates="credit_card")
