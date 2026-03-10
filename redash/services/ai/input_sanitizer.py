"""
Input Sanitizer — Validates and cleans natural language input before LLM processing.

Security-critical module. All user NL input MUST pass through sanitize_input()
before being included in any LLM prompt. Prevents prompt injection at the input layer.

References:
- OWASP LLM01 (Prompt Injection)
- Haddix Arcanum Prompt Injection Taxonomy v1.5
- DataReporter Security Spec (PRD-AI-Query-Integration)
"""

import re
import unicodedata


class InputSanitizationError(Exception):
    """Raised when user input fails sanitization."""

    def __init__(self, message, violation_type=None):
        super().__init__(message)
        self.violation_type = violation_type


# Maximum input length in characters. Limits token consumption and reduces
# injection surface area. 500 chars is ~125 tokens — more than enough for
# any natural language data question.
MAX_INPUT_LENGTH = 500

# Minimum input length. Single-character inputs are not useful questions.
MIN_INPUT_LENGTH = 3

# Known prompt injection patterns. These are common techniques documented
# in the Arcanum taxonomy for hijacking LLM system prompts.
INJECTION_PATTERNS = [
    # Direct instruction override attempts
    re.compile(
        r"ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|context)", re.IGNORECASE
    ),
    re.compile(r"disregard\s+(all\s+)?(previous|prior|above|earlier)", re.IGNORECASE),
    re.compile(
        r"forget\s+(all\s+)?(previous|prior|above|earlier|your)\s+(instructions?|rules?|training)", re.IGNORECASE
    ),
    # Role/identity hijacking
    re.compile(r"you\s+are\s+(now|actually)\s+(a|an|the)\b", re.IGNORECASE),
    re.compile(r"act\s+as\s+(a|an|the)\b", re.IGNORECASE),
    re.compile(r"pretend\s+(you|to)\s+(are|be)\b", re.IGNORECASE),
    re.compile(r"new\s+instructions?:", re.IGNORECASE),
    # System prompt extraction
    re.compile(
        r"(print|show|display|reveal|output|repeat)\s+(your|the|system)\s+(system\s+)?(prompt|instructions?|rules?)",
        re.IGNORECASE,
    ),
    re.compile(r"what\s+(are|is)\s+your\s+(system\s+)?(prompt|instructions?|rules?)", re.IGNORECASE),
    # Delimiter-based injection (trying to escape our <<<>>> delimiters)
    re.compile(r"<<<|>>>", re.IGNORECASE),
    # Encoding-based attacks
    re.compile(r"base64\s*(encode|decode)", re.IGNORECASE),
    re.compile(r"\\x[0-9a-f]{2}", re.IGNORECASE),
    # SQL in the NL input (user trying to inject SQL directly)
    re.compile(
        r"\b(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE|TRUNCATE)\s+(TABLE|DATABASE|INDEX|FROM|INTO)\b", re.IGNORECASE
    ),
]

# Unicode categories that should be stripped. These are invisible control
# characters, directional overrides, and other non-printable characters
# that can be used to hide injection payloads.
STRIPPED_UNICODE_CATEGORIES = {
    "Cc",  # Control characters (except \n, \t)
    "Cf",  # Format characters (includes directional overrides: RLO, LRO, etc.)
    "Cs",  # Surrogates
    "Co",  # Private use
}


def sanitize_input(text):
    """
    Validate and sanitize natural language input for LLM processing.

    This is the FIRST defense layer before any user text enters an LLM prompt.

    Layers:
    1. Type and emptiness check
    2. Length validation (min/max)
    3. Unicode normalization + control character stripping
    4. Null byte removal
    5. Prompt injection pattern detection

    Args:
        text: The raw user input string.

    Returns:
        str: The sanitized input string.

    Raises:
        InputSanitizationError: If input fails validation.
    """
    # Layer 1: Type and emptiness
    if not isinstance(text, str):
        raise InputSanitizationError("Input must be a string", violation_type="type_error")

    text = text.strip()

    if not text:
        raise InputSanitizationError("Input cannot be empty", violation_type="empty")

    # Layer 2: Length validation
    if len(text) < MIN_INPUT_LENGTH:
        raise InputSanitizationError(
            f"Input too short (minimum {MIN_INPUT_LENGTH} characters)",
            violation_type="too_short",
        )

    if len(text) > MAX_INPUT_LENGTH:
        raise InputSanitizationError(
            f"Input too long (maximum {MAX_INPUT_LENGTH} characters)",
            violation_type="too_long",
        )

    # Layer 3: Unicode normalization + control character removal
    text = unicodedata.normalize("NFC", text)
    text = _strip_dangerous_unicode(text)

    # Layer 4: Null byte removal
    text = text.replace("\x00", "")

    # Layer 5: Prompt injection pattern detection
    for pattern in INJECTION_PATTERNS:
        if pattern.search(text):
            raise InputSanitizationError(
                "Input contains a potentially harmful pattern",
                violation_type="injection_pattern",
            )

    return text


def _strip_dangerous_unicode(text):
    """
    Remove invisible/dangerous Unicode characters while preserving
    normal text, whitespace, and common punctuation.
    """
    cleaned = []
    for char in text:
        category = unicodedata.category(char)
        if category in STRIPPED_UNICODE_CATEGORIES:
            # Allow tab and newline (Cc category) but strip everything else
            if char in ("\n", "\t"):
                cleaned.append(char)
            continue
        cleaned.append(char)
    return "".join(cleaned)
