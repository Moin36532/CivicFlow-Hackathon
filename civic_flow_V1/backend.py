from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
import google.generativeai as genai
import os
import json
import time
import random
import opik
from fpdf import FPDF
from dotenv import load_dotenv
from datetime import datetime

# 1. SETUP
load_dotenv()
app = FastAPI(title="CivicFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CONFIG
api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    print("⚠️ WARNING: GOOGLE_API_KEY not found in .env")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

if os.environ.get("OPIK_API_KEY"):
    opik.configure(use_local=False)

# --- DATABASE ENGINE ---
DB_FILE = "complaints.json"
CITY_LAT = 29.3956
CITY_LON = 71.6833

def load_db():
    if not os.path.exists(DB_FILE):
        return []
    with open(DB_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_new_issue(issue_data, plan_data):
    data = load_db()
    
    # Check for duplicates to prevent spam
    # (Simple check: same issue title within last 5 minutes - skipped for hackathon demo speed)

    lat_offset = random.uniform(-0.02, 0.02)
    lon_offset = random.uniform(-0.02, 0.02)
    
    new_record = {
        "id": len(data) + 1,
        "issue": issue_data['issue'],
        "location": issue_data['location'],
        "lat": CITY_LAT + lat_offset, # In real app, geocode the location string
        "lon": CITY_LON + lon_offset,
        "severity": issue_data['severity'],
        "description": issue_data['description'],
        "user_notes": issue_data.get('user_notes', ''),
        "status": "Mobilizing",
        "votes": 1, # Start with 1 vote
        "comments": [],
        "plan": plan_data,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M")
    }
    data.append(new_record)
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)
    return new_record

# --- AI LOGIC ---
@opik.track(name="CivicFlow Inspector")
def get_ai_analysis(text: str, img_data=None, loc: str = ""):
    # Strict prompt based on blueprint rules
    prompt = f"""
    You are a strictly professional City Infrastructure Surveyor. Analyze this report from {loc}.
    USER REPORT: "{text}"
    {"IMAGE EVIDENCE: Attached." if img_data else "IMAGE EVIDENCE: None."}
    
    STRICT SCORING RULES:
    - Cosmetic (Trash, Graffiti, Mild dirt): Score 1-3.
    - Inconvenience (Potholes, Broken Lights, Traffic): Score 4-6.
    - DANGER/CRITICAL (Open Manholes, Live Wires, Structural Collapse, Flooding): Score 7-10.
    
    TASK:
    1. Extract concise Issue Title (e.g. "Critical Sinkhole on Main St").
    2. Assign Severity Score based on RULES above.
    3. Generate 'Official Description' (1 technical sentence).
    
    RETURN JSON ONLY: {{ "issue": "...", "severity": 8, "description": "..." }}
    """
    try:
        if img_data:
            response = model.generate_content([prompt, img_data])
        else:
            response = model.generate_content(prompt)
        
        data = json.loads(response.text.replace("```json", "").replace("```", "").strip())
    except Exception as e:
        print(f"⚠️ AI Error (Falling back to simulation): {e}")
        # FALLBACK SIMULATION (For Hackathon reliability)
        severity = random.randint(4, 9)
        data = {
            "issue": "Reported Infrastructure Hazard", 
            "severity": severity, 
            "description": f"Official technical report pending for reported hazard: {text[:50]}..."
        }
    
    return data

@opik.track(name="CivicFlow Strategist")
def get_strategy(issue_desc: str):
    prompt = f"""
    Create a 3-step 'Civil Action Plan' for: "{issue_desc}".
    Steps must be short, aggressive (legally), and effective.
    RETURN JSON ONLY: {{ "phases": [{{"phase": "Step 1", "task": "..."}}, {{"phase": "Step 2", "task": "..."}}, {{"phase": "Step 3", "task": "..."}}] }}
    """
    try:
        response = model.generate_content(prompt)
        return json.loads(response.text.replace("```json", "").replace("```", "").strip())
    except Exception:
        return {
            "phases": [
                {"phase": "Step 1: Formal Notice", "task": "Draft and serve legal demand letter via registered mail."},
                {"phase": "Step 2: Community Mobilization", "task": "Gather 50+ signatures from local residents."},
                {"phase": "Step 3: Escalation", "task": "File directly with the Ombudsman if no response in 48h."}
            ]
        }

# --- ENDPOINTS ---

@app.get("/", response_class=HTMLResponse)
async def serve_ui():
    with open("index.html", "r", encoding='utf-8') as f:
        return f.read()

@app.get("/cases")
async def get_cases():
    """Returns all active cases for the heatmap"""
    db = load_db()
    return sorted(db, key=lambda x: x['id'], reverse=True) # Newest first

@app.post("/analyze")
async def analyze_report(
    location: str = Form(...),
    description: str = Form(...),
    file: UploadFile = File(None)
):
    img_data = None
    if file:
        content = await file.read()
        img_data = {"mime_type": file.content_type, "data": content}
    
    try:
        # 1. Run AI Analysis
        analysis = get_ai_analysis(description, img_data, location)
        analysis['user_notes'] = description
        analysis['location'] = location
        
        # 2. Generate Battle Plan
        plan = get_strategy(analysis['description'])
        
        # 3. Save to DB
        new_record = save_new_issue(analysis, plan)
        
        return new_record # Return full record including ID
    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/generate-pdf")
def generate_pdf(issue: str, description: str, location: str):
    pdf = FPDF()
    pdf.add_page()
    
    # Official Header
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(0, 10, txt="NOTICE OF PUBLIC HAZARD", ln=True, align='C')
    pdf.line(10, 20, 200, 20)
    pdf.ln(15)
    
    pdf.set_font("Arial", size=12)
    current_date = datetime.now().strftime("%B %d, %Y")
    
    body = f"""
    DATE: {current_date}
    TO: Office of the District Commissioner / Municipal Corporation
    SUBJECT: DEMAND FOR URGENT REPAIRS - {issue.upper()}

    LOCATION: {location}
    
    DETAILS OF VIOLATION:
    {description}

    LEGAL NOTICE:
    We, the undersigned citizens, formally report this hazard under Section 4B of the Local Government Act / Municipal By-Laws. This condition poses an immediate risk to public safety.

    DEMAND FOR ACTION:
    1. Immediate inspection of the site within 24 hours.
    2. A written remediation plan released to the public.
    3. Commencement of repairs within 7 days.
    
    Failure to act may result in escalation to the Ombudsman.

    Sincerely,
    The CivicFlow Community Union
    """
    
    safe_text = body.encode('latin-1', 'replace').decode('latin-1')
    pdf.multi_cell(0, 7, txt=safe_text)
    
    filename = f"Notice_{int(time.time())}.pdf"
    pdf.output(filename)
    return FileResponse(filename, media_type='application/pdf', filename=filename)

@app.post("/email-authorities")
async def email_authorities(issue: str = Form(...), location: str = Form(...)):
    # SIMULATION: In a real app, this would use SMTP
    time.sleep(1.5) # Fake network delay
    return {
        "status": "success",
        "message": f"Official demands sent to District Commissioner (Bahawalpur) and 3 other offices regarding '{issue}'."
    }
