"""Google Gemini Provider — Gemini models via Google AI API."""

import logging

from redash import settings
from redash.services.ai.providers.base import AIProvider, AIProviderError

logger = logging.getLogger(__name__)

GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-pro"]
DEFAULT_MODEL = "gemini-2.5-flash"


class GeminiProvider(AIProvider):
    def __init__(self, model_override=None):
        self._model = model_override or DEFAULT_MODEL

    @property
    def provider_id(self):
        return "gemini"

    @property
    def provider_name(self):
        return "Google Gemini"

    def is_available(self):
        return bool(getattr(settings, "GEMINI_API_KEY", ""))

    def list_models(self):
        return GEMINI_MODELS

    def default_model(self):
        return DEFAULT_MODEL

    def get_completion(self, messages):
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise AIProviderError("Gemini API key not configured", provider="gemini")

        try:
            from google import genai
        except ImportError:
            raise AIProviderError(
                "Google Generative AI library not installed. Install with: pip install google-genai",
                provider="gemini",
            )

        try:
            client = genai.Client(api_key=api_key)

            # Extract system instruction from messages
            system_instruction = None
            gemini_contents = []

            for msg in messages:
                role = msg.get("role", "user")
                content = msg.get("content", "")

                if role == "system":
                    system_instruction = content
                    continue

                gemini_role = "model" if role == "assistant" else "user"
                gemini_contents.append({"role": gemini_role, "parts": [{"text": content}]})

            config = {}
            if system_instruction:
                config["system_instruction"] = system_instruction

            response = client.models.generate_content(
                model=self._model,
                contents=gemini_contents,
                config=config,
            )

            return response.text
        except Exception as e:
            raise AIProviderError(f"Gemini API error: {e}", provider="gemini")
