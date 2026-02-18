from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client.get_database('ai_resume_builder_db')
resumes_collection = db.resumes


def normalize(summary):
    if not summary:
        return summary

    fixed = []
    for b in summary:
        if isinstance(b, list):
            fixed.append(b)
        elif isinstance(b, str):
            fixed.append([b])
    return fixed


# 👉 Get the 3rd resume in collection
resume = resumes_collection.find().skip(2).limit(1)
resume = list(resume)

if not resume:
    print("❌ No 3rd resume found")
    exit()

resume = resume[0]

projects = resume.get("projects", [])
changed = False

for proj in projects:
    structured = proj.get("structured")

    if structured and "project_summary" in structured:
        old = structured["project_summary"]
        new = normalize(old)

        if old != new:
            structured["project_summary"] = new
            changed = True

if changed:
    resumes_collection.update_one(
        {"_id": resume["_id"]},
        {"$set": {"projects": projects}}
    )
    print("✅ 3rd resume updated successfully")
else:
    print("✔ 3rd resume already clean")