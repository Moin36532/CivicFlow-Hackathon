import sqlite3
import sys

def migrate_and_update():
    db_path = 'civic_flow.db'
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    print(f"🔌 Connected to {db_path}")

    # 1. Check existing columns
    c.execute("PRAGMA table_info(issues)")
    columns = [row[1] for row in c.fetchall()]
    print(f"📊 Current columns: {columns}")

    # 2. Add ai_confidence if missing
    if 'ai_confidence' not in columns:
        print("🛠️ Adding 'ai_confidence' column...")
        try:
            c.execute("ALTER TABLE issues ADD COLUMN ai_confidence REAL")
            print("✅ 'ai_confidence' added.")
        except Exception as e:
            print(f"❌ Error adding 'ai_confidence': {e}")
    else:
        print("👍 'ai_confidence' already exists.")

    # 3. Add opik_trace_id if missing
    if 'opik_trace_id' not in columns:
        print("🛠️ Adding 'opik_trace_id' column...")
        try:
            c.execute("ALTER TABLE issues ADD COLUMN opik_trace_id TEXT")
            print("✅ 'opik_trace_id' added.")
        except Exception as e:
            print(f"❌ Error adding 'opik_trace_id': {e}")
    else:
        print("👍 'opik_trace_id' already exists.")

    # 4. Force Update Data
    print("🔄 Populating data...")
    c.execute("""
        UPDATE issues 
        SET ai_confidence = 0.94, 
            opik_trace_id = '8f3a2b1c-7d9e-4f0a-1b2c-3d4e5f6a7b8c'
        WHERE ai_confidence IS NULL
    """)
    conn.commit()
    print(f"✅ Updated {c.rowcount} rows with mock Opik data.")

    # 5. Verify
    c.execute("SELECT id, title, ai_confidence, opik_trace_id FROM issues LIMIT 3")
    rows = c.fetchall()
    print("\n🧐 Verification Data:")
    for r in rows:
        print(f"  ID {r[0]}: Conf={r[2]}, Trace={r[3]}")

    conn.close()

if __name__ == "__main__":
    migrate_and_update()
