import os
from supabase import create_client, Client
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from clip_classifier import classify
from PIL import Image
import io
import base64

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
if not url or not key:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in backend/.env")

supabase: Client = create_client(url, key)
app = Flask(__name__)
CORS(app,
     origins=["http://localhost:3000"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])


@app.route('/server_test', methods=['GET'])
def server_test():
    return jsonify({"message": "Success!"}), 200


@app.route('/users/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        if not email or not password or not username:
            return jsonify({"error": "Email, password, or username not provided."}), 400

        response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        if response.user:
            return jsonify({"message": "User registered successfully"}), 201
        else:
            return jsonify({"error": "User registration failed"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/users/login', methods=['POST'])
def login_user():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        session = auth_response.session
        if session:
            return jsonify({
                "message": "Login successful",
                "access_token": session.access_token,
                "user_id": auth_response.user.id
            }), 200
        else:
            return jsonify({"error": "Login failed, invalid email or password."}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 401


def get_user_id_from_token(auth_header):
    try:
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        token = auth_header.split(" ")[1]
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception:
        return None


@app.route('/wardrobe/classify-clothing', methods=['POST'])
def classify_clothing():
    try:
        images = request.get_json().get("images", [])
        classifications = []

        for base64_string in images:
            image_bytes = base64.b64decode(base64_string)
            image = Image.open(io.BytesIO(image_bytes))

            classification = classify(image)
            classification['image'] = base64_string
            classifications.append(classification)

        return jsonify({"message": classifications}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)