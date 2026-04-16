import pytest

from redash.plywood.server_worker import ServerWorkerApi


class DummyResponse:
    def __init__(self, payload=None, error=None):
        self.payload = payload or {"ok": True}
        self.error = error

    def raise_for_status(self):
        if self.error:
            raise self.error

    def json(self):
        return self.payload


def test_execute_success(monkeypatch):
    monkeypatch.setattr(
        "redash.plywood.server_worker.requests.post",
        lambda url, json: DummyResponse(payload={"status": "ok", "url": url, "body": json}),
    )

    response = ServerWorkerApi.execute("http://worker/run", body={"x": 1})

    assert response == {"status": "ok", "url": "http://worker/run", "body": {"x": 1}}


def test_execute_raises_on_http_error(monkeypatch):
    monkeypatch.setattr(
        "redash.plywood.server_worker.requests.post",
        lambda url, json: DummyResponse(error=RuntimeError("boom")),
    )

    with pytest.raises(RuntimeError, match="boom"):
        ServerWorkerApi.execute("http://worker/fail", body={"y": 2})


def test_health_calls_execute(monkeypatch):
    monkeypatch.setattr(
        "redash.plywood.server_worker.ServerWorkerApi.execute",
        lambda url: {"health": "ok", "url": url},
    )

    result = ServerWorkerApi.health()

    assert result["health"] == "ok"
    assert result["url"].endswith("/health")
