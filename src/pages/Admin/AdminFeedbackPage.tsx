
import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Feedback } from '../../data/mockFeedback';
import { UserProfile } from '../../context/AuthContext';
import FeedbackCard from '../../components/admin/FeedbackCard';
import RespondFeedbackModal from '../../components/admin/RespondFeedbackModal';
import { Loader2, MessageSquare } from 'lucide-react';

type FilterStatus = 'all' | 'pending' | 'reviewed' | 'resolved';

export interface FeedbackWithUser extends Feedback {
    user?: Pick<UserProfile, 'firstName' | 'lastName' | 'email'>;
}

const AdminFeedbackPage: React.FC = () => {
    const [feedbackList, setFeedbackList] = useState<FeedbackWithUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<FilterStatus>('pending');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackWithUser | null>(null);

    useEffect(() => {
        const usersMap = new Map<string, Pick<UserProfile, 'firstName' | 'lastName' | 'email'>>();

        const fetchUsers = async () => {
            if (usersMap.size > 0) return usersMap; // Avoid re-fetching
            const usersCollection = collection(db, 'users');
            const userSnapshot = await getDocs(usersCollection);
            userSnapshot.forEach(doc => {
                const data = doc.data();
                usersMap.set(doc.id, { firstName: data.firstName, lastName: data.lastName, email: data.email });
            });
            return usersMap;
        };

        const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            try {
                const users = await fetchUsers();
                const feedbacks: FeedbackWithUser[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    feedbacks.push({
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt?.toDate(),
                        updatedAt: data.updatedAt?.toDate(),
                        user: users.get(data.userId)
                    } as FeedbackWithUser);
                });
                setFeedbackList(feedbacks);
            } catch (error) {
                console.error("Error processing feedback data:", error);
            } finally {
                setIsLoading(false);
            }
        }, (error) => {
            console.error("Error fetching feedback: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredFeedback = useMemo(() => {
        if (filter === 'all') return feedbackList;
        return feedbackList.filter(fb => fb.status === filter);
    }, [filter, feedbackList]);

    const handleRespondClick = (feedback: FeedbackWithUser) => {
        setSelectedFeedback(feedback);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedFeedback(null);
    };

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary-600" /></div>;
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h1 className="font-display text-3xl font-bold text-gray-800">Customer Feedback</h1>
                <div className="flex flex-wrap w-fit mx-auto mt-4 md:mt-0 md:mx-0 gap-2 rounded-full bg-gray-200 p-1">
                    {(['pending', 'reviewed', 'resolved', 'all'] as FilterStatus[]).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize transition-colors ${filter === f ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:bg-primary-50'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {filteredFeedback.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredFeedback.map(fb => (
                        <FeedbackCard key={fb.id} feedback={fb} onRespond={() => handleRespondClick(fb)} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 p-12 text-center">
                    <MessageSquare className="h-16 w-16 text-gray-400" />
                    <h2 className="mt-4 text-xl font-semibold text-gray-700">No Feedback Here</h2>
                    <p className="mt-1 text-gray-500">No feedback matching the "{filter}" filter.</p>
                </div>
            )}

            {selectedFeedback && (
                <RespondFeedbackModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    feedback={selectedFeedback}
                />
            )}
        </div>
    );
};

export default AdminFeedbackPage;
