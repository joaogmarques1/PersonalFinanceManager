from sqlalchemy.orm import Session
from . import models, schemas


def create_category(db: Session, category: schemas.CategoryCreate) -> models.Category:
    db_category = models.Category(
        name=category.name,
        type=category.type,
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def list_categories(db: Session, skip: int = 0, limit: int = 100) -> list[models.Category]:
    return db.query(models.Category).offset(skip).limit(limit).all()
