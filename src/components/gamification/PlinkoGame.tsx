import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

export interface PlinkoPrize {
    id: string;
    label: string;
    value: number;
    type: 'discount' | 'freebie';
    color: string;
}

const prizes: PlinkoPrize[] = [
    { id: '1', label: '5% OFF', value: 5, type: 'discount', color: '#EF4444' },
    { id: '2', label: '10% OFF', value: 10, type: 'discount', color: '#F97316' },
    { id: '3', label: '20% OFF', value: 20, type: 'discount', color: '#F59E0B' },
    { id: '4', label: '50% OFF', value: 50, type: 'discount', color: '#FBBF24' },
    { id: '5', label: 'FREE!', value: 100, type: 'discount', color: '#10B981' },
    { id: '6', label: '50% OFF', value: 50, type: 'discount', color: '#FBBF24' },
    { id: '7', label: '20% OFF', value: 20, type: 'discount', color: '#F59E0B' },
    { id: '8', label: '10% OFF', value: 10, type: 'discount', color: '#F97316' },
    { id: '9', label: '5% OFF', value: 5, type: 'discount', color: '#EF4444' },
];

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
        const startY = width * 0.05;
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
                        fillStyle: '#E5E7EB'
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
                        const slotIndex = parseInt(slot.label.split('-')[1]);
                        const prize = prizes[slotIndex];

                        setTimeout(() => {
                            onPrizeWon(prize);
                        }, 800);
                    }
                }
            });
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
                    width / 2 + (Math.random() - 0.5) * (width * 0.1),
                    30,
                    ballRadius,
                    {
                        restitution: 0.7,
                        friction: 0.005,
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
                className="rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 shadow-inner w-full max-w-[600px]"
            />

            <div className="grid grid-cols-9 w-full max-w-[600px] mt-2 gap-1 px-2">
                {prizes.map((prize) => (
                    <div
                        key={prize.id}
                        className="text-center py-2 rounded-lg font-bold text-xs"
                        style={{ backgroundColor: prize.color, color: '#fff' }}
                    >
                        {prize.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlinkoGame;
