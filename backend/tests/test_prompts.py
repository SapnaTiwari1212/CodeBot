"""Every operation must be wired end to end.

The other CodeBot tests use Explain. This module walks all ten one-shot
operations through the real route, prompt selection and validation, using a
minimal valid reply generated from each operation's result model. It catches the
kind of mistake that only shows up for one operation, such as a prompt module
whose `build_user_prompt` takes the wrong arguments.
"""

import json

import pytest

from app.schemas.codebot import RESULT_MODELS
from app.services import codebot_service

OPERATIONS = sorted(RESULT_MODELS.keys())


def sample_payload(model):
    """Build one valid value for every field of a result model."""
    payload = {}

    for name, field in model.model_fields.items():
        origin = getattr(field.annotation, "__origin__", None)

        if origin is list or field.annotation is list:
            payload[name] = []
        else:
            payload[name] = "sample"

    return payload


def request_body(operation):
    body = {
        "operation": operation,
        "language": "python",
        "code": "def add(a, b):\n    return a + b\n",
        "prompt": "",
    }

    if operation == "convert":
        body["target_language"] = "javascript"
    if operation == "generate":
        body["prompt"] = "write a function that adds two numbers"

    return body


@pytest.mark.parametrize("operation", OPERATIONS)
def test_operation_runs_end_to_end(auth_client, monkeypatch, operation):
    expected = sample_payload(RESULT_MODELS[operation])

    async def fake_complete(system_prompt, user_prompt, conversation=None):
        assert isinstance(system_prompt, str) and system_prompt
        assert isinstance(user_prompt, str) and user_prompt
        return json.dumps(expected)

    monkeypatch.setattr(codebot_service, "complete", fake_complete)

    response = auth_client.post("/api/codebot/run", json=request_body(operation))

    assert response.status_code == 200, response.text
    assert response.json()["operation"] == operation
    assert response.json()["result"] == expected


@pytest.mark.parametrize("operation", OPERATIONS)
def test_operation_prompt_module_is_complete(operation):
    module = codebot_service.PROMPT_MODULES[operation]

    assert isinstance(module.SYSTEM_PROMPT, str) and module.SYSTEM_PROMPT
    assert callable(module.build_user_prompt)


def test_every_result_model_has_a_prompt_module():
    assert set(RESULT_MODELS) == set(codebot_service.PROMPT_MODULES)