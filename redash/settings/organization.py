import os

from .helpers import parse_boolean

if os.environ.get("REDASH_SAML_LOCAL_METADATA_PATH") is not None:
    print("DEPRECATION NOTICE:\n")
    print("SAML_LOCAL_METADATA_PATH is no longer supported. Only URL metadata is supported now, please update")
    print("your configuration and reload.")
    raise SystemExit(1)


PASSWORD_LOGIN_ENABLED = parse_boolean(os.environ.get("REDASH_PASSWORD_LOGIN_ENABLED", "true"))

SAML_METADATA_URL = os.environ.get("REDASH_SAML_METADATA_URL", "")
SAML_ENTITY_ID = os.environ.get("REDASH_SAML_ENTITY_ID", "")
SAML_NAMEID_FORMAT = os.environ.get("REDASH_SAML_NAMEID_FORMAT", "")
SAML_LOGIN_ENABLED = SAML_METADATA_URL != ""

DATE_FORMAT = os.environ.get("REDASH_DATE_FORMAT", "DD/MM/YY")
TIME_FORMAT = os.environ.get("REDASH_TIME_FORMAT", "HH:mm")
INTEGER_FORMAT = os.environ.get("REDASH_INTEGER_FORMAT", "0,0")
FLOAT_FORMAT = os.environ.get("REDASH_FLOAT_FORMAT", "0,0.00")
MULTI_BYTE_SEARCH_ENABLED = parse_boolean(os.environ.get("MULTI_BYTE_SEARCH_ENABLED", "false"))

JWT_LOGIN_ENABLED = parse_boolean(os.environ.get("REDASH_JWT_LOGIN_ENABLED", "false"))
JWT_AUTH_ISSUER = os.environ.get("REDASH_JWT_AUTH_ISSUER", "")
JWT_AUTH_PUBLIC_CERTS_URL = os.environ.get("REDASH_JWT_AUTH_PUBLIC_CERTS_URL", "")
JWT_AUTH_AUDIENCE = os.environ.get("REDASH_JWT_AUTH_AUDIENCE", "")
JWT_AUTH_ALGORITHMS = os.environ.get("REDASH_JWT_AUTH_ALGORITHMS", "HS256,RS256,ES256").split(",")
JWT_AUTH_COOKIE_NAME = os.environ.get("REDASH_JWT_AUTH_COOKIE_NAME", "")
JWT_AUTH_HEADER_NAME = os.environ.get("REDASH_JWT_AUTH_HEADER_NAME", "")

FEATURE_SHOW_PERMISSIONS_CONTROL = parse_boolean(os.environ.get("REDASH_FEATURE_SHOW_PERMISSIONS_CONTROL", "false"))
SEND_EMAIL_ON_FAILED_SCHEDULED_QUERIES = parse_boolean(
    os.environ.get("REDASH_SEND_EMAIL_ON_FAILED_SCHEDULED_QUERIES", "false")
)
HIDE_PLOTLY_MODE_BAR = parse_boolean(os.environ.get("HIDE_PLOTLY_MODE_BAR", "false"))
DISABLE_PUBLIC_URLS = parse_boolean(os.environ.get("REDASH_DISABLE_PUBLIC_URLS", "false"))

# AI NL Query settings (DB-configurable, env vars as defaults)
AI_DEFAULT_PROVIDER = os.environ.get("AI_PROVIDER", "")
AI_DEFAULT_MODEL = os.environ.get("AI_MODEL", "")
AI_OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
AI_GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
AI_ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
AI_OLLAMA_URL = os.environ.get("OLLAMA_API_URL", "http://ollama:11434")

settings = {
    "auth_password_login_enabled": PASSWORD_LOGIN_ENABLED,
    "auth_saml_enabled": SAML_LOGIN_ENABLED,
    "auth_saml_entity_id": SAML_ENTITY_ID,
    "auth_saml_metadata_url": SAML_METADATA_URL,
    "auth_saml_nameid_format": SAML_NAMEID_FORMAT,
    "date_format": DATE_FORMAT,
    "time_format": TIME_FORMAT,
    "integer_format": INTEGER_FORMAT,
    "float_format": FLOAT_FORMAT,
    "multi_byte_search_enabled": MULTI_BYTE_SEARCH_ENABLED,
    "auth_jwt_login_enabled": JWT_LOGIN_ENABLED,
    "auth_jwt_auth_issuer": JWT_AUTH_ISSUER,
    "auth_jwt_auth_public_certs_url": JWT_AUTH_PUBLIC_CERTS_URL,
    "auth_jwt_auth_audience": JWT_AUTH_AUDIENCE,
    "auth_jwt_auth_algorithms": JWT_AUTH_ALGORITHMS,
    "auth_jwt_auth_cookie_name": JWT_AUTH_COOKIE_NAME,
    "auth_jwt_auth_header_name": JWT_AUTH_HEADER_NAME,
    "feature_show_permissions_control": FEATURE_SHOW_PERMISSIONS_CONTROL,
    "send_email_on_failed_scheduled_queries": SEND_EMAIL_ON_FAILED_SCHEDULED_QUERIES,
    "hide_plotly_mode_bar": HIDE_PLOTLY_MODE_BAR,
    "disable_public_urls": DISABLE_PUBLIC_URLS,
    # AI settings
    "ai_default_provider": AI_DEFAULT_PROVIDER,
    "ai_default_model": AI_DEFAULT_MODEL,
    "ai_openai_api_key": AI_OPENAI_API_KEY,
    "ai_gemini_api_key": AI_GEMINI_API_KEY,
    "ai_anthropic_api_key": AI_ANTHROPIC_API_KEY,
    "ai_ollama_url": AI_OLLAMA_URL,
}
