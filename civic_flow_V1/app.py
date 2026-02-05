import streamlit as st
import google.generativeai as genai
import os
import json
import time
import random
import pandas as pd
from fpdf import FPDF
from dotenv import load_dotenv
from datetime import datetime
import opik

# 1. SETUP
load_dotenv()
gemini_key = os.environ.get("GOOGLE_API_KEY")
opik_key = os.environ.get("OPIK_API_KEY")

if not gemini_key:
    st.error("🚨 GEMINI_API_KEY not found.")
    st.stop()

genai.configure(api_key=gemini_key)
model = genai.GenerativeModel('gemini-2.5-flash')

if opik_key:
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
    # Random jitter for map visualization
    lat_offset = random.uniform(-0.02, 0.02)
    lon_offset = random.uniform(-0.02, 0.02)
    
    new_record = {
        "id": len(data) + 1,
        "issue": issue_data['issue'],
        "location": issue_data['location'],
        "lat": CITY_LAT + lat_offset,
        "lon": CITY_LON + lon_offset,
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

# --- AI AGENTS (Tracked by Opik) ---
@opik.track(name="CivicFlow Inspector")
def analyze_evidence(text_content, image_data=None, location=""):
    base_prompt = f"""
    You are a strict city surveyor. Analyze this citizen report from {location}.
    USER DESCRIPTION: "{text_content}"
    {"IMAGE EVIDENCE: Provided below." if image_data else "IMAGE EVIDENCE: None provided."}
    
    TASK:
    1. Identify the core Issue (2-4 words max).
    2. Rate Severity (1-10). Be harsh.
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
    
    DETAILS: {description}
    LEGAL BASIS: We cite Section 4B of the Local Government Act.
    DEMAND: Remediation plan required within 48 hours.
    
    Signed, The Residents of {location}
    """
    safe_text = body.encode('latin-1', 'replace').decode('latin-1')
    pdf.multi_cell(0, 8, txt=safe_text)
    filename = f"Notice_{int(time.time())}.pdf"
    pdf.output(filename)
    return filename

# --- UI SETUP ---
st.set_page_config(page_title="CivicFlow", page_icon="📢", layout="wide")

# CSS to make buttons look better
st.markdown("""
<style>
    .stButton>button {
        width: 100%;
        border-radius: 5px;
    }
</style>
""", unsafe_allow_html=True)

# SIDEBAR
with st.sidebar:
    st.image("https://img.icons8.com/color/96/city-hall.png", width=60)
    st.title("CivicFlow")
    
    # 1. NEW REPORT BUTTON (Prominent)
    if st.button("➕ Start New Campaign", type="primary"):
        st.session_state.current_report = None
        st.session_state.current_plan = None
        st.rerun()
    
    st.divider()
    st.subheader("Your Community Feed")
    
    db = load_db()
    if not db:
        st.caption("No active reports.")
    else:
        for item in reversed(db):
            with st.container(border=True):
                st.write(f"**{item['issue']}**")
                st.caption(f"📍 {item['location']}")
                
                c1, c2 = st.columns([1, 1])
                # View Button
                if c1.button("📂 Open", key=f"view_{item['id']}"):
                    st.session_state.current_report = item
                    st.session_state.current_plan = item.get('plan', None)
                    st.rerun()
                
                # Join Fight Button (Updated Text)
                if c2.button(f"🔥 Join ({item['votes']})", key=f"v_{item['id']}"):
                    add_vote(item['id'])
                    st.rerun()

# MAIN PAGE
if "current_report" in st.session_state and st.session_state.current_report:
    # --- DASHBOARD VIEW (Single Case) ---
    report = st.session_state.current_report
    plan = st.session_state.get('current_plan')
    
    if st.button("⬅️ Back to Main Map"):
        st.session_state.current_report = None
        st.rerun()
        
    st.divider()
    st.header(f"⚔️ Campaign: {report['issue']}")
    
    score = report['severity']
    color = "red" if score > 7 else "orange"
    col1, col2 = st.columns([2,1])
    col1.markdown(f"### Severity: :{color}[{score}/10]")
    col2.caption(f"Original Report: \"{report.get('user_notes', '')[:50]}...\"")
    st.info(f"**Official Technical Report:** {report.get('description', 'Analysis pending...')}")

    st.subheader("🛡️ Action Plan")
    if plan and 'phases' in plan:
        for step in plan['phases']:
            with st.expander(step['phase'], expanded=True):
                st.write(step['task'])
                if "Legal" in step['phase'] or "Escalation" in step['phase']:
                    c1, c2 = st.columns([1, 1])
                    if c1.button("📄 Generate PDF", key=f"pdf_{step['phase'][:2]}"):
                        pdf_file = create_legal_pdf(report['issue'], report.get('description', ''), report['location'])
                        with open(pdf_file, "rb") as f:
                            st.download_button("⬇️ Download Notice", f, "Notice.pdf")
                    if c2.button("📧 Email Authorities", key=f"email_{step['phase'][:2]}"):
                        st.success("✅ Notice Sent!")
    
    st.divider()
    st.subheader("💬 Community Voices")
    fresh_data = load_db()
    current_comments = next((item.get('comments', []) for item in fresh_data if item['id'] == report['id']), [])
    for c in current_comments:
        st.text(f"👤 {c['user']}: {c['text']}")
    new_comment = st.text_input("Add your voice:", key="new_comment_box")
    if st.button("Post Comment"):
        if new_comment:
            add_comment(report['id'], new_comment)
            st.rerun()

else:
    # --- HOME VIEW (New Report + Map) ---
    st.title("📢 CivicFlow")
    st.markdown("**Bureaucracy is slow. We are fast.**")
    
    # Tabs for Organization
    tab1, tab2 = st.tabs(["📝 New Report", "🌍 Live Cases in Your Area"])
    
    with tab1:
        st.subheader("File a New Complaint")
        st.caption("Our AI will analyze your report and generate legal documents instantly.")
        
        location_input = st.text_input("📍 Location", value="Bahawalpur, Punjab")
        description_input = st.text_area("✍️ Describe the Issue (Required)", height=100)
        uploaded_file = st.file_uploader("📸 Upload Photo Evidence (Optional)", type=["jpg", "png", "jpeg","webp"])

        # PREVIEW UPLOADED IMAGE (New Feature)
        if uploaded_file:
            st.success("✅ Evidence Attached Successfully")
            st.image(uploaded_file, caption="Attested Evidence", width=300)

        st.divider()
        if st.button("🚀 Analyze & Launch Campaign", type="primary", disabled=(not description_input)):
            with st.spinner("🕵️ AI Agent analyzing evidence..."):
                try:
                    image_data = {"mime_type": uploaded_file.type, "data": uploaded_file.getvalue()} if uploaded_file else None
                    
                    # Tracked by Opik
                    analysis = analyze_evidence(description_input, image_data, location_input)
                    plan = generate_battle_plan(analysis['description'])
                    
                    analysis['location'] = location_input
                    analysis['user_notes'] = description_input
                    save_new_issue(analysis, plan)
                    
                    st.success("Campaign Launched!")
                    st.rerun()
                except Exception as e:
                    st.error(f"AI Error: {e}")

    with tab2:
        st.subheader("📍 Live Cases in Bahawalpur")
        db = load_db()
        map_items = [item for item in db if 'lat' in item]
        
        if map_items:
            df = pd.DataFrame(map_items)
            # Large Main Map
            st.map(df, latitude='lat', longitude='lon', size=60, color="#ff4b4b", zoom=13)
            
            # Clickable List Below Map
            st.write("### 📂 Open a Case from the Map:")
            for item in map_items:
                with st.expander(f"📍 {item['issue']} ({item['location']})"):
                    st.write(f"**Severity:** {item['severity']}/10")
                    if st.button("View Details", key=f"map_view_{item['id']}"):
                        st.session_state.current_report = item
                        st.session_state.current_plan = item.get('plan', None)
                        st.rerun()
        else:
            st.info("No active campaigns on the map yet. Be the first to file one!")