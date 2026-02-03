import os
import cohere
import google.generativeai as genai
from typing import Optional

class LLMService:
    def __init__(self):
        self.cohere_client = None
        self.gemini_configured = False
        
        # Initialize Cohere
        cohere_api_key = os.getenv("COHERE_API_KEY")
        if cohere_api_key:
            try:
                self.cohere_client = cohere.Client(api_key=cohere_api_key)
            except Exception as e:
                print(f"Failed to initialize Cohere client: {e}")
        
        # Initialize Google GenAI
        google_api_key = os.getenv("GOOGLE_API_KEY")
        if google_api_key:
            try:
                genai.configure(api_key=google_api_key)
                self.gemini_configured = True
            except Exception as e:
                print(f"Failed to initialize Google GenAI: {e}")

    def generate_cohere(self, prompt: str, model: str = "command-r-plus") -> str:
        """
        Generate text using Cohere.
        """
        if not self.cohere_client:
            return "Error: Cohere client is not initialized. Please check COHERE_API_KEY."
            
        try:
            response = self.cohere_client.chat(
                message=prompt,
                model=model
            )
            return response.text
        except Exception as e:
            return f"Error generating text with Cohere: {e}"

    def generate_gemini(self, prompt: str, model: str = "gemini-1.5-flash") -> str:
        """
        Generate text using Google Gemini.
        """
        if not self.gemini_configured:
            return "Error: Google GenAI is not initialized. Please check GOOGLE_API_KEY."
            
        try:
            # For Gemini 1.5 Flash (latest stable efficient model)
            model_instance = genai.GenerativeModel(model)
            response = model_instance.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating text with Gemini: {e}"

# Global instance
llm_service = LLMService()
