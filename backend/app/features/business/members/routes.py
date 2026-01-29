from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from core.db import get_db
from features.business.members import service, schemas
from features.users.models import User
from features.auth.service import get_current_user

router = APIRouter()

@router.get("/", response_model=list[schemas.BusinessMemberResponse])
def list_members(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user is at least a member/viewer
    service.check_member_role(db, business_id, current_user.id, ['owner', 'admin', 'member', 'viewer'])
    return service.get_members(db, business_id)

@router.post("/", response_model=schemas.BusinessMemberResponse, status_code=status.HTTP_201_CREATED)
def add_member(
    business_id: int,
    member_data: schemas.BusinessMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only owner/admin can add members
    service.check_member_role(db, business_id, current_user.id, ['owner', 'admin'])
    return service.add_member(db, business_id, member_data)

@router.delete("/{user_id}", response_model=schemas.BusinessMemberResponse)
def remove_member(
    business_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only owner/admin can remove members
    service.check_member_role(db, business_id, current_user.id, ['owner', 'admin'])
    return service.remove_member(db, business_id, user_id)
