import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Share2, CheckCircle } from 'lucide-react';
import PlinkoGame, { PlinkoPrize } from './PlinkoGame';
import Confetti from 'react-confetti';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebaseConfig';
import firebase from 'firebase/compat/app';

interface PlinkoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PlinkoModal: React.FC<PlinkoModalProps> = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const [prize, setPrize] = useState<PlinkoPrize | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [canDrop, setCanDrop] = useState(true);
    const [loading, setLoading] = useState(true);
    const [isDropping, setIsDropping] = useState(false);

    useEffect(() => {
        if (isOpen && currentUser) {
            checkDropAvailability();
        }
    }, [isOpen, currentUser]);

    const checkDropAvailability = async () => {
        if (!currentUser) return;

        setLoading(true);
        try {
            // TESTING MODE: Daily limit disabled
            // Uncomment below for production
            /*
            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            const userData = userDoc.data();
            
            const lastDropDate = userData?.lastDropDate?.toDate();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (lastDropDate) {
              const lastDrop = new Date(lastDropDate);
              lastDrop.setHours(0, 0, 0, 0);
              
              if (lastDrop.getTime() >= today.getTime()) {
                setCanDrop(false);
              } else {
                setCanDrop(true);
              }
            } else {
              setCanDrop(true);
            }
            */

            // For testing: always allow drops
            setCanDrop(true);
        } catch (error) {
            console.error('Error checking drop availability:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDrop = () => {
        if (!canDrop || isDropping) return;
        setIsDropping(true);
    };

    const handlePrizeWon = async (wonPrize: PlinkoPrize) => {
        setPrize(wonPrize);
        setIsDropping(false);

        // Show confetti for good wins (25% or better)
        if (wonPrize.value >= 25) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }

        // Save to database and update statistics
        if (currentUser) {
            try {
                const userRef = db.collection('users').doc(currentUser.uid);
                const userDoc = await userRef.get();
                const userData = userDoc.data();

                // Track game statistics
                const plinkoStats = userData?.plinkoStats || {
                    totalPlays: 0,
                    totalDiscountWon: 0,
                    biggestWin: 0,
                    lastWinValue: 0
                };

                await userRef.update({
                    lastDropDate: firebase.firestore.FieldValue.serverTimestamp(),
                    activeDiscount: {
                        type: wonPrize.type,
                        value: wonPrize.value,
                        label: wonPrize.label,
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    },
                    plinkoStats: {
                        totalPlays: plinkoStats.totalPlays + 1,
                        totalDiscountWon: plinkoStats.totalDiscountWon + wonPrize.value,
                        biggestWin: Math.max(plinkoStats.biggestWin, wonPrize.value),
                        lastWinValue: wonPrize.value,
                        lastWinDate: firebase.firestore.FieldValue.serverTimestamp()
                    }
                });

                // TESTING MODE: Don't block further drops
                // setCanDrop(false);
            } catch (error) {
                console.error('Error saving drop result:', error);
            }
        }
    };

    const handleShare = () => {
        if (prize && navigator.share) {
            navigator.share({
                title: 'I just won at Rush Coffee Plinko!',
                text: `🎯 I just won ${prize.label} at Rush Coffee! Drop your ball today!`,
                url: window.location.origin,
            }).catch(() => {
                navigator.clipboard.writeText(`🎯 I just won ${prize.label} at Rush Coffee!`);
            });
        }
    };

    const resetAndClose = () => {
        setPrize(null);
        setShowConfetti(false);
        setIsDropping(false);
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
                        className="bg-white rounded-3xl max-w-3xl w-full p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        {/* Close Button */}
                        <button
                            onClick={resetAndClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full mb-4">
                                <Gift className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
                                {prize ? 'Congratulations! 🎉' : 'Coffee Plinko'}
                            </h2>
                            <p className="text-gray-600">
                                {loading ? 'Checking availability...' :
                                    !canDrop ? 'Come back tomorrow for another drop!' :
                                        prize ? `You won ${prize.label}!` :
                                            'Drop the ball and win prizes!'}
                            </p>
                        </div>

                        {/* Content */}
                        {!loading && (
                            <>
                                {!prize && canDrop && (
                                    <div className="space-y-6">
                                        <PlinkoGame onPrizeWon={handlePrizeWon} isDropping={isDropping} />

                                        <button
                                            onClick={handleDrop}
                                            disabled={isDropping}
                                            className={`w-full max-w-md mx-auto block px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg ${isDropping
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:scale-105'
                                                }`}
                                        >
                                            {isDropping ? 'DROPPING...' : 'DROP BALL!'}
                                        </button>
                                    </div>
                                )}

                                {!prize && !canDrop && (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <p className="text-lg font-semibold text-gray-700 mb-2">
                                            You've already played today!
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Check your active discount in the cart or come back tomorrow for another chance.
                                        </p>
                                    </div>
                                )}

                                {prize && (
                                    <div className="text-center">
                                        <div className="mb-6 p-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200">
                                            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
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
                                                className="flex-1 px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-full font-bold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Share2 className="w-5 h-5" />
                                                Share
                                            </button>
                                            <button
                                                onClick={resetAndClose}
                                                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-colors"
                                            >
                                                Start Shopping
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Game Info */}
                        {!prize && (
                            <div className="text-center mt-6 space-y-1">
                                <p className="text-xs text-gray-500 font-medium">
                                    🎮 TESTING MODE: Unlimited drops enabled
                                </p>
                                <p className="text-xs text-gray-400">
                                    Weighted probability • Prizes expire after 24 hours • Stats tracking enabled
                                </p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PlinkoModal;
