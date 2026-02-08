import google.generativeai as genai
import os
import time

# Configure API Key (Run once on import if env var exists)
api_key = os.environ.get("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# Global model instances for reuse
_primary_model = None
_fallback_model = None

def get_model(model_name):
    return genai.GenerativeModel(model_name)

def generate_with_fallback(prompt, image_payload=None, system_instruction=None):
    """
    Attempts to generate content using the PRIMARY model.
    If it fails, retries with the FALLBACK model.
    """
    
    # Models to try in order
    # 1. Flash 2.5 (High Quality)
    # 2. Flash 2.0 (Fast/Stable)
    # 3. Flash 1.5 (Legacy/Backup)
    models_to_try = ['gemini-3','gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite',]
    
    last_error = None

    for model_name in models_to_try:
        try:
            print(f"🤖 AI Attempt: Using {model_name}...")
            model = get_model(model_name)
            
            if image_payload:
                # Expecting image_payload to be dict like {"mime_type":..., "data":...}
                response = model.generate_content([prompt, image_payload])
            else:
                response = model.generate_content(prompt)
                
            return response.text
            
        except Exception as e:
            print(f"⚠️ Model {model_name} failed: {e}")
            last_error = e
            time.sleep(1) # Brief pause before retry
            continue
            
    # If all fail
    print("❌ All AI models failed.")
    raise last_error or Exception("All models failed")
