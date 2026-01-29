from pydantic import BaseModel
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    type: str | None = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    business_id: int
    created_at: datetime

    class Config:
        from_attributes = True
