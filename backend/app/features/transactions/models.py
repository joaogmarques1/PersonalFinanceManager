from sqlalchemy import Column, Integer, Text, Numeric, String, Date, TIMESTAMP, ForeignKey, text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.db import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"))
    description = Column(Text)
    amount = Column(Numeric(10, 2), nullable=False)
    type = Column(String(10), nullable=False)
    payment_method = Column(String(10), nullable=False)
    date = Column(Date, nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("TIMEZONE('utc', NOW())"))
    deleted_at = Column(TIMESTAMP, nullable=True)


    category = relationship("Category", back_populates="transactions")
