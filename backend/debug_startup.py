
import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

print(f"CWD: {os.getcwd()}")
print(f"Path: {sys.path}")

try:
    print("Attempting to import main...")
    import main
    print("Successfully imported main.")
    print("App object:", main.app)
except Exception as e:
    print(f"Failed to import main: {e}")
    import traceback
    traceback.print_exc()
