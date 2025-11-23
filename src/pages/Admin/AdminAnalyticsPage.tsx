import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import SalesOverview from '../../components/admin/SalesOverview';
import CustomerSatisfaction from '../../components/admin/CustomerSatisfaction';
import { Feedback } from '../../data/mockFeedback';

const AdminAnalyticsPage: React.FC = () => {
    const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            setIsFeedbackLoading(true);
            try {
                const feedbackSnapshot = await db.collection('feedback')
                    .orderBy('createdAt', 'desc')
                    .limit(100) // Limit to recent 100 for performance
                    .get();

                const allFeedback = feedbackSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate(),
                    updatedAt: doc.data().updatedAt?.toDate(),
                })) as Feedback[];

                setFeedbackData(allFeedback);
            } catch (error) {
                console.error("Error fetching feedback:", error);
            } finally {
                setIsFeedbackLoading(false);
            }
        };

        fetchFeedback();
    }, []);

    return (
        <div className="space-y-8">
            {/* Sales & Orders Section */}
            <SalesOverview />

            {/* Customer Satisfaction Section */}
            <div className="border-t border-gray-200 pt-8">
                <CustomerSatisfaction
                    feedbackData={feedbackData}
                    isLoading={isFeedbackLoading}
                />
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;