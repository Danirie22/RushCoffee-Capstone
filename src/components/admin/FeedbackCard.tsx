import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FeedbackWithUser } from '../../pages/Admin/AdminFeedbackPage';
import StarRating from '../feedback/StarRating';
import Badge from '../ui/Badge';

interface FeedbackCardProps {
  feedback: FeedbackWithUser;
  onRespond: () => void;
}

const statusConfig = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
};

const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, onRespond }) => {
    const userName = feedback.user ? `${feedback.user.firstName} ${feedback.user.lastName}` : `User ${feedback.userId.substring(0, 6)}`;
  return (
    <div className="flex flex-col rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">{userName}</h3>
          <p className="text-xs text-gray-500">{feedback.createdAt ? formatDistanceToNow(feedback.createdAt, { addSuffix: true }) : 'Just now'}</p>
        </div>
        <Badge className={`capitalize ${statusConfig[feedback.status]}`}>{feedback.status}</Badge>
      </div>
      <div className="my-3 flex justify-start">
        <StarRating rating={feedback.rating} readonly size="sm" />
      </div>
      <p className="flex-grow text-sm text-gray-600 line-clamp-3">"{feedback.comment}"</p>
      <div className="mt-4 border-t pt-3">
        <button
          onClick={onRespond}
          className="w-full rounded-full bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-200"
        >
          View & Respond
        </button>
      </div>
    </div>
  );
};

export default FeedbackCard;