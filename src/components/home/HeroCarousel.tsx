import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Define the carousel items manually based on the public/carousel folder contents
const carouselItems = [
    {
        id: 'c-1',
        name: 'Spanish Latte',
        imagePath: '/carousel/carousel-spanish-latte.png',
    },
    {
        id: 'c-2',
        name: 'Rush Coffee Blend',
        imagePath: '/carousel/carousel-rush-coffee-blend.png',
    },
    {
        id: 'c-3',
        name: 'Biscoff Milky',
        imagePath: '/carousel/carousel-biscoff-milky.png',
    },
    {
        id: 'c-4',
        name: 'Caramel Choco',
        imagePath: '/carousel/carousel-caramel-choco.png',
    },
    {
        id: 'c-5',
        name: 'Matcha Latte',
        imagePath: '/carousel/carousel-matcha-latte.png',
    },
    {
        id: 'c-6',
        name: 'Breaded Chicken',
        imagePath: '/carousel/carousel-breaded-chicken.png',
    },
    {
        id: 'c-7',
        name: 'Flamango Overload',
        imagePath: '/carousel/carousel-flamangooverload.png',
    },
];

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '20%' : '-20%',
        opacity: 0,
        scale: 0.9,
        zIndex: 0
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? '20%' : '-20%',
        opacity: 0,
        scale: 0.9
    })
};

const HeroCarousel = () => {
    // Helper to get correct URL
    const getImageUrl = (path: string) => {
        return `${import.meta.env.BASE_URL}${path.startsWith('/') ? path.slice(1) : path}`;
    };

    const [[page, direction], setPage] = React.useState([0, 0]);

    // Calculate absolute index to handle wrapping comfortably
    const imageIndex = Math.abs(page % carouselItems.length);
    const currentItem = carouselItems[imageIndex];

    const paginate = (newDirection: number) => {
        setPage([page + newDirection, newDirection]);
    };

    // Auto-rotate
    React.useEffect(() => {
        const timer = setInterval(() => {
            paginate(1);
        }, 3500);
        return () => clearInterval(timer);
    }, [page]);

    return (
        <div className="relative w-full max-w-lg mx-auto aspect-square group">
            <div className="relative h-full w-full flex items-center justify-center">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                        key={page}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 25 },
                            opacity: { duration: 0.1 },
                            scale: { duration: 0.2 }
                        }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center cursor-grab active:cursor-grabbing"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = Math.abs(offset.x) * velocity.x;
                            if (swipe < -10000) {
                                paginate(1);
                            } else if (swipe > 10000) {
                                paginate(-1);
                            }
                        }}
                    >
                        <div className="relative mx-auto h-96 w-96 md:h-[450px] md:w-[450px] drop-shadow-2xl">
                            <img
                                src={getImageUrl(currentItem.imagePath)}
                                alt={currentItem.name}
                                draggable="false"
                                className="h-full w-full object-contain drop-shadow-2xl transition-transform duration-500 scale-[1.35]"
                            />
                        </div>

                        <div className="mt-12 text-gray-800 inline-block relative z-20">
                            <h3 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2 drop-shadow-sm tracking-tight">
                                {currentItem.name}
                            </h3>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                <button
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-1 text-gray-400/50 hover:text-primary-800 transition-all hover:scale-125 hidden lg:block"
                    onClick={() => paginate(-1)}
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-10 h-10" />
                </button>
                <button
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-1 text-gray-400/50 hover:text-primary-800 transition-all hover:scale-125 hidden lg:block"
                    onClick={() => paginate(1)}
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-10 h-10" />
                </button>

                {/* Progress Indicators */}
                <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 gap-3 z-20">
                    {carouselItems.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                const direction = idx > imageIndex ? 1 : -1;
                                setPage([page + (idx - imageIndex), direction]);
                            }}
                            className={`transition-all rounded-full shadow-sm ${idx === imageIndex
                                ? 'w-8 h-2.5 bg-primary-600'
                                : 'w-2.5 h-2.5 bg-gray-300 hover:bg-primary-400'
                                }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeroCarousel;
