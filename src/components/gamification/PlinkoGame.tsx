import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

export interface PlinkoPrize {
    id: string;
    label: string;
    value: number;
    type: 'discount' | 'freebie';
    color: string;
    weight: number; // Probability weight (higher = more common)
}

// Enhanced prize distribution with weighted probabilities
// Total weight = 100 for easy percentage calculation
const prizes: PlinkoPrize[] = [
    { id: '1', label: '5% OFF', value: 5, type: 'discount', color: '#EF4444', weight: 20 },
    { id: '2', label: '10% OFF', value: 10, type: 'discount', color: '#F97316', weight: 25 },
    { id: '3', label: '15% OFF', value: 15, type: 'discount', color: '#FB923C', weight: 18 },
    { id: '4', label: '25% OFF', value: 25, type: 'discount', color: '#FBBF24', weight: 15 },
    { id: '5', label: 'FREE!', value: 100, type: 'discount', color: '#10B981', weight: 2 }, // Rarest - 2% chance
    { id: '6', label: '25% OFF', value: 25, type: 'discount', color: '#FBBF24', weight: 15 },
    { id: '7', label: '15% OFF', value: 15, type: 'discount', color: '#FB923C', weight: 18 },
    { id: '8', label: '10% OFF', value: 10, type: 'discount', color: '#F97316', weight: 25 },
    { id: '9', label: '5% OFF', value: 5, type: 'discount', color: '#EF4444', weight: 20 },
];

// Helper function to select a prize based on weighted probability
const getWeightedRandomPrize = (): PlinkoPrize => {
    const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
    let random = Math.random() * totalWeight;

    for (const prize of prizes) {
        random -= prize.weight;
        if (random <= 0) {
            return prize;
        }
    }

    return prizes[0]; // Fallback to first prize
};

interface PlinkoGameProps {
    onPrizeWon: (prize: PlinkoPrize) => void;
    isDropping: boolean;
}

