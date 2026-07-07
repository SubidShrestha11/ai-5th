from friends import services as friend_services
from movies import services as movie_services


def get_friend_activity_feed(user):
    friend_ids = friend_services.get_friend_user_ids(user)
    return movie_services.get_movie_logs_for_users(friend_ids)
