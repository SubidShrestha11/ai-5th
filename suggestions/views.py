from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.pagination import build_page_links
from movies.serializers import PageQuerySerializer

from . import services
from .serializers import SuggestionResponseSerializer, serialize_suggestion_results


class SuggestionListView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=["Suggestions"],
        summary="Personalised movie suggestions",
        description=(
            "Returns movies your friends have watched, shuffled randomly. "
            "Falls back to popular TMDB movies when your friends have no logs."
        ),
        parameters=[
            OpenApiParameter(
                name="page",
                type=int,
                required=False,
                description="Page number (default: 1).",
            ),
        ],
        responses={
            200: SuggestionResponseSerializer,
            400: OpenApiResponse(description="Validation error"),
        },
    )
    def get(self, request: Request) -> Response:
        query = PageQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        page = query.validated_data["page"]

        payload = services.get_suggestions(request.user, page=page)
        response_data = {
            "source": payload["source"],
            "page": payload["page"],
            "total_pages": payload["total_pages"],
            "total_results": payload["total_results"],
            "results": serialize_suggestion_results(payload["source"], payload["results"]),
        }
        response_data.update(
            build_page_links(request, page, payload["total_pages"]),
        )

        serializer = SuggestionResponseSerializer(response_data)
        return Response(serializer.data)
