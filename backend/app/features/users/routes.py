from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.db import get_db
from features.users import service, schemas

router = APIRouter()

@router.post("/", response_model=schemas.UserRead)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return service.create_user(db, user)
