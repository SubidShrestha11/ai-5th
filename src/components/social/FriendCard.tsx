import { Link } from 'react-router-dom';
import { UserMinus, Clock, UserCheck, X, Send } from 'lucide-react';
import type { Friend, FriendRequest } from '@/types';
import { Avatar, Button, Badge } from '@/components/ui';
import { useRespondToFriendRequest } from '@/hooks/queries/friends';
import { useUIStore } from '@/store/uiStore';
import { getErrorMessage } from '@/api/errors';

interface FriendCardProps {
  friend: Friend;
  onRemove?: () => void;
}

export function FriendCard({ friend, onRemove }: FriendCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-[#101827] rounded-xl border border-white/8 hover:border-white/15 transition-all duration-200 group">
      <Link to={`/profile/${friend.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar name={friend.displayName} src={friend.avatar} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-100 leading-tight">
            {friend.displayName}
          </p>
          <p className="text-xs text-slate-500">{friend.email}</p>
          {friend.bio && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{friend.bio}</p>
          )}
        </div>
      </Link>
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

interface RequestCardProps {
  request: FriendRequest;
}

export function RequestCard({ request }: RequestCardProps) {
  const respondMutation = useRespondToFriendRequest();
  const { addToast } = useUIStore();

  const handleAccept = async () => {
    try {
      await respondMutation.mutateAsync({ requestId: request.id, action: 'accept' });
      addToast('success', `You and ${request.senderDisplayName} are now friends!`);
    } catch (error) {
      addToast('error', getErrorMessage(error));
    }
  };

  const handleDecline = async () => {
    try {
      await respondMutation.mutateAsync({ requestId: request.id, action: 'decline' });
      addToast('info', `Declined request from ${request.senderDisplayName}`);
    } catch (error) {
      addToast('error', getErrorMessage(error));
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-[#101827] rounded-xl border border-sky-300/20">
      <Avatar name={request.senderDisplayName} src={request.senderAvatar} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-100 leading-tight">{request.senderDisplayName}</p>
        <p className="text-xs text-slate-500">{request.senderEmail}</p>
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
          loading={respondMutation.isPending}
        >
          Accept
        </Button>
        <Button
          variant="ghost"
          size="xs"
          icon={<X size={12} />}
          onClick={handleDecline}
          disabled={respondMutation.isPending}
        >
          Decline
        </Button>
      </div>
    </div>
  );
}

interface OutgoingRequestCardProps {
  request: FriendRequest;
}

export function OutgoingRequestCard({ request }: OutgoingRequestCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-[#101827] rounded-xl border border-white/8">
      <Avatar name={request.receiverDisplayName} src={request.receiverAvatar} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-100 leading-tight">{request.receiverDisplayName}</p>
        <p className="text-xs text-slate-500">{request.receiverEmail}</p>
        <Badge variant="default" size="sm" className="mt-1">
          <Send size={9} /> Request sent
        </Badge>
      </div>
    </div>
  );
}
