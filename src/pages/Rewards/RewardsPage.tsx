import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gift, TrendingUp, Star, Coffee, Award, Check, X, QrCode, ClipboardCopy, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import RewardsTierBadge from '../../components/rewards/RewardsTierBadge';
import RewardCard from '../../components/rewards/RewardCard';
import RewardsHistory from '../../components/rewards/RewardsHistory';
import ProductCardSkeleton from '../../components/menu/ProductCardSkeleton'; // Re-using for rewards
import { tierThresholds, AvailableReward, RewardHistory } from '../../data/mockRewards';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import RushCoffeeLogo from '../../components/layout/RushCoffeeLogo';

const tierBenefits = {
  bronze: [
    'Earn 1 point per ₱10 spent',
    'Birthday reward'
  ],
  silver: [
    'Earn 1.5 points per ₱10 spent',
    'Priority queue (coming soon)',
    'Exclusive rewards'
  ],
  gold: [
    'Earn 2 points per ₱10 spent',
    'VIP perks',
    'Early access to new items'
  ],
};

const sortOptions = [
    { value: 'points-asc', label: 'Points: Low to High' },
    { value: 'points-desc', label: 'Points: High to Low' },
];
const filterCategories = ['all', 'drink', 'food', 'discount'];


const RewardsPage: React.FC = () => {
    const { currentUser, redeemReward } = useAuth();
    const [availableRewards, setAvailableRewards] = useState<AvailableReward[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Redeem Flow State
    const [showRedeemModal, setShowRedeemModal] = useState(false);
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [selectedReward, setSelectedReward] = useState<AvailableReward | null>(null);
    const [redemptionCode, setRedemptionCode] = useState('');

    // Filtering & Sorting State
    const [rewardFilter, setRewardFilter] = useState('all');
    const [rewardSort, setRewardSort] = useState('points-asc');

    // UI State
    const [isHowToEarnCollapsed, setIsHowToEarnCollapsed] = useState(true);

    const { showToast } = useCart();

    useEffect(() => {
        const fetchRewards = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const rewardsCollection = collection(db, 'rewards');
                const q = query(rewardsCollection, orderBy('displayOrder', 'asc'));
                const querySnapshot = await getDocs(q);
                const rewardsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as AvailableReward[];
                setAvailableRewards(rewardsList);
            } catch (err) {
                console.error("Error fetching rewards:", err);
                setError("Could not load available rewards. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchRewards();
    }, []);
    
    const nextTier = currentUser ? (currentUser.tier === 'bronze' ? 'silver' : currentUser.tier === 'silver' ? 'gold' : null) : null;
    const nextTierPoints = nextTier ? tierThresholds[nextTier].min : 0;

    const filteredAndSortedRewards = useMemo(() => {
        let filtered = rewardFilter === 'all' 
            ? availableRewards 
            : availableRewards.filter(r => r.category === rewardFilter);
        
        return filtered.sort((a, b) => {
            if (rewardSort === 'points-asc') return a.pointsCost - b.pointsCost;
            return b.pointsCost - a.pointsCost;
        });
    }, [availableRewards, rewardFilter, rewardSort]);


    // Redemption Logic
    const handleRedeemClick = (rewardId: string) => {
        const reward = availableRewards.find(r => r.id === rewardId);
        if (reward) {
            setSelectedReward(reward);
            setShowRedeemModal(true);
        }
    };

    const handleConfirmRedeem = async () => {
        if (!selectedReward || !redeemReward) return;

        await redeemReward(selectedReward);
        
        setShowRedeemModal(false);
        showToast('Reward redeemed successfully!');

        const code = `RUSH-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        setRedemptionCode(code);
        setShowCodeModal(true);
    };
    
    const handleCloseCodeModal = () => {
        setShowCodeModal(false);
        setSelectedReward(null);
        setRedemptionCode('');
    };
    
    if (!currentUser) {
        return (
            <div className="flex min-h-screen flex-col bg-gray-50">
                <Header />
                <main className="flex flex-1 items-center justify-center px-6 py-20 text-center">
                    <div>
                        <RushCoffeeLogo className="mx-auto h-24 w-24 text-gray-300 opacity-50" />
                        <h1 className="mt-4 font-display text-2xl font-bold text-coffee-900">
                            View Your Rewards
                        </h1>
                        <p className="mt-2 text-gray-600">
                           Please log in to see your points and redeem exclusive rewards.
                        </p>
                        <div className="mt-8 flex justify-center gap-4">
                            <Link to="/auth/login" className="rounded-full bg-primary-600 px-8 py-3 font-semibold text-white transition-transform hover:scale-105">
                                Login
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-primary-50 to-coffee-50 px-6 py-12">
                    <div className="container mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <Card className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-coffee-800 p-8 text-white md:col-span-2">
                                <Coffee className="absolute -top-8 -right-8 h-40 w-40 text-white/10 transform rotate-12" />
                                <Star className="absolute bottom-10 left-10 h-20 w-20 animate-pulse-slow text-white/10" />
                                <div className="relative z-10">
                                    <p className="font-semibold text-primary-100">Your Points Balance</p>
                                    <h1 className="mt-2 font-display text-7xl font-bold tracking-tight text-white">
                                        {currentUser.currentPoints.toLocaleString()}
                                    </h1>
                                    <p className="mt-2 text-primary-200">
                                        Lifetime Points: {currentUser.lifetimePoints.toLocaleString()}
                                    </p>
                                </div>
                            </Card>
                            <Card className="p-0">
                                <RewardsTierBadge 
                                    tier={currentUser.tier}
                                    currentPoints={currentUser.currentPoints}
                                    nextTierPoints={nextTierPoints}
                                />
                            </Card>
                        </div>
                        <Card className="mt-6">
                            <h3 className="font-display text-xl font-bold capitalize text-coffee-900">{currentUser.tier} Tier Benefits</h3>
                            <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                {tierBenefits[currentUser.tier].map(benefit => (
                                    <li key={benefit} className="flex items-center gap-2 text-gray-700">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                                            <Check className="h-3 w-3 text-green-600" />
                                        </div>
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                </section>

                {/* Available Rewards Section */}
                <section className="px-6 py-12">
                    <div className="container mx-auto max-w-7xl">
                        <div className="text-center">
                            <h2 className="font-display text-3xl font-bold text-coffee-900">Redeem Your Points</h2>
                            <p className="mt-2 text-gray-600">Choose from our exclusive rewards</p>
                        </div>

                        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-lg border bg-white p-4 md:flex-row">
                            <div className="flex gap-2 rounded-full bg-gray-100 p-1">
                                {filterCategories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setRewardFilter(cat)}
                                        className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize transition-colors ${rewardFilter === cat ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:bg-primary-50'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="sort" className="text-sm font-medium text-gray-700">Sort by:</label>
                                <select 
                                    id="sort"
                                    value={rewardSort}
                                    onChange={e => setRewardSort(e.target.value)}
                                    className="rounded-full border-gray-300 py-1.5 pl-3 pr-8 text-sm focus:border-primary-500 focus:ring-primary-500"
                                >
                                    {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 py-20 text-center text-red-700 md:col-span-3">
                                    <AlertCircle className="h-16 w-16" />
                                    <h3 className="mt-4 text-xl font-semibold">Oops! Something went wrong.</h3>
                                    <p className="mt-2">{error}</p>
                                </div>
                            ) : filteredAndSortedRewards.length > 0 ? (
                                filteredAndSortedRewards.map(reward => (
                                    <RewardCard 
                                        key={reward.id}
                                        reward={reward}
                                        currentPoints={currentUser.currentPoints}
                                        onRedeem={handleRedeemClick}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center md:col-span-2 lg:col-span-3">
                                    <Coffee className="h-16 w-16 text-gray-300" />
                                    <p className="text-lg font-semibold text-gray-700">No rewards available</p>
                                    <p className="text-sm text-gray-500">No rewards match your current filter. Check back soon!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                
                {/* How to Earn Section (Collapsible) */}
                <section className="px-6 py-4">
                    <div className="container mx-auto max-w-7xl">
                        <Card>
                            <button
                                className="flex w-full items-center justify-between text-left"
                                onClick={() => setIsHowToEarnCollapsed(!isHowToEarnCollapsed)}
                                aria-expanded={!isHowToEarnCollapsed}
                            >
                                <h2 className="font-display text-2xl font-bold text-coffee-900">How to Earn Points</h2>
                                <TrendingUp className={`h-6 w-6 text-primary-600 transition-transform ${!isHowToEarnCollapsed ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                            {!isHowToEarnCollapsed && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                    animate={{ height: 'auto', opacity: 1, marginTop: '1rem' }}
                                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="grid grid-cols-1 gap-4 text-gray-700 md:grid-cols-3">
                                    <p>Earn points with every purchase made through the app.</p>
                                    <p>The more you spend, the more you earn, and the faster you'll climb the tiers to unlock even better benefits.</p>
                                    <p>Best of all, your points never expire!</p>
                                    </div>
                                </motion.div>
                            )}
                            </AnimatePresence>
                        </Card>
                    </div>
                </section>

                {/* History Section */}
                <section className="px-6 py-12">
                    <div className="container mx-auto max-w-7xl">
                        <RewardsHistory history={currentUser.rewardsHistory} />
                    </div>
                </section>
            </main>
            
            <Footer />

            {/* Redemption Confirmation Modal */}
            {selectedReward && (
                <Modal
                    isOpen={showRedeemModal}
                    onClose={() => setShowRedeemModal(false)}
                    title="Confirm Redemption"
                    footer={
                        <>
                            <Button variant="ghost" onClick={() => setShowRedeemModal(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleConfirmRedeem}>Confirm</Button>
                        </>
                    }
                >
                    <div className="text-center">
                        <img src={selectedReward.imageUrl} alt={selectedReward.name} className="mb-4 h-40 w-full rounded-lg object-cover"/>
                        <p className="text-gray-600">You are about to redeem:</p>
                        <h4 className="my-1 text-xl font-bold text-coffee-900">{selectedReward.name}</h4>
                        <div className="my-4 space-y-2">
                             <div className="flex justify-between text-gray-700"><p>Current Points:</p> <p className="font-semibold">{currentUser.currentPoints}</p></div>
                             <div className="flex justify-between text-red-600"><p>Points Cost:</p> <p className="font-semibold">-{selectedReward.pointsCost}</p></div>
                             <hr className="my-1 border-dashed"/>
                             <div className="flex justify-between text-lg font-bold text-gray-900"><p>Points After:</p> <p>{currentUser.currentPoints - selectedReward.pointsCost}</p></div>
                        </div>
                        <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                            This action cannot be undone. Please confirm you want to proceed.
                        </div>
                    </div>
                </Modal>
            )}

             {/* Redemption Code Modal */}
            {selectedReward && (
                <Modal
                    isOpen={showCodeModal}
                    onClose={handleCloseCodeModal}
                    title="Redemption Successful!"
                >
                    <div className="text-center">
                        <p className="mb-2 text-gray-600">Show this code to the staff at the counter:</p>
                        
                        <div className="relative my-4 rounded-lg border-2 border-dashed border-primary-400 bg-primary-50 p-4">
                            <p className="font-mono text-4xl font-bold tracking-widest text-primary-700">{redemptionCode}</p>
                             <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(redemptionCode);
                                    showToast('Code copied to clipboard!');
                                }}
                                className="absolute top-2 right-2 rounded-full p-1.5 text-primary-600 transition-colors hover:bg-primary-100"
                                aria-label="Copy redemption code"
                            >
                                <ClipboardCopy className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-lg border bg-white p-2 shadow-inner">
                            <QrCode className="h-full w-full text-coffee-900" />
                        </div>
                        
                        <p className="mt-4 text-xs text-gray-500">Valid for 7 days</p>
                        
                        <Button variant="primary" size="lg" className="mt-6 w-full" onClick={handleCloseCodeModal}>
                            Done
                        </Button>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default RewardsPage;
