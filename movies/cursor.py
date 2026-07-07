import base64
import json

from rest_framework.exceptions import ValidationError


def encode_cursor(page: int, query: str | None = None) -> str:
    payload: dict = {"page": page}
    if query:
        payload["q"] = query
    encoded = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
    return encoded.rstrip("=")


def decode_cursor(cursor: str) -> tuple[int, str | None]:
    padding = "=" * (-len(cursor) % 4)
    try:
        payload = json.loads(base64.urlsafe_b64decode(cursor + padding).decode())
    except (ValueError, json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise ValidationError({"cursor": "Invalid cursor."}) from exc

    page = payload.get("page", 1)
    if not isinstance(page, int) or page < 1:
        raise ValidationError({"cursor": "Invalid cursor."})

    query = payload.get("q")
    if query is not None and (not isinstance(query, str) or not query.strip()):
        raise ValidationError({"cursor": "Invalid cursor."})

    return page, query
