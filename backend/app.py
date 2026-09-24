from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app,
     origins=["http://localhost:3000"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

@app.route('/server_test', methods=['GET'])
def server_test():
    return jsonify({"message": "Success!"}), 200

if __name__ == '__main__':
    app.run(debug=True)