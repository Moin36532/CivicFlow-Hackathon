import sqlite3
import os

try:
    # Use absolute path or relative if reliable
    db_path = 'civic_flow.db'
    if not os.path.exists(db_path):
        # Try looking in current dir or parent
        if os.path.exists(os.path.join('backend', 'civic_flow.db')):
             db_path = os.path.join('backend', 'civic_flow.db')
    
    print(f"Connecting to {db_path}...")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # Check if 's' exists
    c.execute("SELECT count(*) FROM issues WHERE title='s'")
    count = c.fetchone()[0]
    print(f"Found {count} issues with title 's'")
    
    if count > 0:
        c.execute("DELETE FROM issues WHERE title='s'")
        conn.commit()
        print(f"Deleted {count} issues.")
    else:
        print("No issues found to delete.")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
