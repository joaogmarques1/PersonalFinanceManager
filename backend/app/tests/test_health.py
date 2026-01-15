from fastapi.testclient import TestClient
from main import app


def test_health_root_ok():
    client = TestClient(app)
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.json() == {"status": "running"}
