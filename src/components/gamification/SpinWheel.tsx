import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameSounds } from '../../hooks/useGameSounds';

export interface WheelPrize {
    id: string;
    label: string;
    value: number;
    type: 'discount' | 'points' | 'freebie';
    color: string;
    textColor: string;
}

// Premium gradient prizes with modern colors
const prizes: WheelPrize[] = [
    { id: '1', label: '5% OFF', value: 5, type: 'discount', color: '#F97316', textColor: '#FFFFFF' },
    { id: '2', label: '25% OFF', value: 25, type: 'discount', color: '#FBBF24', textColor: '#000000' },
    { id: '3', label: '10% OFF', value: 10, type: 'discount', color: '#FB923C', textColor: '#FFFFFF' },
    { id: '4', label: '50% OFF', value: 50, type: 'discount', color: '#FFD700', textColor: '#000000' },
    { id: '5', label: '15% OFF', value: 15, type: 'discount', color: '#EF4444', textColor: '#FFFFFF' },
    { id: '6', label: 'FREE!', value: 100, type: 'freebie', color: '#10B981', textColor: '#FFFFFF' },
    { id: '7', label: '20% OFF', value: 20, type: 'discount', color: '#F59E0B', textColor: '#FFFFFF' },
    { id: '8', label: '30% OFF', value: 30, type: 'discount', color: '#DC2626', textColor: '#FFFFFF' },
];

// Weighted selection
const getWeightedPrizeIndex = (): number => {
    const weights = [20, 15, 25, 1, 18, 0.5, 12, 7];
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return i;
        }
    }

    return 0;
};

