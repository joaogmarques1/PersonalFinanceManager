from pydantic import BaseModel
from datetime import datetime

class BusinessBase(BaseModel):
    name: str
    tax_id: str
    country: str

class BusinessCreate(BusinessBase):
    pass

class BusinessResponse(BusinessBase):
    id: int
    created_at: datetime
    role: str | None = None  # Role of the current user in this business

    class Config:
        from_attributes = True
