from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, func
from sqlalchemy.orm import relationship

from core.db import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(10), nullable=False)  # e.g. "income" or "expense"

    transactions = relationship(
        "Transaction",
        back_populates="category",
        cascade="all, delete",
        passive_deletes=True,
    )
