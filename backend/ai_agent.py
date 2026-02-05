import google.generativeai as genai
import os
import json
import opik
from dotenv import load_dotenv

# 1. SETUP
load_dotenv()

# Configure Google Gemini
api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    # Fallback for safety if env not loaded
    print("⚠️ WARNING: GOOGLE_API_KEY not found.")

if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')

# Configure Opik (Safety Tracking)
if os.environ.get("OPIK_API_KEY"):
    opik.configure(use_local=False)

# --- AGENT 1: THE CLASSIFIER ---
@opik.track(name="CivicFlow Classifier")
def classify_issue(text_description: str, image_bytes: bytes = None, mime_type: str = None):
    prompt = f"""
    You are the CivicFlow Intelligence Agent.
    USER REPORT: "{text_description}"
    TASK: Classify into 'GOVT' or 'VOLUNTEER'.
    
    1. 'GOVT': Infrastructure, Law, Danger (Potholes, Sewage, Wires).
    2. 'VOLUNTEER': Social Needs, Help (Beach_Cleanliness, Blood, Flood, Animals).
       
    RETURN JSON ONLY:
    {{
        "category": "GOVT" or "VOLUNTEER",
        "title": "Short title (3-5 words)",
        "severity": 1-10,
        "description": "One technical sentence.",
        "tags": ["tag1", "tag2"],
        "responsible_department": "Name of the government department responsible (e.g., 'Sanitation Works', 'Highways Dept', 'WAPDA', 'Education Dept', 'Police'). If Volunteer, put 'NGO / Community'.",
        "legal_precedent": "If GOVT: Citation (e.g., Local Govt Act Sec 11-B)",
        "matched_volunteers_count": "If VOLUNTEER: estimated count (int)",
        "ai_analysis": "Detailed analysis paragraph (3-4 sentences) explaining the issue, its impact, and why it falls into this category."
    }}
    """
    try:
        if image_bytes and mime_type:
            img_payload = {"mime_type": mime_type, "data": image_bytes}
            response = model.generate_content([prompt, img_payload])
        else:
            response = model.generate_content(prompt)
        return json.loads(response.text.replace("```json", "").replace("```", "").strip())
    except Exception as e:
        import time
        print(f"❌ AI Error: {e}")
        time.sleep(3) # Simulate AI thinking time if API fails
        return {
            "category": "GOVT", 
            "title": "Report", 
            "severity": 7, 
            "description": text_description, 
            "tags": [],
            "responsible_department": "General Municipal Dept",
            "legal_precedent": "Pending Analysis",
            "matched_volunteers_count": 0,
            "ai_analysis": "AI Service unavailable (Missing API Key). Using fallback analysis."
        }

# --- AGENT 2: THE MATCHER ---
@opik.track(name="Volunteer Matcher")
def match_volunteers_agent(problem_description: str, candidates: list):
    prompt = f"""
    You are the CivicFlow Dispatch Coordinator.
    EMERGENCY: "{problem_description}"
    CANDIDATES: {json.dumps(candidates)}
    
    TASK: Pick TOP 3 candidates.
    RETURN JSON ONLY: {{ "ranked_matches": [ {{ "name": "Name", "reason": "Why?" }} ] }}
    """
    try:
        response = model.generate_content(prompt)
        return json.loads(response.text.replace("```json", "").replace("```", "").strip())
    except Exception:
        return {"ranked_matches": []}

# --- AGENT 3: THE FEED RANKER ---
@opik.track(name="Feed Ranker")
def rank_issues_for_user(user_profile: dict, issues_list: list):
    prompt = f"""
    Rank issues for USER: {user_profile['name']} (Skills: {user_profile['skills']}).
    ISSUES: {json.dumps(issues_list)}
    
    LOGIC:
    - Volunteer: Match Skills & Distance.
    - Govt: Match Distance Only.
    
    RETURN JSON: {{ "recommended": [ {{ "issue_id": 123, "match_score": 90, "reason": "Why?" }} ] }}
    """
    try:
        response = model.generate_content(prompt)
        return json.loads(response.text.replace("```json", "").replace("```", "").strip())
    except Exception:
        return {"recommended": []}

# --- AGENT 4: LEGAL DRAFTER (NEW) ---
@opik.track(name="Legal Drafter")
def generate_legal_text(issue_title, issue_desc, category="General", ai_analysis=None):
    analysis_text = f"\n    TECHNICAL ANALYSIS: {ai_analysis}" if ai_analysis else ""
    
    prompt = f"""
    You are a Senior Municipal Lawyer. Write the body of a FORMAL LEGAL NOTICE to the Municipal Commissioner.
    
    CASE DETAILS:
    - Issue: {issue_title}
    - Category: {category}
    - Description: {issue_desc}{analysis_text}
    
    INSTRUCTIONS:
    1. Cite specific sections of 'Punjab Local Govt Act 2013' relevant to {category}.
    2. Use professional, authoritative, and slightly demanding legal tone.
    3. Incorporate technical details from the analysis if available to make the case stronger.
    4. Demand action within 7 days under Section 11-B.
    5. Format as a clean legal letter body (no subject line or salutation needed, just the paragraph text).
    6. Keep it under 200 words.
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception:
        return f"Formal notice regarding {issue_title}. Immediate action required under Local Govt Act 2013. The condition described as '{issue_desc}' constitutes a public nuisance and safety hazard."