import json
import numpy as np
import google.generativeai as genai
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


# =========================================================
# LOAD MODELS (load once globally)
# =========================================================

bi_encoder = SentenceTransformer("all-MiniLM-L6-v2")


# =========================================================
# LLM OVERALL SCORE
# =========================================================

def generate_llm_overall_score(
    semantic_skills,
    combined_project_summary,
    job_description
):

    model = genai.GenerativeModel(
        "gemini-2.5-flash",
        generation_config={
            "temperature": 0.0,
            "top_p": 0.0
        }
    )

    prompt = f"""
Role: You are a deterministic technical evaluation engine.

Objective:
Evaluate the overall alignment between the candidate profile and the Job Description.

Candidate Profile:
Skills Summary:
{semantic_skills}

Project Summary:
{combined_project_summary}

Job Description:
{job_description}

Scoring Rubric:

0–20  = Poor Match
21–40 = Weak Match
41–60 = Moderate Match
61–80 = Strong Match
81–100 = Excellent Match

Rules:
- Use only provided information.
- Do NOT hallucinate.
- Choose a score strictly within one defined band.
- Output ONLY raw JSON.
- No markdown.
- No explanations.

Output Format:
{{ "overall_score": number }}
"""

    response = model.generate_content(prompt)
    text = response.text.strip()

    try:
        parsed = json.loads(text)
        return int(parsed["overall_score"])
    except:
        return None


# =========================================================
# PROJECT SUMMARY GENERATION
# =========================================================

def generate_combined_project_summary(projects, job_description):

    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""
Generate a dense technical capability summary optimized for embedding similarity.

Projects:
{projects}

Job Description:
{job_description}

Rules:
- Use only technologies mentioned in the projects
- Do NOT hallucinate
- Emphasize parts relevant to the job description
- Maximum 200 words
- Use short declarative sentences
- Return only the summary text
"""

    response = model.generate_content(prompt)
    return response.text.strip()


# =========================================================
# SKILL SUMMARY GENERATION
# =========================================================

def generate_semantic_skill_summary(skills_text, job_description):

    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""
Generate a dense professional skill summary optimized for embedding similarity.

Skills:
{skills_text}

Job Description:
{job_description}

Rules:
- Use only provided skills
- Do NOT hallucinate
- Emphasize skills aligned with the job description
- Ignore unrelated skills
- Maximum 180 words
- Short declarative technical sentences
- Return only the summary text
"""

    response = model.generate_content(prompt)
    return response.text.strip()


# =========================================================
# EMBEDDING SIMILARITY
# =========================================================

def compute_skill_similarity(skills_text, job_text):

    skill_embedding = bi_encoder.encode(skills_text)
    job_embedding = bi_encoder.encode(job_text)

    similarity = cosine_similarity(
        [skill_embedding],
        [job_embedding]
    )[0][0]

    return float(similarity)


def compute_project_similarity(project_text, job_text):

    project_embedding = bi_encoder.encode(project_text)
    job_embedding = bi_encoder.encode(job_text)

    sim = cosine_similarity(
        [project_embedding],
        [job_embedding]
    )[0][0]

    sim = max(sim, 0.0)

    return float(sim)


# =========================================================
# FINAL HYBRID SCORE
# =========================================================

def compute_final_score(skills, projects, job_description):

    semantic_skills = generate_semantic_skill_summary(
        skills,
        job_description
    )

    skill_score = compute_skill_similarity(
        semantic_skills,
        job_description
    )

    combined_project_summary = generate_combined_project_summary(
        projects,
        job_description
    )

    project_score = compute_project_similarity(
        combined_project_summary,
        job_description
    )

    embedding_score = (0.6 * skill_score) + (0.4 * project_score)
    embedding_score_percent = round(embedding_score * 100, 2)

    llm_score = generate_llm_overall_score(
        semantic_skills,
        combined_project_summary,
        job_description
    )

    if llm_score is not None:
        final_score = round(
            (0.7 * embedding_score_percent) + (0.3 * llm_score),
            2
        )
    else:
        final_score = embedding_score_percent

    return {
        "skill_score_%": round(skill_score * 100, 2),
        "project_score_%": round(project_score * 100, 2),
        "embedding_score_%": embedding_score_percent,
        "llm_score_%": llm_score,
        "final_match_%": final_score,
        "semantic_skills": semantic_skills,
        "project_summary": combined_project_summary
    }


# =========================================================
# DETAILED ANALYSIS REPORT
# =========================================================

def generate_resume_analysis_report(
    final_score,
    skills,
    projects,
    job_description
):

    model = genai.GenerativeModel(
        "gemini-2.5-flash",
        generation_config={"temperature": 0.2}
    )

    prompt = f"""
You are a technical hiring analyst.

Generate an evaluation report explaining the match.

Final Score:
{final_score}%

Candidate Skills:
{skills}

Candidate Projects:
{projects}

Job Description:
{job_description}

Sections:
1. Overall Match Assessment
2. Strength Areas
3. Gaps or Missing Areas
4. Improvement Suggestions
"""

    response = model.generate_content(prompt)

    return response.text.strip()


# =========================================================
# MAIN ENTRY FUNCTION FOR FLASK
# =========================================================

def analyze_resume_job_match(
    skills,
    projects,
    job_description
):

    score_result = compute_final_score(
        skills,
        projects,
        job_description
    )

    report = generate_resume_analysis_report(
        final_score=score_result["final_match_%"],
        skills=skills,
        projects=projects,
        job_description=job_description
    )

    return {
        "scores": score_result,
        "analysis": report
    }