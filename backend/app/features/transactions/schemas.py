from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from features.categories.schemas import Category

class TransactionBase(BaseModel):
    description: str | None = None
    amount: float
    type: str
    payment_method: str
    date: date
    category_id: int | None = None


class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    user_id: int
    created_at: datetime
    category: Category | None = None

    class Config:
        from_attributes = True
