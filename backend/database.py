import sqlite3
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.path.join(BASE_DIR, "civic_flow.db")

# --- THE GOLDEN DATASET (Scripted for Demo) ---
DEMO_VOLUNTEERS = [
    {"name": "Dr. Ayesha Khan", "phone": "0300-1234567", "skills": ["Medical", "Teaching"], "lat": 29.3960, "lon": 71.6840, "avatar": "https://i.pravatar.cc/150?u=ayesha"},
    {"name": "Rescue 1122 Squad", "phone": "1122", "skills": ["Rescue", "Medical", "Transport"], "lat": 29.3956, "lon": 71.6833, "avatar": "https://cdn-icons-png.flaticon.com/512/4006/4006520.png"}
]

DEMO_ISSUES = [
    # --- GOVT ISSUES (Red) ---
    {
        "title": "Open Manhole (Death Trap)",
        "category": "GOVT",
        "description": "Main sewage line cover missing in front of Girls College. Highly dangerous for pedestrians at night.",
        "lat": 29.3958, "lon": 71.6835,
        "tags": ["Danger", "Infrastructure", "Urgent"],
        "severity": 9,
        "avatar": "https://cdn-icons-png.flaticon.com/512/564/564619.png",
        "department": "Sanitation & Water Works",
        "reported_by": "Jon Anderson"
    },
    {
        "title": "Sparking Transformer",
        "category": "GOVT",
        "description": "WAPDA Transformer on Link Road is sparking heavily. Risk of fire to nearby shops.",
        "lat": 29.3980, "lon": 71.6810,
        "tags": ["Fire Risk", "Electrical"],
        "severity": 8,
        "avatar": "https://cdn-icons-png.flaticon.com/512/9693/9693685.png",
        "department": "Energy Department (WAPDA)",
        "reported_by": "Sarah Smith"
    },
    # --- VOLUNTEER ISSUES (Green) ---
    {
        "title": "Urgent: O- Blood Needed",
        "category": "VOLUNTEER",
        "description": "Thalassemia patient needs 2 pints of O-Negative blood immediately at Victoria Hospital.",
        "lat": 29.3955, "lon": 71.6830,
        "tags": ["Medical", "Urgent", "Blood"],
        "severity": 10,
        "avatar": "https://i.pravatar.cc/150?u=patient1",
        "department": "Health Department"
    },
    {
        "title": "Found Lost Child",
        "category": "VOLUNTEER",
        "description": "Found a 5-year-old boy named 'Ali' near Model Town Park. He is safe with me. Need help finding parents.",
        "lat": 29.3990, "lon": 71.6890,
        "tags": ["Rescue", "Child"],
        "severity": 10,
        "avatar": "https://i.pravatar.cc/150?u=child",
        "department": "Police / Child Protection"
    }
]


def get_issue_comments(issue_id):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM comments WHERE issue_id=? ORDER BY timestamp DESC", (issue_id,))
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def add_comment(issue_id, user_name, text, avatar=""):
    print(f"DEBUG: Adding comment for issue {issue_id} by {user_name}")
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("INSERT INTO comments (issue_id, user_name, text, avatar) VALUES (?, ?, ?, ?)", 
              (issue_id, user_name, text, avatar))
    comment_id = c.lastrowid
    conn.commit()
    print(f"DEBUG: Comment added with ID {comment_id}")
    conn.close()
    return comment_id

