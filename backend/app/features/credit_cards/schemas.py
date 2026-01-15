from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional

class CreditCardBase(BaseModel):
    name: str = Field(..., max_length=100)
    credit_card_limit: float = Field(..., gt=0)
    interest_rate: Optional[float] = None

class CreditCardCreate(CreditCardBase):
    pass

class CreditCardRead(CreditCardBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
