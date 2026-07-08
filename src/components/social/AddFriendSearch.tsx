import { useEffect, useRef, useState } from 'react';
import { Loader2, Search, UserPlus } from 'lucide-react';
import type { SearchUserResult } from '@/types';
import { Avatar, Badge, Button } from '@/components/ui';
import {
  useFriendsList,
  useFriendRequests,
  useSearchFriends,
  useSendFriendRequest,
} from '@/hooks/queries/friends';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { getErrorMessage } from '@/api/errors';
import { getUserFriendStatus } from '@/lib/friendStatus';

interface UserSearchCardProps {
  user: SearchUserResult;
  onAdd: (user: SearchUserResult) => void;
  adding: boolean;
  status: ReturnType<typeof getUserFriendStatus>;
}

function UserSearchCard({ user, onAdd, adding, status }: UserSearchCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-[#101827] rounded-xl border border-white/8">
      <Avatar name={user.displayName} src={user.avatar} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-100 leading-tight">{user.displayName}</p>
        <p className="text-xs text-slate-500">{user.email}</p>
        {user.bio && (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{user.bio}</p>
        )}
      </div>
      {status === 'self' && (
        <Badge variant="default" size="sm">You</Badge>
      )}
      {status === 'friend' && (
        <Badge variant="default" size="sm">Friends</Badge>
      )}
      {status === 'incoming' && (
        <Badge variant="cyan" size="sm">Requested you</Badge>
      )}
      {status === 'outgoing' && (
        <Badge variant="default" size="sm">Request sent</Badge>
      )}
      {status === 'add' && (
        <Button
          variant="primary"
          size="xs"
          icon={<UserPlus size={12} />}
          onClick={() => onAdd(user)}
          loading={adding}
        >
          Add
        </Button>
      )}
    </div>
  );
}

export function AddFriendSearch() {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: friends = [] } = useFriendsList();
  const { data: incomingRequests = [] } = useFriendRequests('incoming');
  const { data: outgoingRequests = [] } = useFriendRequests('outgoing');
  const sendRequestMutation = useSendFriendRequest();
  const [addingUserId, setAddingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const canSearch = debouncedQuery.length >= 2;
  const {
    data: results = [],
    isLoading,
    isFetching,
    error,
  } = useSearchFriends(debouncedQuery, canSearch);

  const loading = canSearch && (isLoading || isFetching);
  const errorMessage = error ? getErrorMessage(error) : null;

  const handleAddFriend = async (result: SearchUserResult) => {
    setAddingUserId(result.id);
    try {
      await sendRequestMutation.mutateAsync(result.id);
      addToast('success', `Friend request sent to ${result.displayName}`);
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setAddingUserId(null);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Search size={16} className="text-violet-400" />
        <h2 className="font-semibold text-white">Find people</h2>
      </div>

      <div className="relative">
        <div className="flex items-center gap-3 bg-[#101827] border border-white/10 rounded-2xl px-4 h-12 focus-within:border-sky-300/40 focus-within:ring-1 focus-within:ring-sky-300/20 transition-all duration-200">
          {loading ? (
            <Loader2 size={18} className="text-slate-500 shrink-0 animate-spin" />
          ) : (
            <Search size={18} className="text-slate-500 shrink-0" />
          )}
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search by email or name..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            autoComplete="off"
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Search for film lovers by email to send a friend request.
        </p>
      </div>

      {!canSearch && query.trim().length > 0 && (
        <p className="text-sm text-slate-500">Type at least 2 characters to search.</p>
      )}

      {canSearch && errorMessage && !loading && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <p className="text-sm text-red-400">{errorMessage}</p>
        </div>
      )}

      {canSearch && !loading && !errorMessage && results.length === 0 && (
        <div className="text-center py-8 rounded-2xl border border-white/8 bg-[#101827]">
          <p className="text-slate-400 font-medium">No users found for "{debouncedQuery}"</p>
          <p className="text-slate-500 text-sm mt-1">Try searching with their full email address.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map(result => (
            <UserSearchCard
              key={result.id}
              user={result}
              onAdd={handleAddFriend}
              adding={addingUserId === result.id}
              status={getUserFriendStatus(
                result.id,
                user?.id,
                friends,
                incomingRequests,
                outgoingRequests
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
