from google import genai
from dotenv import load_dotenv


load_dotenv()

client = genai.Client()

# response = client.models.generate_content(
#     model="gemini-3-flash-preview",
#     contents="Explain how AI works in a few words",
# )
import google.generativeai as genai

genai.configure(api_key="api_key")

for m in genai.list_models():
    print(m.name)