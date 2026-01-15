from sqlalchemy.orm import Session
from fastapi import HTTPException
from features.users import models, schemas
from passlib.hash import bcrypt

def create_user(db: Session, user: schemas.UserCreate):
    # Existing email check
    if db.query(User).filter(User.email == user.email).first():
        raise ValueError("Email já registado")
    
    # Existing username check
    if db.query(User).filter(User.username == user.username).first():
        raise ValueError("Username já existe") # This message is sent to frontend
    
    hashed_pw = bcrypt.hash(user.password)
    new_user = models.User(email=user.email, password_hash=hashed_pw, username=user.username)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
