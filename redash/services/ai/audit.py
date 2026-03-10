"""
AI Audit Logger — Records all AI query activity for security monitoring.

Every AI query attempt is logged with full context: who asked, what they asked,
what SQL was generated, whether it passed validation, and whether it was executed.

Uses DataReporter's existing event system (record_event) for consistency.
"""

import logging
from datetime import datetime

logger = logging.getLogger(__name__)


def log_ai_query(
    org, user, data_source_id, question, provider, model, sql=None, validation_passed=None, executed=False, error=None
):
    """
    Log an AI query event.

    This function MUST be called for every AI query attempt, regardless of outcome.
    It records both successful and failed attempts for security audit purposes.

    Args:
        org: The organization object.
        user: The user who made the request.
        data_source_id: ID of the data source queried.
        question: The natural language question (sanitized).
        provider: AI provider used (e.g., 'gemini', 'openai').
        model: Model used (e.g., 'gemini-2.5-flash').
        sql: Generated SQL (None if generation failed).
        validation_passed: Whether SQL passed validation (None if not generated).
        executed: Whether the SQL was executed.
        error: Error message if any step failed.
    """
    try:
        from redash.monitor import record_event

        event_data = {
            "action": "ai_query",
            "object_type": "data_source",
            "object_id": data_source_id,
            "ai_question": question[:500],  # Truncate for storage
            "ai_provider": provider,
            "ai_model": model,
            "ai_sql_generated": bool(sql),
            "ai_validation_passed": validation_passed,
            "ai_executed": executed,
            "ai_error": str(error)[:500] if error else None,
            "timestamp": datetime.utcnow().isoformat(),
        }

        # Log the SQL separately at debug level (may contain schema info)
        if sql:
            logger.debug("AI generated SQL for user %s on ds %s: %s", user.id, data_source_id, sql[:200])

        record_event(org, user, event_data)
    except Exception as e:
        # Audit logging MUST NOT crash the request.
        # If logging fails, log to stderr and continue.
        logger.error("Failed to record AI query audit event: %s", e)
