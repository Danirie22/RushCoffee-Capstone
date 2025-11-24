
import React, { useState, useEffect, FormEvent } from 'react';
// FIX: Use compat import for v8 syntax.
import firebase from 'firebase/compat/app';
import { db } from '../../firebaseConfig';
import { formatDistanceToNow } from 'date-fns';
import { Send, Loader2, ChevronDown, MessageSquare, AlertCircle, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { UserProfile } from '../../context/AuthContext';
import { Feedback } from '../../data/mockFeedback';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StarRating from '../feedback/StarRating';
import { useCart } from '../../context/CartContext';
import Badge from '../ui/Badge';

interface FeedbackSectionProps {
  user: UserProfile;
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ user }) => {
  const [mode, setMode] = useState<'feedback' | 'issue'>('feedback');
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<'service' | 'food' | 'system' | 'other'>('food');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [feedbackHistory, setFeedbackHistory] = useState<Feedback[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { showToast } = useCart();

  useEffect(() => {
    if (!user) return;
    // The query requires a composite index if we combine `where` and `orderBy` on different fields.
    // To avoid this, we fetch based on the user and sort the results on the client.
    const q = db.collection("feedback").where("userId", "==", user.uid);

    const unsubscribe = q.onSnapshot((querySnapshot) => {
      const history: Feedback[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        history.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Feedback);
      });
      // Sort client-side
      history.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));

      setFeedbackHistory(history);
      setIsLoadingHistory(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleModeChange = (newMode: 'feedback' | 'issue') => {
    setMode(newMode);
    setComment('');
    if (newMode === 'issue') {
      setRating(0);
      setCategory('system');
    } else {
      setRating(0);
      setCategory('food');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (mode === 'feedback' && rating === 0) {
      showToast('Please provide a rating.');
      return;
    }

    if (comment.trim().length < 10) {
      showToast('Please provide a description (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      await db.collection("feedback").add({
        userId: user.uid,
        rating: mode === 'issue' ? 0 : rating, // 0 indicates issue report
        category,
        comment,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        type: mode // Optional: store type if we want to filter later
      });
      showToast(mode === 'issue' ? 'Issue reported successfully!' : 'Feedback submitted successfully!');
      setRating(0);
      setComment('');
      if (mode === 'feedback') setCategory('food');
    } catch (error) {
      console.error("Error submitting feedback: ", error);
      showToast('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusConfig = {
    pending: 'bg-yellow-100 text-yellow-800',
    published: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <h2 className="mb-4 font-display text-2xl font-bold text-coffee-900">Your History</h2>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>
          ) : feedbackHistory.length > 0 ? (
            <div className="space-y-3">
              {feedbackHistory.map(fb => (
                <div key={fb.id} className="rounded-lg border border-gray-200">
                  <button onClick={() => setExpandedId(expandedId === fb.id ? null : fb.id)} className="flex w-full items-center justify-between p-4 text-left">
                    <div className="flex items-center gap-4">
                      {fb.rating > 0 ? (
                        <StarRating rating={fb.rating} size="sm" readonly />
                      ) : (
                        <div className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                          <AlertCircle className="h-3 w-3" />
                          Issue Report
                        </div>
                      )}
                      <div className="flex-1 overflow-hidden">
                        <p className="font-semibold text-gray-800 truncate">{fb.comment}</p>
                        <p className="text-xs text-gray-500">{fb.createdAt ? formatDistanceToNow(fb.createdAt, { addSuffix: true }) : 'Just now'}</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 transform transition-transform ${expandedId === fb.id ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedId === fb.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="border-t p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <Badge className="capitalize bg-gray-100 text-gray-600">{fb.category}</Badge>
                            <Badge className={`capitalize ${statusConfig[fb.status]}`}>{fb.status}</Badge>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{fb.comment}</p>
                          {fb.response && (
                            <div className="mt-4 rounded-md border-l-4 border-primary-400 bg-primary-50 p-3">
                              <p className="font-semibold text-primary-800">Response from Rush Coffee:</p>
                              <p className="mt-1 text-sm text-primary-700 italic">"{fb.response}"</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-500">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 font-semibold">No history found.</p>
              <p className="text-sm">Share your thoughts or report issues using the form!</p>
            </div>
          )}
        </Card>
      </div>
      <div>
        <Card>
          {/* Toggle Tabs */}
          <div className="flex p-1 mb-6 bg-gray-100 rounded-lg">
            <button
              onClick={() => handleModeChange('feedback')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${mode === 'feedback' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <ThumbsUp className="h-4 w-4" />
              Give Feedback
            </button>
            <button
              onClick={() => handleModeChange('issue')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${mode === 'issue' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <AlertCircle className="h-4 w-4" />
              Report Issue
            </button>
          </div>

          <h2 className="mb-4 font-display text-2xl font-bold text-coffee-900">
            {mode === 'feedback' ? 'Share Your Experience' : 'Report a Problem'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'feedback' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Overall Rating</label>
                <StarRating rating={rating} onRatingChange={setRating} />
              </div>
            )}

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                id="category"
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="food">Food & Drinks</option>
                <option value="service">Service</option>
                <option value="system">App/Website</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                {mode === 'feedback' ? 'Comments' : 'Describe the issue'}
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder={mode === 'feedback' ? "Tell us more about your experience..." : "Please describe the issue in detail..."}
              ></textarea>
            </div>
            <Button type="submit" disabled={isSubmitting} className={`w-full ${mode === 'issue' ? 'bg-red-600 hover:bg-red-700' : ''}`}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (mode === 'issue' ? <AlertCircle className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />)}
              {isSubmitting ? 'Submitting...' : (mode === 'issue' ? 'Report Issue' : 'Submit Feedback')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackSection;