from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.db import get_db
from features.business import service, schemas
from features.users.models import User
from features.auth.service import get_current_user
from features.business.members.service import check_member_role

router = APIRouter()

@router.get("/", response_model=list[schemas.BusinessResponse])
def list_user_businesses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_user_businesses(db, current_user.id)

@router.post("/", response_model=schemas.BusinessResponse, status_code=status.HTTP_201_CREATED)
def create_business(
    business: schemas.BusinessCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.create_business(db, business, current_user.id)

@router.get("/{business_id}", response_model=schemas.BusinessResponse)
def get_business(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_member_role(db, business_id, current_user.id, ['owner', 'admin', 'member', 'viewer'])
    business = service.get_business(db, business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return business

@router.delete("/{business_id}", response_model=schemas.BusinessResponse)
def delete_business(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_member_role(db, business_id, current_user.id, ['owner', 'admin'])
    return service.delete_business(db, business_id, current_user.id)

