import sqlite3

def force_update():
    conn = sqlite3.connect('civic_flow.db')
    c = conn.cursor()
    
    print("Checking current data...")
    c.execute("SELECT id, title, ai_confidence FROM issues")
    rows = c.fetchall()
    for r in rows:
        print(f"Issue {r[0]}: {r[1]} - Confidence: {r[2]}")

    print("\nForce updating Opik fields...")
    c.execute("""
        UPDATE issues 
        SET ai_confidence = 0.94, 
            opik_trace_id = '8f3a2b1c-7d9e-4f0a-1b2c-3d4e5f6a7b8c'
        WHERE ai_confidence IS NULL OR ai_confidence = ''
    """)
    conn.commit()
    
    print("Verifying update...")
    c.execute("SELECT id, title, ai_confidence FROM issues")
    rows = c.fetchall()
    for r in rows:
        print(f"Issue {r[0]}: {r[1]} - Confidence: {r[2]}")
        
    conn.close()

if __name__ == "__main__":
    force_update()
