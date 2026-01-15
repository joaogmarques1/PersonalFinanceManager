"""Security placeholders (no-ops).

These functions are stubs to illustrate where hashing or token utilities would
live. They are intentionally unimplemented.
"""


def hash_password(password: str) -> str:  # pragma: no cover - placeholder
    """Placeholder for password hashing."""
    pass


def verify_password(plain_password: str, hashed_password: str) -> bool:  # pragma: no cover - placeholder
    """Placeholder for password verification."""
    pass

