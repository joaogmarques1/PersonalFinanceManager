from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, text, CheckConstraint
from sqlalchemy.orm import relationship
from core.db import Base

class BusinessMember(Base):
    __tablename__ = "business_members"

    id = Column(Integer, primary_key=True)
    business_id = Column(Integer, ForeignKey("business.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("TIMEZONE('utc', NOW())"))
    deleted_at = Column(TIMESTAMP, nullable=True)

    __table_args__ = (
        CheckConstraint("role IN ('owner', 'admin', 'member', 'viewer', 'invited')", name='business_members_role_check'),
    )
