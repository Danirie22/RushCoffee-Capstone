
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Star, ThumbsUp, ThumbsDown, Minus, MessageSquare } from 'lucide-react';
import Card from '../ui/Card';
import { Feedback } from '../../data/mockFeedback';

interface CustomerSatisfactionProps {
    feedbackData: Feedback[];
    isLoading: boolean;
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444']; // Green, Yellow, Red

const CustomerSatisfaction: React.FC<CustomerSatisfactionProps> = ({ feedbackData, isLoading }) => {

    const metrics = useMemo(() => {
        if (!feedbackData.length) return null;

        const reviews = feedbackData.filter(f => f.rating > 0);
        const totalReviews = reviews.length;

        if (totalReviews === 0) return null;

        // 1. Average Rating
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

        // 2. NPS Calculation (Proxy: 5=Promoter, 4=Passive, 1-3=Detractor)
        const promoters = reviews.filter(r => r.rating === 5).length;
        const detractors = reviews.filter(r => r.rating <= 3).length;
        const nps = Math.round(((promoters - detractors) / totalReviews) * 100);

        // 3. Sentiment Distribution
        const sentimentData = [
            { name: 'Positive (5★)', value: promoters },
            { name: 'Neutral (4★)', value: reviews.filter(r => r.rating === 4).length },
            { name: 'Negative (1-3★)', value: detractors },
        ];

        // 4. Category Performance
        const categories = ['food', 'service', 'system', 'other'];
        const categoryData = categories.map(cat => {
            const catReviews = reviews.filter(r => r.category === cat);
            const catAvg = catReviews.length
                ? catReviews.reduce((sum, r) => sum + r.rating, 0) / catReviews.length
                : 0;
            return {
                name: cat.charAt(0).toUpperCase() + cat.slice(1),
                rating: Number(catAvg.toFixed(1)),
                count: catReviews.length
            };
        }).filter(c => c.count > 0);

        return { avgRating, nps, sentimentData, categoryData, totalReviews };
    }, [feedbackData]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <Card className="h-80 animate-pulse bg-gray-100"><div></div></Card>
                <Card className="h-80 animate-pulse bg-gray-100"><div></div></Card>
            </div>
        );
    }

    if (!metrics) {
        return (
            <Card className="mt-8 text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No Feedback Data</h3>
                <p className="text-gray-500">Collect more customer feedback to see satisfaction metrics.</p>
            </Card>
        );
    }

    return (
        <div className="mt-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Customer Satisfaction & Feedback</h2>

            {/* Top Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="flex items-center justify-between p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-amber-100">
                    <div>
                        <p className="text-sm font-medium text-amber-800">Average Rating</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-bold text-amber-900">{metrics.avgRating.toFixed(1)}</span>
                            <div className="flex text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < Math.round(metrics.avgRating) ? 'fill-current' : 'text-amber-200'}`} />
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-amber-700 mt-1">Based on {metrics.totalReviews} reviews</p>
                    </div>
                </Card>

                <Card className={`flex items-center justify-between p-6 bg-gradient-to-br ${metrics.nps > 0 ? 'from-green-50 to-emerald-50 border-emerald-100' : 'from-red-50 to-rose-50 border-rose-100'}`}>
                    <div>
                        <p className={`text-sm font-medium ${metrics.nps > 0 ? 'text-emerald-800' : 'text-rose-800'}`}>Net Promoter Score (NPS)</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className={`text-3xl font-bold ${metrics.nps > 0 ? 'text-emerald-900' : 'text-rose-900'}`}>{metrics.nps > 0 ? '+' : ''}{metrics.nps}</span>
                        </div>
                        <p className={`text-xs mt-1 ${metrics.nps > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {metrics.nps > 50 ? 'Excellent' : metrics.nps > 0 ? 'Good' : 'Needs Improvement'}
                        </p>
                    </div>
                    <div className={`p-3 rounded-full ${metrics.nps > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {metrics.nps > 0 ? <ThumbsUp className="w-6 h-6" /> : <ThumbsDown className="w-6 h-6" />}
                    </div>
                </Card>

                <Card className="flex items-center justify-between p-6 bg-white border-gray-100">
                    <div className="w-full">
                        <p className="text-sm font-medium text-gray-500 mb-3">Sentiment Distribution</p>
                        <div className="flex h-4 w-full rounded-full overflow-hidden">
                            {metrics.sentimentData.map((entry, index) => (
                                <div
                                    key={entry.name}
                                    style={{ width: `${(entry.value / metrics.totalReviews) * 100}%`, backgroundColor: COLORS[index] }}
                                    title={`${entry.name}: ${entry.value}`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Pos</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div>Neu</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>Neg</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Rating by Category</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis type="number" domain={[0, 5]} hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="rating" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={20} background={{ fill: '#F3F4F6' }}>
                                    {
                                        metrics.categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.rating >= 4.5 ? '#10B981' : entry.rating >= 4 ? '#8B5CF6' : '#F59E0B'} />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Feedback Volume Trend</h3>
                    <div className="h-64 flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        Chart placeholder (Requires historical data aggregation)
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CustomerSatisfaction;
