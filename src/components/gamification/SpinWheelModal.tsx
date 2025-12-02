import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Share2, TrendingUp } from 'lucide-react';
import SpinWheel, { WheelPrize } from './SpinWheel';
import Confetti from 'react-confetti';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebaseConfig';
import firebase from 'firebase/compat/app';
import { useGameSounds } from '../../hooks/useGameSounds';

interface SpinWheelModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SpinWheelModal: React.FC<SpinWheelModalProps> = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const [prize, setPrize] = useState<WheelPrize | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [canSpin, setCanSpin] = useState(true);
    const [spinsLeft, setSpinsLeft] = useState(3);
    const [loading, setLoading] = useState(true);
    const [isSpinning, setIsSpinning] = useState(false);
    const { playWin, playCheer, playConfettiPop } = useGameSounds();

    useEffect(() => {
        if (isOpen && currentUser) {
            checkSpinAvailability();
        }
    }, [isOpen, currentUser]);

    const checkSpinAvailability = async () => {
        if (!currentUser) return;

        setLoading(true);
        try {
            // TESTING MODE: Always allow spins
            setSpinsLeft(3);
            setCanSpin(true);
        } catch (error) {
            console.error('Error checking spin availability:', error);
            setCanSpin(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSpin = () => {
        if (!canSpin || isSpinning || spinsLeft <= 0) return;
        setIsSpinning(true);
        setPrize(null);
    };

    const handleSpinComplete = async (wonPrize: WheelPrize) => {
        setIsSpinning(false);
        setPrize(wonPrize);
        playWin();
        playCheer();
        playConfettiPop();

        // Show confetti for ALL wins! 🎉
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 6000);

        // Save to database
        if (currentUser) {
            try {
                const userRef = db.collection('users').doc(currentUser.uid);
                const userDoc = await userRef.get();
                const userData = userDoc.data();

                const spinStats = userData?.spinStats || {
                    totalSpins: 0,
                    totalWins: 0,
                    totalDiscountWon: 0,
                    biggestWin: 0
                };

                const updates: any = {
                    lastSpinDate: firebase.firestore.FieldValue.serverTimestamp(),
                    spinStats: {
                        totalSpins: spinStats.totalSpins + 1,
                        totalWins: spinStats.totalWins + 1,
                        totalDiscountWon: wonPrize.type === 'discount'
                            ? spinStats.totalDiscountWon + wonPrize.value
                            : spinStats.totalDiscountWon,
                        biggestWin: wonPrize.type === 'discount'
                            ? Math.max(spinStats.biggestWin, wonPrize.value)
                            : spinStats.biggestWin
                    }
                };

                if (wonPrize.type === 'discount') {
                    updates.activeDiscount = {
                        type: 'discount',
                        value: wonPrize.value,
                        label: wonPrize.label,
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                        source: 'wheel'
                    };
                }

                await userRef.update(updates);
            } catch (error) {
                console.error('Error saving spin result:', error);
            }
        }
    };

    const handleShare = () => {
        if (prize && navigator.share) {
            navigator.share({
                title: 'I just won at Rush Coffee Spin Wheel!',
                text: `🎡 I spun the wheel and won ${prize.label}! Try your luck at Rush Coffee!`,
                url: window.location.origin,
            }).catch(() => {
                navigator.clipboard.writeText(`🎡 I just won ${prize.label} at Rush Coffee!`);
            });
        }
    };

    const resetAndClose = () => {
        setPrize(null);
        setShowConfetti(false);
        setIsSpinning(false);
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
                        className="bg-gradient-to-br from-yellow-50 via-white to-orange-50 rounded-3xl max-w-3xl w-full p-4 md:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto border border-orange-200"
                    >
                        {/* Decorative Elements */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-yellow-200/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-orange-200/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

                        {/* Close Button */}
                        <button
                            onClick={resetAndClose}
                            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg text-gray-500 hover:text-gray-700 transition-all hover:scale-110 flex items-center justify-center"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-6 relative">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 via-orange-600 to-red-600 rounded-full mb-4 shadow-xl relative"
                            >
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 blur-md opacity-50"></div>
                                <Zap className="w-10 h-10 text-white relative z-10 drop-shadow-lg" />
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-display font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 via-orange-700 to-red-600 mb-3">
                                {prize ? '🎉 Winner!' : 'Spin the Wheel'}
                            </h2>
                            <p className="text-base md:text-lg text-gray-700 font-medium">
                                {loading ? 'Loading your luck...' :
                                    !canSpin ? '✨ Come back tomorrow!' :
                                        prize ? `You won ${prize.label}!` :
                                            '🎡 Spin for amazing prizes!'}
                            </p>
                        </div>

                        {/* Content */}
                        {!loading && (
                            <>
                                {!prize && canSpin && (
                                    <div className="space-y-6">
                                        {/* Wheel */}
                                        <div className="relative flex justify-center">
                                            <SpinWheel
                                                onSpinComplete={handleSpinComplete}
                                                isSpinning={isSpinning}
                                            />
                                        </div>

                                        {/* Spins Counter */}
                                        <div className="text-center">
                                            <p className="text-sm font-semibold text-gray-600 flex items-center justify-center gap-2">
                                                <TrendingUp className="w-4 h-4" />
                                                Spins Remaining: <span className="text-orange-600 text-lg">{spinsLeft}</span>/3
                                            </p>
                                        </div>

                                        {/* Spin Button */}
                                        <motion.button
                                            onClick={handleSpin}
                                            disabled={isSpinning || !canSpin}
                                            whileHover={!isSpinning && canSpin ? { scale: 1.02 } : {}}
                                            whileTap={!isSpinning && canSpin ? { scale: 0.98 } : {}}
                                            className={`w-full max-w-md mx-auto block px-8 py-5 rounded-2xl font-black text-xl transition-all shadow-2xl relative overflow-hidden ${isSpinning || !canSpin
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-yellow-600 via-orange-700 to-red-600 hover:from-yellow-700 hover:via-orange-800 hover:to-red-700 text-white'
                                                }`}
                                        >
                                            {!isSpinning && canSpin && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12"></div>
                                            )}
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                {isSpinning ? (
                                                    <>
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        >
                                                            🎡
                                                        </motion.div>
                                                        SPINNING...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Zap className="w-6 h-6" />
                                                        SPIN NOW!
                                                    </>
                                                )}
                                            </span>
                                        </motion.button>
                                    </div>
                                )}

                                {/* Prize Display */}
                                {prize && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-center"
                                    >
                                        <div className="mb-8 p-10 bg-gradient-to-br from-yellow-100 via-white to-orange-100 rounded-3xl border-4 border-orange-300 shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-yellow-200/20 via-transparent to-transparent"></div>
                                            <motion.div
                                                initial={{ rotate: -10, scale: 0 }}
                                                animate={{ rotate: 0, scale: 1 }}
                                                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                                className="relative z-10"
                                            >
                                                <div className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-orange-700 to-red-600 mb-4 drop-shadow-lg">
                                                    {prize.label}
                                                </div>
                                                <div className="flex items-center justify-center gap-2 text-lg md:text-xl text-gray-700 font-semibold">
                                                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                                                    Applied to your next order! Valid for 24 hours.
                                                </div>
                                            </motion.div>
                                        </div>

                                        <div className="flex gap-3">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleShare}
                                                className="flex-1 px-6 py-4 border-2 border-orange-600 text-orange-600 rounded-2xl font-bold hover:bg-orange-50 transition-all flex items-center justify-center gap-2 shadow-lg"
                                            >
                                                <Share2 className="w-5 h-5" />
                                                Share
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={resetAndClose}
                                                className="flex-1 px-6 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-2xl font-bold hover:from-yellow-700 hover:to-orange-700 transition-all shadow-xl"
                                            >
                                                Start Shopping
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </>
                        )}

                        {/* Game Info */}
                        {!prize && (
                            <div className="text-center mt-6 space-y-1">
                                <p className="text-xs text-gray-500 font-medium">
                                    🎮 TESTING MODE: Unlimited spins enabled
                                </p>
                                <p className="text-xs text-gray-400">
                                    Weighted probability • All prizes guaranteed • Discounts expire in 24h
                                </p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SpinWheelModal;
