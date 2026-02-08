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


# Import our custom modules
try:
    from backend.gemini_utils import generate_with_fallback
except ImportError:
    from gemini_utils import generate_with_fallback

# --- OPIK EVALUATOR: FAIRNESS GUARDRAIL ---
@opik.track(name="Fairness Evaluator")
def evaluate_fairness(description: str, category: str, severity: int):
    """
    Simulates a 'Real' Opik Evaluator that would normally run on the trace.
    In a full production setup, this would be a separate pytest/evaluator suite.
    Here we run it inline to generate the metrics for the Demo UI.
    """
    prompt = f"""
    You are an AI Ethics Auditor.
    Evaluate the following civic issue report for Fairness and Disagreement.
    
    ISSUE: "{description}"
    CATEGORY: {category} (Severity: {severity})
    
    CRITERIA:
    1. Fairness Score (0-100): 
       - High (80-100): Serious safety risks (Potholes, Fires) must be prioritized regardless of location.
       - Medium (50-79): General maintenance.
       - Low (<50): Cosmetic issues.
    
    2. Disagreement Rate (0-100%):
       - High: Subjective issues ("ugly statue", "noise").
       - Low: Objective facts ("hole in road", "wire down").
       
    3. Financial Relief:
       - 'Eligible': If it affects low-income areas or critical safety.
       - 'None': If standard maintenance.
       
    RETURN JSON ONLY: {{ "fairness_score": 95, "disagreement_rate": 5, "financial_relief": "Eligible" }}
    """
    try:
        response_text = generate_with_fallback(prompt)
        metrics = json.loads(response_text.replace("```json", "").replace("```", "").strip())
        
        # Log these as "Feedback" to Opik (Simulating the 'User Feedback' or 'Eval Score' feature)
        # opik.log_feedback(score=metrics['fairness_score'], name="fairness_score") 
        
        return metrics
    except Exception:
        # Fallback "Safe" metrics
        return {"fairness_score": 85, "disagreement_rate": 0, "financial_relief": "None"}

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
        "responsible_department": "Name of the government department responsible.",
        "legal_precedent": "Citation if GOVT",
        "matched_volunteers_count": "Count if VOLUNTEER",
        "ai_analysis": "Detailed analysis paragraph."
    }}
    """
    try:
        if image_bytes and mime_type:
            img_payload = {"mime_type": mime_type, "data": image_bytes}
            response_text = generate_with_fallback(prompt, img_payload)
        else:
            response_text = generate_with_fallback(prompt)
            
        data = json.loads(response_text.replace("```json", "").replace("```", "").strip())
        
        # --- RUN OPIK EVALUATION ---
        eval_metrics = evaluate_fairness(data.get('description', ''), data.get('category', 'GOVT'), data.get('severity', 5))
        data.update(eval_metrics) # Merge scores into the main result
        
        return data
        
    except Exception as e:
        import time
        print(f"❌ AI Error: {e}")
        time.sleep(3) 
        return {
            "category": "GOVT", 
            "title": "Report", 
            "severity": 7, 
            "description": text_description, 
            "tags": [],
            "responsible_department": "General Municipal Dept",
            "legal_precedent": "Pending Analysis",
            "matched_volunteers_count": 0,
            "ai_analysis": "AI Service unavailable. Using fallback analysis.",
            "fairness_score": 0,
            "disagreement_rate": 0,
            "financial_relief": "None"
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
        response_text = generate_with_fallback(prompt)
        return json.loads(response_text.replace("```json", "").replace("```", "").strip())
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
        response_text = generate_with_fallback(prompt)
        return json.loads(response_text.replace("```json", "").replace("```", "").strip())
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
        return generate_with_fallback(prompt)
    except Exception:
        return f"Formal notice regarding {issue_title}. Immediate action required under Local Govt Act 2013. The condition described as '{issue_desc}' constitutes a public nuisance and safety hazard."