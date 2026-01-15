from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    username: str | None = None

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    created_at: str
    class Config:
        from_attributes = True