interface SpinWheelProps {
    onSpinComplete: (prize: WheelPrize) => void;
    isSpinning: boolean;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ onSpinComplete, isSpinning }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [rotation, setRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const animationRef = useRef<number>();
    const lastTickRef = useRef<number>(0);
    const { playTick, playSpinStart } = useGameSounds();

    useEffect(() => {
        drawWheel();
    }, [rotation]);

    useEffect(() => {
        if (isSpinning && !spinning) {
            spin();
        }
    }, [isSpinning]);

    const drawWheel = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw outer glow
        ctx.save();
        ctx.shadowColor = 'rgba(251, 146, 60, 0.5)';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.3)';
        ctx.lineWidth = 20;
        ctx.stroke();
        ctx.restore();

        const sliceAngle = (2 * Math.PI) / prizes.length;

        // Draw prize slices
        prizes.forEach((prize, index) => {
            const startAngle = index * sliceAngle + rotation;
            const endAngle = startAngle + sliceAngle;

            // 3D effect - draw shadow
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(centerX + 3, centerY + 3);
            ctx.arc(centerX + 3, centerY + 3, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fill();
            ctx.restore();

            // Draw main slice with gradient
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();

            // Radial gradient for depth
            const gradient = ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, radius
            );
            gradient.addColorStop(0, lightenColor(prize.color, 30));
            gradient.addColorStop(0.7, prize.color);
            gradient.addColorStop(1, darkenColor(prize.color, 20));

            ctx.fillStyle = gradient;
            ctx.fill();

            // Glossy effect
            ctx.save();
            ctx.clip();
            const glossyGradient = ctx.createRadialGradient(
                centerX, centerY - radius * 0.3, 0,
                centerX, centerY - radius * 0.3, radius * 0.8
            );
            glossyGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            glossyGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
            glossyGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = glossyGradient;
            ctx.fill();
            ctx.restore();

            // Border with slight glow
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Text with shadow
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Text shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            ctx.fillStyle = prize.textColor;
            ctx.font = 'bold 24px Inter, sans-serif';
            ctx.fillText(prize.label, radius * 0.7, 0);
            ctx.restore();
        });

        // Draw metallic pegs (pins) between segments
        prizes.forEach((_, index) => {
            const angle = index * sliceAngle + rotation;
            const pegX = centerX + Math.cos(angle) * radius;
            const pegY = centerY + Math.sin(angle) * radius;

            ctx.beginPath();
            ctx.arc(pegX, pegY, 6, 0, 2 * Math.PI);

            // Silver/Metal gradient for 3D look
            const pegGradient = ctx.createRadialGradient(pegX - 2, pegY - 2, 0, pegX, pegY, 6);
            pegGradient.addColorStop(0, '#FFFFFF');
            pegGradient.addColorStop(0.4, '#D1D5DB');
            pegGradient.addColorStop(1, '#4B5563');

            ctx.fillStyle = pegGradient;
            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.shadowBlur = 4;
            ctx.fill();

            ctx.strokeStyle = '#1F2937';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // Center hub with 3D effect
        // Outer ring
        const centerGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 50
        );
        centerGradient.addColorStop(0, '#FFFFFF');
        centerGradient.addColorStop(0.7, '#F3F4F6');
        centerGradient.addColorStop(1, '#D1D5DB');

        ctx.beginPath();
        ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
        ctx.fillStyle = centerGradient;
        ctx.fill();

        // Border
        ctx.strokeStyle = '#F97316';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Inner circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        const innerGradient = ctx.createRadialGradient(
            centerX - 5, centerY - 5, 0,
            centerX, centerY, 20
        );
        innerGradient.addColorStop(0, '#FFA500');
        innerGradient.addColorStop(1, '#FF6B00');
        ctx.fillStyle = innerGradient;
        ctx.fill();

        // Shine effect
        ctx.beginPath();
        ctx.arc(centerX - 5, centerY - 5, 8, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
    };

    const lightenColor = (color: string, amount: number): string => {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.min(255, ((num >> 16) & 0xFF) + amount);
        const g = Math.min(255, ((num >> 8) & 0xFF) + amount);
        const b = Math.min(255, (num & 0xFF) + amount);
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    };

    const darkenColor = (color: string, amount: number): string => {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.max(0, ((num >> 16) & 0xFF) - amount);
        const g = Math.max(0, ((num >> 8) & 0xFF) - amount);
        const b = Math.max(0, (num & 0xFF) - amount);
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    };

    const spin = () => {
        setSpinning(true);
        playSpinStart();

        const winningIndex = getWeightedPrizeIndex();
        const sliceAngle = (2 * Math.PI) / prizes.length;

        // Ensure spins is an INTEGER so we land on the correct segment
        const spins = 5 + Math.floor(Math.random() * 5); // 5 to 9 full spins

        // Calculate target angle:
        // 1. Full rotations (2 * PI * spins)
        // 2. Minus offset to reach winning slice (winningIndex * sliceAngle)
        // 3. Minus half slice to center it (sliceAngle / 2)
        // 4. Minus PI/2 because pointer is at TOP (not right)
        const targetAngle = (2 * Math.PI * spins) - (winningIndex * sliceAngle) - (sliceAngle / 2) - (Math.PI / 2);

        const duration = 5000; // 5 seconds for smoother animation
        const startTime = Date.now();
        const startRotation = rotation;

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Cubic easing for ultra-smooth deceleration
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentRotation = startRotation + (targetAngle - startRotation) * easeOutCubic;

            // Calculate ticks based on rotation
            // 8 segments = PI/4 radians per segment
            const segmentAngle = (Math.PI * 2) / prizes.length;
            const currentTick = Math.floor(currentRotation / segmentAngle);

            if (currentTick > lastTickRef.current) {
                playTick();
                lastTickRef.current = currentTick;
            }

            setRotation(currentRotation);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setSpinning(false);
                setTimeout(() => {
                    onSpinComplete(prizes[winningIndex]);
                }, 300);
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <div className="relative flex items-center justify-center py-4">
            {/* Outer decorative ring */}
            <motion.div
                className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-br from-orange-200/30 via-yellow-200/30 to-red-200/30 blur-2xl"
                animate={spinning ? { scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] } : {}}
                transition={{ duration: 2, repeat: spinning ? Infinity : 0 }}
            />

            {/* Wheel container with glass effect */}
            <motion.div
                className="relative"
                animate={spinning ? {
                    scale: [1, 1.02, 1],
                } : { scale: 1 }}
                transition={{ duration: 0.5, repeat: spinning ? Infinity : 0 }}
            >
                {/* Glass morphism background */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-full -m-8"></div>

                <canvas
                    ref={canvasRef}
                    width={450}
                    height={450}
                    className="relative drop-shadow-2xl"
                />

                {/* Premium pointer at top with glow */}
                <motion.div
                    className="absolute top-[-10px] left-1/2 z-10"
                    style={{ x: "-50%" }}
                    animate={spinning ? { y: [0, 5, 0] } : { y: 0 }}
                    transition={{ duration: 0.3, repeat: spinning ? Infinity : 0 }}
                >
                    <div className="relative">
                        {/* Glow */}
                        <div className="absolute inset-0 blur-md">
                            <div className="w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-t-[50px] border-t-red-500"></div>
                        </div>
                        {/* Actual pointer */}
                        <div className="relative w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-t-[50px] border-t-gradient-to-b from-red-500 to-red-600 drop-shadow-2xl"></div>
                        {/* Shine */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[16px] border-t-white/40"></div>
                    </div>
                </motion.div>

                {/* Spinning indicator glow */}
                {spinning && (
                    <motion.div
                        className="absolute inset-0 rounded-full border-4 border-orange-400/50"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                )}
            </motion.div>
        </div>
    );
};

export default SpinWheel;
export { prizes };
