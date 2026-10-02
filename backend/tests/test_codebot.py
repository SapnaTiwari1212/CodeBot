"""The CodeBot run and chat endpoints.

OpenAI is replaced by a fake, so these tests cover our orchestration: prompt
selection, response validation, persistence and error mapping. They never make
a network call.
"""

import pytest

from app.services import codebot_service
from app.services.ai_service import AiServiceError

EXPLAIN_REPLY = """
{
  "summary": "Adds two numbers.",
  "explanation": "The function returns the sum of a and b.",
  "line_by_line": ["def add(a, b): declares the function"],
  "concepts": ["function", "return value"],
  "suggestions": []
}
"""

RUN_BODY = {
    "operation": "explain",
    "language": "python",
    "code": "def add(a, b):\n    return a + b\n",
    "prompt": "",
}


def patch_ai(monkeypatch, reply=EXPLAIN_REPLY):
    async def fake_complete(system_prompt, user_prompt, conversation=None):
        fake_complete.calls.append(
            {"system": system_prompt, "user": user_prompt, "conversation": conversation}
        )
        return reply

    fake_complete.calls = []
    monkeypatch.setattr(codebot_service, "complete", fake_complete)

    return fake_complete


def test_run_requires_authentication(client):
    assert client.post("/api/codebot/run", json=RUN_BODY).status_code == 401


def test_run_returns_the_validated_result(auth_client, monkeypatch):
    patch_ai(monkeypatch)

    response = auth_client.post("/api/codebot/run", json=RUN_BODY)

    assert response.status_code == 200

    body = response.json()
    assert body["status"] == "success"
    assert body["result"]["summary"] == "Adds two numbers."
    assert body["operation"] == "explain"
    assert body["id"]
    assert body["duration_seconds"] >= 0


def test_run_persists_the_session(auth_client, fake_db, user, monkeypatch):
    patch_ai(monkeypatch)

    auth_client.post("/api/codebot/run", json=RUN_BODY)

    assert len(fake_db.sessions.documents) == 1

    saved = fake_db.sessions.documents[0]
    assert saved["user_id"] == str(user["_id"])
    assert saved["operation"] == "explain"
    assert saved["status"] == "success"


def test_run_sends_the_code_and_language_to_the_model(auth_client, monkeypatch):
    fake = patch_ai(monkeypatch)

    auth_client.post("/api/codebot/run", json=RUN_BODY)

    user_prompt = fake.calls[0]["user"]
    assert "def add(a, b):" in user_prompt
    assert "python" in user_prompt


def test_convert_without_a_target_language_is_rejected(auth_client):
    response = auth_client.post(
        "/api/codebot/run",
        json={**RUN_BODY, "operation": "convert", "target_language": None},
    )

    assert response.status_code == 422


def test_convert_to_the_same_language_is_rejected(auth_client):
    response = auth_client.post(
        "/api/codebot/run",
        json={**RUN_BODY, "operation": "convert", "target_language": "python"},
    )

    assert response.status_code == 422


def test_generate_without_a_prompt_is_rejected(auth_client):
    response = auth_client.post(
        "/api/codebot/run",
        json={**RUN_BODY, "operation": "generate", "prompt": ""},
    )

    assert response.status_code == 422


def test_target_language_outside_convert_is_rejected(auth_client):
    response = auth_client.post(
        "/api/codebot/run",
        json={**RUN_BODY, "target_language": "javascript"},
    )

    assert response.status_code == 422


def test_unsupported_language_is_rejected(auth_client):
    response = auth_client.post(
        "/api/codebot/run",
        json={**RUN_BODY, "language": "brainfuck"},
    )

    assert response.status_code == 422


def test_ai_failure_returns_502_and_saves_the_attempt(auth_client, fake_db, monkeypatch):
    async def failing_complete(*args, **kwargs):
        raise AiServiceError("The AI service could not be reached. Please try again.")

    monkeypatch.setattr(codebot_service, "complete", failing_complete)

    response = auth_client.post("/api/codebot/run", json=RUN_BODY)

    assert response.status_code == 502

    assert len(fake_db.sessions.documents) == 1
    assert fake_db.sessions.documents[0]["status"] == "error"


def test_invalid_model_output_returns_502(auth_client, monkeypatch):
    patch_ai(monkeypatch, reply="I cannot answer that.")

    response = auth_client.post("/api/codebot/run", json=RUN_BODY)

    assert response.status_code == 502


def test_chat_returns_the_reply(auth_client, monkeypatch):
    async def fake_complete(system_prompt, user_prompt, conversation=None):
        return "This function adds its two arguments and returns the sum."

    monkeypatch.setattr(codebot_service, "complete", fake_complete)

    response = auth_client.post(
        "/api/codebot/chat",
        json={
            "message": "What does this do?",
            "code": RUN_BODY["code"],
            "language": "python",
            "history": [],
        },
    )

    assert response.status_code == 200
    assert "adds" in response.json()["reply"]


def test_chat_forwards_history_to_the_model(auth_client, monkeypatch):
    captured = {}

    async def fake_complete(system_prompt, user_prompt, conversation=None):
        captured["conversation"] = conversation
        return "Sure."

    monkeypatch.setattr(codebot_service, "complete", fake_complete)

    auth_client.post(
        "/api/codebot/chat",
        json={
            "message": "And why?",
            "code": RUN_BODY["code"],
            "language": "python",
            "history": [
                {"role": "user", "content": "What does this do?"},
                {"role": "assistant", "content": "It adds two numbers."},
            ],
        },
    )

    assert captured["conversation"] == [
        {"role": "user", "content": "What does this do?"},
        {"role": "assistant", "content": "It adds two numbers."},
    ]


def test_chat_requires_authentication(client):
    response = client.post(
        "/api/codebot/chat",
        json={"message": "hi", "code": "x = 1", "language": "python", "history": []},
    )

    assert response.status_code == 401