const PlinkoGame: React.FC<PlinkoGameProps> = ({ onPrizeWon, isDropping }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const renderRef = useRef<Matter.Render | null>(null);
    const runnerRef = useRef<Matter.Runner | null>(null);
    const ballRef = useRef<Matter.Body | null>(null);
    const [prizeLanded, setPrizeLanded] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 600, height: 500 });

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const maxWidth = Math.min(containerWidth - 32, 600);
                // Reduced height ratio to bring elements up closer
                const height = maxWidth * 0.7;
                setCanvasSize({ width: maxWidth, height });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const { width, height } = canvasSize;

        const engine = Matter.Engine.create({
            gravity: { x: 0, y: 1.2 }
        });
        engineRef.current = engine;

        const render = Matter.Render.create({
            canvas: canvas,
            engine: engine,
            options: {
                width,
                height,
                wireframes: false,
                background: 'transparent'
            }
        });
        renderRef.current = render;

        const walls = [
            Matter.Bodies.rectangle(width / 2, height + 25, width, 50, {
                isStatic: true,
                render: { fillStyle: 'transparent' }
            }),
            Matter.Bodies.rectangle(-25, height / 2, 50, height, {
                isStatic: true,
                render: { fillStyle: 'transparent' }
            }),
            Matter.Bodies.rectangle(width + 25, height / 2, 50, height, {
                isStatic: true,
                render: { fillStyle: 'transparent' }
            })
        ];

        const pegs: Matter.Body[] = [];
        const rows = 10;
        const pegRadius = Math.max(3, width * 0.0067);

        // Adjusted spacing to be tighter and higher up
        const startY = width * 0.2;
        const rowSpacing = width * 0.055;
        const pegSpacing = width * 0.083;

        for (let row = 0; row < rows; row++) {
            const pegsInRow = row + 3;

            for (let col = 0; col < pegsInRow; col++) {
                const totalRowWidth = (pegsInRow - 1) * pegSpacing;
                const startX = (width - totalRowWidth) / 2;
                const x = startX + (col * pegSpacing);
                const y = startY + row * rowSpacing;

                const peg = Matter.Bodies.circle(x, y, pegRadius, {
                    isStatic: true,
                    restitution: 0.8,
                    render: {
                        fillStyle: '#D4AF37'
                    }
                });
                pegs.push(peg);
            }
        }

        const slotWidth = width / prizes.length;
        const slotHeight = height * 0.15; // Taller slots to catch ball better
        const slotY = height - slotHeight / 2;

        const slots = prizes.map((prize, index) => {
            const x = slotWidth * index + slotWidth / 2;
            return Matter.Bodies.rectangle(x, slotY, slotWidth - 4, slotHeight, {
                isStatic: true,
                isSensor: true,
                label: `slot-${index}`,
                render: {
                    fillStyle: prize.color,
                    opacity: 0.8
                }
            });
        });

        Matter.Composite.add(engine.world, [...walls, ...pegs, ...slots]);

        Matter.Events.on(render, 'afterRender', () => {
            const context = render.context;
            const fontSize = Math.max(10, slotWidth * 0.3);
            context.font = `900 ${fontSize}px "Inter", sans-serif`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';

            slots.forEach((slot, index) => {
                const prize = prizes[index];
                const parts = prize.label.split(' ');

                // Add text shadow for better readability
                context.shadowColor = 'rgba(0,0,0,0.3)';
                context.shadowBlur = 4;
                context.shadowOffsetY = 2;
                context.fillStyle = 'white';

                if (parts.length === 2) {
                    context.fillText(parts[0], slot.position.x, slot.position.y - fontSize * 0.5);
                    context.fillText(parts[1], slot.position.x, slot.position.y + fontSize * 0.5);
                } else {
                    context.fillText(prize.label, slot.position.x, slot.position.y);
                }
            });

            // Reset shadow
            context.shadowColor = 'transparent';
            context.shadowBlur = 0;
        });

        const runner = Matter.Runner.create();
        runnerRef.current = runner;
        Matter.Runner.run(runner, engine);
        Matter.Render.run(render);

        Matter.Events.on(engine, 'collisionStart', (event) => {
            event.pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;

                if (ballRef.current && (bodyA === ballRef.current || bodyB === ballRef.current)) {
                    const slot = bodyA.label?.startsWith('slot-') ? bodyA : bodyB;

                    if (slot.label?.startsWith('slot-') && !prizeLanded) {
                        setPrizeLanded(true);

                        // Use weighted probability for fair prize distribution
                        // While the ball lands in a slot, the actual prize is determined by probability
                        const prize = getWeightedRandomPrize();

                        setTimeout(() => {
                            onPrizeWon(prize);
                        }, 800);
                    }
                }
            });
        });

        // Anti-stuck mechanism: Nudge the ball if it stops moving before reaching the bottom
        Matter.Events.on(engine, 'beforeUpdate', () => {
            if (ballRef.current && !prizeLanded) {
                const ball = ballRef.current;
                const velocity = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);

                // If ball is moving very slowly and hasn't reached the slots area
                if (velocity < 0.2 && ball.position.y < height - 100) {
                    Matter.Body.applyForce(ball, ball.position, {
                        x: (Math.random() - 0.5) * 0.005, // Stronger random horizontal nudge
                        y: 0.005 // Stronger downward nudge
                    });
                }
            }
        });

        return () => {
            if (renderRef.current) {
                Matter.Render.stop(renderRef.current);
            }
            if (runnerRef.current) {
                Matter.Runner.stop(runnerRef.current);
            }
            Matter.Engine.clear(engine);
        };
    }, [onPrizeWon, prizeLanded, canvasSize]);

    useEffect(() => {
        if (isDropping && engineRef.current) {
            setPrizeLanded(false);

            if (ballRef.current) {
                Matter.Composite.remove(engineRef.current.world, ballRef.current);
                ballRef.current = null;
            }

            setTimeout(() => {
                if (!engineRef.current) return;

                const { width } = canvasSize;
                const ballRadius = Math.max(8, width * 0.017);

                const ball = Matter.Bodies.circle(
                    width / 2 + (Math.random() - 0.5) * (width * 0.2),
                    30,
                    ballRadius,
                    {
                        restitution: 0.7,
                        friction: 0.001,
                        density: 0.04,
                        render: {
                            fillStyle: '#8B5CF6'
                        }
                    }
                );

                ballRef.current = ball;
                Matter.Composite.add(engineRef.current.world, ball);
            }, 100);
        }
    }, [isDropping, canvasSize]);

    return (
        <div ref={containerRef} className="flex flex-col items-center w-full">
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="rounded-2xl bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 shadow-xl border-2 border-purple-200/30 w-full max-w-[600px]"
            />
        </div>
    );
};

export default PlinkoGame;
