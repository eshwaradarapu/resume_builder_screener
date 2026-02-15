# import requests
# from flask import Flask, request, jsonify

# app = Flask(__name__)

# TAVILY_API_KEY = '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'  # <-- put your real key

# @app.route('/job-alerts', methods=['POST'])
# def job_alerts():
#     data = request.get_json()
#     skills = data.get('skills', [])
#     if not skills:
#         return jsonify({'error': 'No skills provided'}), 400

#     query = ' OR '.join(skills) + ' jobs'
#     headers = {
#         'Authorization': f'Bearer {TAVILY_API_KEY}',
#         'Content-Type': 'application/json'
#     }
#     payload = {'query': query, 'max_results': 5}

#     try:
#         response = requests.post('https://api.tavily.com/search', json=payload, headers=headers)
#         response.raise_for_status()
#         results = response.json().get('results', [])
#         jobs = [{'title': j.get('title'), 'link': j.get('url'), 'snippet': j.get('snippet')} for j in results]
#         return jsonify({'jobs': jobs})
#     except requests.exceptions.RequestException as e:
#         return jsonify({'error': str(e)}), 500

# if __name__ == '__main__':
#     app.run(debug=True)
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Adzuna credentials
APP_ID = 'dbbb629a'
APP_KEY = 'df60ee14ea93956d825b182837602d04'
COUNTRY = 'in'  # India



@app.route('/job-alerts', methods=['POST'])
def job_alerts():
    data = request.get_json()
    skills = data.get('skills', [])
    location = data.get('location', '')
    job_type = data.get('job_type', '')

    if not skills:
        return jsonify({'error': 'No skills provided'}), 400

    all_jobs = []

    for skill in skills:
        url = f"https://api.adzuna.com/v1/api/jobs/{COUNTRY}/search/1"  # first page only
        params = {
            'app_id': APP_ID,
            'app_key': APP_KEY,
            'results_per_page': 2,  # max 2 jobs per skill
            'what': skill,
            'where': location
        }

        if job_type == 'full_time':
            params['full_time'] = 1
        elif job_type == 'part_time':
            params['part_time'] = 1
        elif job_type == 'contract':
            params['contract'] = 1

        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            jobs_data = response.json().get('results', [])

            for job in jobs_data:
                job_entry = {
                    'skill': skill,
                    'title': job.get('title'),
                    'company': job.get('company', {}).get('display_name'),
                    'location': job.get('location', {}).get('display_name'),
                    'salary_min': job.get('salary_min'),
                    'salary_max': job.get('salary_max'),
                    'link': job.get('redirect_url')
                }
                # Avoid duplicates
                if job_entry not in all_jobs:
                    all_jobs.append(job_entry)

        except requests.exceptions.RequestException as e:
            return jsonify({'error': str(e)}), 500

    return jsonify({'jobs': all_jobs})


if __name__ == '__main__':
    app.run(debug=True)