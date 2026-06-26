import sys
from pathlib import Path
from types import SimpleNamespace

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import backend.app as app_module


class FakeResponse:
    def __init__(self, data):
        self.data = data


class FakeTable:
    def __init__(self, rows):
        self.rows = rows

    def select(self, *_args, **_kwargs):
        return self

    def eq(self, *_args, **_kwargs):
        return self

    def order(self, *_args, **_kwargs):
        return self

    def update(self, *_args, **_kwargs):
        return self

    def delete(self, *_args, **_kwargs):
        return self

    def insert(self, *_args, **_kwargs):
        return self

    def execute(self):
        return FakeResponse(self.rows)


class FakeClient:
    def __init__(self, rows):
        self._rows = rows

    def table(self, *_args, **_kwargs):
        return FakeTable(self._rows)


@pytest.fixture
def client(monkeypatch):
    rows = [
        {
            "id": 1,
            "full_name": "Ada Lovelace",
            "dob": "1990-01-01",
            "email": "ada@example.com",
            "glucose": 92.0,
            "haemoglobin": 13.2,
            "cholesterol": 180.0,
            "remarks": "Healthy",
            "created_at": "2024-01-01T00:00:00",
            "risk_level": "Low",
        }
    ]

    monkeypatch.setattr(app_module, "get_supabase_client", lambda: FakeClient(rows))
    app_module.app.config["TESTING"] = True
    return app_module.app.test_client()


def test_get_patients_collection(client):
    response = client.get("/api/patients")
    assert response.status_code == 200
    payload = response.get_json()
    assert isinstance(payload, list)
    assert payload[0]["full_name"] == "Ada Lovelace"


def test_get_patient_detail(client):
    response = client.get("/api/patients/1")
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["email"] == "ada@example.com"


def test_frontend_routes_fall_back_to_index(client, monkeypatch, tmp_path):
    index_file = tmp_path / "index.html"
    index_file.write_text("<html>React app</html>", encoding="utf-8")
    monkeypatch.setattr(app_module, "DIST_DIR", tmp_path)

    response = client.get("/patients")

    assert response.status_code == 200
    assert b"React app" in response.data
