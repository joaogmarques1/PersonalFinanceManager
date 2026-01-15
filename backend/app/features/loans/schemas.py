from pydantic import BaseModel, ConfigDict, Field
from datetime import date, datetime
from typing import Optional

class LoanBase(BaseModel):
    name: str = Field(..., max_length=100)
    principal: float = Field(..., ge=0)
    interest_rate: Optional[float] = None
    start_date: date
    end_date: Optional[date] = None
    total_installments: Optional[int] = None
    used_credit_card: Optional[int] = None


class LoanCreate(LoanBase):
    pass


class LoanRead(LoanBase):
    id: int
    user_id: int
    created_at: datetime  

    model_config = ConfigDict(from_attributes=True)

class LoanUpdate(BaseModel):
    used_credit_card: Optional[int] = None
    interest_rate: Optional[float] = None

class LoanRepayment(BaseModel):
    amount: float = Field(..., gt=0)
    date: date
    payment_method: str = "Outro" # Default to 'Outro' or require user to specify
    description: Optional[str] = "Abatimento de Empréstimo"


class LoanCorrection(BaseModel):
    new_balance: float = Field(..., ge=0)
    reason: Optional[str] = None

class LoanBalance(BaseModel):
    balance: float = Field(..., ge=0)

class CreditCardBalances(BaseModel):
    resume: dict[int, float]

class CreditCardBalanceRepayment(BaseModel):
    repayment: float = Field(..., ge=0)

class CreditCardBalanceCorrection(BaseModel):
    balance: float = Field(..., gt=0)
    date: datetime
    description: Optional[str] = None