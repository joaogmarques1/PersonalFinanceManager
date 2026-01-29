from sqlalchemy.orm import Session
from features.business.transaction_categories import models, schemas
from fastapi import HTTPException, status

def get_categories(db: Session, business_id: int):
    return db.query(models.BusinessTransactionCategory).filter(
        models.BusinessTransactionCategory.business_id == business_id
    ).all()

def create_category(db: Session, business_id: int, category: schemas.CategoryCreate):
    # Check if exists
    existing = db.query(models.BusinessTransactionCategory).filter(
        models.BusinessTransactionCategory.business_id == business_id,
        models.BusinessTransactionCategory.name == category.name, # Simplified check by name
        models.BusinessTransactionCategory.type == category.type
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")

    new_cat = models.BusinessTransactionCategory(
        business_id=business_id,
        **category.model_dump()
    )
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat

def update_category(db: Session, category_id: int, business_id: int, category: schemas.CategoryUpdate):
    db_category = db.query(models.BusinessTransactionCategory).filter(
        models.BusinessTransactionCategory.id == category_id,
        models.BusinessTransactionCategory.business_id == business_id
    ).first()
    
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    for key, value in category.model_dump().items():
        setattr(db_category, key, value)
        
    db.commit()
    db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int, business_id: int):
    category = db.query(models.BusinessTransactionCategory).filter(
        models.BusinessTransactionCategory.id == category_id,
        models.BusinessTransactionCategory.business_id == business_id
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    category.deleted_at = datetime.now()
    db.commit()
    return category
