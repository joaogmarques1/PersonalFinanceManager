from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.db import engine, Base
from features import users, categories, transactions, loans
from features import auth

import os

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Finance Manager API", version="1.0")

# Configurar CORS via variável de ambiente
origins_str = os.getenv("CORS_ORIGINS", "")
origins = [origin.strip() for origin in origins_str.split(",")] if origins_str else []

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"ok": True, "message": "Finance Manager API online"}

# Importar routers
from features.users.routes import router as users_router
from features.categories.routes import router as categories_router
from features.transactions.routes import router as transactions_router
from features.loans.routes import router as loans_router
from features.auth.routes import router as auth_router
from features.auth.routes import router as auth_router
from features.credit_cards.routes import router as credit_cards_router

app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(categories_router, prefix="/categories", tags=["Categories"])
app.include_router(transactions_router, prefix="/transactions", tags=["Transactions"])
app.include_router(loans_router, prefix="/loans", tags=["Loans"])
app.include_router(credit_cards_router, prefix="/credit-cards", tags=["Credit Cards"])
app.include_router(auth_router, prefix="/auth", tags=["Auth"])