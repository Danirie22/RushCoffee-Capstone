

import React, { useState, FormEvent, useEffect } from 'react';
// FIX: Use compat import for v8 syntax.
import firebase from 'firebase/compat/app';
import { db } from '../../firebaseConfig';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { FeedbackWithUser } from '../../pages/Admin/AdminFeedbackPage';
import StarRating from '../feedback/StarRating';
import { Loader2, Send } from 'lucide-react';

interface RespondFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    feedback: FeedbackWithUser;
}

const RespondFeedbackModal: React.FC<RespondFeedbackModalProps> = ({ isOpen, onClose, feedback }) => {
    const [response, setResponse] = useState(feedback.response || '');
    const [status, setStatus] = useState(feedback.status);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setResponse(feedback.response || '');
            setStatus(feedback.status);
        }
    }, [isOpen, feedback]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const feedbackRef = db.collection('feedback').doc(feedback.id);
            await feedbackRef.update({
                response,
                status,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
            onClose();
        } catch (error) {
            console.error("Error updating feedback: ", error);
        } finally {
            setIsSaving(false);
        }
    };

    const userName = feedback.user ? `${feedback.user.firstName} ${feedback.user.lastName}` : `User ID: ${feedback.userId}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Feedback from ${userName}`}>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-gray-500">Rating</h4>
                    <StarRating rating={feedback.rating} readonly />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-500">Comment</h4>
                    <p className="mt-1 max-h-40 overflow-y-auto rounded-md bg-gray-50 p-3 text-gray-700 whitespace-pre-wrap">{feedback.comment}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="response" className="block text-sm font-medium text-gray-700">Your Response</label>
                        <textarea
                            id="response"
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            placeholder="Write a response to the customer..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Update Status</label>
                        <div className="mt-2 flex gap-2 rounded-full bg-gray-100 p-1">
                            {(['pending', 'published', 'resolved'] as const).map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setStatus(s)}
                                    className={`w-full rounded-full py-1.5 text-sm font-semibold capitalize transition-colors ${status === s ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:bg-primary-50'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Save Response
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default RespondFeedbackModal;