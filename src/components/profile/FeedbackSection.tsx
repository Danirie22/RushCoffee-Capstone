import React, { useState, useEffect, FormEvent } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { formatDistanceToNow } from 'date-fns';
import { Send, Loader2, ChevronDown, MessageSquare } from 'lucide-react';
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
    const q = query(
      collection(db, "feedback"),
      where("userId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (rating === 0 || comment.trim().length < 10) {
      showToast('Please provide a rating and a comment (at least 10 characters).');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "feedback"), {
        userId: user.uid,
        rating,
        category,
        comment,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showToast('Feedback submitted successfully!');
      setRating(0);
      setCategory('food');
      setComment('');
    } catch (error) {
      console.error("Error submitting feedback: ", error);
      showToast('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const statusConfig = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <h2 className="mb-4 font-display text-2xl font-bold text-coffee-900">Your Feedback History</h2>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary-600"/></div>
          ) : feedbackHistory.length > 0 ? (
            <div className="space-y-3">
              {feedbackHistory.map(fb => (
                <div key={fb.id} className="rounded-lg border border-gray-200">
                  <button onClick={() => setExpandedId(expandedId === fb.id ? null : fb.id)} className="flex w-full items-center justify-between p-4 text-left">
                    <div className="flex items-center gap-4">
                      <StarRating rating={fb.rating} size="sm" readonly />
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
                        <p className="text-gray-700 whitespace-pre-wrap">{fb.comment}</p>
                        {fb.response && (
                          <div className="mt-4 rounded-md border-l-4 border-primary-400 bg-primary-50 p-3">
                            <p className="font-semibold text-primary-800">Response from Rush Coffee:</p>
                            <p className="mt-1 text-sm text-primary-700 italic">"{fb.response}"</p>
                          </div>
                        )}
                         <div className="mt-3">
                            <Badge className={`capitalize ${statusConfig[fb.status]}`}>{fb.status}</Badge>
                         </div>
                      </div>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-500">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-300"/>
                <p className="mt-2 font-semibold">No feedback history found.</p>
                <p className="text-sm">Share your thoughts with us using the form!</p>
            </div>
          )}
        </Card>
      </div>
      <div>
        <Card>
          <h2 className="mb-4 font-display text-2xl font-bold text-coffee-900">Leave Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Overall Rating</label>
              <StarRating rating={rating} onRatingChange={setRating} />
            </div>
             <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select id="category" value={category} onChange={e => setCategory(e.target.value as any)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                <option value="food">Food & Drinks</option>
                <option value="service">Service</option>
                <option value="system">App/Website</option>
                <option value="other">Other</option>
              </select>
            </div>
             <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comments</label>
              <textarea id="comment" value={comment} onChange={e => setComment(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="Tell us more about your experience..."></textarea>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackSection;