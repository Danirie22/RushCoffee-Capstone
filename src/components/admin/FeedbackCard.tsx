import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FeedbackWithUser } from '../../pages/Admin/AdminFeedbackPage';
import StarRating from '../feedback/StarRating';
import Badge from '../ui/Badge';
import { AlertCircle, Bug, MessageSquare } from 'lucide-react';

interface FeedbackCardProps {
  feedback: FeedbackWithUser;
  onRespond: () => void;
}

const statusConfig = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
};

const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, onRespond }) => {
  const userName = feedback.user ? `${feedback.user.firstName} ${feedback.user.lastName}` : `User ${feedback.userId.substring(0, 6)}`;
  const isReport = feedback.rating === 0;

  return (
    <div className={`flex flex-col rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md group ${isReport ? 'border-l-4 border-l-red-500' : 'border-gray-100'}`}>
      {/* Header Section */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar / Icon */}
          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${isReport ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
            {isReport ? <Bug className="h-5 w-5" /> : userName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">{userName}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              {feedback.createdAt ? formatDistanceToNow(feedback.createdAt, { addSuffix: true }) : 'Just now'}
            </p>
          </div>
        </div>
        <Badge className={`capitalize border ${statusConfig[feedback.status]}`}>{feedback.status}</Badge>
      </div>

      {/* Content Section */}
      <div className="mb-3">
        {isReport ? (
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/10">
              <AlertCircle className="h-3.5 w-3.5" />
              Issue Report
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 capitalize">
              {feedback.category}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={feedback.rating} readonly size="sm" />
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs font-medium text-gray-500 capitalize">{feedback.category}</span>
          </div>
        )}

        <div className={`rounded-lg p-3 text-sm ${isReport ? 'bg-red-50/50 text-gray-800' : 'bg-gray-50 text-gray-600'}`}>
          "{feedback.comment}"
        </div>
      </div>

      {/* Action Section */}
      <div className="mt-auto pt-2">
        <button
          onClick={onRespond}
          className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors 
            ${isReport
              ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-primary-600'
            }`}
        >
          <MessageSquare className="h-4 w-4" />
          {isReport ? 'Resolve Issue' : 'View & Respond'}
        </button>
      </div>
    </div>
  );
};

export default FeedbackCard;