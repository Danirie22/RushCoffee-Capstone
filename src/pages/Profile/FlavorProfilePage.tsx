import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Zap, Heart, Star, Award, TrendingUp, Share2, Clock, Calendar } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { useProduct } from '../../context/ProductContext';
import Button from '../../components/ui/Button';

// Mock Data Generator
const generateMockHistory = () => {
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
    const { products } = useProduct();
    const history = useMemo(() => generateMockHistory(), []);

    // 1. Calculate Averages
    const flavorStats = useMemo(() => {
        const total = history.length;
        const avgSweetness = history.reduce((acc, curr) => acc + curr.sweetness, 0) / total;
        const avgStrength = history.reduce((acc, curr) => acc + curr.strength, 0) / total;
        const avgCreaminess = (avgSweetness + (100 - avgStrength)) / 2;
        const avgBitterness = avgStrength * 0.8;

        return [
            { label: 'Sweetness', value: Math.round(avgSweetness), color: 'bg-pink-500', icon: Heart },
            { label: 'Strength', value: Math.round(avgStrength), color: 'bg-stone-800', icon: Zap },
            { label: 'Creaminess', value: Math.round(avgCreaminess), color: 'bg-amber-400', icon: Star },
            { label: 'Bitterness', value: Math.round(avgBitterness), color: 'bg-stone-600', icon: Coffee },
        ];
    }, [history]);

    // 2. Caffeine Data
    const caffeineData = useMemo(() => {
        return history.slice(0, 7).reverse().map(h => ({
            day: h.date,
            caffeine: h.caffeine,
            height: (h.caffeine / 200) * 100 // Normalize to percentage (assuming max 200mg)
        }));
    }, [history]);

    // 3. Archetype Logic
    const archetype = useMemo(() => {
        const sweet = flavorStats.find(s => s.label === 'Sweetness')?.value || 0;
        const strong = flavorStats.find(s => s.label === 'Strength')?.value || 0;

        if (sweet > 70) return { name: 'The Sweet Tooth', icon: Heart, gradient: 'from-pink-500 to-rose-500', text: 'text-pink-50', desc: 'Coffee? You mean dessert in a cup. You love the sweeter side of life!' };
        if (strong > 70) return { name: 'The Purist', icon: Coffee, gradient: 'from-stone-800 to-stone-950', text: 'text-stone-50', desc: 'No sugar, no milk, no nonsense. You respect the bean in its purest form.' };
        if (Math.abs(sweet - strong) < 20) return { name: 'The Balanced Brewer', icon: Star, gradient: 'from-amber-500 to-orange-600', text: 'text-amber-50', desc: 'Harmony is your middle name. You appreciate a perfect blend of flavors.' };
        return { name: 'The Explorer', icon: Zap, gradient: 'from-violet-600 to-indigo-600', text: 'text-violet-50', desc: 'You like to mix it up! Your palate is always on an adventure.' };
    }, [flavorStats]);

    // 4. Favorite Drink
    const favoriteDrinkName = "Spanish Latte";
    const favoriteProduct = products.find(p => p.name === favoriteDrinkName);
    const favoriteDrinkImage = favoriteProduct?.imageUrl || "https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";

    return (
        <div className="flex min-h-screen flex-col bg-stone-50">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-r from-primary-600 to-primary-800 text-white mb-4 shadow-lg shadow-primary-600/30"
                    >
                        <TrendingUp className="w-6 h-6" />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-3">Your Coffee DNA</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        We've analyzed your brewing habits. Here's what your coffee choices say about you.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">

                    {/* 1. Archetype Card (Hero) - Spans full width on mobile, 8 cols on desktop */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={`lg:col-span-8 relative overflow-hidden rounded-3xl bg-gradient-to-br ${archetype.gradient} p-8 md:p-12 text-white shadow-xl`}
                    >
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-black opacity-10 rounded-full blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="p-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
                                <archetype.icon className="w-16 h-16 text-white" />
                            </div>
                            <div className="text-center md:text-left flex-1">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-2 opacity-90">
                                    <span className="text-xs font-bold uppercase tracking-[0.2em]">Archetype</span>
                                    <div className="h-px w-8 bg-white/50"></div>
                                </div>
                                <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">{archetype.name}</h2>
                                <p className="text-lg md:text-xl opacity-90 leading-relaxed">{archetype.desc}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* 2. Quick Stats - Spans 4 cols */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-4 grid grid-rows-2 gap-6"
                    >
                        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 flex flex-col justify-center items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                                <Award className="w-6 h-6" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900">Top 5%</div>
                            <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Customer Rank</div>
                        </div>
                        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 flex flex-col justify-center items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900">24</div>
                            <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Orders this Month</div>
                        </div>
                    </motion.div>

                    {/* 3. Flavor Profile Bars (Custom CSS Chart) */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-5 bg-white rounded-3xl shadow-lg p-8 border border-gray-100"
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Star className="w-5 h-5 text-primary-500" /> Flavor Footprint
                        </h3>
                        <div className="space-y-6">
                            {flavorStats.map((stat, index) => (
                                <div key={stat.label}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                                            <stat.icon className="w-4 h-4 text-gray-400" />
                                            {stat.label}
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{stat.value}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stat.value}%` }}
                                            transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                                            className={`h-full rounded-full ${stat.color}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-center text-gray-400 mt-6">Based on your last 20 orders</p>
                    </motion.div>

                    {/* 4. Caffeine Intake (Custom CSS Bar Chart) */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-7 bg-white rounded-3xl shadow-lg p-8 border border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" /> Caffeine Intake
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" /> Last 7 Days
                            </div>
                        </div>

                        <div className="flex items-end justify-between h-48 gap-2 sm:gap-4">
                            {caffeineData.map((data, index) => (
                                <div key={index} className="flex flex-col items-center gap-2 flex-1 group">
                                    <div className="relative w-full max-w-[40px] h-full flex items-end bg-gray-50 rounded-t-lg overflow-hidden">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${data.height}%` }}
                                            transition={{ duration: 0.8, delay: 0.4 + (index * 0.1) }}
                                            className={`w-full rounded-t-lg transition-colors duration-300 ${data.caffeine > 100 ? 'bg-gradient-to-t from-red-500 to-red-400' : 'bg-gradient-to-t from-amber-400 to-yellow-300'
                                                } group-hover:opacity-90`}
                                        />
                                        {/* Tooltip on hover */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                            {data.caffeine}mg
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500">{data.day}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <span>Moderate</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <span>High Energy</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* 5. Favorite Drink Spotlight */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-12 relative overflow-hidden rounded-3xl bg-stone-900 text-white shadow-xl"
                    >
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-20"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/90 to-transparent"></div>

                        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
                            <div className="relative">
                                <div className="absolute inset-0 bg-amber-500 blur-3xl opacity-20 rounded-full"></div>
                                <img
                                    src={favoriteDrinkImage}
                                    alt="Favorite Drink"
                                    className="relative w-48 h-48 object-cover rounded-full border-4 border-stone-800 shadow-2xl"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"; // Fallback image
                                    }}
                                />
                                <div className="absolute -bottom-4 -right-4 bg-amber-500 text-stone-900 font-bold py-2 px-4 rounded-full shadow-lg border-4 border-stone-900">
                                    #1 Pick
                                </div>
                            </div>

                            <div className="text-center md:text-left flex-1">
                                <h3 className="text-amber-500 font-bold uppercase tracking-wider text-sm mb-2">Your All-Time Favorite</h3>
                                <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">{favoriteDrinkName}</h2>
                                <p className="text-stone-300 text-lg max-w-xl leading-relaxed mb-8">
                                    You've ordered this <span className="text-white font-bold">12 times</span> this month! It seems you really love the creamy texture and sweet finish.
                                </p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <Button className="bg-amber-500 hover:bg-amber-600 text-stone-900 border-none">
                                        Order Again
                                    </Button>
                                    <Button variant="outline" className="border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white">
                                        <Share2 className="w-4 h-4 mr-2" /> Share Profile
                                    </Button>
                                </div>
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
