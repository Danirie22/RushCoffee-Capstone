
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Gift, Loader2, Check, ClipboardCopy, AlertCircle } from 'lucide-react';
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
            // MOCK DATA FOR TESTING
            const rewardsList = mockAvailableRewards.map((reward, index) => ({
                ...reward,
                id: `mock-reward-${index}`
            }));
            setAvailableRewards(rewardsList);
            setIsLoading(false);
            return; // Skip firestore logic

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
            setIsLoading(false);
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
    
    if (!currentUser) {
        return (
             <div className="flex min-h-screen flex-col bg-gray-50">
                <Header />
                <main className="flex flex-1 items-center justify-center px-6 py-20 text-center">
                    <div>
                        <Gift className="mx-auto h-24 w-24 text-gray-300 opacity-50" />
                        <h1 className="mt-4 font-display text-2xl font-bold text-coffee-900">
                            Join Our Rewards Program
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Log in or create an account to start earning points and get free coffee!
                        </p>
                        <div className="mt-8 flex justify-center gap-4">
                            <Link to="/auth/login" className="rounded-full bg-primary-600 px-8 py-3 font-semibold text-white transition-transform hover:scale-105">
                                Login
                            </Link>
                             <Link to="/auth/register" className="rounded-full border-2 border-primary-600 px-8 py-3 font-semibold text-primary-600 transition-transform hover:scale-105 hover:bg-primary-50">
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
                <section className="bg-gradient-to-r from-primary-50 to-coffee-50 px-6 py-12">
                    <div className="container mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-3">
                            <div className="md:col-span-2">
                                <h1 className="font-display text-4xl font-bold text-coffee-900 md:text-5xl">
                                    Welcome, {currentUser.firstName}!
                                </h1>
                                <p className="mt-2 text-lg text-gray-600">
                                    You're doing great! Keep earning points for amazing rewards.
                                </p>
                            </div>
                            <div className="flex justify-center md:justify-end">
                                <RewardsTierBadge 
                                    tier={currentUser.tier}
                                    currentPoints={currentUser.currentPoints}
                                    nextTierPoints={nextTierPoints}
                                />
                            </div>
                        </div>
                    </div>
                </section>
                
                <section className="px-6 py-16">
                    <div className="container mx-auto max-w-7xl">
                        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="font-display text-3xl font-bold text-coffee-900">Redeem Your Points</h2>
                                <p className="mt-1 text-gray-600">Use your points to claim these exciting rewards.</p>
                            </div>
                            <div className="rounded-full bg-white px-4 py-2 text-lg font-semibold text-primary-600 shadow-md">
                                Your Points: <span className="font-bold">{currentUser.currentPoints}</span>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                            </div>
                        ) : availableRewards.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                            <Card className="py-20 text-center">
                                <Gift className="mx-auto h-16 w-16 text-gray-300"/>
                                <h3 className="mt-4 font-semibold text-gray-800">No Rewards Available</h3>
                                <p className="mt-1 text-gray-500">Please check back later for new rewards.</p>
                            </Card>
                        )}
                    </div>
                </section>

                <section className="bg-white px-6 py-16">
                    <div className="container mx-auto max-w-4xl">
                        <RewardsHistory history={currentUser.rewardsHistory} />
                    </div>
                </section>
            </main>
            <Footer />
            
            <Modal isOpen={isRedeemModalOpen} onClose={closeRedeemModal} title={redeemCode ? 'Reward Claimed!' : `Redeem: ${selectedReward?.name || ''}`}>
                {!redeemCode ? (
                    <>
                        <p className="text-center text-gray-600">
                            Are you sure you want to spend <span className="font-bold text-primary-600">{selectedReward?.pointsCost} points</span> to redeem this reward?
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="ghost" onClick={closeRedeemModal}>Cancel</Button>
                            <Button onClick={handleRedeem} disabled={isRedeeming}>
                                {isRedeeming ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4" />}
                                Confirm
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <Check className="h-8 w-8 text-green-600"/>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">Success!</h3>
                        <p className="mt-1 text-gray-600">Show this code at the counter to claim your reward:</p>
                        
                        <div className="relative my-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4">
                            <p className="font-mono text-2xl font-bold text-primary-700 tracking-widest">{redeemCode}</p>
                            <button onClick={handleCopyCode} className="absolute top-2 right-2 text-gray-400 hover:text-primary-600">
                                <ClipboardCopy className="h-5 w-5"/>
                            </button>
                        </div>

                        <div className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                            <AlertCircle className="h-5 w-5 flex-shrink-0"/>
                            <span>This code is for one-time use only.</span>
                        </div>
                        
                        <div className="mt-6">
                            <Button onClick={closeRedeemModal}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>

        </div>
    );
};

export default RewardsPage;