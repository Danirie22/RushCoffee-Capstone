import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Share2, CheckCircle } from 'lucide-react';
import SpinWheel, { Prize } from './SpinWheel';
import Confetti from 'react-confetti';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebaseConfig';
import firebase from 'firebase/compat/app';

interface RouletteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RouletteModal: React.FC<RouletteModalProps> = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const [prize, setPrize] = useState<Prize | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [canSpin, setCanSpin] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && currentUser) {
            checkSpinAvailability();
        }
    }, [isOpen, currentUser]);

    const checkSpinAvailability = async () => {
        if (!currentUser) return;

        setLoading(true);
        try {
            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            const userData = userDoc.data();

            const lastSpinDate = userData?.lastSpinDate?.toDate();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (lastSpinDate) {
                const lastSpin = new Date(lastSpinDate);
                lastSpin.setHours(0, 0, 0, 0);

                if (lastSpin.getTime() >= today.getTime()) {
                    setCanSpin(false);
                } else {
                    setCanSpin(true);
                }
            } else {
                setCanSpin(true);
            }
        } catch (error) {
            console.error('Error checking spin availability:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSpinComplete = async (wonPrize: Prize) => {
        setPrize(wonPrize);

        // Show confetti for big wins
        if (wonPrize.value >= 20) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }

        // Save to database
        if (currentUser) {
            try {
                await db.collection('users').doc(currentUser.uid).update({
                    lastSpinDate: firebase.firestore.FieldValue.serverTimestamp(),
                    activeDiscount: {
                        type: wonPrize.type,
                        value: wonPrize.value,
                        label: wonPrize.label,
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                    },
                });
                setCanSpin(false);
            } catch (error) {
                console.error('Error saving spin result:', error);
            }
        }
    };

    const handleShare = () => {
        if (prize && navigator.share) {
            navigator.share({
                title: 'I just won at Rush Coffee Roulette!',
                text: `🎰 I just won ${prize.label} at Rush Coffee! Try your luck today!`,
                url: window.location.origin,
            }).catch(() => {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(`🎰 I just won ${prize.label} at Rush Coffee!`);
            });
        }
    };

    const resetAndClose = () => {
        setPrize(null);
        setShowConfetti(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={resetAndClose}
                >
                    {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl max-w-lg w-full p-8 relative shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={resetAndClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
                                <Gift className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
                                {prize ? 'Congratulations! 🎉' : 'Coffee Roulette'}
                            </h2>
                            <p className="text-gray-600">
                                {loading ? 'Checking availability...' :
                                    !canSpin ? 'Come back tomorrow for another spin!' :
                                        prize ? `You won ${prize.label}!` :
                                            'Spin the wheel for a chance to win!'}
                            </p>
                        </div>

                        {/* Content */}
                        {!loading && (
                            <>
                                {!prize && canSpin && (
                                    <SpinWheel onSpinComplete={handleSpinComplete} />
                                )}

                                {!prize && !canSpin && (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <p className="text-lg font-semibold text-gray-700 mb-2">
                                            You've already spun today!
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Check your active discount in the cart or come back tomorrow for another chance.
                                        </p>
                                    </div>
                                )}

                                {prize && (
                                    <div className="text-center">
                                        <div className="mb-6 p-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200">
                                            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 mb-2">
                                                {prize.label}
                                            </div>
                                            <p className="text-gray-600">
                                                {prize.type === 'discount'
                                                    ? `Applied to your next order! Valid for 24 hours.`
                                                    : `Your free upgrade is ready!`
                                                }
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleShare}
                                                className="flex-1 px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-full font-bold hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Share2 className="w-5 h-5" />
                                                Share
                                            </button>
                                            <button
                                                onClick={resetAndClose}
                                                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-full font-bold hover:bg-primary-700 transition-colors"
                                            >
                                                Start Shopping
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Fine Print */}
                        {!prize && (
                            <p className="text-xs text-gray-400 text-center mt-6">
                                One free spin per day. Prizes expire after 24 hours. Terms apply.
                            </p>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RouletteModal;
