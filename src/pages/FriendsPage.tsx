import { Bell, Users } from 'lucide-react';
import { FriendCard, RequestCard } from '@/components/social/FriendCard';
import { Button } from '@/components/ui';
import {
  useFriendsList,
  useFriendRequests,
  useRemoveFriend,
} from '@/hooks/queries/friends';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { getErrorMessage } from '@/api/errors';

export function FriendsPage() {
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal, addToast } = useUIStore();
  const { data: friends = [], isLoading: friendsLoading } = useFriendsList(isAuthenticated);
  const { data: incomingRequests = [], isLoading: requestsLoading } = useFriendRequests(
    'incoming',
    isAuthenticated
  );
  const removeFriendMutation = useRemoveFriend();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400/20 to-sky-300/20 border border-white/10 flex items-center justify-center">
          <Users size={28} className="text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-serif text-white mb-2">Friends</h1>
          <p className="text-slate-400 max-w-sm">
            Sign in to connect with fellow film lovers and follow their cinema journeys.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => openAuthModal('register')}>
            Join free
          </Button>
          <Button variant="outline" onClick={() => openAuthModal('login')}>
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  const handleRemove = async (friendId: string, name: string) => {
    try {
      await removeFriendMutation.mutateAsync(friendId);
      addToast('info', `Removed ${name} from friends`);
    } catch (error) {
      addToast('error', getErrorMessage(error));
    }
  };

  const loading = friendsLoading || requestsLoading;

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold font-serif text-white">Friends</h1>
        <p className="text-slate-400 mt-1">
          {friends.length} friend{friends.length !== 1 ? 's' : ''} · {incomingRequests.length} pending request{incomingRequests.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading && (
        <p className="text-sm text-slate-500">Loading friends…</p>
      )}

      {incomingRequests.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-sky-300" />
            <h2 className="font-semibold text-white">
              Pending Requests
              <span className="ml-2 text-xs bg-sky-300/20 text-sky-300 px-2 py-0.5 rounded-full">
                {incomingRequests.length}
              </span>
            </h2>
          </div>
          <div className="space-y-3">
            {incomingRequests.map(req => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-violet-400" />
          <h2 className="font-semibold text-white">
            Following
            <span className="ml-2 text-xs bg-white/8 text-slate-400 px-2 py-0.5 rounded-full">
              {friends.length}
            </span>
          </h2>
        </div>
        {friends.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-white/8 bg-[#101827]">
            <Users size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No friends yet</p>
            <p className="text-slate-500 text-sm mt-1">
              Send friend requests from profiles when user search is available
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map(friend => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onRemove={() => handleRemove(friend.id, friend.displayName)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
