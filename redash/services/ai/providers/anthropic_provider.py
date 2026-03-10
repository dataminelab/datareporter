"""Anthropic Claude Provider — Claude models via Anthropic API."""

import logging

import requests

from redash import settings
from redash.services.ai.providers.base import AIProvider, AIProviderError

logger = logging.getLogger(__name__)

ANTHROPIC_MODELS = ["claude-sonnet-4-20250514", "claude-haiku-4-5-20251001"]
DEFAULT_MODEL = "claude-sonnet-4-20250514"


class AnthropicProvider(AIProvider):
    def __init__(self, model_override=None):
        self._model = model_override or DEFAULT_MODEL

    @property
    def provider_id(self):
        return "anthropic"

    @property
    def provider_name(self):
        return "Anthropic Claude"

    def is_available(self):
        return bool(getattr(settings, "ANTHROPIC_API_KEY", ""))

    def list_models(self):
        return ANTHROPIC_MODELS

    def default_model(self):
        return DEFAULT_MODEL

    def get_completion(self, messages):
        api_key = getattr(settings, "ANTHROPIC_API_KEY", "")
        if not api_key:
            raise AIProviderError("Anthropic API key not configured", provider="anthropic")

        # Anthropic API uses a different message format:
        # system prompt goes in a top-level 'system' field, not in messages
        system_prompt = None
        anthropic_messages = []

        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")

            if role == "system":
                system_prompt = content
                continue

            anthropic_messages.append({"role": role, "content": content})

        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self._model,
            "max_tokens": 4096,
            "messages": anthropic_messages,
            "temperature": 0,
        }

        if system_prompt:
            payload["system"] = system_prompt

        try:
            response = requests.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=payload,
                timeout=60,
            )

            if response.status_code != 200:
                error_data = response.json()
                error_msg = error_data.get("error", {}).get("message", "Unknown error")
                raise AIProviderError(
                    f"Anthropic API error: {error_msg}",
                    provider="anthropic",
                    status_code=response.status_code,
                )

            data = response.json()
            # Anthropic returns content as a list of content blocks
            content_blocks = data.get("content", [])
            text_parts = [block["text"] for block in content_blocks if block.get("type") == "text"]
            return "\n".join(text_parts)
        except requests.exceptions.Timeout:
            raise AIProviderError("Anthropic API request timed out", provider="anthropic")
        except requests.exceptions.RequestException as e:
            raise AIProviderError(f"Failed to connect to Anthropic: {e}", provider="anthropic")
