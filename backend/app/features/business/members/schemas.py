from pydantic import BaseModel
from datetime import datetime

class BusinessMemberBase(BaseModel):
    user_id: int

class BusinessMemberCreate(BusinessMemberBase):
    pass

class BusinessMemberResponse(BusinessMemberBase):
    id: int
    business_id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True
