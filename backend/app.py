from flask import Flask, jsonify, request
from flask_cors import CORS
from clip_classifier import classify
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app,
     origins=["http://localhost:3000"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

@app.route('/server_test', methods=['GET'])
def server_test():
    return jsonify({"message": "Success!"}), 200

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
    app.run(debug=True)