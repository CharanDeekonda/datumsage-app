# File: python-ai-service/check_models.py
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

try:
    print("Fetching available models for your API key...")
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"- {model.name}")

except Exception as e:
    print(f"An error occurred: {e}")