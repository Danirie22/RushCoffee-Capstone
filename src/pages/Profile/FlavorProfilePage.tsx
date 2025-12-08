import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coffee, Zap, Heart, Star, Award, TrendingUp, Share2, Clock, Calendar, ArrowRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { useProduct } from '../../context/ProductContext';
import { useOrder } from '../../context/OrderContext';
import Button from '../../components/ui/Button';

// ----------------------------------------------------------------------
// 1. FLAVOR DATABASE (AI KNOWLEDGE)
// ----------------------------------------------------------------------
// Base stats for each drink (0-100 scale)
const FLAVOR_MAP: Record<string, { sweetness: number; strength: number; caffeine: number; bitterness: number }> = {
    // Coffee Based
    'Spanish Latte': { sweetness: 80, strength: 50, caffeine: 75, bitterness: 30 },
    'Rush Coffee Blend': { sweetness: 40, strength: 70, caffeine: 100, bitterness: 60 },
    'Caramel Chocolate Mocha': { sweetness: 90, strength: 40, caffeine: 60, bitterness: 20 },
    'Dark Chocolate Mocha': { sweetness: 70, strength: 60, caffeine: 70, bitterness: 50 },
    'Mocha Latte': { sweetness: 75, strength: 50, caffeine: 75, bitterness: 40 },
    'Americano': { sweetness: 0, strength: 90, caffeine: 150, bitterness: 80 },
    'Biscoff Latte': { sweetness: 95, strength: 40, caffeine: 60, bitterness: 10 },
    'Reeses Latte': { sweetness: 95, strength: 40, caffeine: 60, bitterness: 10 },
    'Brown Sugar Latte': { sweetness: 85, strength: 50, caffeine: 75, bitterness: 30 },
    'Iced Latte': { sweetness: 30, strength: 60, caffeine: 75, bitterness: 50 },
    'Orange Latte': { sweetness: 60, strength: 50, caffeine: 75, bitterness: 40 },
    'Coffee Jelly': { sweetness: 70, strength: 40, caffeine: 60, bitterness: 30 },

    // Non-Coffee
    'Red Velvet': { sweetness: 90, strength: 0, caffeine: 0, bitterness: 0 },
    'Red Velvet Matcha Latte': { sweetness: 85, strength: 30, caffeine: 40, bitterness: 20 },
    'Milky Choco': { sweetness: 85, strength: 0, caffeine: 5, bitterness: 10 },
    'Strawberry Milk': { sweetness: 80, strength: 0, caffeine: 0, bitterness: 0 },
    'Biscoff Milky': { sweetness: 95, strength: 0, caffeine: 0, bitterness: 0 },
    'Oreo Latte': { sweetness: 90, strength: 0, caffeine: 5, bitterness: 10 }, // Assuming non-coffee based on context, or low caffeine

    // Matcha
    'Matcha Latte': { sweetness: 50, strength: 60, caffeine: 70, bitterness: 40 },
    'Strawberry Matcha': { sweetness: 70, strength: 50, caffeine: 60, bitterness: 30 },
    'Matcha Cream Cheese': { sweetness: 60, strength: 55, caffeine: 70, bitterness: 35 },
    'Matcha Oreo': { sweetness: 80, strength: 40, caffeine: 60, bitterness: 20 },

    // Refreshments (High sugar, no caffeine/strength usually)
    'Flamangooverload Shake': { sweetness: 95, strength: 0, caffeine: 0, bitterness: 0 },
    'Mangoberry Shake': { sweetness: 90, strength: 0, caffeine: 0, bitterness: 0 },
    'Mango Caramel Shake': { sweetness: 95, strength: 0, caffeine: 0, bitterness: 0 },
    'Blueberry Shake': { sweetness: 85, strength: 0, caffeine: 0, bitterness: 0 },
    'Strawberry Shake': { sweetness: 85, strength: 0, caffeine: 0, bitterness: 0 },
    'Green Apple Shake': { sweetness: 80, strength: 0, caffeine: 0, bitterness: 10 },
    'Blueberry Soda Pop': { sweetness: 75, strength: 0, caffeine: 0, bitterness: 0 },
    'Strawberry Soda Pop': { sweetness: 75, strength: 0, caffeine: 0, bitterness: 0 },
    'Green Apple Soda Pop': { sweetness: 70, strength: 0, caffeine: 0, bitterness: 0 },
    'Lemon Soda Pop': { sweetness: 60, strength: 0, caffeine: 0, bitterness: 10 },
    'Lychee Soda Pop': { sweetness: 80, strength: 0, caffeine: 0, bitterness: 0 },
    'Mango Soda Pop': { sweetness: 80, strength: 0, caffeine: 0, bitterness: 0 },

    // Fallback for unknown
    'Default': { sweetness: 50, strength: 50, caffeine: 50, bitterness: 20 }
};


