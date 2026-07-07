import traceback
from fastapi.testclient import TestClient
from backend.main import app

from backend.database import init_db
init_db()

client = TestClient(app)

print("--- Testing /chat ---")
try:
    response = client.post("/chat", json={
        "message": "I lost my Aadhaar",
        "session_id": "test_session",
        "language": "English"
    })
    print("Status code:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    traceback.print_exc()

print("\n--- Testing /recommend-schemes ---")
try:
    response = client.post("/recommend-schemes", json={
        "age": 25,
        "occupation": "Student",
        "income": 100000.0,
        "gender": "Male",
        "education": "Graduate"
      })
    print("Status code:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    traceback.print_exc()

print("\n--- Testing /submit-complaint ---")
try:
    response = client.post("/submit-complaint", json={
        "title": "Broken Streetlight",
        "description": "Streetlight has been broken for 3 weeks",
        "detected_type": "Broken Streetlight",
        "suggested_department": "Electricity Board",
        "severity": "Medium"
    })
    print("Status code:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    traceback.print_exc()
