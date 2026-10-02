"""The health endpoint must answer without touching the database."""


def test_health_returns_ok(client):
    response = client.get("/api/health")

    assert response.status_code == 200

    body = response.json()
    assert body["status"] == "ok"
    assert body["service"]
    assert body["version"]


def test_unknown_route_returns_404(client):
    assert client.get("/api/does-not-exist").status_code == 404