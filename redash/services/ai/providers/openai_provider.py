"""OpenAI Provider — GPT models via OpenAI API."""

import logging

import requests

from redash import settings
from redash.services.ai.providers.base import AIProvider, AIProviderError

logger = logging.getLogger(__name__)

OPENAI_MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-4.1-mini", "gpt-4.1"]
DEFAULT_MODEL = "gpt-4o-mini"


class OpenAIProvider(AIProvider):
    def __init__(self, model_override=None):
        self._model = model_override or DEFAULT_MODEL

    @property
    def provider_id(self):
        return "openai"

    @property
    def provider_name(self):
        return "OpenAI"

    def is_available(self):
        return bool(getattr(settings, "OPENAI_API_KEY", ""))

    def list_models(self):
        return OPENAI_MODELS

    def default_model(self):
        return DEFAULT_MODEL

    def get_completion(self, messages):
        api_key = settings.OPENAI_API_KEY
        if not api_key:
            raise AIProviderError("OpenAI API key not configured", provider="openai")

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self._model,
            "messages": messages,
            "temperature": 0,  # Deterministic SQL generation
        }

        try:
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=60,
            )

            if response.status_code != 200:
                try:
                    error_msg = response.json().get("error", {}).get("message", "Unknown error")
                except (ValueError, KeyError):
                    error_msg = f"HTTP {response.status_code}"
                raise AIProviderError(
                    f"OpenAI API error: {error_msg}",
                    provider="openai",
                    status_code=response.status_code,
                )

            data = response.json()
            return data["choices"][0]["message"]["content"]
        except requests.exceptions.Timeout:
            raise AIProviderError("OpenAI API request timed out", provider="openai")
        except requests.exceptions.RequestException as e:
            raise AIProviderError(f"Failed to connect to OpenAI: {e}", provider="openai")
