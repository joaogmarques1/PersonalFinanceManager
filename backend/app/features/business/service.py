from sqlalchemy.orm import Session
from features.business import models, schemas
from features.business.members import models as member_models
from datetime import datetime
from fastapi import HTTPException, status
from features.business.members.service import check_member_role

def get_business(db: Session, business_id: int):
    return db.query(models.Business).filter(models.Business.id == business_id).first()

def create_business(db: Session, business: schemas.BusinessCreate, user_id: int):
    # 1. Create Business
    db_business = models.Business(**business.model_dump())
    db.add(db_business)
    db.flush() # Flush to get the business ID before committing

    # 2. Add Creator as Owner
    db_member = member_models.BusinessMember(
        business_id=db_business.id,
        user_id=user_id,
        role="owner"
    )
    db.add(db_member)
    
    db.commit()
    db.refresh(db_business)
    return db_business

def delete_business(db: Session, business_id: int, user_id: int):
    business = get_business(db, business_id)
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    business.deleted_at = datetime.now()
    db.commit()
    return business

def get_user_businesses(db: Session, user_id: int):
    results =  db.query(models.Business, member_models.BusinessMember.role)\
        .join(member_models.BusinessMember, models.Business.id == member_models.BusinessMember.business_id)\
        .filter(member_models.BusinessMember.user_id == user_id)\
        .filter(member_models.BusinessMember.deleted_at == None)\
        .filter(models.Business.deleted_at == None)\
        .all()
    
    # Format result to include role in the business object (or return a specific schema)
    businesses = []
    for business, role in results:
        # We can dynamically add role for the Pydantic schema to pick up if configured
        business_dict = business.__dict__.copy()
        business_dict['role'] = role
        businesses.append(business_dict)
    
    return businesses
