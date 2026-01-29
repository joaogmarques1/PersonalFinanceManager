from sqlalchemy.orm import Session
from features.business.members import models, schemas
from fastapi import HTTPException, status
from datetime import datetime

def check_member_role(db: Session, business_id: int, user_id: int, allowed_roles: list[str]):
    member = db.query(models.BusinessMember).filter(
        models.BusinessMember.business_id == business_id,
        models.BusinessMember.user_id == user_id
    ).first()
    
    if not member or member.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action."
        )
    return member

def get_members(db: Session, business_id: int):
    return db.query(models.BusinessMember).filter(models.BusinessMember.business_id == business_id).all()

def add_member(db: Session, business_id: int, member_data: schemas.BusinessMemberCreate):
    # Check if already exists
    existing = db.query(models.BusinessMember).filter(
        models.BusinessMember.business_id == business_id,
        models.BusinessMember.user_id == member_data.user_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member of this business")

    new_member = models.BusinessMember(
        business_id=business_id,
        user_id=member_data.user_id,
        role= 'invited'
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member

def remove_member(db: Session, business_id: int, user_id_to_remove: int):
    member = db.query(models.BusinessMember).filter(
        models.BusinessMember.business_id == business_id,
        models.BusinessMember.user_id == user_id_to_remove
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    member.deleted_at = datetime.now()
    db.commit()
    return member
