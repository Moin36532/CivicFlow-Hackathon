from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fpdf import FPDF
import os
import json

# Import our custom modules
# Import our custom modules
try:
    from backend.database import save_issue_to_db, get_open_issues, get_nearby_volunteers
    from backend.ai_agent import classify_issue, rank_issues_for_user, match_volunteers_agent, generate_legal_text
    from backend.rag_agent import chat_rag_agent
except ImportError:
    from database import save_issue_to_db, get_open_issues, get_nearby_volunteers
    from ai_agent import classify_issue, rank_issues_for_user, match_volunteers_agent, generate_legal_text
    from rag_agent import chat_rag_agent

app = FastAPI(title="CivicFlow Brain")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"], # Added explicit frontend ports for safety, kept * for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PDF GENERATOR HELPER ---
def create_pdf(issue):
    pdf = FPDF()
    pdf.add_page()
    
    # Header
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(0, 10, "CIVICFLOW - CITIZEN DEMAND NOTICE", ln=True, align='C')
    pdf.ln(10)
    
    # Body
    pdf.set_font("Arial", size=12)
    pdf.cell(0, 10, f"Subject: URGENT NOTICE - {issue['title']}", ln=True)
    pdf.ln(5)
    
    # Get AI Legal Text
    legal_body = generate_legal_text(
        issue['title'], 
        issue['description'],
        issue.get('category', 'General'),
        issue.get('ai_analysis')
    )
    
    # Fix for unicode characters in PDF
    safe_text = legal_body.encode('latin-1', 'replace').decode('latin-1')
    pdf.multi_cell(0, 7, safe_text)
    
    pdf.ln(20)
    pdf.set_font("Arial", 'I', 10)
    pdf.cell(0, 10, "(Generated via CivicFlow App - Bahawalpur)", ln=True, align='C')

    filename = f"notice_{issue['id']}.pdf"
    pdf.output(filename)
    return filename, safe_text

# --- ENDPOINTS ---

from pydantic import BaseModel
from typing import List, Optional

# ... previous imports ...

class PublishIssueRequest(BaseModel):
    title: str
    category: str
    description: str
    lat: float
    lon: float
    tags: List[str]
    severity: int
    ai_analysis: Optional[str] = None
    legal_precedent: Optional[str] = None
    matched_volunteers_count: Optional[int] = None
    responsible_department: Optional[str] = "General"

# ... (keep existing code until report_issue) ...

@app.post("/report") # Renaming to /analyze internally might be better, but keeping route for now or changing?
# The user wants "analyze by AI" then "publish". 
# Let's change this endpoint to be pure analysis if that's what the UI calls "Analyze".
# But wait, existing UI calls it /report. FOr backward compat, I will keep /report as the analysis endpoint but stop saving.
async def analyze_issue(description: str = Form(""), file: UploadFile = File(None)):
    image_bytes = await file.read() if file else None
    mime_type = file.content_type if file else None
    
    if not description and not image_bytes:
        return {"error": "Empty report"}

    # 1. Classify ONLY (Do not save yet)
    analysis = classify_issue(description, image_bytes, mime_type)
    analysis['lat'] = 29.3956 # Mock GPS
    analysis['lon'] = 71.6833
    
    # We return the analysis to the frontend. Frontend will verify and then call /publish
    return {"status": "analyzed", "analysis": analysis}

@app.post("/publish_issue")
async def publish_new_issue(issue: PublishIssueRequest):
    data = issue.dict()
    # Map 'responsible_department' from frontend to 'department' in DB
    data['department'] = data.get('responsible_department', 'General')
    
    # save_issue_to_db handles mapping
    new_id = save_issue_to_db(data)
    
    return {"status": "saved", "id": new_id}

