import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { Coffee, Zap, Heart, Star, Award, TrendingUp } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';

// Mock Data Generator
const generateMockHistory = () => {
    // Simulate last 20 orders
    return Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        drink: i % 3 === 0 ? 'Caramel Macchiato' : i % 3 === 1 ? 'Spanish Latte' : 'Americano',
        category: i % 3 === 0 ? 'Sweet' : i % 3 === 1 ? 'Creamy' : 'Strong',
        sweetness: i % 3 === 0 ? 80 : i % 3 === 1 ? 60 : 0,
        strength: i % 3 === 0 ? 40 : i % 3 === 1 ? 50 : 90,
        caffeine: i % 3 === 0 ? 75 : i % 3 === 1 ? 75 : 150,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
    }));
};

const FlavorProfilePage: React.FC = () => {
    const { currentUser } = useAuth();
    const history = useMemo(() => generateMockHistory(), []);

    // 1. Calculate Averages for Radar Chart
    const flavorStats = useMemo(() => {
        const total = history.length;
        const avgSweetness = history.reduce((acc, curr) => acc + curr.sweetness, 0) / total;
        const avgStrength = history.reduce((acc, curr) => acc + curr.strength, 0) / total;
        // Mocking other attributes based on the main two
        const avgCreaminess = (avgSweetness + (100 - avgStrength)) / 2;
        const avgBitterness = avgStrength * 0.8;
        const avgAroma = (avgStrength + avgSweetness) / 2; // Arbitrary for demo

        return [
            { subject: 'Sweetness', A: Math.round(avgSweetness), fullMark: 100 },
            { subject: 'Strength', A: Math.round(avgStrength), fullMark: 100 },
            { subject: 'Creaminess', A: Math.round(avgCreaminess), fullMark: 100 },
            { subject: 'Bitterness', A: Math.round(avgBitterness), fullMark: 100 },
            { subject: 'Aroma', A: Math.round(avgAroma), fullMark: 100 },
        ];
    }, [history]);

    // 2. Caffeine Intake (Last 7 entries aggregated by day)
    const caffeineData = useMemo(() => {
        // Simple mock aggregation: just take the last 7 orders as "Daily" for visual simplicity
        // In a real app, we'd group by actual date.
        return history.slice(0, 7).reverse().map(h => ({
            day: h.date,
            caffeine: h.caffeine,
        }));
    }, [history]);

    // 3. Determine Archetype
    const archetype = useMemo(() => {
        const sweet = flavorStats.find(s => s.subject === 'Sweetness')?.A || 0;
        const strong = flavorStats.find(s => s.subject === 'Strength')?.A || 0;

        if (sweet > 70) return { name: 'The Sweet Tooth', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-100', desc: 'You believe coffee is just a vehicle for dessert. No judgment here!' };
        if (strong > 70) return { name: 'The Purist', icon: Coffee, color: 'text-stone-800', bg: 'bg-stone-200', desc: 'Black as midnight, strong as your will. You respect the bean.' };
        if (Math.abs(sweet - strong) < 20) return { name: 'The Balanced Brewer', icon: Star, color: 'text-primary-600', bg: 'bg-primary-100', desc: 'Harmony is your middle name. You like the best of both worlds.' };
        return { name: 'The Explorer', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-100', desc: 'You like to mix it up! Your palate is always on an adventure.' };
    }, [flavorStats]);

    // 4. Favorite Drink
    const favoriteDrink = "Spanish Latte"; // Hardcoded for demo, or calculate mode

    return (
        <div className="flex min-h-screen flex-col bg-stone-50">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block p-3 rounded-full bg-primary-100 text-primary-600 mb-4"
                    >
                        <TrendingUp className="w-8 h-8" />
                    </motion.div>
                    <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Your Coffee Profile</h1>
                    <p className="text-gray-600">A deep dive into your unique coffee personality.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

                    {/* 1. The Archetype Card (Hero) */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="lg:col-span-3 bg-white rounded-3xl shadow-xl p-8 border border-gray-100 flex flex-col md:flex-row items-center gap-8"
                    >
                        <div className={`p-8 rounded-full ${archetype.bg} ${archetype.color}`}>
                            <archetype.icon className="w-16 h-16" />
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Your Coffee Archetype</h2>
                            <h3 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-3">{archetype.name}</h3>
                            <p className="text-lg text-gray-600">{archetype.desc}</p>
                        </div>
                        <div className="bg-stone-50 p-6 rounded-2xl min-w-[200px] text-center">
                            <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-gray-900">Top 5%</div>
                            <div className="text-sm text-gray-500">Customer Rank</div>
                        </div>
                    </motion.div>

                    {/* 2. Flavor Radar Chart */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1 bg-white rounded-3xl shadow-lg p-6 border border-gray-100"
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Star className="w-5 h-5 text-primary-500" /> Flavor Footprint
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={flavorStats}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="My Profile"
                                        dataKey="A"
                                        stroke="#D97706"
                                        strokeWidth={3}
                                        fill="#F59E0B"
                                        fillOpacity={0.5}
                                    />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-center text-sm text-gray-500 mt-4">
                            Based on your last 20 orders
                        </p>
                    </motion.div>

                    {/* 3. Caffeine Intake Chart */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-6 border border-gray-100"
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" /> Caffeine Intake (Last 7 Days)
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={caffeineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Bar dataKey="caffeine" radius={[8, 8, 0, 0]}>
                                        {caffeineData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.caffeine > 100 ? '#ef4444' : '#f59e0b'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 mt-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <span className="text-gray-600">Moderate</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-gray-600">High Energy</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* 4. Favorite Drink Card */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-3 bg-gradient-to-br from-stone-800 to-stone-900 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="w-32 h-32 rounded-full border-4 border-white/20 overflow-hidden shrink-0">
                                <img
                                    src="https://images.unsplash.com/photo-1570968992193-d6ea06651af1?q=80&w=2574&auto=format&fit=crop"
                                    alt="Favorite Drink"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-stone-400 font-bold uppercase tracking-wider text-sm mb-2">Your All-Time Favorite</h3>
                                <h2 className="text-4xl font-display font-bold mb-2">{favoriteDrink}</h2>
                                <p className="text-stone-300 max-w-xl">
                                    You've ordered this 12 times this month! It seems you really love the creamy texture and sweet finish.
                                </p>
                            </div>
                            <div className="ml-auto">
                                <button className="bg-white text-stone-900 px-6 py-3 rounded-full font-bold hover:bg-stone-100 transition-colors">
                                    Order Again
                                </button>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default FlavorProfilePage;
