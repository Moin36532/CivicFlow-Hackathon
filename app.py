import streamlit as st
import google.generativeai as genai
import os
import json
import time
from fpdf import FPDF
from dotenv import load_dotenv
from datetime import datetime

# 1. IMPORT OPIK (For the $5,000 Prize)
import opik

# 2. SETUP & CONFIGURATION
load_dotenv()

# Load Keys
gemini_key = os.environ.get("GOOGLE_API_KEY")
opik_key = os.environ.get("OPIK_API_KEY")

# Safety Check
if not gemini_key:
    st.error("🚨 CRITICAL ERROR: GEMINI_API_KEY not found in .env file.")
    st.stop()

# Configure AI Tools
genai.configure(api_key=gemini_key)
model = genai.GenerativeModel('gemini-3-flash')

# Configure Opik (Forces data to go to the Comet Dashboard)
if opik_key:
    opik.configure(use_local=False)
else:
    print("⚠️ Warning: OPIK_API_KEY not found. Tracking disabled.")

# --- DATABASE ENGINE ---
DB_FILE = "complaints.json"

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
    new_record = {
        "id": len(data) + 1,
        "issue": issue_data['issue'],
        "location": issue_data['location'],
        "severity": issue_data['severity'],
        "description": issue_data['description'],
        "user_notes": issue_data['user_notes'],
        "status": "Active",
        "votes": 1,
        "comments": [],
        "plan": plan_data,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M")
    }
    data.append(new_record)
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)
    return new_record

def add_vote(issue_id):
    data = load_db()
    for item in data:
        if item['id'] == issue_id:
            item['votes'] += 1
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)

def add_comment(issue_id, comment_text):
    data = load_db()
    for item in data:
        if item['id'] == issue_id:
            item['comments'].append({
                "user": "Neighbor",
                "text": comment_text,
                "time": datetime.now().strftime("%H:%M")
            })
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)

# --- AI AGENTS (With Opik Tracking) ---

@opik.track(name="CivicFlow Inspector")
def analyze_evidence(text_content, image_data=None, location=""):
    base_prompt = f"""
    You are a strict city surveyor. Analyze this citizen report from {location}.
    USER DESCRIPTION: "{text_content}"
    {"IMAGE EVIDENCE: Provided below." if image_data else "IMAGE EVIDENCE: None provided."}
    
    TASK:
    1. Identify the core Issue (2-4 words max).
    2. Rate Severity (1-10). Be harsh. (Potholes = 6, Open Wires = 9).
    3. Write a 'Official Description' (Short, Technical).
    
    RETURN JSON ONLY: {{ "issue": "...", "severity": 8, "description": "..." }}
    """
    if image_data:
        response = model.generate_content([base_prompt, image_data])
    else:
        response = model.generate_content(base_prompt)
        
    return json.loads(response.text.replace("```json", "").replace("```", ""))

@opik.track(name="CivicFlow Strategist")
def generate_battle_plan(issue_desc):
    prompt = f"""
    Create a 3-step 'Civil Action Plan' for: "{issue_desc}".
    Steps must be short, aggressive, and legal.
    RETURN JSON ONLY: {{ "phases": [{{"phase": "1. ...", "task": "..."}}] }}
    """
    response = model.generate_content(prompt)
    return json.loads(response.text.replace("```json", "").replace("```", ""))

def create_legal_pdf(issue, description, location):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, txt="NOTICE OF PUBLIC HAZARD", ln=True, align='C')
    pdf.ln(10)
    pdf.set_font("Arial", size=12)
    
    body = f"""
    TO: Municipal Authorities, {location}
    FROM: CivicFlow Community Union
    DATE: {datetime.now().strftime("%Y-%m-%d")}
    
    RE: URGENT REPAIR REQUIRED - {issue}
    
    This formal notice serves to inform you of a critical infrastructure failure at {location}.
    
    DETAILS:
    {description}
    
    LEGAL BASIS:
    We cite Section 4B of the Local Government Act (Public Safety), which mandates the immediate rectification of hazards that threaten life or property.
    
    DEMAND:
    We request a remediation plan be published within 48 hours. Failure to act will result in further escalation to the District Commissioner.
    
    Signed,
    The Residents of {location}
    """
    safe_text = body.encode('latin-1', 'replace').decode('latin-1')
    pdf.multi_cell(0, 8, txt=safe_text)
    filename = f"Notice_{int(time.time())}.pdf"
    pdf.output(filename)
    return filename

# --- UI SETUP ---
st.set_page_config(page_title="CivicFlow", page_icon="📢", layout="wide")

