from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from . import services
from .models import MovieLog
from .serializers import (
    MovieLogCreateSerializer,
    MovieLogSerializer,
    MovieSearchQuerySerializer,
    PageQuerySerializer,
    TMDBCursorPaginatedResponseSerializer,
    TMDBMovieDetailSerializer,
    TMDBPaginatedResponseSerializer,
)


class PopularMoviesView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=["Movies"],
        summary="List popular movies from TMDB",
        parameters=[
            OpenApiParameter(name="page", type=int, description="TMDB page number"),
        ],
        responses={
            200: TMDBPaginatedResponseSerializer,
            502: OpenApiResponse(description="TMDB fetch failed"),
        },
    )
    def get(self, request: Request) -> Response:
        query = PageQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        data = services.get_popular_movies(page=query.validated_data["page"])
        serializer = TMDBPaginatedResponseSerializer(data)
        return Response(serializer.data)


class MovieSearchView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=["Movies"],
        summary="Browse or search movies on TMDB",
        description=(
            "Returns popular movies when `q` is omitted. "
            "Results are fetched in the background on cache miss — "
            "retry with the same cursor while `status` is `pending`."
        ),
        parameters=[
            OpenApiParameter(
                name="q",
                type=str,
                required=False,
                description="Optional search query. Omit to list popular movies.",
            ),
            OpenApiParameter(
                name="cursor",
                type=str,
                required=False,
                description="Cursor for the next or previous page of results.",
            ),
        ],
        responses={
            200: TMDBCursorPaginatedResponseSerializer,
            400: OpenApiResponse(description="Validation error"),
        },
    )
    def get(self, request: Request) -> Response:
        query = MovieSearchQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        validated = query.validated_data
        data = services.browse_movies(
            query=validated.get("q") or None,
            cursor=validated.get("cursor") or None,
        )
        serializer = TMDBCursorPaginatedResponseSerializer(data)
        return Response(serializer.data)


class MovieDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=["Movies"],
        summary="Get TMDB movie details",
        responses={
            200: TMDBMovieDetailSerializer,
            502: OpenApiResponse(description="TMDB fetch failed"),
        },
    )
    def get(self, request: Request, tmdb_id: int) -> Response:
        data = services.get_movie_detail(tmdb_id)
        serializer = TMDBMovieDetailSerializer(data)
        return Response(serializer.data)


class MovieLogListCreateView(ListCreateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = MovieLogSerializer

    def get_queryset(self):
        return (
            MovieLog.objects.filter(user=self.request.user)
            .select_related("movie")
            .order_by("-watched_date", "-created_at")
        )

    @extend_schema(
        tags=["Movies"],
        summary="List your movie logs",
    )
    def get(self, request: Request, *args, **kwargs) -> Response:
        return super().get(request, *args, **kwargs)

    @extend_schema(
        tags=["Movies"],
        summary="Log a watched movie",
        request=MovieLogCreateSerializer,
        responses={
            201: MovieLogSerializer,
            400: OpenApiResponse(description="Validation error"),
        },
    )
    def post(self, request: Request, *args, **kwargs) -> Response:
        serializer = MovieLogCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        log = services.create_movie_log(request.user, serializer.validated_data)
        return Response(
            MovieLogSerializer(log).data,
            status=status.HTTP_201_CREATED,
        )


class MovieLogDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = MovieLogSerializer
    lookup_url_kwarg = "log_id"

    def get_queryset(self):
        return MovieLog.objects.filter(user=self.request.user).select_related("movie")

    @extend_schema(
        tags=["Movies"],
        summary="Get a movie log entry",
    )
    def get(self, request: Request, *args, **kwargs) -> Response:
        return super().get(request, *args, **kwargs)

    @extend_schema(
        tags=["Movies"],
        summary="Update a movie log (review, rating, date)",
    )
    def patch(self, request: Request, *args, **kwargs) -> Response:
        return super().patch(request, *args, **kwargs)

    @extend_schema(
        tags=["Movies"],
        summary="Delete a movie log entry",
    )
    def delete(self, request: Request, *args, **kwargs) -> Response:
        return super().delete(request, *args, **kwargs)

    def perform_update(self, serializer):
        services.update_movie_log(serializer.instance, serializer.validated_data)