# --- UPDATE THIS FUNCTION IN backend/main.py ---
@app.post("/my_feed")
async def get_volunteer_feed(user_skills: str = Form(...), user_lat: float = Form(...), user_lon: float = Form(...)):
    # 1. Get All Issues from DB
    all_issues = get_open_issues()
    
    # If DB is empty, return empty
    if not all_issues: 
        print("⚠️ Database is empty!")
        return {"feed": []}

    # 2. Try AI Ranking
    try:
        user_profile = {"name": "Volunteer", "skills": user_skills, "lat": user_lat, "lon": user_lon}
        ranking = rank_issues_for_user(user_profile, all_issues)
        recommended_ids = [item['issue_id'] for item in ranking.get("recommended", [])]
    except Exception as e:
        print(f"❌ AI Ranking Failed: {e}")
        recommended_ids = []

    # 3. CONSTRUCT FEED (Fallback logic)
    final_feed = []
    for issue in all_issues:
        # If AI picked it, use AI data. If not, just show it anyway (Safety Mode)
        is_recommended = issue['id'] in recommended_ids
        
        final_feed.append({
            "id": issue['id'],
            "title": issue['title'],
            "category": issue['category'],
            "description": issue['description'],
            "severity": issue['severity'],
            "dist_km": 1.2, # Mock distance
            "avatar": issue.get('avatar', ''),
            "reason": "AI Match" if is_recommended else "Nearby Issue", # Fallback reason
            "match_score": 90 if is_recommended else 50,
            "reportedBy": issue.get('reported_by', 'Civic Citizen'),
            "department": issue.get('department', 'General')
        })

    # Sort: High scores first
    final_feed.sort(key=lambda x: x['match_score'], reverse=True)
    
    print(f"✅ Sending {len(final_feed)} items to frontend.")
    print(f"✅ Sending {len(final_feed)} items to frontend.")
    return {"feed": final_feed}

@app.get("/issue/{issue_id}")
async def get_issue(issue_id: int):
    try:
        # 1. Fetch from DB
        from backend.database import get_issue_by_id
        issue = get_issue_by_id(issue_id)
        
        if not issue:
            return {"error": "Issue not found"}

        # 2. Format for Frontend
        return {
            "id": issue['id'],
            "title": issue['title'],
            "category": issue['category'],
            "description": issue['description'],
            "severity": issue['severity'],
            "location": "Bahawalpur", # Mock for now
            "lat": issue['lat'],
            "lon": issue['lon'],
            "tags": json.loads(issue['tags']) if isinstance(issue['tags'], str) else issue['tags'],
            "status": issue['status'],
            "aiAnalysis": issue.get('ai_analysis', 'Analysis pending...'), 
            "supportersJoined": 12, 
            "volunteersJoined": 5, 
            "volunteersNeeded": 10, 
            "volunteersJoined": 5, 
            "volunteersNeeded": 10, 
            "reportedBy": issue.get('reported_by', 'Civic Citizen'),
            "department": issue.get('department', 'General'),
            "timestamp": "2024-02-01" 
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e), "traceback": str(traceback.format_exc())}

@app.get("/comments/{issue_id}")
async def get_comments(issue_id: int):
    print(f"DEBUG: Fetching comments for issue {issue_id}")
    from backend.database import get_issue_comments
    comments = get_issue_comments(issue_id)
    print(f"DEBUG: Found {len(comments)} comments")
    return {"comments": comments}

@app.post("/comments")
async def post_comment(issue_id: int = Form(...), user_name: str = Form(...), text: str = Form(...), avatar: str = Form("")):
    print(f"DEBUG: Posting comment for issue {issue_id}: {text}")
    from backend.database import add_comment
    new_id = add_comment(issue_id, user_name, text, avatar)
    return {"status": "success", "id": new_id}

@app.post("/generate_legal_notice")
async def generate_notice(issue_id: int = Form(...)):
    all_issues = get_open_issues()
    issue = next((x for x in all_issues if x['id'] == issue_id), None)
    
    if not issue: return {"error": "Issue not found"}
    
    filename, text = create_pdf(issue)
    return {"filename": filename, "preview_text": text}

@app.get("/download_pdf/{filename}")
async def download_pdf(filename: str):
    if os.path.exists(filename):
        return FileResponse(filename, media_type="application/pdf", filename=filename)
    return {"error": "File missing"}

@app.get("/departments/stats")
async def get_department_stats():
    # Mock data for now. In real app, would query DB for resolved/total issues per dept
    return {
        "trending": [
            {"name": "Traffic Police", "score": 95, "resolved": 120, "trend": "up"},
            {"name": "Rescue 1122", "score": 92, "resolved": 85, "trend": "up"},
            {"name": "Waste Management", "score": 78, "resolved": 450, "trend": "stable"}
        ],
        "needs_attention": [
            {"name": "WAPDA (Power)", "score": 45, "resolved": 12, "trend": "down"},
            {"name": "Roads Dept", "score": 30, "resolved": 5, "trend": "down"}
        ]
    }

# --- CHATBOT ENDPOINT ---


@app.post("/chat")
async def chat_endpoint(query: str = Form(...), use_docs: bool = Form(True)):
    return {
        "reply": chat_rag_agent(query, use_docs)
    }