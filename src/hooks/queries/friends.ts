import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { friendsService } from '@/api/services/friendsService';
import { queryKeys } from '@/api/queryKeys';
import { getErrorMessage } from '@/api/errors';
import type { Friend, FriendRequest } from '@/types';

/** Example: list friends with cached loading/error states */
export function useFriendsList(enabled = true) {
  return useQuery({
    queryKey: queryKeys.friends.list(),
    queryFn: () => friendsService.listFriends(),
    enabled,
  });
}

/** Example: pending friend requests */
export function useFriendRequests(enabled = true) {
  return useQuery({
    queryKey: queryKeys.friends.requests(),
    queryFn: () => friendsService.listFriendRequests(),
    enabled,
  });
}

/** Example: send friend request */
export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => friendsService.sendFriendRequest(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.requests() });
    },
  });
}

/** Example: accept/decline with optimistic update */
export function useRespondToFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      status,
    }: {
      requestId: string;
      status: 'accepted' | 'declined';
    }) => friendsService.respondToFriendRequest(requestId, status),
    onMutate: async ({ requestId, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.friends.requests() });
      await queryClient.cancelQueries({ queryKey: queryKeys.friends.list() });

      const previousRequests = queryClient.getQueryData<FriendRequest[]>(
        queryKeys.friends.requests()
      );
      const previousFriends = queryClient.getQueryData<Friend[]>(
        queryKeys.friends.list()
      );

      queryClient.setQueryData<FriendRequest[]>(
        queryKeys.friends.requests(),
        current => current?.filter(request => request.id !== requestId) ?? []
      );

      if (status === 'accepted') {
        const acceptedRequest = previousRequests?.find(request => request.id === requestId);
        if (acceptedRequest) {
          queryClient.setQueryData<Friend[]>(queryKeys.friends.list(), current => [
            ...(current ?? []),
            {
              id: acceptedRequest.fromUserId,
              username: acceptedRequest.fromUsername,
              displayName: acceptedRequest.fromDisplayName,
              avatar: acceptedRequest.fromAvatar,
              moviesWatched: 0,
              recentActivity: null,
            },
          ]);
        }
      }

      return { previousRequests, previousFriends };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(queryKeys.friends.requests(), context.previousRequests);
      }
      if (context?.previousFriends) {
        queryClient.setQueryData(queryKeys.friends.list(), context.previousFriends);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
    },
    meta: {
      errorMessage: (error: unknown) => getErrorMessage(error),
    },
  });
}

/** Example: remove friend */
export function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => friendsService.removeFriend(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.list() });
    },
  });
}
