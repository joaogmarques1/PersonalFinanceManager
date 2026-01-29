from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from core.db import get_db
from features.business.transaction_categories import service, schemas
from features.users.models import User
from features.auth.service import get_current_user
from features.business.members.service import check_member_role

router = APIRouter()

@router.get("/", response_model=list[schemas.CategoryResponse])
def list_categories(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_member_role(db, business_id, current_user.id, ['owner', 'admin', 'member', 'viewer'])
    return service.get_categories(db, business_id)

@router.post("/", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    business_id: int,
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_member_role(db, business_id, current_user.id, ['owner', 'admin'])
    return service.create_category(db, business_id, category)

@router.put("/{category_id}", response_model=schemas.CategoryResponse)
def update_category(
    business_id: int,
    category_id: int,
    category: schemas.CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_member_role(db, business_id, current_user.id, ['owner', 'admin'])
    return service.update_category(db, category_id, business_id, category)

@router.delete("/{category_id}", status_code=status.HTTP_200_OK)
def delete_category(
    business_id: int,
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_member_role(db, business_id, current_user.id, ['owner', 'admin'])
    return service.delete_category(db, category_id, business_id)
