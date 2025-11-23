
import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Feedback } from '../../data/mockFeedback';
import { UserProfile } from '../../context/AuthContext';
import FeedbackCard from '../../components/admin/FeedbackCard';
import RespondFeedbackModal from '../../components/admin/RespondFeedbackModal';
import { Loader2, MessageSquare, Star, AlertCircle, Filter } from 'lucide-react';

type FilterStatus = 'all' | 'pending' | 'published' | 'resolved';
type ViewMode = 'all' | 'reviews' | 'reports';

export interface FeedbackWithUser extends Feedback {
    user?: Pick<UserProfile, 'firstName' | 'lastName' | 'email'>;
}

const AdminFeedbackPage: React.FC = () => {
    const [feedbackList, setFeedbackList] = useState<FeedbackWithUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('pending');
    const [viewMode, setViewMode] = useState<ViewMode>('all');
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
        return feedbackList.filter(fb => {
            // 1. Filter by Status
            if (statusFilter !== 'all' && fb.status !== statusFilter) return false;

            // 2. Filter by View Mode (Type)
            if (viewMode === 'reviews' && fb.rating === 0) return false; // Hide reports
            if (viewMode === 'reports' && fb.rating > 0) return false;   // Hide reviews

            return true;
        });
    }, [statusFilter, viewMode, feedbackList]);

    const stats = useMemo(() => {
        return {
            total: feedbackList.length,
            reviews: feedbackList.filter(f => f.rating > 0).length,
            reports: feedbackList.filter(f => f.rating === 0).length,
            pending: feedbackList.filter(f => f.status === 'pending').length
        };
    }, [feedbackList]);

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
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-gray-800">Feedback & Support</h1>
                    <p className="text-gray-500 mt-1">Manage customer reviews and resolve reported issues.</p>
                </div>

                {/* View Mode Toggles (Tabs) */}
                <div className="flex p-1 bg-gray-100 rounded-lg self-start md:self-auto">
                    <button
                        onClick={() => setViewMode('all')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        All ({stats.total})
                    </button>
                    <button
                        onClick={() => setViewMode('reviews')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'reviews' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Star className="h-4 w-4" />
                        Reviews ({stats.reviews})
                    </button>
                    <button
                        onClick={() => setViewMode('reports')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'reports' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <AlertCircle className="h-4 w-4" />
                        Issues ({stats.reports})
                    </button>
                </div>
            </div>

            {/* Status Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600">
                    <Filter className="h-4 w-4" />
                    <span>Filter Status:</span>
                </div>
                {(['pending', 'published', 'resolved', 'all'] as FilterStatus[]).map(f => (
                    <button
                        key={f}
                        onClick={() => setStatusFilter(f)}
                        className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-all border ${statusFilter === f
                            ? 'bg-gray-800 text-white border-gray-800'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            {filteredFeedback.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredFeedback.map(fb => (
                        <FeedbackCard key={fb.id} feedback={fb} onRespond={() => handleRespondClick(fb)} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-16 text-center">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="h-8 w-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-700">No items found</h2>
                    <p className="mt-2 text-gray-500 max-w-sm">
                        There are no {viewMode === 'reports' ? 'issue reports' : viewMode === 'reviews' ? 'reviews' : 'items'} matching the "{statusFilter}" filter.
                    </p>
                    {statusFilter !== 'all' && (
                        <button
                            onClick={() => setStatusFilter('all')}
                            className="mt-6 text-primary-600 font-semibold hover:text-primary-700"
                        >
                            Clear Filters
                        </button>
                    )}
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
