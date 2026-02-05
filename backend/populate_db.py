import sqlite3
import json
import random
from database import DB_NAME, init_db 

# Clean old data first
def clean_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    # Drop table to force schema update in dev
    c.execute("DROP TABLE IF EXISTS issues")
    conn.commit()
    conn.close()
    
    # Re-init to create table with new columns (and it might inject demo data)
    init_db()
    
    # Clear any auto-injected data from init_db so we can inject our exact MOCK_DATA
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("DELETE FROM issues")
    conn.commit()
    conn.close()

# Exact copies from frontend/mockData.ts
MOCK_DATA = [
  {
    "id": 1, 
    "type": "government",
    "title": "Pothole on Main Street",
    "description": "Large pothole causing traffic hazard near intersection",
    "aiAnalysis": "This infrastructure issue poses a significant safety risk to motorists and pedestrians. The pothole measures approximately 2 feet in diameter and 6 inches deep, violating Municipal Road Safety Standards Section 4.2. Similar cases have resulted in vehicle damage claims and personal injury lawsuits. Immediate action is required under Local Government Act 2013, Section 11-B, which mandates repair within 7 working days of notification.",
    "severity": 9,
    "lat": 40.7580,
    "lon": -73.9855,
    "location_address": "Main Street, Model Town",
    "category": "Road Safety",
    "status": "pending",
    "supportersJoined": 23,
    "reportedBy": "Jon Anderson",
    "tags": ["Road Safety", "Infrastructure"]
  },

  {
    "id": 3,
    "type": "volunteer",
    "title": "Food Drive - Winter Donations",
    "description": "Collecting non-perishable items for local shelter",
    "aiAnalysis": "The local community shelter is experiencing increased demand due to winter conditions. They urgently need non-perishable food items including rice, lentils, canned goods, and cooking oil. The shelter serves approximately 150 families daily and current supplies will last only 5 more days. This is an excellent opportunity for community members to make a direct impact on families facing food insecurity.",
    "severity": 5,
    "lat": 40.7590,
    "lon": -73.9840,
    "location_address": "Community Center, Downtown",
    "category": "Food",
    "status": "in-progress",
    "volunteersNeeded": 10,
    "volunteersJoined": 7,
    "reportedBy": "James Smith",
    "tags": ["Food", "Charity"]
  },
  {
    "id": 4,
    "type": "volunteer",
    "title": "Blood Donation Camp",
    "description": "Urgent need for O+ blood type",
    "aiAnalysis": "City Hospital has issued an urgent appeal for O+ blood donations. Current blood bank reserves are at critically low levels (only 2 days supply remaining). O+ is the most common blood type and is needed for emergency surgeries and trauma cases. The donation camp will be held with full safety protocols, and each donation can save up to 3 lives. Medical staff will be present to ensure donor safety.",
    "severity": 8,
    "lat": 40.7570,
    "lon": -73.9860,
    "location_address": "City Hospital",
    "category": "Medical",
    "status": "pending",
    "volunteersNeeded": 50,
    "volunteersJoined": 32,
    "reportedBy": "Dr. Michael Chen",
    "tags": ["Medical", "Health"]
  },
  {
    "id": 5,
    "type": "government",
    "title": "Overflowing Gutter",
    "description": "Sewage overflow in residential area",
    "aiAnalysis": "Raw sewage overflow has been reported in a densely populated residential area, creating serious health hazards. This violates Environmental Protection Act Section 12-C and Public Health Standards 2020. Prolonged exposure to sewage overflow can lead to waterborne diseases including cholera, typhoid, and hepatitis. The Municipal Corporation is legally obligated to address sewage issues within 48 hours under emergency protocols.",
    "severity": 8,
    "lat": 40.7600,
    "lon": -73.9830,
    "location_address": "Model Town Block B",
    "category": "Sanitation",
    "status": "pending",
    "supportersJoined": 41,
    "reportedBy": "William Davis",
    "tags": ["Sanitation", "Health"]
  },
  {
    "id": 6,
    "type": "volunteer",
    "title": "Elder Care Volunteers Needed",
    "description": "Weekly visits to senior citizens living alone",
    "aiAnalysis": "The Elder Care initiative needs volunteers to visit and assist senior citizens who live alone in our community. Tasks include companionship, helping with grocery shopping, and checking on their wellbeing. Studies show that regular social interaction significantly improves mental health and quality of life for elderly individuals. Volunteers will be matched with seniors based on location and availability.",
    "severity": 6,
    "lat": 40.7585,
    "lon": -73.9845,
    "location_address": "Silver Oak Senior Community",
    "category": "Social",
    "status": "pending",
    "volunteersNeeded": 15,
    "volunteersJoined": 9,
    "reportedBy": "Emily Rodriguez",
    "tags": ["Social", "Elderly"]
  },
  {
    "id": 7,
    "type": "government",
    "title": "Illegal Construction Blocking Road",
    "description": "Unauthorized construction blocking public access",
    "aiAnalysis": "An illegal construction has encroached upon public road space, reducing the road width by 40% and creating traffic congestion. This violates Urban Planning Act Section 15-B and Building Code Regulations 2021. The construction lacks proper permits and is blocking emergency vehicle access. Legal precedent shows that municipal authorities must remove unauthorized constructions within 72 hours of formal complaint.",
    "severity": 7,
    "lat": 40.7575,
    "lon": -73.9850,
    "location_address": "Green Park Extension",
    "category": "Urban Planning",
    "status": "pending",
    "supportersJoined": 18,
    "reportedBy": "David Miller",
    "tags": ["Construction", "Traffic"]
  },
  {
    "id": 8,
    "type": "volunteer",
    "title": "Tree Plantation Drive",
    "description": "Community tree planting event this weekend",
    "aiAnalysis": "Join us for a community-wide tree plantation drive aimed at increasing green cover in our neighborhood. We plan to plant 200 native trees that will improve air quality, reduce urban heat, and provide habitat for local wildlife. The initiative includes proper training on tree planting techniques and long-term maintenance planning. Each participant will receive a certificate and can adopt a tree to monitor its growth.",
    "severity": 4,
    "lat": 40.7595,
    "lon": -73.9835,
    "location_address": "Central Park Area",
    "category": "Environment",
    "status": "pending",
    "volunteersNeeded": 30,
    "volunteersJoined": 22,
    "reportedBy": "Sarah Connor",
    "tags": ["Environment", "Community"]
  }
]

def populate_exact_data():
    clean_db()
    
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    print("✨ Injecting Exact Mock Data...")
    
    for item in MOCK_DATA:
        c.execute('''INSERT INTO issues (id, title, category, description, lat, lon, tags, severity, ai_analysis, reported_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', 
                  (item['id'], item['title'], item['category'], item['description'], item['lat'], item['lon'], json.dumps(item['tags']), item['severity'], item.get('aiAnalysis', 'Analysis pending...'), item.get('reportedBy', 'Civic Citizen')))
    
    conn.commit()
    
    conn.commit()
    conn.close()
    print("✅ Done! Mock data injected.")

if __name__ == "__main__":
    populate_exact_data()