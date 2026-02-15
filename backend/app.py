import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from bson.objectid import ObjectId
import google.generativeai as genai

# ==============================================================================
# INITIAL SETUP & CONFIGURATION
# ==============================================================================

# 1. Load Environment Variables from the .env file
# This loads the MONGO_URI, GEMINI_API_KEY, and JWT_SECRET_KEY
load_dotenv()

# 2. Initialize the Flask Application
app = Flask(__name__)

# 3. Configure CORS (Cross-Origin Resource Sharing)
# This is crucial to allow our React frontend (running on localhost:3000)
# to make API requests to this backend server (running on localhost:5000).
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# 4. Connect to the MongoDB Database
try:
    client = MongoClient(os.getenv("MONGO_URI"))
    db = client.get_database('ai_resume_builder_db')
    users_collection = db.users
    resumes_collection = db.resumes
    print("MongoDB connected successfully!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

# 5. Configure the Google Gemini AI Model
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    ai_model = genai.GenerativeModel('gemini-2.5-flash')
    print("Google AI Model configured successfully!")
except Exception as e:
    print(f"Error configuring Google AI: {e}")
    ai_model = None

# 6. Get the Secret Key for JWT (JSON Web Tokens)
JWT_SECRET = os.getenv("JWT_SECRET_KEY")

# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================

# This function decodes the JWT token sent from the frontend to securely identify the user.
def get_user_id_from_token(request):
    try:
        # The token is expected in the 'Authorization' header like: "Bearer <token>"
        token = request.headers.get('Authorization').split('Bearer ')[1]
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return decoded['user_id']
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None

# ==============================================================================
# API ENDPOINTS (ROUTES)
# ==============================================================================

# --- AUTHENTICATION ENDPOINTS ---

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        if users_collection.find_one({"email": email}):
            return jsonify({"error": "User with this email already exists"}), 409

        # ✅ FIX: store hash as string
        hashed_password = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

        users_collection.insert_one({
            "email": email,
            "password": hashed_password
        })

        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        print("Register error:", e)  # 👈 keep this
        return jsonify({"error": str(e)}), 500


@app.route('/api/login', methods=['POST'])
def login():
    """Handles user login and returns a JWT token."""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        user = users_collection.find_one({"email": email})

        # ✅ FIX: encode stored hash back to bytes
        if user and bcrypt.checkpw(
            password.encode('utf-8'),
            user['password'].encode('utf-8')
        ):
            token = jwt.encode(
                {
                    'user_id': str(user['_id']),
                    'exp': datetime.utcnow() + timedelta(hours=24)
                },
                JWT_SECRET,
                algorithm="HS256"
            )

            return jsonify({"token": token}), 200

        return jsonify({"error": "Invalid email or password"}), 401

    except Exception as e:
        print("Login error:", e)
        return jsonify({"error": str(e)}), 500

# --- RESUME DATA ENDPOINTS ---

@app.route('/api/resume', methods=['GET'])
def get_resume():
    """Fetches the logged-in user's resume data from the database."""
    user_id = get_user_id_from_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        # Find the resume document linked to the user's ID
        resume_data = resumes_collection.find_one({"user_id": ObjectId(user_id)})
        if resume_data:
            # Convert MongoDB's ObjectId to a string so it can be sent as JSON
            resume_data['_id'] = str(resume_data['_id'])
            resume_data['user_id'] = str(resume_data['user_id'])
            return jsonify(resume_data), 200
        else:
            # If the user has no saved resume, return an empty object
            return jsonify({}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/resume', methods=['POST'])
def save_resume():
    """Saves/updates a user's resume data after rephrasing with AI."""
    user_id = get_user_id_from_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
        
    form_data = request.get_json()

    try:
        # --- AI Rephrasing Logic ---
        if ai_model:
            # Loop through each experience and rephrase its description
            for exp in form_data.get('experience', []):
                if exp.get('description'):
                    prompt = f"""
You are an ATS-optimized technical resume writer.

Rewrite the following experience description into EXACTLY 3 professional resume bullet points.

STRICT RULES (must follow all):
1. Each bullet must be ONE concise sentence.
2. Each bullet MUST start with a strong action verb (past tense).
3. Focus on responsibilities, technical skills, and measurable or concrete outcomes.
4. Use industry-relevant keywords that ATS systems can easily parse.
5. Avoid personal pronouns (I, we, my).
6. Avoid filler words, soft skills, and vague phrases.
7. Do NOT add headings, numbering, or extra text.

FORMAT RULES:
- Output EXACTLY 3 plain text bullet lines.
- Each line must start with a bullet symbol (•).
- No blank lines before or after.

Original experience description:
"{exp['description']}"

Rewritten ATS-optimized bullet points:
"""

            # Loop through each project and rephrase its description
            for proj in form_data.get('projects', []):
                if proj.get('description'):
                    prompt = f"""
                        You are an expert technical resume writer. Rewrite the following text into EXACTLY 3 resume bullet points for the project titled "{proj.get('title', '')}".
                        Rules:
                        1. Each bullet must be ONE sentence.
                        2. Each bullet MUST start with a strong action verb.
                        3. Highlight a concrete technical achievement.
                        4. Output format: 3 plain text lines with bullet symbol at beginning.
                        5. at the beginning of the project description , you have to add the relevant  tech stack for the project .
                        5. And i am giving the example for you . so you should follow the same format 
                        Example:
                       
                        Tech Stack: React, Flask, MongoDB, JWT

                        • Developed a full-stack employment portal enabling job posting and application management
                        • Implemented secure authentication and role-based access for employers and candidates
                        • Designed REST APIs and database schemas for efficient job and user management
                        Original text: "{proj['description']}"
                        Rewritten bullet points:
                    """
                    response = ai_model.generate_content(prompt)
                    proj['description'] = response.text.strip()
        
        # --- Save to Database ---
        # This command finds a document with the user's ID and updates it.
        # If no document is found, it creates a new one (upsert=True).
        form_data.pop("_id", None)

        resumes_collection.update_one(
            {"user_id": ObjectId(user_id)},
            {"$set": {**form_data, "user_id": ObjectId(user_id)}},
            upsert=True
        )
        
        # Return the final, AI-polished data back to the frontend for the preview
        return jsonify({"success": True, "data": form_data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==============================================================================
# RUN THE APPLICATION
# ==============================================================================

if __name__ == '__main__':
    app.run(debug=True)

