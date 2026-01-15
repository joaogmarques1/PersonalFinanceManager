from sqlalchemy import inspect
from core.db import engine, Base
from features.categories import models # ensure model is imported

def check_and_create():
    inspector = inspect(engine)
    if "categories" in inspector.get_tables_names():
        print("Table 'categories' EXISTS.")
    else:
        print("Table 'categories' MISSING. Creating...")
        # Be careful here, but for this task/user context creating it is likely desired
        Base.metadata.create_all(bind=engine)
        print("Table 'categories' CREATED.")

if __name__ == "__main__":
    check_and_create()
