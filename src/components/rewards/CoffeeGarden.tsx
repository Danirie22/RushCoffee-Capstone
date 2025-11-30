import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, Flower, Leaf, Sun, Cloud } from 'lucide-react';

interface CoffeeGardenProps {
    points: number;
}

const CoffeeGarden: React.FC<CoffeeGardenProps> = ({ points }) => {
    // Determine growth stage based on points
    // 0-100: Seed/Sprout
    // 100-300: Sapling
    // 300-600: Bush
    // 600+: Flowering/Harvest

    const getStage = (pts: number) => {
        if (pts < 100) return 'sprout';
        if (pts < 300) return 'sapling';
        if (pts < 600) return 'bush';
        return 'harvest';
    };

    const stage = getStage(points);

    return (
        <div className="relative w-full h-64 bg-gradient-to-b from-sky-200 to-sky-50 rounded-3xl overflow-hidden shadow-inner border-4 border-white">
            {/* Background Elements */}
            <motion.div
                animate={{ x: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="absolute top-4 right-8 text-yellow-400"
            >
                <Sun className="w-12 h-12 fill-current" />
            </motion.div>

            <motion.div
                animate={{ x: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                className="absolute top-8 left-8 text-white opacity-80"
            >
                <Cloud className="w-16 h-16 fill-current" />
            </motion.div>

            {/* Ground */}
            <div className="absolute bottom-0 w-full h-16 bg-[#5D4037] flex items-center justify-center">
                <div className="w-full h-2 bg-[#795548] absolute top-0"></div>
            </div>

            {/* Plant Container */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center">

                {/* Stage: Sprout */}
                {stage === 'sprout' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-500"
                    >
                        <Sprout className="w-12 h-12" />
                    </motion.div>
                )}

                {/* Stage: Sapling */}
                {stage === 'sapling' && (
                    <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-green-600 flex flex-col items-center"
                    >
                        <div className="flex gap-2">
                            <Leaf className="w-8 h-8 -rotate-45" />
                            <Leaf className="w-8 h-8 rotate-45" />
                        </div>
                        <div className="w-2 h-12 bg-green-700 rounded-full"></div>
                    </motion.div>
                )}

                {/* Stage: Bush */}
                {stage === 'bush' && (
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="text-green-700 relative"
                    >
                        <div className="absolute -left-6 top-0"><Leaf className="w-8 h-8 -rotate-12" /></div>
                        <div className="absolute -right-6 top-2"><Leaf className="w-8 h-8 rotate-12" /></div>
                        <div className="absolute left-0 -top-6"><Leaf className="w-10 h-10" /></div>
                        <div className="w-4 h-20 bg-[#4E342E] rounded-full mx-auto mt-4"></div>
                    </motion.div>
                )}

                {/* Stage: Harvest */}
                {stage === 'harvest' && (
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="text-green-800 relative"
                    >
                        {/* Cherries */}
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -left-4 top-2 w-4 h-4 bg-red-500 rounded-full shadow-sm z-10"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                            className="absolute right-2 -top-2 w-4 h-4 bg-red-500 rounded-full shadow-sm z-10"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                            className="absolute left-2 -top-4 w-4 h-4 bg-red-500 rounded-full shadow-sm z-10"
                        />

                        <div className="absolute -left-8 top-0"><Leaf className="w-10 h-10 -rotate-12" /></div>
                        <div className="absolute -right-8 top-2"><Leaf className="w-10 h-10 rotate-12" /></div>
                        <div className="absolute left-0 -top-8"><Leaf className="w-12 h-12" /></div>
                        <div className="w-6 h-24 bg-[#3E2723] rounded-full mx-auto mt-4"></div>
                    </motion.div>
                )}
            </div>

            {/* Tooltip/Status */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-green-800 shadow-sm">
                Stage: {stage.charAt(0).toUpperCase() + stage.slice(1)}
            </div>
        </div>
    );
};

export default CoffeeGarden;
