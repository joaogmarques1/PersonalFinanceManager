from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from core.db import get_db
from . import schemas, service

router = APIRouter()


@router.post("/", response_model=schemas.Category, status_code=status.HTTP_201_CREATED)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category."""
    return service.create_category(db=db, category=category)


@router.get("/", response_model=List[schemas.Category])
def list_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all categories."""
    return service.list_categories(db, skip=skip, limit=limit)
