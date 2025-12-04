import * as React from 'react';
import { Link } from 'react-router-dom';
import { Gift, Loader2, Check, ClipboardCopy, AlertCircle, Sparkles, Lock } from 'lucide-react';
// FIX: Use compat import for v8 syntax.
import firebase from 'firebase/compat/app';
import { db } from '../../firebaseConfig';

import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import RewardsTierBadge from '../../components/rewards/RewardsTierBadge';
import RewardCard from '../../components/rewards/RewardCard';
import RewardsHistory from '../../components/rewards/RewardsHistory';

import ProductCardSkeleton from '../../components/menu/ProductCardSkeleton';
import { tierThresholds, AvailableReward } from '../../data/mockRewards';
import { mockAvailableRewards } from '../../data/mockAvailableRewards';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const RewardsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { showToast } = useCart();

    const [availableRewards, setAvailableRewards] = React.useState<AvailableReward[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isRedeemModalOpen, setIsRedeemModalOpen] = React.useState(false);
    const [selectedReward, setSelectedReward] = React.useState<AvailableReward | null>(null);
    const [isRedeeming, setIsRedeeming] = React.useState(false);
    const [redeemCode, setRedeemCode] = React.useState('');

    React.useEffect(() => {
        const seedAndFetchRewards = async () => {
            setIsLoading(true);

            try {
                const rewardsCollectionRef = db.collection('rewards');
                const snapshot = await rewardsCollectionRef.get();

                if (snapshot.empty) {
                    console.log("Seeding available rewards...");
                    const promises = mockAvailableRewards.map(reward => rewardsCollectionRef.add(reward));
                    await Promise.all(promises);
                }

                const q = rewardsCollectionRef.orderBy('displayOrder');
                const rewardsSnapshot = await q.get();
                const rewardsListFromDb = rewardsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as AvailableReward[];

                setAvailableRewards(rewardsListFromDb);
            } catch (error) {
                console.error("Error fetching rewards:", error);
                // Fallback to mock data if fetch fails
                const rewardsList = mockAvailableRewards.map((reward, index) => ({
                    ...reward,
                    id: `mock-reward-${index}`
                }));
                setAvailableRewards(rewardsList);
            } finally {
                setIsLoading(false);
            }
        };
        seedAndFetchRewards();
    }, []);

    const nextTier = currentUser?.tier === 'bronze' ? 'silver' : (currentUser?.tier === 'silver' ? 'gold' : null);
    const nextTierPoints = nextTier ? tierThresholds[nextTier]?.min || 0 : 0;

    const openRedeemModal = (reward: AvailableReward) => {
        setSelectedReward(reward);
        setIsRedeemModalOpen(true);
    };

    const handleRedeem = async () => {
        if (!currentUser || !selectedReward) return;

        setIsRedeeming(true);
        try {
            if (currentUser.currentPoints < selectedReward.pointsCost) {
                throw new Error("You don't have enough points.");
            }

            const userDocRef = db.collection('users').doc(currentUser.uid);
            const redemptionHistory = {
                id: `rh-${Date.now()}`,
                type: 'redeemed' as const,
                points: -selectedReward.pointsCost,
                description: `Redeemed: ${selectedReward.name}`,
                date: new Date(),
            };

            await userDocRef.update({
                currentPoints: firebase.firestore.FieldValue.increment(-selectedReward.pointsCost),
                rewardsHistory: firebase.firestore.FieldValue.arrayUnion(redemptionHistory)
            });

            setRedeemCode(`RC-REDEEM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);

        } catch (error: any) {
            showToast(error.message || 'Failed to redeem reward.');
            setIsRedeeming(false);
        }
    };

    const handleCopyCode = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(redeemCode);
            showToast('Code copied to clipboard!');
        }
    };

    const closeRedeemModal = () => {
        setIsRedeemModalOpen(false);
        setSelectedReward(null);
        setIsRedeeming(false);
        setRedeemCode('');
    };

    const scrollToRewards = () => {
        const rewardsSection = document.getElementById('rewards-section');
        rewardsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (!currentUser) {
        return (
            <div className="flex min-h-screen flex-col bg-gray-50">
                <Header />
                <main className="flex flex-1 items-center justify-center px-6 py-20 text-center">
                    <div className="max-w-md">
                        <Gift className="mx-auto h-24 w-24 text-gray-300 opacity-50" />
                        <h1 className="mt-6 font-display text-3xl font-bold text-primary-900">
                            Join Our Rewards Program
                        </h1>
                        <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                            Log in or create an account to start earning points and get free coffee!
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/auth/login" className="rounded-full bg-primary-600 px-8 py-3.5 font-semibold text-white transition-all hover:scale-105 hover:bg-primary-700 shadow-lg hover:shadow-xl">
                                Login
                            </Link>
                            <Link to="/auth/register" className="rounded-full border-2 border-primary-600 px-8 py-3.5 font-semibold text-primary-600 transition-all hover:scale-105 hover:bg-primary-50 shadow-md hover:shadow-lg">
                                Sign Up
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
                {/* Polished Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 px-4 py-16 text-white shadow-2xl sm:px-6 sm:py-20 lg:py-28">
                    {/* Background Textures & Effects */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary-500 blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-primary-500 blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-primary-600/10 blur-2xl"></div>

                    <div className="container relative mx-auto max-w-7xl animate-fade-in-up">
                        <div className="grid grid-cols-1 items-center gap-12 md:gap-16 lg:grid-cols-2">
                            {/* Left Column - Points Info */}
                            <div className="z-10 space-y-6 text-center lg:text-left">
                                {/* Badge */}
                                <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-white/15 to-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md ring-1 ring-white/20 shadow-lg transition-all hover:shadow-xl hover:scale-105 lg:justify-start">
                                    <Sparkles className="mr-2 h-4 w-4 text-primary-200" />
                                    <span className="bg-gradient-to-r from-white to-primary-100 bg-clip-text text-transparent">
                                        Loyalty Points
                                    </span>
                                </div>

                                {/* Rewards Heading */}
                                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                                    <span className="bg-gradient-to-r from-white via-primary-100 to-white bg-clip-text text-transparent">
                                        Rewards
                                    </span>
                                </h1>

                                {/* Balance Card */}
                                <div className="inline-flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                                    <button
                                        onClick={scrollToRewards}
                                        className="w-full text-left outline-none focus:ring-2 focus:ring-primary-400/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-2xl transition-all"
                                    >
                                        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700/80 to-primary-800/60 p-px transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-900/50 cursor-pointer backdrop-blur-sm">
                                            <div className="relative rounded-2xl bg-gradient-to-br from-primary-800/90 to-primary-900/90 backdrop-blur-md px-6 py-5 border border-primary-600/30">
                                                <div className="flex items-center gap-4">
                                                    {/* Icon */}
                                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/90 to-primary-600/90 shadow-md group-hover:scale-110 transition-transform">
                                                        <Gift className="h-6 w-6 text-white" />
                                                    </div>
                                                    {/* Content */}
                                                    <div className="flex-1">
                                                        <div className="flex items-baseline gap-1.5 mb-0.5">
                                                            <span className="text-sm font-semibold text-primary-200/80 uppercase tracking-wider">Balance</span>
                                                        </div>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-4xl font-black text-white tracking-tight">
                                                                {currentUser.currentPoints}
                                                            </span>
                                                            <span className="text-base font-bold text-primary-300">pts</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Subtle shine effect */}
                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-primary-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                {/* Supporting Text */}
                                <p className="text-primary-100 text-base sm:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
                                    Earn points with every purchase and unlock exclusive rewards!
                                </p>
                            </div>

                            {/* Right Column - Tier Badge */}
                            <div className="flex justify-center lg:justify-end">
                                <div className="relative group">
                                    {/* Glow Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity duration-500 rounded-full"></div>

                                    {/* Badge Container */}
                                    <div className="relative transform transition-all hover:scale-105 duration-500">
                                        <RewardsTierBadge
                                            tier={currentUser.tier}
                                            currentPoints={currentUser.currentPoints}
                                            nextTierPoints={nextTierPoints}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Enhanced Redeem Section */}
                <section id="rewards-section" className="px-4 py-12 sm:px-6 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
                    <div className="container mx-auto max-w-7xl">
                        {/* Enhanced Header */}
                        <div className="mb-10 sm:mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 mb-3">
                                    <div className="h-1 w-12 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full"></div>
                                    <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Rewards</span>
                                </div>
                                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-900 mb-3">
                                    Redeem Your Points
                                </h2>
                                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                                    Use your points to claim these exciting rewards and enjoy exclusive perks.
                                </p>
                            </div>
                            {/* Modern Points Badge */}
                            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 p-0.5 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]">
                                <div className="relative rounded-2xl bg-white px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200">
                                            <Gift className="h-6 w-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Balance</p>
                                            <div className="flex items-baseline gap-1.5">
                                                <p className="text-3xl font-black text-primary-600">{currentUser.currentPoints}</p>
                                                <span className="text-sm font-semibold text-gray-400">pts</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-primary-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                </div>
                            </div>
                        </div>

                        {/* Rewards Grid */}
                        {isLoading ? (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                                {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                            </div>
                        ) : availableRewards.length > 0 ? (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                                {availableRewards.map(reward => (
                                    <RewardCard
                                        key={reward.id}
                                        reward={reward}
                                        currentPoints={currentUser.currentPoints}
                                        onRedeem={() => openRedeemModal(reward)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Card className="py-20 sm:py-24 text-center transition-all hover:shadow-lg">
                                <Gift className="mx-auto h-20 w-20 text-gray-300" />
                                <h3 className="mt-6 text-xl font-semibold text-gray-800">No Rewards Available</h3>
                                <p className="mt-2 text-gray-500 max-w-sm mx-auto">Please check back later for new rewards and exclusive offers.</p>
                            </Card>
                        )}
                    </div>
                </section>

                {/* Enhanced History Section */}
                <section className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:py-20 border-t border-gray-100">
                    <div className="container mx-auto max-w-5xl">
                        <RewardsHistory history={currentUser.rewardsHistory} />
                    </div>
                </section>
            </main>
            <Footer />

            {/* Enhanced Modal */}
            <Modal isOpen={isRedeemModalOpen} onClose={closeRedeemModal} title={redeemCode ? '🎉 Reward Claimed!' : (selectedReward && currentUser && currentUser.currentPoints < selectedReward.pointsCost ? 'Keep Earning!' : `Redeem: ${selectedReward?.name || ''}`)}>
                {!redeemCode ? (
                    selectedReward && currentUser && currentUser.currentPoints < selectedReward.pointsCost ? (
                        <div className="text-center py-4">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 mb-4">
                                <Lock className="h-8 w-8 text-yellow-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Not Enough Points</h3>
                            <p className="text-gray-600 mb-6 max-w-xs mx-auto">
                                You need <span className="font-bold text-primary-600">{selectedReward.pointsCost - currentUser.currentPoints} more points</span> to redeem this reward.
                            </p>
                            <Button onClick={closeRedeemModal} className="w-full sm:w-auto min-w-[120px]">
                                Got it
                            </Button>
                        </div>
                    ) : (
                        <>
                            <p className="text-center text-gray-600 text-lg leading-relaxed">
                                Are you sure you want to spend <span className="font-bold text-primary-600 text-xl">{selectedReward?.pointsCost} points</span> to redeem this reward?
                            </p>
                            <div className="mt-8 flex justify-end gap-3">
                                <Button variant="ghost" onClick={closeRedeemModal}>Cancel</Button>
                                <Button onClick={handleRedeem} disabled={isRedeeming}>
                                    {isRedeeming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                    Confirm
                                </Button>
                            </div>
                        </>
                    )
                ) : (
                    <div className="text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200 shadow-lg">
                            <Check className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="mt-6 text-2xl font-semibold text-gray-900">Success!</h3>
                        <p className="mt-2 text-gray-600 leading-relaxed">Show this code at the counter to claim your reward:</p>

                        <div className="relative my-6 rounded-2xl border-2 border-dashed border-primary-300 bg-gradient-to-br from-primary-50 to-primary-100 p-6 shadow-inner">
                            <p className="font-mono text-3xl font-bold text-primary-700 tracking-widest">{redeemCode}</p>
                            <button
                                onClick={handleCopyCode}
                                className="absolute top-3 right-3 text-gray-400 hover:text-primary-600 transition-all hover:scale-110 p-2 rounded-lg hover:bg-white/50"
                                aria-label="Copy code"
                            >
                                <ClipboardCopy className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800 border border-yellow-200">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <span className="font-medium">This code is for one-time use only.</span>
                        </div>

                        <div className="mt-6">
                            <Button onClick={closeRedeemModal} className="w-full sm:w-auto">Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default RewardsPage;