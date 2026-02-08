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

MOCK_DATA = [
  {
    "id": 1, 
    "type": "government",
    "title": "Broken Road near Fareed Gate",
    "description": "Large pothole causing traffic hazard near historical gate",
    "aiAnalysis": "This infrastructure issue poses a significant safety risk to motorists and pedestrians. The pothole measures approximately 2 feet in diameter and 6 inches deep, violating Municipal Road Safety Standards. Similar cases have resulted in vehicle damage claims. Immediate action is required.",
    "severity": 9,
    "lat": 29.3956 + (random.uniform(-0.01, 0.01)),
    "lon": 71.6833 + (random.uniform(-0.01, 0.01)),
    "location_address": "Fareed Gate, Bahawalpur",
    "category": "Road Safety",
    "status": "pending",
    "supportersJoined": 23,
    "reportedBy": "Jon Anderson",
    "tags": ["Road Safety", "Infrastructure"],
    "aiConfidence": 0.98,
    "opikTraceId": "8f3a2b1c-7d9e-4f0a-1b2c-3d4e5f6a7b8c",
    "fairnessScore": 92,
    "disagreementRate": 5,
    "financialRelief": "None"
  },

  {
    "id": 3,
    "type": "volunteer",
    "title": "Food Drive - One Unit Chowk",
    "description": "Collecting non-perishable items for local shelter",
    "aiAnalysis": "The local community shelter is experiencing increased demand. They urgently need non-perishable food items including rice, lentils, and cooking oil. Current supplies will last only 5 more days.",
    "severity": 5,
    "lat": 29.3956 + (random.uniform(-0.01, 0.01)),
    "lon": 71.6833 + (random.uniform(-0.01, 0.01)),
    "location_address": "One Unit Chowk",
    "category": "Food",
    "status": "in-progress",
    "volunteersNeeded": 10,
    "volunteersJoined": 7,
    "reportedBy": "James Smith",
    "tags": ["Food", "Charity"],
    "aiConfidence": 0.95,
    "opikTraceId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "fairnessScore": 98,
    "disagreementRate": 0,
    "financialRelief": "Tax Deductible"
  },
  {
    "id": 4,
    "type": "volunteer",
    "title": "Blood Donation - BVH Hospital",
    "description": "Urgent need for O+ blood type",
    "aiAnalysis": "Bahawal Victoria Hospital has issued an urgent appeal for O+ blood donations. Current blood bank reserves are at critically low levels.",
    "severity": 8,
    "lat": 29.3956 + (random.uniform(-0.01, 0.01)),
    "lon": 71.6833 + (random.uniform(-0.01, 0.01)),
    "location_address": "BVH Hospital",
    "category": "Medical",
    "status": "pending",
    "volunteersNeeded": 50,
    "volunteersJoined": 32,
    "reportedBy": "Dr. Michael Chen",
    "tags": ["Medical", "Health"],
    "aiConfidence": 0.99,
    "opikTraceId": "9z8y7x6w-5v4u-3t2s-1r0q-9p8o7n6m5l4k",
    "fairnessScore": 95,
    "disagreementRate": 2,
    "financialRelief": "None"
  },
  {
    "id": 5,
    "type": "government",
    "title": "Sewage Overflow - Satellite Town",
    "description": "Sewage overflow in residential area",
    "aiAnalysis": "Raw sewage overflow has been reported in a densely populated residential area, creating serious health hazards. Causes waterborne diseases.",
    "severity": 8,
    "lat": 29.3956 + (random.uniform(-0.01, 0.01)),
    "lon": 71.6833 + (random.uniform(-0.01, 0.01)),
    "location_address": "Satellite Town Block A",
    "category": "Sanitation",
    "status": "pending",
    "supportersJoined": 41,
    "reportedBy": "William Davis",
    "tags": ["Sanitation", "Health"],
    "aiConfidence": 0.97,
    "opikTraceId": "3f4e5d6c-7b8a-9c0d-1e2f-3a4b5c6d7e8f",
    "fairnessScore": 88,
    "disagreementRate": 12,
    "financialRelief": "Municipal Fund"
  },
  {
    "id": 6,
    "type": "volunteer",
    "title": "Elder Care - Model Town A",
    "description": "Weekly visits to senior citizens",
    "aiAnalysis": "The Elder Care initiative needs volunteers to visit and assist senior citizens who live alone in our community.",
    "severity": 6,
    "lat": 29.3956 + (random.uniform(-0.01, 0.01)),
    "lon": 71.6833 + (random.uniform(-0.01, 0.01)),
    "location_address": "Model Town A",
    "category": "Social",
    "status": "pending",
    "volunteersNeeded": 15,
    "volunteersJoined": 9,
    "reportedBy": "Emily Rodriguez",
    "tags": ["Social", "Elderly"],
    "aiConfidence": 0.94,
    "opikTraceId": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
    "fairnessScore": 96,
    "disagreementRate": 1,
    "financialRelief": "None"
  },
  {
    "id": 7,
    "type": "government",
    "title": "Illegal Parking - University Chowk",
    "description": "Unauthorized parking blocking road",
    "aiAnalysis": "Illegal parking has encroached upon public road space, reducing the road width and creating traffic congestion.",
    "severity": 7,
    "lat": 29.3956 + (random.uniform(-0.01, 0.01)),
    "lon": 71.6833 + (random.uniform(-0.01, 0.01)),
    "location_address": "University Chowk",
    "category": "Urban Planning",
    "status": "pending",
    "supportersJoined": 18,
    "reportedBy": "David Miller",
    "tags": ["Construction", "Traffic"],
    "aiConfidence": 0.96,
    "opikTraceId": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
    "fairnessScore": 85,
    "disagreementRate": 15,
    "financialRelief": "None"
  },
  {
    "id": 8,
    "type": "volunteer",
    "title": "Tree Planting - Dring Stadium",
    "description": "Community tree planting event",
    "aiAnalysis": "Join us for a community-wide tree plantation drive aimed at increasing green cover.",
    "severity": 4,
    "lat": 29.3956 + (random.uniform(-0.01, 0.01)),
    "lon": 71.6833 + (random.uniform(-0.01, 0.01)),
    "location_address": "Dring Stadium",
    "category": "Environment",
    "status": "pending",
    "volunteersNeeded": 30,
    "volunteersJoined": 22,
    "reportedBy": "Sarah Connor",
    "tags": ["Environment", "Community"],
    "aiConfidence": 0.93,
    "opikTraceId": "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
    "fairnessScore": 99,
    "disagreementRate": 0,
    "financialRelief": "Green Fund"
  },
  # New Random Markers
  {
    "id": 9,
    "type": "government",
    "title": "Street Light Defect - Noor Mahal Road",
    "description": "Street lights not working for 3 days",
    "aiAnalysis": "Dark streets increase risk of accidents and crime.",
    "severity": 6,
    "lat": 29.3956 + (random.uniform(-0.02, 0.02)),
    "lon": 71.6833 + (random.uniform(-0.02, 0.02)),
    "location_address": "Noor Mahal Road",
    "category": "Infrastructure",
    "status": "pending",
    "supportersJoined": 12,
    "reportedBy": "Ali Khan",
    "tags": ["Lighting", "Safety"],
    "aiConfidence": 0.91,
    "opikTraceId": "trace-9",
    "fairnessScore": 90,
    "disagreementRate": 5,
    "financialRelief": "None"
  },
  {
    "id": 10,
    "type": "volunteer",
    "title": "Park Cleanup - Gulzar-e-Sadiq",
    "description": "Weekend cleanup drive",
    "aiAnalysis": "Park maintenance encourages community health.",
    "severity": 3,
    "lat": 29.3956 + (random.uniform(-0.02, 0.02)),
    "lon": 71.6833 + (random.uniform(-0.02, 0.02)),
    "location_address": "Gulzar-e-Sadiq Park",
    "category": "Environment",
    "status": "pending",
    "volunteersNeeded": 20,
    "volunteersJoined": 5,
    "reportedBy": "Sana Ahmed",
    "tags": ["Cleanup", "Park"],
    "aiConfidence": 0.94,
    "opikTraceId": "trace-10",
    "fairnessScore": 97,
    "disagreementRate": 1,
    "financialRelief": "None"
  },
  {
    "id": 11,
    "type": "government",
    "title": "Water Leakage - Model Town B",
    "description": "Main pipeline leaking clean water",
    "aiAnalysis": "Water wastage is a critical resource issue.",
    "severity": 8,
    "lat": 29.3956 + (random.uniform(-0.02, 0.02)),
    "lon": 71.6833 + (random.uniform(-0.02, 0.02)),
    "location_address": "Model Town B",
    "category": "Water Supply",
    "status": "pending",
    "supportersJoined": 30,
    "reportedBy": "Usman Ali",
    "tags": ["Water", "Leak"],
    "aiConfidence": 0.96,
    "opikTraceId": "trace-11",
    "fairnessScore": 89,
    "disagreementRate": 8,
    "financialRelief": "None"
  },
  {
    "id": 12,
    "type": "volunteer",
    "title": "Free Tuition - Shahdara",
    "description": "Teaching underprivileged kids",
    "aiAnalysis": "Education support for low-income families.",
    "severity": 5,
    "lat": 29.3956 + (random.uniform(-0.02, 0.02)),
    "lon": 71.6833 + (random.uniform(-0.02, 0.02)),
    "location_address": "Shahdara Area",
    "category": "Education",
    "status": "pending",
    "volunteersNeeded": 5,
    "volunteersJoined": 2,
    "reportedBy": "Zara Sheikh",
    "tags": ["Education", "Teaching"],
    "aiConfidence": 0.99,
    "opikTraceId": "trace-12",
    "fairnessScore": 99,
    "disagreementRate": 0,
    "financialRelief": "None"
  }
]

def populate_exact_data():
    clean_db()
    
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    print("Injecting Exact Mock Data...")
    
    for item in MOCK_DATA:
        c.execute('''INSERT INTO issues (id, title, category, description, lat, lon, tags, severity, ai_analysis, reported_by, ai_confidence, opik_trace_id, fairness_score, disagreement_rate, financial_relief)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', 
                  (item['id'], item['title'], item['category'], item['description'], item['lat'], item['lon'], json.dumps(item['tags']), item['severity'], item.get('aiAnalysis', 'Analysis pending...'), item.get('reportedBy', 'Civic Citizen'), item.get('aiConfidence'), item.get('opikTraceId'), item.get('fairnessScore'), item.get('disagreementRate'), item.get('financialRelief')))
    
    conn.commit()
    
    conn.commit()
    conn.close()
    print("Done! Mock data injected.")

if __name__ == "__main__":
    populate_exact_data()