"""
AI Query Handler — HTTP endpoints for NL-to-SQL query generation.

Endpoints:
    POST /api/ai/query      — Generate SQL from natural language
    GET  /api/ai/providers   — List available AI providers
    POST /api/nl-query/generate — MCP compatibility alias for /api/ai/query

Security controls enforced by AIService, not duplicated here:
    - Input sanitization (prompt injection defense)
    - SQL validation (AST-based, SELECT only)
    - Audit logging (every request)
    - Permission enforcement (ai:query + data source access)
"""

import logging
import time

from flask import request
from flask_restful import abort

from redash import models
from redash.handlers.base import BaseResource, get_object_or_404
from redash.permissions import has_access, require_permission, view_only
from redash.services.ai import AIService
from redash.services.ai.input_sanitizer import InputSanitizationError
from redash.services.ai.providers.base import AIProviderError
from redash.services.ai.sql_validator import SQLValidationError

logger = logging.getLogger(__name__)

# Simple in-memory rate limiter. Tracks per-user request counts.
# In production with multiple workers, this should use Redis.
# For now, it provides per-process protection.
_rate_limit_store = {}
_RATE_LIMIT_WINDOW = 86400  # 24 hours in seconds


class NLQueryResource(BaseResource):
    """
    POST /api/ai/query — Generate SQL from a natural language question.

    Request body:
        {
            "question": "Top 10 customers by revenue",
            "data_source_id": 1,
            "provider": "gemini",        // optional
            "model": "gemini-2.5-flash", // optional
            "conversation": [            // optional
                {"question": "...", "sql": "..."},
                ...
            ]
        }

    Response:
        {
            "sql": "SELECT ...",
            "explanation": "...",
            "tables_used": ["customers", "orders"],
            "provider": "gemini",
            "model": "gemini-2.5-flash",
            "generation_time_ms": 1234
        }
    """

    @require_permission("execute_query")
    def post(self):
        data = request.get_json(force=True)

        # Validate required fields
        question = data.get("question")
        if not question:
            abort(400, message="Missing 'question' in request body.")

        data_source_id = data.get("data_source_id")
        if not data_source_id:
            abort(400, message="Missing 'data_source_id' in request body.")

        # Load data source with permission check
        data_source = get_object_or_404(
            models.DataSource.get_by_id_and_org,
            data_source_id,
            self.current_org,
        )

        # Check user has access to this data source
        if not has_access(data_source, self.current_user, view_only):
            abort(403, message="You do not have access to this data source.")

        # Rate limiting (configurable per-org via admin settings)
        limit = _get_rate_limit(self.current_org)
        if not _check_rate_limit(self.current_user.id, limit):
            abort(429, message=f"AI query rate limit exceeded ({limit} per day). Try again later.")

        # Optional parameters
        provider_id = data.get("provider")
        model = data.get("model")

        # Parse conversation context
        conversation = None
        raw_conversation = data.get("conversation")
        if raw_conversation and isinstance(raw_conversation, list):
            conversation = []
            for entry in raw_conversation[-3:]:  # Max 3 previous exchanges
                q = entry.get("question", "")
                s = entry.get("sql", "")
                if q and s:
                    conversation.append((q, s))

        try:
            result = AIService.generate_sql(
                question=question,
                data_source=data_source,
                user=self.current_user,
                org=self.current_org,
                provider_id=provider_id,
                model=model,
                conversation=conversation,
            )
            return result

        except InputSanitizationError as e:
            abort(400, message=f"Invalid input: {e}")
        except SQLValidationError as e:
            from redash import settings

            show_sql = getattr(settings, "AI_SHOW_FAILED_SQL", False)
            response = {"message": f"The AI generated an invalid query: {e}"}
            if show_sql and e.sql:
                response["failed_sql"] = e.sql
            abort(422, **response)
        except AIProviderError as e:
            abort(502, message=f"AI provider error: {e}")
        except ValueError as e:
            abort(400, message=str(e))


class AIProvidersResource(BaseResource):
    """
    GET /api/ai/providers — List available AI providers and models.

    Response:
        {
            "providers": [
                {
                    "id": "gemini",
                    "name": "Google Gemini",
                    "available": true,
                    "models": ["gemini-2.5-flash", "gemini-2.5-pro"],
                    "default_model": "gemini-2.5-flash"
                },
                ...
            ],
            "default_provider": "gemini"
        }

    Note: API keys are NEVER included in the response.
    """

    @require_permission("execute_query")
    def get(self):
        providers = AIService.get_providers()

        # Determine default provider
        from redash import settings

        configured_default = getattr(settings, "AI_PROVIDER", None)
        if configured_default:
            default_provider = configured_default
        else:
            # Auto-detect: first available
            available = [p for p in providers if p["available"]]
            default_provider = available[0]["id"] if available else None

        return {
            "providers": providers,
            "default_provider": default_provider,
        }


def _get_rate_limit(org):
    """Get AI rate limit from org settings, falling back to env var default."""
    org_limit = org.get_setting("ai_rate_limit_per_day", raise_on_missing=False) if org else None
    if org_limit is not None:
        return int(org_limit)
    from redash import settings

    return int(getattr(settings, "AI_RATE_LIMIT_PER_DAY", 50))


def _check_rate_limit(user_id, limit):
    """
    Simple per-user rate limiting. Returns True if within limit, False if exceeded.

    Note: This is per-process. For multi-worker deployments, migrate to Redis.
    """
    now = time.time()
    key = str(user_id)

    if key not in _rate_limit_store:
        _rate_limit_store[key] = {"count": 0, "window_start": now}

    entry = _rate_limit_store[key]

    # Reset window if expired
    if now - entry["window_start"] > _RATE_LIMIT_WINDOW:
        entry["count"] = 0
        entry["window_start"] = now

    if entry["count"] >= limit:
        return False

    entry["count"] += 1
    return True
