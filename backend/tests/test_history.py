"""History listing, ownership and deletion."""

from datetime import datetime, timezone

from bson import ObjectId


def make_session(user_id, operation="explain", language="python", days_ago=0):
    now = datetime.now(timezone.utc)
    return {
        "_id": ObjectId(),
        "user_id": user_id,
        "operation": operation,
        "language": language,
        "target_language": None,
        "source_code": "def add(a, b):\n    return a + b\n",
        "input_prompt": "",
        "result": {"summary": "Adds two numbers."},
        "status": "success",
        "duration_seconds": 1.2,
        "created_at": now,
        "updated_at": now,
    }


def test_history_requires_authentication(client):
    assert client.get("/api/history").status_code == 401


def test_empty_history_is_an_empty_list(auth_client):
    response = auth_client.get("/api/history")

    assert response.status_code == 200

    body = response.json()
    assert body["sessions"] == []
    assert body["total"] == 0


def test_history_lists_only_the_owners_sessions(auth_client, fake_db, user):
    auth_client  # ensure auth override is applied

    fake_db.sessions.documents.append(make_session(str(user["_id"])))
    fake_db.sessions.documents.append(make_session(str(ObjectId())))

    response = auth_client.get("/api/history")

    assert response.status_code == 200
    assert response.json()["total"] == 1


def test_history_can_filter_by_operation(auth_client, fake_db, user):
    user_id = str(user["_id"])
    fake_db.sessions.documents.append(make_session(user_id, operation="explain"))
    fake_db.sessions.documents.append(make_session(user_id, operation="review"))

    response = auth_client.get("/api/history", params={"operation": "review"})

    assert response.json()["total"] == 1
    assert response.json()["sessions"][0]["operation"] == "review"


def test_reading_another_users_session_is_not_found(auth_client, fake_db):
    other_person_session = make_session(str(ObjectId()))
    fake_db.sessions.documents.append(other_person_session)

    response = auth_client.get(f"/api/history/{other_person_session['_id']}")

    assert response.status_code == 404


def test_reading_a_malformed_id_is_not_found(auth_client):
    assert auth_client.get("/api/history/not-an-object-id").status_code == 404


def test_session_can_be_read_then_deleted(auth_client, fake_db, user):
    session = make_session(str(user["_id"]))
    fake_db.sessions.documents.append(session)

    read = auth_client.get(f"/api/history/{session['_id']}")
    assert read.status_code == 200
    assert read.json()["id"] == str(session["_id"])

    deleted = auth_client.delete(f"/api/history/{session['_id']}")
    assert deleted.status_code == 200

    assert auth_client.get(f"/api/history/{session['_id']}").status_code == 404


def test_deleting_another_users_session_is_not_found(auth_client, fake_db):
    other_person_session = make_session(str(ObjectId()))
    fake_db.sessions.documents.append(other_person_session)

    response = auth_client.delete(f"/api/history/{other_person_session['_id']}")

    assert response.status_code == 404
    # The session must still exist for its real owner.
    assert len(fake_db.sessions.documents) == 1