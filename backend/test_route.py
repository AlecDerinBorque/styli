import base64, requests
b64 = base64.b64encode(open("backend/image.png", "rb").read()).decode()
r = requests.post("http://127.0.0.1:5000/wardrobe/classify-clothing", json={"images": [b64]})
print(r.status_code)
print(r.headers.get("Server"))
print(r.text[:500])