from rest_framework import serializers

from movies.serializers import MovieSerializer, TMDBMovieSerializer

from . import constants


class SuggestionResponseSerializer(serializers.Serializer):
    source = serializers.ChoiceField(choices=(constants.SOURCE_FRIENDS, constants.SOURCE_POPULAR))
    page = serializers.IntegerField()
    total_pages = serializers.IntegerField()
    total_results = serializers.IntegerField()
    next = serializers.URLField(allow_null=True)
    previous = serializers.URLField(allow_null=True)
    results = serializers.ListField()


def serialize_suggestion_results(source: str, results) -> list:
    if source == constants.SOURCE_FRIENDS:
        return MovieSerializer(results, many=True).data
    return TMDBMovieSerializer(results, many=True).data
