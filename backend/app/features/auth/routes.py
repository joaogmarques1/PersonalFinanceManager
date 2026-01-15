from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.db import get_db
from features.auth import service, schemas
from features.users.models import User


router = APIRouter()

@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = service.register_user(db, user)
        token = service.create_access_token({"sub": str(db_user.id)})
        return {"access_token": token, "token_type": "bearer"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    token = service.authenticate_user(db, credentials)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")
    return token

from features.auth.service import get_current_user

@router.get("/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    """Devolve os dados do utilizador autenticado"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,  
        "created_at": current_user.created_at
    }