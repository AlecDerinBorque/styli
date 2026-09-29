import requests

BASE = "http://127.0.0.1:5000"

r = requests.post(f"{BASE}/users/register", json={
    "username": "alec",
    "email": "alec+test@example.com",
    "password": "testpassword123"
})
print("register:", r.status_code, r.json())

r = requests.post(f"{BASE}/users/login", json={
    "email": "alec+test@example.com",
    "password": "testpassword123"
})
print("login:", r.status_code, r.json())