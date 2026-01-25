from google import genai
from dotenv import load_dotenv


load_dotenv()

client = genai.Client()

response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents="Explain how AI works in a few words",
)
print(response.text)
for model in genai.list_models():
    print(f"Model Name: {model.name}")
    print(f"Supported Methods: {model.supported_generation_methods}")
    print("-" * 20)