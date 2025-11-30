import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface Prize {
    id: string;
    label: string;
    value: number; // For discounts: 5, 10, 20, 50, 100
    type: 'discount' | 'freebie';
    color: string;
    probability: number; // 0-100
}

const prizes: Prize[] = [
    { id: '1', label: '5% OFF', value: 5, type: 'discount', color: '#FEF3C7', probability: 40 },
    { id: '2', label: '10% OFF', value: 10, type: 'discount', color: '#FDE68A', probability: 25 },
    { id: '3', label: 'FREE SHOT', value: 0, type: 'freebie', color: '#FCD34D', probability: 15 },
    { id: '4', label: '20% OFF', value: 20, type: 'discount', color: '#FBBF24', probability: 10 },
    { id: '5', label: '50% OFF', value: 50, type: 'discount', color: '#F59E0B', probability: 7 },
    { id: '6', label: 'SIZE UP!', value: 0, type: 'freebie', color: '#D97706', probability: 2.5 },
    { id: '7', label: '100% OFF', value: 100, type: 'discount', color: '#B45309', probability: 0.5 },
];

interface SpinWheelProps {
    onSpinComplete: (prize: Prize) => void;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ onSpinComplete }) => {
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);

    const selectPrize = (): Prize => {
        const random = Math.random() * 100;
        let cumulative = 0;

        for (const prize of prizes) {
            cumulative += prize.probability;
            if (random <= cumulative) {
                return prize;
            }
        }

        return prizes[0]; // Fallback
    };

    const handleSpin = () => {
        if (isSpinning) return;

        setIsSpinning(true);
        const selectedPrize = selectPrize();
        const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id);

        // Calculate target rotation
        const segmentAngle = 360 / prizes.length;
        const targetAngle = prizeIndex * segmentAngle;
        const spins = 5; // Number of full rotations
        const finalRotation = 360 * spins + (360 - targetAngle) + (segmentAngle / 2);

        setRotation(rotation + finalRotation);

        // Complete after animation
        setTimeout(() => {
            setIsSpinning(false);
            onSpinComplete(selectedPrize);
        }, 4000);
    };

    const segmentAngle = 360 / prizes.length;

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Wheel Container */}
            <div className="relative w-80 h-80">
                {/* Pointer */}
                <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-20">
                    <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-600 drop-shadow-lg"></div>
                </div>

                {/* Wheel */}
                <motion.div
                    className="w-full h-full rounded-full relative overflow-hidden shadow-2xl border-8 border-white"
                    animate={{ rotate: rotation }}
                    transition={{ duration: 4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    {prizes.map((prize, index) => {
                        const startAngle = index * segmentAngle;
                        const endAngle = startAngle + segmentAngle;

                        return (
                            <div
                                key={prize.id}
                                className="absolute w-full h-full"
                                style={{
                                    transform: `rotate(${startAngle}deg)`,
                                    transformOrigin: 'center',
                                }}
                            >
                                <div
                                    className="absolute w-full h-1/2 origin-bottom flex items-start justify-center pt-4"
                                    style={{
                                        background: prize.color,
                                        clipPath: `polygon(50% 0%, ${50 - Math.tan((segmentAngle / 2) * Math.PI / 180) * 50}% 100%, ${50 + Math.tan((segmentAngle / 2) * Math.PI / 180) * 50}% 100%)`,
                                    }}
                                >
                                    <span className="text-xs font-bold text-gray-800 transform rotate-180">
                                        {prize.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Center Circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg border-4 border-primary-600 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary-600">RUSH</span>
                    </div>
                </motion.div>
            </div>

            {/* Spin Button */}
            <button
                onClick={handleSpin}
                disabled={isSpinning}
                className={`px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg ${isSpinning
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white hover:scale-105'
                    }`}
            >
                {isSpinning ? 'SPINNING...' : 'SPIN NOW!'}
            </button>
        </div>
    );
};

export default SpinWheel;
