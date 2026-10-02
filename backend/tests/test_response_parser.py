"""The parser is the guard between a flexible model and a strict schema."""

import pytest

from app.utils.response_parser import AiResponseError, extract_json_text, parse_result


def test_bare_json_is_accepted():
    assert extract_json_text('{"a": 1}') == '{"a": 1}'


def test_fenced_json_is_unwrapped():
    content = '```json\n{"a": 1}\n```'

    assert extract_json_text(content) == '{"a": 1}'


def test_json_with_surrounding_prose_is_extracted():
    content = 'Here is the result:\n{"a": 1}\nHope that helps!'

    assert extract_json_text(content) == '{"a": 1}'


def test_empty_response_is_rejected():
    with pytest.raises(AiResponseError):
        extract_json_text("")


def test_non_json_response_is_rejected():
    with pytest.raises(AiResponseError):
        extract_json_text("I cannot help with that.")


EXPLAIN_JSON = """
{
  "summary": "Adds two numbers.",
  "explanation": "It returns the sum.",
  "line_by_line": ["def add(a, b): defines the function"],
  "concepts": ["function"],
  "suggestions": []
}
"""


def test_valid_result_is_parsed_into_a_dict():
    result = parse_result("explain", EXPLAIN_JSON)

    assert result["summary"] == "Adds two numbers."
    assert result["concepts"] == ["function"]


def test_fenced_result_is_parsed():
    result = parse_result("explain", f"```json\n{EXPLAIN_JSON}\n```")

    assert result["summary"] == "Adds two numbers."


def test_missing_required_key_is_rejected():
    content = '{"summary": "only a summary"}'

    with pytest.raises(AiResponseError) as error:
        parse_result("explain", content)

    # The message should name the fields that were missing.
    assert "explanation" in str(error.value)


def test_unknown_operation_is_rejected():
    with pytest.raises(AiResponseError):
        parse_result("teleport", EXPLAIN_JSON)