def get_issue_by_id(issue_id):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM issues WHERE id=?", (issue_id,))
    row = c.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    # 1. Users Table
    c.execute('''CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY,
                    name TEXT,
                    phone TEXT,
                    lat REAL,
                    lon REAL,
                    skills TEXT,
                    avatar TEXT, 
                    status TEXT
                )''')

    # 2. Issues Table
    c.execute('''CREATE TABLE IF NOT EXISTS issues (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT,
                    category TEXT,
                    description TEXT,
                    lat REAL,
                    lon REAL,
                    tags TEXT,
                    severity INTEGER,
                    avatar TEXT,
                    status TEXT DEFAULT 'Open',
                    ai_analysis TEXT,
                    reported_by TEXT DEFAULT 'Civic Citizen',
                    department TEXT DEFAULT 'General'
                )''')

    # 3. Comments Table
    c.execute('''CREATE TABLE IF NOT EXISTS comments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    issue_id INTEGER,
                    user_name TEXT,
                    avatar TEXT,
                    text TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(issue_id) REFERENCES issues(id)
                )''')
    
    # Check for ai_analysis column in existing table and add if missing
    c.execute("PRAGMA table_info(issues)")
    columns = [info[1] for info in c.fetchall()]
    if 'ai_analysis' not in columns:
        print("Migrating DB: Adding ai_analysis column...")
        c.execute("ALTER TABLE issues ADD COLUMN ai_analysis TEXT")
    
    if 'reported_by' not in columns:
        print("Migrating DB: Adding reported_by column...")
        c.execute("ALTER TABLE issues ADD COLUMN reported_by TEXT DEFAULT 'Civic Citizen'")

    if 'department' not in columns:
        print("Migrating DB: Adding department column...")
        c.execute("ALTER TABLE issues ADD COLUMN department TEXT DEFAULT 'General'")

    c.execute('SELECT count(*) FROM users')
    if c.fetchone()[0] == 0:
        print("⚡ Injecting GOLDEN DATASET (Volunteers)...")
        for u in DEMO_VOLUNTEERS:
            c.execute('INSERT INTO users (name, phone, lat, lon, skills, avatar, status) VALUES (?,?,?,?,?,?,?)', 
                      (u['name'], u['phone'], u['lat'], u['lon'], json.dumps(u['skills']), u['avatar'], "Active"))

    c.execute('SELECT count(*) FROM issues')
    if c.fetchone()[0] == 0:
        print("⚡ Injecting GOLDEN DATASET (Issues)...")
        for i in DEMO_ISSUES:
            c.execute('''INSERT INTO issues (title, category, description, lat, lon, tags, severity, avatar, ai_analysis, department)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', 
                      (i['title'], i['category'], i['description'], i['lat'], i['lon'], 
                       json.dumps(i['tags']), i['severity'], i['avatar'], 
                       i.get('ai_analysis', 'Analysis pending...'), i.get('department', 'General')))
        
        conn.commit()

    conn.close()

def get_nearby_volunteers(required_skill, lat, lon, radius_km=10):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT name, phone, skills, lat, lon, avatar FROM users")
    volunteers = c.fetchall()
    conn.close()
    matches = []
    for v in volunteers:
        skills = json.loads(v['skills'])
        dist = ((lat - v['lat'])**2 + (lon - v['lon'])**2)**0.5 * 111
        matches.append({"name": v['name'], "dist_km": round(dist, 1), "skills": skills, "phone": v['phone'], "avatar": v['avatar']})
    matches.sort(key=lambda x: x['dist_km'])
    return matches[:10]

def save_issue_to_db(data):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    avatar = "https://cdn-icons-png.flaticon.com/512/7542/7542190.png"
    
    # Check if table has ai_analysis column (for robustness)
    c.execute("PRAGMA table_info(issues)")
    columns = [info[1] for info in c.fetchall()]
    
    has_department = 'department' in columns
    
    if has_department:
         c.execute('''INSERT INTO issues (title, category, description, lat, lon, tags, severity, avatar, ai_analysis, reported_by, department)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', 
              (data.get('title', 'Untitled'), data['category'], data['description'], 
               data.get('lat', 29.3956), data.get('lon', 71.6833), json.dumps(data.get('tags', [])), 
               data.get('severity', 1), avatar, data.get('ai_analysis') or "Analysis pending...", 
               data.get('reported_by', 'Civic Citizen'), data.get('department', 'General')))
    else:
        # Fallback (Should not strictly be needed if migration runs, but good habit)
         c.execute('''INSERT INTO issues (title, category, description, lat, lon, tags, severity, avatar, ai_analysis)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''', 
              (data.get('title', 'Untitled'), data['category'], data['description'], 
               data.get('lat', 29.3956), data.get('lon', 71.6833), json.dumps(data.get('tags', [])), 
               data.get('severity', 1), avatar, data.get('ai_analysis') or "Analysis pending..."))
                   
    issue_id = c.lastrowid
    conn.commit()
    conn.close()
    return issue_id

def get_open_issues():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM issues WHERE status='Open'")
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]

init_db()