from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import settings

# Connection to postgreSQL
engine = create_engine(settings.DATABASE_URL, echo=settings.DEBUG)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# function to use access the DB
def get_db():
    """Returns a db session to each request"""
    db = SessionLocal()
    try:
         # força o encoding na sessão
        db.execute(text("SET client_encoding TO 'UTF8';"))
        yield db
    finally:
        db.close()
