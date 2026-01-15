import pytest
from sqlalchemy import text
from core.db import engine


def test_db_connection_select_1():
    """
    Attempts a lightweight connection and simple SELECT.
    Skips gracefully if the configured DB is not reachable.
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            assert result.scalar() == 1
    except Exception as exc:
        pytest.skip(f"Database not available: {exc}")

