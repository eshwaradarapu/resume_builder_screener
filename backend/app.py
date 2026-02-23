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
import json
import tempfile
import subprocess
import requests
from flask import send_file


# ==============================================================================
# INITIAL SETUP & CONFIGURATION
# ==============================================================================

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

try:
    client = MongoClient(os.getenv("MONGO_URI"))
    db = client.get_database('ai_resume_builder_db')
    users_collection = db.users
    resumes_collection = db.resumes
    print("MongoDB connected successfully!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    ai_model = genai.GenerativeModel('gemini-2.5-flash')
    print("Google AI Model configured successfully!")
except Exception as e:
    print(f"Error configuring Google AI: {e}")
    ai_model = None

JWT_SECRET = os.getenv("JWT_SECRET_KEY")

# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================
N8N_WEBHOOK_URL = "http://localhost:5678/webhook/76bc8864-7530-4772-a167-1927ca5d718b"   # ← replace

def fetch_jobs_from_n8n(skills, location, experience=0):
    try:
        payload = {
            "skills": skills if isinstance(skills, list) else skills.split(","),
            "location": location,
            "experience": experience
        }

        res = requests.post(N8N_WEBHOOK_URL, json=payload, timeout=20)
        res.raise_for_status()
        return res.json()

    except Exception as e:
        print("N8N job fetch error:", e)
        return []

def generate_roles_from_skills(skills):
    if not ai_model:
        return skills[:3] if isinstance(skills, list) else []

    skills_text = ", ".join(skills)

    prompt = f"""
You are a career assistant.

Based on these skills:
{skills_text}

Return ONLY valid JSON.

RULES:
- Suggest exactly 3 realistic job roles
- Roles must be common LinkedIn titles
- No explanation text

FORMAT:
{{
  "roles": ["Role 1", "Role 2", "Role 3"]
}}
"""

    try:
        response = ai_model.generate_content(prompt)
        text = response.text.strip()

        if text.startswith("```"):
            text = text.split("```")[1].replace("json", "").strip()

        parsed = json.loads(text)
        return parsed.get("roles", [])

    except Exception as e:
        print("Role generation failed:", e)
        return skills[:3]
    

def get_user_id_from_token(request):
    try:
        token = request.headers.get('Authorization').split('Bearer ')[1]
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return decoded['user_id']
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None

def normalize_nested(summary):
    """Ensure bullets are always stored as nested arrays"""
    if not summary:
        return summary
    normalized = []
    for b in summary:
        if isinstance(b, list):
            normalized.append(b)
        elif isinstance(b, str):
            normalized.append([b])
    return normalized

# ==============================================================================
# AI GENERATORS
# ==============================================================================
def generate_project_json(description):
    if not ai_model:
        return None

    prompt = f"""
You are a JSON generation engine.

Return ONLY valid JSON.
No explanations, no markdown, no extra text.

IMPORTANT CONTENT RULES (MUST FOLLOW):
1. Use ONLY information explicitly present in the project description.
2. Do NOT invent technologies or features.
3. If unclear, omit instead of guessing.

PROJECT BULLET RULES (MUST FOLLOW):
- Start with strong action verbs
- Describe what was built, how, and purpose
- Professional resume language
- Between 90 and 220 characters
- No repeated wording

Return exactly 3 bullets.

JSON STRUCTURE REQUIRED:

{{
  "tech_stack": ["string"],
  "project_summary": [
    ["string"],
    ["string"],
    ["string"]
  ]
}}

PROJECT DESCRIPTION:
\"\"\"{description}\"\"\"
"""

    try:
        response = ai_model.generate_content(prompt)
        text = response.text.strip()

        # ✅ REMOVE MARKDOWN BLOCKS
        if text.startswith("```"):
            text = text.split("```")[1]
            text = text.replace("json", "", 1).strip()

        parsed = json.loads(text)
        return parsed

    except Exception as e:
        print("Project JSON failed:", e)
        print("Model output:", response.text if 'response' in locals() else "No response")
        return None
    
def generate_experience_json(description):
    if not ai_model:
        return None

    prompt = f"""
You are a JSON generation engine.

Return ONLY valid JSON.
No explanations, no markdown, no extra text.

IMPORTANT CONTENT RULES:
1. Use ONLY information from the description.
2. Do NOT invent achievements or tools.
3. Exactly 3 bullets.

JSON STRUCTURE REQUIRED:

{{
  "experience_summary": [
    ["string"],
    ["string"],
    ["string"]
  ]
}}

EXPERIENCE DESCRIPTION:
\"\"\"{description}\"\"\"
"""

    try:
        response = ai_model.generate_content(prompt)
        text = response.text.strip()

        # ✅ REMOVE MARKDOWN BLOCKS
        if text.startswith("```"):
            text = text.split("```")[1]
            text = text.replace("json", "", 1).strip()

        parsed = json.loads(text)
        return parsed

    except Exception as e:
        print("Experience JSON failed:", e)
        print("Model output:", response.text if 'response' in locals() else "No response")
        return None

# ==============================================================================
# API ROUTES
# ==============================================================================

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
        print("Register error:", e)
        return jsonify({"error": str(e)}), 500


@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        user = users_collection.find_one({"email": email})

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


@app.route('/api/resume', methods=['GET'])
def get_resume():
    user_id = get_user_id_from_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        resume_data = resumes_collection.find_one({"user_id": ObjectId(user_id)})
        if resume_data:
            resume_data['_id'] = str(resume_data['_id'])
            resume_data['user_id'] = str(resume_data['user_id'])
            return jsonify(resume_data), 200
        else:
            return jsonify({}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/api/resume', methods=['POST'])
def save_resume():
    user_id = get_user_id_from_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
        
    form_data = request.get_json()

    use_ai = form_data.get("use_ai", True)
    form_data.pop("use_ai", None)

    try:
        if ai_model and use_ai:

            # ===== EXPERIENCE STRUCTURED =====
            for exp in form_data.get('experience', []):
                description = exp.get('description', '').strip()
                structured = exp.get('structured')

                summary = structured.get("experience_summary") if structured else None
                bullet_count = len(summary) if summary else 0

                # ⭐ AI needed if:
                # - no structured OR
                # - only 1 bullet (manual conversion)
                needs_ai = (
                    not structured
                    or bullet_count <= 1
                )

                if description and needs_ai:
                    print(f"AI running for experience: {exp.get('title')}")
                    structured = generate_experience_json(description)

                    if structured:
                        structured['experience_summary'] = normalize_nested(
                            structured.get('experience_summary')
                        )
                        exp['structured'] = structured


            # ===== PROJECT STRUCTURED =====
            for proj in form_data.get('projects', []):
                description = proj.get('description', '').strip()
                structured = proj.get('structured')

                # ⭐ AI needed if no tech stack
                needs_ai = (
                    not structured
                    or not structured.get("tech_stack")
                )

                if description and needs_ai:
                    print(f"AI running for project: {proj.get('title')}")
                    structured = generate_project_json(description)

                    if structured:
                        structured['project_summary'] = normalize_nested(
                            structured.get('project_summary')
                        )
                        proj['structured'] = structured


        form_data.pop("_id", None)

        resumes_collection.update_one(
            {"user_id": ObjectId(user_id)},
            {"$set": {**form_data, "user_id": ObjectId(user_id)}},
            upsert=True
        )

        return jsonify({"success": True, "data": form_data}), 200

    except Exception as e:
        print("SAVE ERROR:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-pdf', methods=['POST'])
def generate_pdf():
    try:
        html = request.json.get("html")

        if not html:
            return jsonify({"error": "No HTML provided"}), 400

        with tempfile.NamedTemporaryFile(delete=False, suffix=".html") as f:
            f.write(html.encode("utf-8"))
            html_path = f.name

        pdf_path = html_path.replace(".html", ".pdf")

        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        PDF_SCRIPT = os.path.join(BASE_DIR, "pdf-service", "runPdf.js")

        subprocess.run(["node", PDF_SCRIPT, html_path, pdf_path],check=True)

        return send_file(pdf_path, as_attachment=True, download_name="resume.pdf")

    except Exception as e:
        print("PDF error:", e)
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/jobs', methods=['GET'])
def get_jobs_for_user():
    user_id = get_user_id_from_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        resume = resumes_collection.find_one({"user_id": ObjectId(user_id)})
        if not resume:
            return jsonify({"jobs": []}), 200

        # =========================
        # CHECK IF WE FETCHED TODAY
        # =========================
        last_fetch = resume.get("last_job_fetch")
        cached_jobs = resume.get("cached_jobs", [])

        if last_fetch:
            if datetime.utcnow() - last_fetch < timedelta(hours=24):
                print("Returning cached jobs")
                return jsonify({"jobs": cached_jobs}), 200

        # =========================
        # STEP 1: GET SKILLS
        # =========================
        skills = resume.get("skills", "")
        location = resume.get("location", "")
        experience = 0

        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(",") if s.strip()]

        # =========================
        # STEP 2: AI → TOP ROLES
        # =========================
        roles = generate_roles_from_skills(skills)
        print("AI suggested roles:", roles)

        # =========================
        # STEP 3: CALL N8N FLOW
        # =========================
        jobs = fetch_jobs_from_n8n(roles, location, experience)

        # =========================
        # STEP 4: SAVE CACHE
        # =========================
        resumes_collection.update_one(
            {"user_id": ObjectId(user_id)},
            {
                "$set": {
                    "cached_jobs": jobs,
                    "last_job_fetch": datetime.utcnow(),
                    "recommended_roles": roles
                }
            }
        )

        print("Fetched fresh jobs from n8n")

        return jsonify({
            "jobs": jobs,
            "roles": roles
        }), 200

    except Exception as e:
        print("Jobs route error:", e)
        return jsonify({"error": str(e)}), 500
# ==============================================================================
# RUN APP
# ==============================================================================

if __name__ == '__main__':
    app.run(debug=True)