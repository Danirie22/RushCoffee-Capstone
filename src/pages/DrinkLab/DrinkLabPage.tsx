import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Beaker, Coffee, Droplets, Snowflake, Flame, Star, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useCart } from '../../context/CartContext';
import { Product } from '../../data/mockProducts';

const DrinkLabPage: React.FC = () => {
    const { addToCart } = useCart();

    // Lab State
    const [base, setBase] = useState<'coffee' | 'matcha' | 'chocolate'>('coffee');
    const [strength, setStrength] = useState(50); // 0-100
    const [sweetness, setSweetness] = useState(50); // 0-100
    const [creaminess, setCreaminess] = useState(50); // 0-100
    const [ice, setIce] = useState(50); // 0-100

    // Scores
    const [balanceScore, setBalanceScore] = useState(0);
    const [sweetnessScore, setSweetnessScore] = useState(0);
    const [isBaristaApproved, setIsBaristaApproved] = useState(false);
    const [feedback, setFeedback] = useState('');

    // Calculate scores on change
    useEffect(() => {
        // Sweetness Score (1-5)
        const sweetScore = Math.ceil((sweetness / 100) * 5);
        setSweetnessScore(sweetScore);

        // Balance Score Logic
        // Ideal ratio: Strength should roughly equal (Sweetness + Creaminess) / 2
        const richness = (sweetness + creaminess) / 2;
        const diff = Math.abs(strength - richness);
        // Map diff (0-100) to score (5-1). Smaller diff is better.
        // If diff is 0, score 5. If diff is 50, score 2.5.
        let bal = 5 - (diff / 20);
        if (bal < 1) bal = 1;
        setBalanceScore(parseFloat(bal.toFixed(1)));

        // Barista Approval
        // Rules: 
        // 1. Balance > 3.5
        // 2. Not 100% Sweetness with 0% Strength (Sugar milk)
        // 3. Not 100% Strength with 0% Creaminess/Sweetness (unless you like pain)
        let approved = false;
        let msg = "";

        if (bal > 3.8) {
            approved = true;
            msg = "Perfectly balanced! A masterpiece.";
        } else if (strength > 80 && sweetness < 20 && creaminess < 20) {
            approved = true;
            msg = "Bold and intense. For the purists.";
        } else if (sweetness > 80 && strength < 30) {
            approved = false;
            msg = "Whoa! That's a sugar rush waiting to happen.";
        } else if (ice > 90 && strength < 20) {
            approved = false;
            msg = "That's mostly flavored water!";
        } else {
            approved = bal > 3.0;
            msg = approved ? "A solid choice." : "Might be a bit experimental...";
        }

        setIsBaristaApproved(approved);
        setFeedback(msg);

    }, [strength, sweetness, creaminess, ice]);

    const handleAddToCart = () => {
        // Create a custom product object
        // Note: In a real app, this would need backend support for custom recipes.
        // For now, we map it to a generic "Lab Creation" product or similar.
        // We'll mock a product here just to make the button work visually.
        const customProduct: Product = {
            id: `lab-${Date.now()}`,
            name: `My Custom ${base.charAt(0).toUpperCase() + base.slice(1)}`,
            description: `Lab Creation: Strength ${strength}%, Sweetness ${sweetness}%, Creaminess ${creaminess}%`,
            category: 'Custom',
            image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=2574&auto=format&fit=crop',
            sizes: [
                { name: 'Regular', price: 180, calories: 250 }
            ],
            customizationOptions: []
        };

        addToCart(customProduct, customProduct.sizes[0]);
        // Ideally show a toast here
    };

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
                        <Beaker className="w-8 h-8" />
                    </motion.div>
                    <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Drink Lab</h1>
                    <p className="text-gray-600">Mix, match, and create your perfect cup.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    {/* Controls Section */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Flame className="text-orange-500" />
                            Mix Ingredients
                        </h2>

                        {/* Base Selection */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Choose Base</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['coffee', 'matcha', 'chocolate'].map((b) => (
                                    <button
                                        key={b}
                                        onClick={() => setBase(b as any)}
                                        className={`py-3 px-4 rounded-xl border-2 transition-all font-medium capitalize ${base === b
                                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                : 'border-gray-200 hover:border-primary-200 text-gray-600'
                                            }`}
                                    >
                                        {b}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sliders */}
                        <div className="space-y-8">
                            {/* Strength */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="flex items-center gap-2 font-medium text-gray-700">
                                        <Coffee className="w-4 h-4" /> Strength
                                    </label>
                                    <span className="text-primary-600 font-bold">{strength}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={strength}
                                    onChange={(e) => setStrength(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                />
                            </div>

                            {/* Sweetness */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="flex items-center gap-2 font-medium text-gray-700">
                                        <Droplets className="w-4 h-4" /> Sweetness
                                    </label>
                                    <span className="text-primary-600 font-bold">{sweetness}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={sweetness}
                                    onChange={(e) => setSweetness(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                            </div>

                            {/* Creaminess */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="flex items-center gap-2 font-medium text-gray-700">
                                        <div className="w-4 h-4 rounded-full border-2 border-gray-400" /> Creaminess
                                    </label>
                                    <span className="text-primary-600 font-bold">{creaminess}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={creaminess}
                                    onChange={(e) => setCreaminess(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                                />
                            </div>

                            {/* Ice */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="flex items-center gap-2 font-medium text-gray-700">
                                        <Snowflake className="w-4 h-4" /> Ice Level
                                    </label>
                                    <span className="text-primary-600 font-bold">{ice}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={ice}
                                    onChange={(e) => setIce(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {/* Score Card */}
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Star className="w-32 h-32" />
                            </div>

                            <h2 className="text-2xl font-bold mb-6">Lab Results</h2>

                            <div className="space-y-6">
                                {/* Balance Score */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-gray-600 font-medium">Flavor Balance</span>
                                        <span className="text-2xl font-bold text-primary-700">{balanceScore}/5</span>
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-primary-400 to-primary-600"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(balanceScore / 5) * 100}%` }}
                                            transition={{ type: "spring", stiffness: 50 }}
                                        />
                                    </div>
                                </div>

                                {/* Sweetness Score */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-gray-600 font-medium">Sweetness Level</span>
                                        <span className="text-2xl font-bold text-pink-600">{sweetnessScore}/5</span>
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-pink-300 to-pink-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(sweetnessScore / 5) * 100}%` }}
                                            transition={{ type: "spring", stiffness: 50 }}
                                        />
                                    </div>
                                </div>

                                {/* Barista Verdict */}
                                <div className={`mt-8 p-4 rounded-xl border-l-4 ${isBaristaApproved ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'}`}>
                                    <div className="flex items-start gap-3">
                                        {isBaristaApproved ? (
                                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                                        )}
                                        <div>
                                            <h3 className={`font-bold ${isBaristaApproved ? 'text-green-800' : 'text-yellow-800'}`}>
                                                {isBaristaApproved ? 'Barista Approved' : 'Experimental Mix'}
                                            </h3>
                                            <p className={`text-sm mt-1 ${isBaristaApproved ? 'text-green-700' : 'text-yellow-700'}`}>
                                                {feedback}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAddToCart}
                                className="w-full mt-8 bg-gray-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                            >
                                <Beaker className="w-5 h-5" />
                                Brew & Add to Cart
                            </motion.button>
                        </div>

                        {/* Visual Preview (Abstract) */}
                        <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 flex items-center justify-center min-h-[200px]">
                            <div className="relative w-32 h-40 bg-gray-100 rounded-b-3xl rounded-t-lg border-4 border-gray-200 overflow-hidden">
                                {/* Liquid Layers */}
                                <motion.div
                                    className="absolute bottom-0 w-full bg-amber-900"
                                    animate={{ height: `${strength}%` }}
                                    style={{ opacity: 0.8 }}
                                />
                                <motion.div
                                    className="absolute bottom-0 w-full bg-amber-100"
                                    animate={{ height: `${(creaminess / 2) + (strength / 2)}%` }} // Mix visual
                                    style={{ opacity: 0.5, mixBlendMode: 'overlay' }}
                                />
                                <motion.div
                                    className="absolute bottom-0 w-full bg-blue-200"
                                    animate={{ height: `${ice}%` }}
                                    style={{ opacity: 0.3, zIndex: 10 }}
                                />
                            </div>
                            <div className="ml-6 text-sm text-gray-500">
                                <p>Visual Preview</p>
                                <p className="text-xs mt-1">(Representation only)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default DrinkLabPage;