const FlavorProfilePage: React.FC = () => {
    const { currentUser } = useAuth();
    const { products } = useProduct();
    const { orderHistory, isHistoryLoading } = useOrder();

    // ----------------------------------------------------------------------
    // 2. DATA PROCESSING ENGINE
    // ----------------------------------------------------------------------
    const { flavorStats, caffeineData, archetype, favoriteDrinkId } = useMemo(() => {
        // 1. Filter valid drink orders
        const validItems: any[] = [];

        // Create a normalized map for case-insensitive lookup
        const NORMALIZED_FLAVOR_MAP = Object.keys(FLAVOR_MAP).reduce((acc, key) => {
            acc[key.toLowerCase()] = FLAVOR_MAP[key];
            return acc;
        }, {} as Record<string, typeof FLAVOR_MAP['Default']>);

        orderHistory.forEach(order => {
            if (order.status === 'cancelled') return;

            order.orderItems.forEach(item => {
                // Determine if it's a drink (exclude Meals category)
                // specific check for meal category or if name contains specific keywords
                const isMeal = item.category?.toLowerCase() === 'meals' ||
                    ['breaded', 'rice', 'fries', 'meal'].some(k => item.productName.toLowerCase().includes(k));

                if (!isMeal) {
                    const normalizedName = item.productName.toLowerCase();
                    let baseStats = NORMALIZED_FLAVOR_MAP[normalizedName];

                    // Fallback to Default if not found, but try to infer from category if possible
                    if (!baseStats) {
                        // Simple heuristic fallback based on likely category keywords in name
                        if (normalizedName.includes('coffee') || normalizedName.includes('latte') || normalizedName.includes('americano')) {
                            baseStats = { sweetness: 50, strength: 60, caffeine: 70, bitterness: 40 };
                        } else if (normalizedName.includes('matcha')) {
                            baseStats = { sweetness: 60, strength: 50, caffeine: 60, bitterness: 30 };
                        } else if (normalizedName.includes('shake') || normalizedName.includes('soda')) {
                            baseStats = { sweetness: 90, strength: 0, caffeine: 0, bitterness: 0 };
                        } else {
                            baseStats = FLAVOR_MAP['Default'];
                        }
                    }

                    // Apply modifiers
                    let sweetness = baseStats.sweetness;
                    if (item.customizations?.sugarLevel) {
                        const level = parseInt(item.customizations.sugarLevel);
                        if (!isNaN(level)) {
                            // 100% is baseline. 120% = 1.2x. 0% = 0.
                            sweetness = baseStats.sweetness * (level / 100);
                        }
                    }

                    validItems.push({
                        ...item,
                        date: order.timestamp,
                        stats: {
                            sweetness,
                            strength: baseStats.strength,
                            caffeine: baseStats.caffeine,
                            bitterness: baseStats.bitterness
                        }
                    });
                }
            });
        });

        // 2. Empty State Check
        if (validItems.length < 1) {
            return { flavorStats: [], caffeineData: [], archetype: null, favoriteDrinkId: null };
        }

        // 3. Calculate Average Stats
        const total = validItems.length;
        const avgSweetness = validItems.reduce((acc, i) => acc + i.stats.sweetness, 0) / total;
        const avgStrength = validItems.reduce((acc, i) => acc + i.stats.strength, 0) / total;
        const avgCaffeine = validItems.reduce((acc, i) => acc + i.stats.caffeine, 0) / total;
        const avgBitterness = validItems.reduce((acc, i) => acc + i.stats.bitterness, 0) / total;

        // Creaminess is often inverse of strength/bitterness + high sweetness
        const avgCreaminess = Math.min(100, (avgSweetness * 0.5) + ((100 - avgBitterness) * 0.5));

        const derivedStats = [
            { label: 'Sweetness', value: Math.round(avgSweetness), color: 'bg-pink-500', icon: Heart },
            { label: 'Strength', value: Math.round(avgStrength), color: 'bg-stone-800', icon: Zap },
            { label: 'Creaminess', value: Math.round(avgCreaminess), color: 'bg-amber-400', icon: Star },
            { label: 'Bitterness', value: Math.round(avgBitterness), color: 'bg-stone-600', icon: Coffee },
        ];

        // 4. Calculate Caffeine History (Last 7 Days)
        const last7Days: Record<string, number> = {};
        // Init last 7 days keys
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('en-US', { weekday: 'short' });
            last7Days[key] = 0;
        }

        validItems.forEach(item => {
            const dayKey = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' });
            if (last7Days[dayKey] !== undefined) {
                last7Days[dayKey] += item.stats.caffeine;
            }
        });

        const derivedCaffeine = Object.entries(last7Days).map(([day, caf]) => ({
            day,
            caffeine: caf,
            height: Math.min(100, (caf / 300) * 100) // 300mg as arbitrary max for graph
        }));

        // 5. Determine Archetype
        let derivedArchetype;
        if (avgSweetness > 75) derivedArchetype = { name: 'The Sweet Tooth', icon: Heart, gradient: 'from-pink-500 to-rose-500', text: 'text-pink-50', desc: 'Coffee? You mean dessert in a cup. You love the sweeter side of life!' };
        else if (avgStrength > 70) derivedArchetype = { name: 'The Purist', icon: Coffee, gradient: 'from-stone-800 to-stone-950', text: 'text-stone-50', desc: 'No sugar, no milk, no nonsense. You respect the bean in its purest form.' };
        else if (avgCaffeine > 100) derivedArchetype = { name: 'The Power User', icon: Zap, gradient: 'from-orange-600 to-red-600', text: 'text-orange-50', desc: 'You run on high octane. Caffeine is your primary food group.' };
        else if (Math.abs(avgSweetness - avgStrength) < 20) derivedArchetype = { name: 'The Balanced Brewer', icon: Star, gradient: 'from-amber-500 to-orange-600', text: 'text-amber-50', desc: 'Harmony is your middle name. You appreciate a perfect blend of flavors.' };
        else derivedArchetype = { name: 'The Explorer', icon: Zap, gradient: 'from-violet-600 to-indigo-600', text: 'text-violet-50', desc: 'You like to mix it up! Your palate is always on an adventure.' };

        // 6. Find Favorite Drink
        const counts: Record<string, { count: number, id: string }> = {};
        validItems.forEach(item => {
            if (!counts[item.productId]) counts[item.productId] = { count: 0, id: item.productId };
            counts[item.productId].count++;
        });

        let favId = null;
        let maxCount = 0;
        Object.values(counts).forEach(c => {
            if (c.count > maxCount) {
                maxCount = c.count;
                favId = c.id;
            }
        });

        return { flavorStats: derivedStats, caffeineData: derivedCaffeine, archetype: derivedArchetype, favoriteDrinkId: favId };

    }, [orderHistory]);


    // Loading State
    if (isHistoryLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-stone-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // ----------------------------------------------------------------------
    // 3. EMPTY STATE (Not Enough Data)
    // ----------------------------------------------------------------------
    if (!archetype || !favoriteDrinkId) {
        return (
            <div className="flex min-h-screen flex-col bg-stone-50">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-6 bg-white rounded-3xl shadow-xl border border-gray-100 mb-8 max-w-md"
                    >
                        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Coffee className="w-10 h-10 text-stone-400" />
                        </div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 mb-3">Your Journey Begins</h1>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            We're still learning about your taste buds! Order a few more drinks to unlock your personalized Coffee DNA, archetype, and stats.
                        </p>
                        <Link to="/menu">
                            <Button className="w-full justify-center py-4 text-base">
                                Start Ordering <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </motion.div>
                </main>
                <Footer />
            </div>
        );
    }

    const favoriteProduct = products.find(p => p.id === favoriteDrinkId) || products[0];

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
                        Based on your order history, we've analyzed your unique taste profile.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">

                    {/* 1. Archetype Card */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={`lg:col-span-8 relative overflow-hidden rounded-3xl bg-gradient-to-br ${archetype.gradient} p-8 md:p-12 text-white shadow-xl transform transition-transform hover:scale-[1.01] duration-500`}
                    >
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-black opacity-10 rounded-full blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="p-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
                                <archetype.icon className="w-16 h-16 text-white" />
                            </div>
                            <div className="text-center md:text-left flex-1">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-2 opacity-90">
                                    <span className="text-xs font-bold uppercase tracking-[0.2em]">Your Archetype</span>
                                    <div className="h-px w-8 bg-white/50"></div>
                                </div>
                                <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">{archetype.name}</h2>
                                <p className="text-lg md:text-xl opacity-90 leading-relaxed">{archetype.desc}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* 2. Quick Stats */}
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
                            <div className="text-3xl font-bold text-gray-900">
                                {currentUser?.tier === 'gold' ? 'Top 5%' : currentUser?.tier === 'silver' ? 'Top 20%' : 'Rising Star'}
                            </div>
                            <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Customer Rank</div>
                        </div>
                        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 flex flex-col justify-center items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900">{orderHistory.length}</div>
                            <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Lifetime Orders</div>
                        </div>
                    </motion.div>

                    {/* 3. Flavor Profile Bars - GENERIC REUSABLE COMPONENT */}
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
                        <p className="text-xs text-center text-gray-400 mt-6">Based on your recent drinking habits</p>
                    </motion.div>

                    {/* 4. Caffeine Intake Chart */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-7 bg-white rounded-3xl shadow-lg p-8 border border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" /> Caffeine Monitor
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
                                            className={`w-full rounded-t-lg transition-colors duration-300 ${data.caffeine > 150 ? 'bg-gradient-to-t from-red-500 to-red-400' : 'bg-gradient-to-t from-amber-400 to-yellow-300'
                                                } group-hover:opacity-90`}
                                        />
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
                                    src={favoriteProduct?.imageUrl || "https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"}
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
                                <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">{favoriteProduct?.name}</h2>
                                <p className="text-stone-300 text-lg max-w-xl leading-relaxed mb-8">
                                    It seems you can't get enough of this! The {favoriteProduct?.name} fits your {archetype.name} profile perfectly.
                                </p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <Link to={`/menu`}>
                                        <Button className="bg-amber-500 hover:bg-amber-600 text-stone-900 border-none">
                                            Order Again
                                        </Button>
                                    </Link>
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
