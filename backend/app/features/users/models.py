from sqlalchemy import Column, Integer, String, DateTime, func
from core.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)   # ✅ adicionado
    password_hash = Column(String, nullable=False)             # ✅ campo usado no auth
    username = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())