import os
from supabase import create_client, Client
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from clip_classifier import classify
from PIL import Image
import io
import base64
import uuid
from clothing import Clothing
from outfit_generator import generate_ranked_outfits

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
if not url or not key:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in backend/.env")

supabase: Client = create_client(url, key)
supabase_auth: Client = create_client(url, key)
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

        response = supabase_auth.auth.sign_up({
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

        auth_response = supabase_auth.auth.sign_in_with_password({
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
        user = supabase_auth.auth.get_user(token)
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


@app.route('/wardrobe/save-clothing-items', methods=['POST'])
def save_clothing_items():
    try:
        auth_header = request.headers.get("Authorization")
        user_id = get_user_id_from_token(auth_header)
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401

        new_items = request.get_json()

        for item in new_items:
            item_copy = item.copy()
            img_data = item_copy.pop('image', None)

            items_response = supabase.table("clothing_items").insert(item_copy).execute()
            clothing_id = items_response.data[0]["id"]

            if "," in img_data:
                img_data = img_data.split(",")[1]
            image_bytes = base64.b64decode(img_data)

            file_name = f"clothing_{clothing_id}_{uuid.uuid4()}.jpg"
            file_path = f"user_clothes/user_{user_id}/{file_name}"

            supabase.storage.from_("images").upload(file_path, image_bytes)
            image_url = supabase.storage.from_("images").get_public_url(file_path)

            supabase.table("clothing_images").insert({
                "clothing_id": clothing_id,
                "image_url": image_url,
                "image_name": file_name,
                "user_id": user_id
            }).execute()

        return jsonify(new_items), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    

@app.route('/wardrobe/fetch-user-items', methods=['GET'])
def get_wardrobe():
    try:
        auth_header = request.headers.get("Authorization")
        user_id = get_user_id_from_token(auth_header)
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401

        response = (
            supabase
            .table("clothing_images")
            .select("user_id, clothing_id, image_url, clothing_items(*)")
            .eq("user_id", user_id)
            .execute()
        )

        wardrobe = []
        for row in response.data:
            clothing_data = row["clothing_items"]
            if not clothing_data:
                continue
            wardrobe.append({
                "image": row["image_url"],
                "main_category": clothing_data.get("main_category", ""),
                "sub_category": clothing_data.get("sub_category", ""),
                "style": clothing_data.get("style", ""),
                "silhouette": clothing_data.get("silhouette", ""),
                "color": clothing_data.get("color", ""),
                "pattern": clothing_data.get("pattern", ""),
                "season": clothing_data.get("season", ""),
                "occasion": clothing_data.get("occasion", ""),
            })

        return jsonify(wardrobe), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/outfits/generate', methods=['POST'])
def generate_outfit():
    try:
        request_data = request.get_json()

        auth_header = request.headers.get("Authorization")
        user_id = get_user_id_from_token(auth_header)
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401

        response = (
            supabase
            .table("clothing_images")
            .select("user_id, clothing_id, image_url, clothing_items(*)")
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            return jsonify({"outfit": []}), 200

        clothing_list = []
        for row in response.data:
            metadata = row.get("clothing_items")
            if not metadata:
                continue
            clothing_list.append(Clothing(
                row["image_url"], metadata['main_category'], metadata['sub_category'],
                metadata['style'], metadata['silhouette'], metadata['color'],
                metadata['pattern'], metadata['season'], metadata['occasion'],
                row['clothing_id']
            ))

        generated_outfits = generate_ranked_outfits(clothing_list, request_data)

        formatted_outfits = []
        for outfit in generated_outfits:
            formatted_outfit = []
            for category, clothing_item in outfit.items():
                if category == "score" or not clothing_item:
                    continue
                formatted_outfit.append({
                    "id": clothing_item.id,
                    "image": clothing_item.image_url,
                    "category": category,
                    "main_category": clothing_item.main_category,
                    "sub_category": clothing_item.sub_category,
                    "color": clothing_item.color
                })
            if formatted_outfit:
                formatted_outfits.append(formatted_outfit)

        return jsonify({"outfit": formatted_outfits}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)