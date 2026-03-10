"""
AI Provider Base — Abstract base class for all AI providers.

Each provider implements get_completion() which takes a message list
and returns the raw LLM response text.
"""

from abc import ABC, abstractmethod


class AIProvider(ABC):
    """Abstract base class for AI providers."""

    @property
    @abstractmethod
    def provider_id(self):
        """Unique identifier for this provider (e.g., 'openai', 'gemini')."""
        pass

    @property
    @abstractmethod
    def provider_name(self):
        """Human-readable name (e.g., 'OpenAI', 'Google Gemini')."""
        pass

    @abstractmethod
    def get_completion(self, messages):
        """
        Get a completion from the AI provider.

        Args:
            messages: List of message dicts with 'role' and 'content' keys.
                     Roles: 'system', 'user', 'assistant'.

        Returns:
            str: The raw response text from the LLM.

        Raises:
            AIProviderError: If the API call fails.
        """
        pass

    @abstractmethod
    def is_available(self):
        """Check if this provider is configured and available."""
        pass

    @abstractmethod
    def list_models(self):
        """
        Return the list of supported model identifiers.

        Returns:
            list[str]: Model identifiers (e.g., ['gpt-4o', 'gpt-4o-mini']).
        """
        pass

    @abstractmethod
    def default_model(self):
        """Return the default model identifier for this provider."""
        pass


class AIProviderError(Exception):
    """Raised when an AI provider API call fails."""

    def __init__(self, message, provider=None, status_code=None):
        super().__init__(message)
        self.provider = provider
        self.status_code = status_code
