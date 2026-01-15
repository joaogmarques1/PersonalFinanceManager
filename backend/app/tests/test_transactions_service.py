from __future__ import annotations

from datetime import date
import pytest
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import sessionmaker

from core.db import Base
from features.transactions import models, schemas, service
from features.users.models import User
from features.categories.models import Category


@pytest.fixture()
def db_session():
    engine = create_engine("sqlite:///:memory:", future=True)
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def _create_user(session) -> User:
    user = User(email="user@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def _transaction_payload(user_id: int, **overrides) -> schemas.TransactionCreate:
    data = {
        "description": "Salary",
        "amount": 1250.55,
        "type": "income",
        "date": date(2024, 1, 1),
        "category_id": None,
        "user_id": user_id,
    }
    data.update(overrides)
    return schemas.TransactionCreate(**data)


def test_create_transaction_persists_and_returns_instance(db_session):
    user = _create_user(db_session)

    payload = _transaction_payload(user_id=user.id)

    created = service.create_transaction(db_session, payload)

    assert created.id is not None
    assert created.user_id == user.id
    assert pytest.approx(float(created.amount), rel=0.0, abs=0.01) == pytest.approx(1250.55, rel=0.0, abs=0.01)

    # ensure it round-trips from the database
    fetched = service.get_transaction(db_session, created.id)
    assert fetched is not None
    assert fetched.id == created.id


def test_get_transactions_returns_all(db_session):
    user = _create_user(db_session)

    for idx in range(2):
        payload = _transaction_payload(user_id=user.id, description=f"Entry {idx}")
        service.create_transaction(db_session, payload)

    transactions = service.get_transactions(db_session)

    assert len(transactions) == 2
    assert {tx.description for tx in transactions} == {"Entry 0", "Entry 1"}


def test_delete_transaction_removes_existing_record(db_session):
    user = _create_user(db_session)
    payload = _transaction_payload(user_id=user.id)
    created = service.create_transaction(db_session, payload)

    deleted = service.delete_transaction(db_session, created.id)

    assert deleted is not None
    assert deleted.id == created.id
    assert service.get_transaction(db_session, created.id) is None


def test_delete_transaction_returns_none_for_missing_id(db_session):
    assert service.delete_transaction(db_session, transaction_id=9999) is None