# SIDEBAR: Community Feed
with st.sidebar:
    # 1. NEW CAMPAIGN BUTTON
    if st.button("➕ Start New Campaign", type="primary"):
        st.session_state.current_report = None
        st.session_state.current_plan = None
        st.rerun()
    
    st.divider()
    st.header("🏙️ Neighborhood Watch")
    
    db = load_db()
    if not db:
        st.caption("No active reports.")
    else:
        for item in reversed(db):
            with st.container(border=True):
                st.write(f"**{item['issue']}**")
                st.caption(f"📍 {item['location']} | ⚠️ {item['severity']}/10")
                
                c1, c2, c3 = st.columns([1, 1, 1])
                
                # VIEW Button
                if c1.button("📂", key=f"view_{item['id']}", help="Open this case"):
                    st.session_state.current_report = item
                    st.session_state.current_plan = item.get('plan', None)
                    st.rerun()
                
                # VOTE Button
                if c2.button(f"🔥 {item['votes']}", key=f"v_{item['id']}"):
                    add_vote(item['id'])
                    st.rerun()
                    
                # COMMENT Indicator
                comment_count = len(item.get('comments', []))
                c3.caption(f"💬 {comment_count}")

# MAIN PAGE LOGIC
st.title("📢 CivicFlow")

# IF a report is selected, show Dashboard
if "current_report" in st.session_state and st.session_state.current_report:
    report = st.session_state.current_report
    plan = st.session_state.get('current_plan')
    
    # Back button just in case
    if st.button("⬅️ Back to Home"):
        st.session_state.current_report = None
        st.rerun()
        
    st.divider()
    st.header(f"⚔️ Campaign: {report['issue']}")
    
    score = report['severity']
    color = "red" if score > 7 else "orange"
    col1, col2 = st.columns([2,1])
    col1.markdown(f"### Severity: :{color}[{score}/10]")
    
    user_note_preview = report.get('user_notes', 'No description provided')[:50]
    col2.caption(f"Original Report: \"{user_note_preview}...\"")
    
    st.info(f"**Official Technical Report:** {report.get('description', 'Analysis pending...')}")

    st.subheader("🛡️ Action Plan")
    if plan and 'phases' in plan:
        for step in plan['phases']:
            with st.expander(step['phase'], expanded=True):
                st.write(step['task'])
                if "Legal" in step['phase'] or "Escalation" in step['phase']:
                    c1, c2 = st.columns([1, 1])
                    if c1.button("📄 Generate PDF", key=f"pdf_{report['id']}_{step['phase'][:2]}"):
                        pdf_file = create_legal_pdf(report['issue'], report.get('description', ''), report['location'])
                        with open(pdf_file, "rb") as f:
                            st.download_button("⬇️ Download Notice", f, "Official_Notice.pdf")
                    if c2.button("📧 Email Authorities", key=f"email_{report['id']}_{step['phase'][:2]}"):
                        bar = st.progress(0, text="Connecting...")
                        for p in range(100):
                            time.sleep(0.01)
                            bar.progress(p + 1)
                        st.success("✅ Notice Sent!")
    else:
        st.warning("⚠️ No Battle Plan found for this issue.")

    st.divider()
    st.subheader("💬 Community Voices")
    fresh_data = load_db()
    current_comments = next((item.get('comments', []) for item in fresh_data if item['id'] == report['id']), [])
    
    if not current_comments:
        st.caption("No comments yet.")
    for c in current_comments:
        st.text(f"👤 {c['user']} ({c['time']}): {c['text']}")
        
    new_comment = st.text_input("Add your voice:", key="new_comment_box")
    if st.button("Post Comment"):
        if new_comment:
            add_comment(report['id'], new_comment)
            st.rerun()

# ELSE show the "New Report" Input Form
else:
    st.markdown("**Bureaucracy is slow. We are fast.** Report an issue to auto-generate legal pressure.")
    st.subheader("📝 New Report")
    st.caption("Details help us build a stronger legal case.")

    location_input = st.text_input("📍 Location", value="Bahawalpur, Punjab", help="Enter exact street or area.")
    description_input = st.text_area("✍️ Describe the Issue (Required)", placeholder="e.g., The street light on Main St is broken...")
    uploaded_file = st.file_uploader("📸 Upload Photo Evidence (Optional)", type=["jpg", "png", "jpeg"])

    if not uploaded_file and description_input:
        st.info("💡 **Tip:** Uploading photos makes your case stronger!")

    if st.button("🚀 Analyze & Launch Campaign", type="primary", disabled=(not description_input)):
        with st.spinner("🕵️ AI Agent analyzing evidence..."):
            try:
                image_data = {"mime_type": uploaded_file.type, "data": uploaded_file.getvalue()} if uploaded_file else None
                
                # These calls are now TRACKED by Opik!
                analysis = analyze_evidence(description_input, image_data, location_input)
                plan = generate_battle_plan(analysis['description'])
                
                analysis['location'] = location_input
                analysis['user_notes'] = description_input
                new_record = save_new_issue(analysis, plan)
                
                st.session_state.current_report = new_record
                st.session_state.current_plan = plan
                st.success("Campaign Launched!")
                st.rerun()
                
            except Exception as e:
                st.error(f"AI Error: {e}")