import { Link } from 'react-router-dom';
import { UserPlus, UserMinus, Clock, UserCheck, X } from 'lucide-react';
import type { Friend, User, FriendRequest } from '@/types';
import { Avatar, Button, Badge } from '@/components/ui';
import { useFriendStore } from '@/store/friendStore';
import { useUIStore } from '@/store/uiStore';

interface FriendCardProps {
  friend: Friend;
  onRemove?: () => void;
}

export function FriendCard({ friend, onRemove }: FriendCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-[#101827] rounded-xl border border-white/8 hover:border-white/15 transition-all duration-200 group">
      <Avatar name={friend.displayName} src={friend.avatar} size="md" />
      <div className="flex-1 min-w-0">
        <Link
          to={`/profile/${friend.username}`}
          className="font-semibold text-slate-100 hover:text-sky-300 transition-colors block leading-tight"
        >
          {friend.displayName}
        </Link>
        <p className="text-xs text-slate-500">@{friend.username}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {friend.moviesWatched} films logged
        </p>
      </div>
      <Button
        variant="danger"
        size="xs"
        icon={<UserMinus size={12} />}
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        Remove
      </Button>
    </div>
  );
}

interface SuggestedUserCardProps {
  user: User;
}

export function SuggestedUserCard({ user }: SuggestedUserCardProps) {
  const { sendRequest, cancelRequest, hasSentRequest } = useFriendStore();

  const pending = hasSentRequest(user.id);

  return (
    <div className="flex items-center gap-3 p-4 bg-[#101827] rounded-xl border border-white/8 hover:border-white/15 transition-all duration-200">
      <Avatar name={user.displayName} src={user.avatar} size="md" />
      <div className="flex-1 min-w-0">
        <Link
          to={`/profile/${user.username}`}
          className="font-semibold text-slate-100 hover:text-sky-300 transition-colors block leading-tight"
        >
          {user.displayName}
        </Link>
        <p className="text-xs text-slate-500">@{user.username}</p>
        {user.bio && (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{user.bio}</p>
        )}
        <p className="text-xs text-slate-500 mt-0.5">{user.moviesWatched} films</p>
      </div>
      {pending ? (
        <Button
          variant="outline"
          size="xs"
          icon={<Clock size={12} />}
          onClick={() => cancelRequest(user.id)}
        >
          Pending
        </Button>
      ) : (
        <Button
          variant="primary"
          size="xs"
          icon={<UserPlus size={12} />}
          onClick={() =>
            sendRequest({
              id: user.id,
              username: user.username,
              displayName: user.displayName,
              avatar: user.avatar,
            })
          }
        >
          Follow
        </Button>
      )}
    </div>
  );
}

interface RequestCardProps {
  request: FriendRequest;
}

export function RequestCard({ request }: RequestCardProps) {
  const { acceptRequest, rejectRequest } = useFriendStore();
  const { addToast } = useUIStore();

  const handleAccept = () => {
    acceptRequest(request.id);
    addToast('success', `You and ${request.fromDisplayName} are now friends!`);
  };

  const handleReject = () => {
    rejectRequest(request.id);
    addToast('info', `Declined request from ${request.fromDisplayName}`);
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-[#101827] rounded-xl border border-sky-300/20">
      <Avatar name={request.fromDisplayName} src={request.fromAvatar} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-100 leading-tight">{request.fromDisplayName}</p>
        <p className="text-xs text-slate-500">@{request.fromUsername}</p>
        <Badge variant="cyan" size="sm" className="mt-1">
          <Clock size={9} /> Wants to follow
        </Badge>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button
          variant="primary"
          size="xs"
          icon={<UserCheck size={12} />}
          onClick={handleAccept}
        >
          Accept
        </Button>
        <Button
          variant="ghost"
          size="xs"
          icon={<X size={12} />}
          onClick={handleReject}
        >
          Decline
        </Button>
      </div>
    </div>
  );
}
