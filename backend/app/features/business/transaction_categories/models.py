from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, text, CheckConstraint
from core.db import Base

class BusinessTransactionCategory(Base):
    __tablename__ = "business_transactions_categories"

    id = Column(Integer, primary_key=True)
    business_id = Column(Integer, ForeignKey("business.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    type = Column(String(10), nullable=True)
    created_at = Column(TIMESTAMP, server_default=text("TIMEZONE('utc', NOW())"))
    deleted_at = Column(TIMESTAMP, nullable=True)

    __table_args__ = (
        CheckConstraint("type IN ('income', 'expense')", name='business_tx_cat_type_check'),
    )
