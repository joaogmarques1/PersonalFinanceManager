from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint, TIMESTAMP, text
from core.db import Base

class Business(Base):
    __tablename__ = "business"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    tax_id = Column(String(20), nullable=False)
    country = Column(String(100), nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("TIMEZONE('utc', NOW())"))
    deleted_at = Column(TIMESTAMP, nullable=True)

    __table_args__ = (
        UniqueConstraint('tax_id', 'country', name='business_tax_id_country_key'),
    )
