from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class BusinessTransactionBase(BaseModel):
    counterparty_name: str
    counterparty_tax_id: str
    counterparty_country: str
    category_id: Optional[int]
    description: Optional[str]
    type: str
    net_amount: float
    vat_rate: Optional[float]
    vat_amount: float
    vat_exemption: bool
    withholding_tax_amount: Optional[float]
    gross_amount: float
    currency: str = 'EUR'
    payment_method: str
    invoice_number: Optional[str]
    date: date

class BusinessTransactionCreate(BusinessTransactionBase):
    pass

from features.business.transaction_categories.schemas import CategoryResponse

class BusinessTransactionResponse(BusinessTransactionBase):
    id: int
    business_id: int
    user_id: int
    created_at: datetime
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True
