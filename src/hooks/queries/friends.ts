import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { friendsService } from '@/api/services/friendsService';
import { queryKeys } from '@/api/queryKeys';
import { getErrorMessage } from '@/api/errors';
import type { Friend, FriendRequest } from '@/types';

export function useFriendsList(enabled = true) {
  return useQuery({
    queryKey: queryKeys.friends.list(),
    queryFn: () => friendsService.listFriends(),
    enabled,
  });
}

export function useFriendRequests(
  direction: 'incoming' | 'outgoing' = 'incoming',
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.friends.requests(direction),
    queryFn: () => friendsService.listFriendRequests(direction),
    enabled,
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (receiverId: string) => friendsService.sendFriendRequest(receiverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.requests('outgoing') });
    },
  });
}

export function useRespondToFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      action,
    }: {
      requestId: string;
      action: 'accept' | 'decline';
    }) => friendsService.respondToFriendRequest(requestId, action),
    onMutate: async ({ requestId, action }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.friends.requests('incoming') });
      await queryClient.cancelQueries({ queryKey: queryKeys.friends.list() });

      const previousRequests = queryClient.getQueryData<FriendRequest[]>(
        queryKeys.friends.requests('incoming')
      );
      const previousFriends = queryClient.getQueryData<Friend[]>(
        queryKeys.friends.list()
      );

      queryClient.setQueryData<FriendRequest[]>(
        queryKeys.friends.requests('incoming'),
        current => current?.filter(request => request.id !== requestId) ?? []
      );

      if (action === 'accept') {
        const acceptedRequest = previousRequests?.find(request => request.id === requestId);
        if (acceptedRequest) {
          queryClient.setQueryData<Friend[]>(queryKeys.friends.list(), current => [
            ...(current ?? []),
            {
              id: acceptedRequest.senderId,
              email: acceptedRequest.senderEmail,
              displayName: acceptedRequest.senderDisplayName,
              avatar: acceptedRequest.senderAvatar,
              bio: '',
              recentActivity: null,
            },
          ]);
        }
      }

      return { previousRequests, previousFriends };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(
          queryKeys.friends.requests('incoming'),
          context.previousRequests
        );
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

export function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => friendsService.removeFriend(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.list() });
    },
  });
}

export function useFriendLogs(userId: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.friends.logs(userId ?? ''),
    queryFn: () => friendsService.listFriendLogs(userId as string),
    enabled: enabled && Boolean(userId),
  });
}
