from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, text, CheckConstraint, Numeric, Boolean, Date, Text
from sqlalchemy.orm import relationship
from core.db import Base

class BusinessTransaction(Base):
    __tablename__ = "business_transactions"

    id = Column(Integer, primary_key=True)
    business_id = Column(Integer, ForeignKey("business.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    counterparty_name = Column(String(100), nullable=False)
    counterparty_tax_id = Column(String(20), nullable=False)
    counterparty_country = Column(String(100), nullable=False)
    category_id = Column(Integer, ForeignKey("business_transactions_categories.id", ondelete="SET NULL"))
    description = Column(Text)
    type = Column(String(10), nullable=False)
    
    net_amount = Column(Numeric(10, 2), nullable=False)
    vat_rate = Column(Numeric(5, 2))
    vat_amount = Column(Numeric(10, 2), nullable=False)
    vat_exemption = Column(Boolean, nullable=False)
    withholding_tax_amount = Column(Numeric(5, 2))
    gross_amount = Column(Numeric(10, 2), nullable=False)
    
    currency = Column(String(3), nullable=False, default='EUR')
    payment_method = Column(String(50), nullable=False)
    invoice_number = Column(String(50))
    date = Column(Date, nullable=False)
    
    created_at = Column(TIMESTAMP, server_default=text("TIMEZONE('utc', NOW())"))
    deleted_at = Column(TIMESTAMP, nullable=True)

    __table_args__ = (
        CheckConstraint("type IN ('income', 'expense')", name='business_tx_type_check'),
    )

    category = relationship("BusinessTransactionCategory")
