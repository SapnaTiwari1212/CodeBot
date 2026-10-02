"""Registration, login and the current-user endpoint, end to end."""

VALID_USER = {
    "name": "Grace Hopper",
    "email": "grace@example.com",
    "password": "a-strong-password",
}


def test_register_returns_a_token_and_the_user(client):
    response = client.post("/api/auth/register", json=VALID_USER)

    assert response.status_code == 201

    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user"]["email"] == "grace@example.com"
    assert body["user"]["name"] == "Grace Hopper"


def test_register_never_returns_the_password_hash(client):
    response = client.post("/api/auth/register", json=VALID_USER)

    assert "password" not in response.text
    assert "password_hash" not in response.text


def test_registering_the_same_email_twice_is_a_conflict(client):
    client.post("/api/auth/register", json=VALID_USER)

    response = client.post("/api/auth/register", json=VALID_USER)

    assert response.status_code == 409


def test_registering_the_same_email_in_different_case_is_a_conflict(client):
    client.post("/api/auth/register", json=VALID_USER)

    response = client.post(
        "/api/auth/register",
        json={**VALID_USER, "email": "GRACE@example.com"},
    )

    assert response.status_code == 409


def test_register_rejects_a_short_password(client):
    response = client.post(
        "/api/auth/register",
        json={**VALID_USER, "password": "short"},
    )

    assert response.status_code == 422


def test_login_succeeds_with_correct_credentials(client):
    client.post("/api/auth/register", json=VALID_USER)

    response = client.post(
        "/api/auth/login",
        json={"email": VALID_USER["email"], "password": VALID_USER["password"]},
    )

    assert response.status_code == 200
    assert response.json()["access_token"]


def test_login_is_case_insensitive_for_email(client):
    client.post("/api/auth/register", json=VALID_USER)

    response = client.post(
        "/api/auth/login",
        json={"email": "GRACE@example.com", "password": VALID_USER["password"]},
    )

    assert response.status_code == 200


def test_login_with_wrong_password_is_rejected(client):
    client.post("/api/auth/register", json=VALID_USER)

    response = client.post(
        "/api/auth/login",
        json={"email": VALID_USER["email"], "password": "not-the-password"},
    )

    assert response.status_code == 401


def test_login_with_unknown_email_gives_the_same_message(client):
    wrong_password = client.post(
        "/api/auth/login",
        json={"email": VALID_USER["email"], "password": "not-the-password"},
    )
    unknown_email = client.post(
        "/api/auth/login",
        json={"email": "nobody@example.com", "password": "not-the-password"},
    )

    assert wrong_password.status_code == unknown_email.status_code == 401
    # Identical messages, so the response cannot be used to enumerate accounts.
    assert wrong_password.json()["detail"] == unknown_email.json()["detail"]


def test_me_requires_a_token(client):
    assert client.get("/api/auth/me").status_code == 401


def test_me_returns_the_token_owner(client):
    register = client.post("/api/auth/register", json=VALID_USER).json()
    token = register["access_token"]

    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["email"] == VALID_USER["email"]
    assert response.json()["id"] == register["user"]["id"]


def test_me_rejects_a_garbage_token(client):
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer not.a.real.token"},
    )

    assert response.status_code == 401