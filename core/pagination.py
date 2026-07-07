from urllib.parse import urlencode

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


def build_page_links(
    request,
    page: int,
    total_pages: int,
    *,
    extra_query: dict | None = None,
) -> dict[str, str | None]:
    """Build absolute ``next`` / ``previous`` URLs for page-based infinite scroll."""

    def link_for_page(target_page: int) -> str | None:
        if target_page < 1:
            return None
        if total_pages and target_page > total_pages:
            return None

        params = {**(extra_query or {}), "page": target_page}
        query_string = urlencode(
            {key: value for key, value in params.items() if value not in (None, "")}
        )
        suffix = f"?{query_string}" if query_string else ""
        return request.build_absolute_uri(f"{request.path}{suffix}")

    return {
        "next": link_for_page(page + 1) if page < total_pages else None,
        "previous": link_for_page(page - 1) if page > 1 else None,
    }


class InfiniteScrollPagination(PageNumberPagination):
    """Page-number pagination with ``next`` / ``previous`` links for infinite scroll."""

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response(
            {
                "count": self.page.paginator.count,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "results": data,
            }
        )
