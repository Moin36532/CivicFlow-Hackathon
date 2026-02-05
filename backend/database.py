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
    {
        "title": "Pothole on Main Street",
        "category": "Road Safety",
        "description": "Large pothole causing traffic hazard near intersection. Measures approx 2ft diameter.",
        "lat": 29.3958, "lon": 71.6835,
        "tags": ["Road Safety", "Infrastructure"],
        "severity": 9,
        "avatar": "https://img.freepik.com/premium-photo/happy-selfie-fitness-with-man-city-social-media-profile-picture-running-smile-workout-relax-with-portrait-male-runner-photo-road-exercise-training-freedom_590464-198210.jpg",
        "department": "Traffic Police / Highways",
        "reported_by": "Jon Anderson",
        "ai_analysis": "This infrastructure issue poses a significant safety risk to motorists and pedestrians. The pothole measures approximately 2 feet in diameter and 6 inches deep, violating Municipal Road Safety Standards Section 4.2. Immediate action is required under Local Government Act 2013, Section 11-B."
    },
    {
        "title": "Food Drive - Winter Donations",
        "category": "Food",
        "description": "Collecting non-perishable items for local shelter. Urgent need for rice, lentils, and oil.",
        "lat": 29.3980, "lon": 71.6810,
        "tags": ["Food", "Charity"],
        "severity": 5,
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
        "department": "Social Welfare",
        "reported_by": "James Smith",
        "ai_analysis": "The local community shelter is experiencing increased demand due to winter conditions. They urgently need non-perishable food items. The shelter serves approximately 150 families daily. This is an excellent opportunity for community members to make a direct impact."
    },
    {
        "title": "Blood Donation Camp",
        "category": "Medical",
        "description": "Urgent need for O+ blood type. City Hospital blood bank reserves are critically low.",
        "lat": 29.3955, "lon": 71.6830,
        "tags": ["Medical", "Health"],
        "severity": 8,
        "avatar": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
        "department": "Health Department",
        "reported_by": "Dr. Michael Chen",
        "ai_analysis": "City Hospital has issued an urgent appeal for O+ blood donations. Current blood bank reserves are at critically low levels (only 2 days supply remaining). O+ is the most common blood type and is needed for emergency surgeries and trauma cases."
    },
    {
        "title": "Overflowing Gutter",
        "category": "Sanitation",
        "description": "Sewage overflow in residential area, creating serious health hazards.",
        "lat": 29.3990, "lon": 71.6890,
        "tags": ["Sanitation", "Health"],
        "severity": 8,
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
        "department": "Waste Management Co.",
        "reported_by": "William Davis",
        "ai_analysis": "Raw sewage overflow has been reported in a densely populated residential area, creating serious health hazards. This violates Environmental Protection Act Section 12-C and Public Health Standards 2020. Prolonged exposure can lead to waterborne diseases."
    },
    {
        "title": "Elder Care Volunteers Needed",
        "category": "Social",
        "description": "Weekly visits to senior citizens living alone. Companionship and grocery assistance.",
        "lat": 29.3970, "lon": 71.6850,
        "tags": ["Social", "Elderly"],
        "severity": 6,
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
        "department": "Social Welfare",
        "reported_by": "Emily Rodriguez",
        "ai_analysis": "The Elder Care initiative needs volunteers to visit and assist senior citizens who live alone. Tasks include companionship and helping with grocery shopping. Studies show that regular social interaction significantly improves mental health for elderly individuals."
    },
    {
        "title": "Illegal Construction Blocking Road",
        "category": "Urban Planning",
        "description": "Unauthorized construction blocking public access and reducing road width.",
        "lat": 29.3965, "lon": 71.6825,
        "tags": ["Construction", "Traffic"],
        "severity": 7,
        "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
        "department": "Development Authority",
        "reported_by": "David Miller",
        "ai_analysis": "An illegal construction has encroached upon public road space, reducing the road width by 40% and creating traffic congestion. This violates Urban Planning Act Section 15-B. The construction lacks proper permits and is blocking emergency vehicle access."
    },
    {
        "title": "Tree Plantation Drive",
        "category": "Environment",
        "description": "Community tree planting event this weekend. Joining 200 native trees.",
        "lat": 29.3945, "lon": 71.6845,
        "tags": ["Environment", "Community"],
        "severity": 4,
        "avatar": "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
        "department": "Parks & Horticulture",
        "reported_by": "Sarah Connor",
        "ai_analysis": "Join us for a community-wide tree plantation drive aimed at increasing green cover in our neighborhood. We plan to plant 200 native trees that will improve air quality, reduce urban heat, and provide habitat for local wildlife."
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