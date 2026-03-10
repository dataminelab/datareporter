"""
AI Provider Registry — Factory for creating AI provider instances.

Supports model override: if a specific model is requested, it's passed
to the provider. Otherwise the provider's default model is used.
"""

from redash.services.ai.providers.anthropic_provider import AnthropicProvider
from redash.services.ai.providers.base import AIProvider, AIProviderError
from redash.services.ai.providers.gemini_provider import GeminiProvider
from redash.services.ai.providers.ollama_provider import OllamaProvider
from redash.services.ai.providers.openai_provider import OpenAIProvider

# Provider registry — order determines auto-detection priority.
_PROVIDERS = [
    GeminiProvider,
    OpenAIProvider,
    AnthropicProvider,
    OllamaProvider,
]


def get_provider(provider_id=None, model=None):
    """
    Get an AI provider instance.

    Args:
        provider_id: Provider identifier ('openai', 'gemini', 'anthropic', 'ollama').
                    If None, returns the first available provider.
        model: Optional model override. If provided, the provider uses this model
              instead of its default.

    Returns:
        AIProvider: An initialized provider instance.

    Raises:
        AIProviderError: If no provider is available or the requested one isn't configured.
    """
    if provider_id:
        for provider_class in _PROVIDERS:
            instance = provider_class(model_override=model)
            if instance.provider_id == provider_id:
                if not instance.is_available():
                    raise AIProviderError(
                        f"AI provider '{provider_id}' is not configured. " f"Set the required API key or URL.",
                        provider=provider_id,
                    )
                return instance
        raise AIProviderError(f"Unknown AI provider: {provider_id}", provider=provider_id)

    # Auto-detect: return first available provider
    for provider_class in _PROVIDERS:
        instance = provider_class(model_override=model)
        if instance.is_available():
            return instance

    raise AIProviderError("No AI providers are configured. Set at least one API key.")


def list_providers():
    """
    List all providers with their availability status.

    Returns:
        list[dict]: Provider info dicts with keys:
            id, name, available, models, default_model.

    Note: API keys are NEVER included in the response.
    """
    result = []
    for provider_class in _PROVIDERS:
        instance = provider_class()
        result.append(
            {
                "id": instance.provider_id,
                "name": instance.provider_name,
                "available": instance.is_available(),
                "models": instance.list_models(),
                "default_model": instance.default_model(),
            }
        )
    return result
