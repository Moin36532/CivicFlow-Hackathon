from ai_agent import classify_issue

# Test 1: Govt Issue (Text Only)
print("--- TEST 1: Pothole ---")
print(classify_issue("There is a massive pothole on Main Street."))

# Test 2: Volunteer Issue (Text Only)
print("\n--- TEST 2: Hungry Dog ---")
print(classify_issue("Found a stray dog that looks starving."))
