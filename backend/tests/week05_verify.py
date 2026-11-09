"""Read-only verification: run from repository root with python -m backend.tests.week05_verify."""
from pathlib import Path
import requests
from sqlalchemy import text
from backend.app.database import engine


def main():
    base = "http://127.0.0.1:8000"
    health = requests.get(base + "/health", timeout=5)
    health.raise_for_status()
    print("HEALTH", health.json())
    with engine.connect() as connection:
        script = Path(__file__).resolve().parents[2] / "database/13_week05_verify.sql"
        for query in script.read_text(encoding="utf-8").split(";"):
            if query.strip():
                rows = connection.execute(text(query)).mappings().all()
                print("SQL", [dict(row) for row in rows])
        expected = connection.execute(text("""
            SELECT id FROM enrollment_events
            WHERE dataset = 'demo' AND student_id = '22000004'
            ORDER BY occurred_at DESC, id DESC LIMIT 10
        """)).scalars().all()
        history = requests.get(base + "/enrollment-events",
                               params={"student_id": "22000004", "limit": 10}, timeout=5)
        history.raise_for_status()
        assert [row["id"] for row in history.json()] == expected
        print("PASS: HTTP history matches PostgreSQL demo rows and stable ordering.")
        print("DATASETS", connection.execute(text(
            "SELECT dataset, COUNT(*) FROM enrollment_events GROUP BY dataset"
        )).all())
    for origin in ("http://localhost:5173", "http://127.0.0.1:5173"):
        response = requests.options(base + "/enrollments", headers={
            "Origin": origin, "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
        }, timeout=5)
        assert response.status_code == 200
        assert response.headers["access-control-allow-origin"] == origin
    print("PASS: CORS preflight for both allowed origins.")


if __name__ == "__main__":
    main()
