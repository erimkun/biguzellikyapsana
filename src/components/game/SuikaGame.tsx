'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { BALL_TYPES, GAME_CONSTANTS } from '@/lib/gameLogic';

interface SuikaGameProps {
    isVisible: boolean;
}

export default function SuikaGame({ isVisible }: SuikaGameProps) {
    const sceneRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const renderRef = useRef<Matter.Render | null>(null);
    const [score, setScore] = useState(0);
    const [nextBallLevel, setNextBallLevel] = useState<number>(1);
    const lastDropTime = useRef<number>(0);
    const runnerRef = useRef<Matter.Runner | null>(null);

    // Determines the level of the next ball (weighted towards 1 and 2)
    const getNextBallLevel = () => {
        const rand = Math.random();
        if (rand < 0.6) return 1;
        if (rand < 0.9) return 2;
        return 3;
    };

    // Creates a physical ball body
    const createBall = useCallback((x: number, y: number, level: number, isStatic = false) => {
        const typeContext = BALL_TYPES[level - 1];
        if (!typeContext) return null;

        const PREFERRED_IMAGE_WIDTH = 512;
        const PREFERRED_IMAGE_HEIGHT = 512;

        const ballOptions: Matter.IChamferableBodyDefinition = {
            restitution: 0.6,
            friction: 0.001,
            density: 0.05,
            isStatic,
            label: `ball_${level}`,
            render: {
                fillStyle: 'transparent', // Make the base body transparent
                // We will handle the custom circular image drawing in afterRender
                // so we don't use the native sprite object to avoid square renders.
            },
            // Store custom data for our custom renderer
            plugin: {
                texture: typeContext.texture,
                radius: typeContext.radius,
                color: typeContext.color
            }
        };

        return Matter.Bodies.circle(x, y, typeContext.radius, ballOptions);
    }, []);

    useEffect(() => {
        if (!sceneRef.current) return;

        // Initialize Engine
        const engine = Matter.Engine.create();
        engine.gravity.y = 1.2;
        engineRef.current = engine;

        // Initialize Renderer
        const render = Matter.Render.create({
            element: sceneRef.current,
            engine: engine,
            options: {
                width: GAME_CONSTANTS.WIDTH,
                height: GAME_CONSTANTS.HEIGHT,
                wireframes: false, // Must be false to show sprites / colors
                background: 'transparent',
                pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
            },
        });
        renderRef.current = render;

        // Create Container Walls
        const { WIDTH, HEIGHT, WALL_THICKNESS } = GAME_CONSTANTS;
        const wallOptions = {
            isStatic: true,
            friction: 0.5,
            restitution: 0.2,
            render: {
                fillStyle: 'rgba(255,255,255,0.2)',
                strokeStyle: 'rgba(255,255,255,0.5)',
                lineWidth: 2,
            },
        };

        const ground = Matter.Bodies.rectangle(WIDTH / 2, HEIGHT, WIDTH, WALL_THICKNESS, wallOptions);
        const leftWall = Matter.Bodies.rectangle(0, HEIGHT / 2, WALL_THICKNESS, HEIGHT, wallOptions);
        const rightWall = Matter.Bodies.rectangle(WIDTH, HEIGHT / 2, WALL_THICKNESS, HEIGHT, wallOptions);

        Matter.World.add(engine.world, [ground, leftWall, rightWall]);

        // Collision Logic
        Matter.Events.on(engine, 'collisionStart', (event: Matter.IEventCollision<Matter.Engine>) => {
            const pairs = event.pairs;
            for (let i = 0; i < pairs.length; i++) {
                const { bodyA, bodyB } = pairs[i];

                if (bodyA.label.startsWith('ball_') && bodyB.label.startsWith('ball_')) {
                    const levelA = parseInt(bodyA.label.split('_')[1]);
                    const levelB = parseInt(bodyB.label.split('_')[1]);

                    // If same level balls collide
                    if (levelA === levelB) {
                        // Prevent multiple unhandled merge triggers for the same pair
                        if ((bodyA as any).isMerging || (bodyB as any).isMerging) continue;
                        (bodyA as any).isMerging = true;
                        (bodyB as any).isMerging = true;

                        const nextLevel = levelA + 1;

                        if (nextLevel <= BALL_TYPES.length) {
                            // Find midpoint to spawn new ball
                            const midpointX = (bodyA.position.x + bodyB.position.x) / 2;
                            const midpointY = (bodyA.position.y + bodyB.position.y) / 2;

                            const newBall = createBall(midpointX, midpointY, nextLevel);
                            if (newBall) {
                                // Add score
                                setScore((s) => s + BALL_TYPES[nextLevel - 1].score);

                                Matter.Composite.remove(engine.world, [bodyA, bodyB]);
                                Matter.Composite.add(engine.world, newBall);
                            }
                        }
                    }
                }
            }
        });


        // Custom Render Loop for Circular Masked Images
        const loadedImages: { [key: string]: HTMLImageElement } = {};

        // Preload images
        BALL_TYPES.forEach(type => {
            const img = new Image();
            img.src = type.texture;
            loadedImages[type.texture] = img;
        });

        Matter.Events.on(render, 'afterRender', () => {
            const context = render.context;
            const bodies = Matter.Composite.allBodies(engine.world);

            bodies.forEach((body) => {
                if (body.label.startsWith('ball_') && body.plugin && body.plugin.texture) {
                    const img = loadedImages[body.plugin.texture];
                    if (!img || !img.complete) return;

                    const radius = body.plugin.radius;
                    const { x, y } = body.position;

                    context.save();
                    context.translate(x, y);
                    context.rotate(body.angle);

                    // Create circular clipping path
                    context.beginPath();
                    context.arc(0, 0, radius, 0, 2 * Math.PI);
                    context.closePath();
                    context.clip();

                    // Fill background color
                    if (body.plugin.color) {
                        context.fillStyle = body.plugin.color;
                        context.fill();
                    }

                    // Calculate fit dimensions (contain logic with slight padding)
                    const aspect = img.width / img.height;
                    const maxSize = radius * 2 * 0.85; // 85% of diameter so corners don't clip much
                    let drawWidth = maxSize;
                    let drawHeight = maxSize;

                    if (aspect > 1) {
                        drawHeight = drawWidth / aspect;
                    } else {
                        drawWidth = drawHeight * aspect;
                    }

                    // Draw the image centered
                    context.drawImage(
                        img,
                        -drawWidth / 2,
                        -drawHeight / 2,
                        drawWidth,
                        drawHeight
                    );

                    context.restore();
                }
            });
        });

        // Run Engine & Renderer
        Matter.Render.run(render);
        const runner = Matter.Runner.create();
        runnerRef.current = runner;
        Matter.Runner.run(runner, engine);

        setNextBallLevel(getNextBallLevel());

        return () => {
            // Cleanup on unmount
            Matter.Render.stop(render);
            if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
            Matter.Engine.clear(engine);
            render.canvas.remove();
            render.textures = {};
        };
    }, [createBall]);

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!engineRef.current || !renderRef.current) return;
        const now = Date.now();
        if (now - lastDropTime.current < GAME_CONSTANTS.DROP_COOLDOWN_MS) return;

        const rect = sceneRef.current?.getBoundingClientRect();
        if (!rect) return;

        // Get relative drop X
        let dropX = e.clientX - rect.left;

        // Restrict dropping too close to the edge to prevent overlap
        const typeContext = BALL_TYPES[nextBallLevel - 1];
        const minX = GAME_CONSTANTS.WALL_THICKNESS / 2 + typeContext.radius;
        const maxX = GAME_CONSTANTS.WIDTH - GAME_CONSTANTS.WALL_THICKNESS / 2 - typeContext.radius;
        dropX = Math.max(minX, Math.min(maxX, dropX));

        const newBall = createBall(dropX, 50, nextBallLevel); // Create ball at top
        if (newBall) {
            Matter.Composite.add(engineRef.current.world, newBall);
            lastDropTime.current = now;
            setNextBallLevel(getNextBallLevel());
        }
    }, [nextBallLevel, createBall]);


    return (
        <div
            className={`fixed inset-0 z-40 flex items-center justify-center transition-all duration-700 pointer-events-none 
                ${isVisible ? 'opacity-100' : 'opacity-0 scale-95 translate-y-8'}`}
        >
            <div className="relative pointer-events-auto flex items-end">
                {/* 6.jpeg Outside Container */}
                <div
                    className="absolute -left-32 bottom-0 w-48 h-48 opacity-40 pointer-events-none bg-contain bg-no-repeat bg-bottom z-0"
                    style={{ backgroundImage: 'url(/6.jpeg)' }}
                />

                {/* Score and Next Ball HUD */}
                <div className="absolute -top-16 left-0 flex items-center gap-6 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20 shadow-xl w-full z-20">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Score</span>
                        <span className="text-2xl font-bold text-gray-800">{score}</span>
                    </div>
                    <div className="h-10 w-px bg-white/20" />
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Next:</span>
                        <div
                            className="w-10 h-10 rounded-full shadow-inner bg-no-repeat bg-center border border-white/20"
                            style={{
                                backgroundImage: `url(${BALL_TYPES[nextBallLevel - 1]?.texture})`,
                                backgroundColor: BALL_TYPES[nextBallLevel - 1]?.color,
                                backgroundSize: '75%'
                            }}
                        />
                    </div>
                </div>

                {/* Glassmorphic Game Container */}
                <div
                    ref={sceneRef}
                    className="overflow-hidden rounded-b-3xl rounded-t-lg bg-white/5 backdrop-blur-[2px] border-x border-b border-white/30 shadow-2xl cursor-crosshair relative z-10"
                    style={{ width: GAME_CONSTANTS.WIDTH, height: GAME_CONSTANTS.HEIGHT, boxShadow: 'inset 0 0 40px rgba(255,255,255,0.1)' }}
                    onPointerDown={handlePointerDown}
                >
                    {/* Game area styling: Visual boundary overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
