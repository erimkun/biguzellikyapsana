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
    const [leaderboard, setLeaderboard] = useState<{ id: number; name: string; score: number }[]>([]);
    const [playerName, setPlayerName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [shareMessage, setShareMessage] = useState('');

    const lastDropTime = useRef<number>(0);
    const runnerRef = useRef<Matter.Runner | null>(null);

    // Determines the level of the next ball based on current score
    const getNextBallLevel = useCallback(() => {
        const rand = Math.random();

        // As score increases, unlock higher level balls
        if (score > 1000) {
            if (rand < 0.3) return 1;
            if (rand < 0.6) return 2;
            if (rand < 0.8) return 3;
            if (rand < 0.95) return 4;
            return 5;
        } else if (score > 500) {
            if (rand < 0.4) return 1;
            if (rand < 0.7) return 2;
            if (rand < 0.9) return 3;
            return 4;
        } else if (score > 200) {
            if (rand < 0.5) return 1;
            if (rand < 0.8) return 2;
            return 3;
        } else {
            // Default starting difficulty
            if (rand < 0.6) return 1;
            if (rand < 0.9) return 2;
            return 3;
        }
    }, [score]);

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
        fetchLeaderboard();

        return () => {
            // Cleanup on unmount
            Matter.Render.stop(render);
            if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
            Matter.Engine.clear(engine);
            render.canvas.remove();
            render.textures = {};
        };
    }, [createBall, getNextBallLevel]);

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch('/api/leaderboard');
            if (res.ok) {
                const data = await res.json();
                setLeaderboard(data);
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        }
    };

    const handleSaveScore = async () => {
        if (!playerName.trim() || score === 0 || isSaving) return;

        setIsSaving(true);
        try {
            const res = await fetch('/api/leaderboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: playerName, score }),
            });

            if (res.ok) {
                setHasSaved(true);
                fetchLeaderboard();
            }
        } catch (error) {
            console.error('Failed to save score:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleShareScore = async () => {
        const textToShare = `Kentaş Suika'da ${score} puan yaptım! Sen de oyna: ${typeof window !== 'undefined' ? window.location.origin : ''}`;
        try {
            await navigator.clipboard.writeText(textToShare);
            setShareMessage('Panoya kopyalandı!');
            setTimeout(() => setShareMessage(''), 3000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

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
                <div className="absolute -top-16 left-0 flex items-center justify-between bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20 shadow-xl w-full z-20">
                    <div className="flex items-center gap-6">
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

                    {/* Share Button (Left of Leaderboard) */}
                    <div className="flex flex-col items-center">
                        <button
                            onClick={handleShareScore}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-4 rounded-xl transition-colors shadow-md flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                            Puanını Paylaş
                        </button>
                        {shareMessage && <span className="text-xs text-green-600 font-medium absolute -bottom-5">{shareMessage}</span>}
                    </div>
                </div>

                {/* Vertical Leaderboard Panel */}
                <div className="absolute top-0 -right-64 w-60 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl z-20 overflow-hidden flex flex-col h-full rounded-l-none border-l-0">
                    <div className="bg-gradient-to-r from-blue-600/80 to-indigo-600/80 p-4 shrink-0">
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            Top 5 Leaderboard
                        </h3>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto">
                        <div className="flex flex-col gap-3">
                            {leaderboard.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">Henüz puan yok</p>
                            ) : (
                                leaderboard.map((entry, index) => (
                                    <div key={entry.id} className="flex items-center justify-between bg-white/40 p-2 rounded-lg border border-white/50">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-400 text-yellow-900' : index === 1 ? 'bg-gray-300 text-gray-800' : index === 2 ? 'bg-amber-600 text-amber-100' : 'bg-white/50 text-gray-600'}`}>
                                                {index + 1}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-800 truncate max-w-[90px]" title={entry.name}>
                                                {entry.name}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                                            {entry.score}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-white/20 border-t border-white/30 shrink-0">
                        <div className="flex flex-col gap-2">
                            <input
                                type="text"
                                placeholder="İsminiz..."
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                disabled={hasSaved || isSaving}
                                className="w-full px-3 py-2 text-sm rounded-lg bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                maxLength={15}
                            />
                            <button
                                onClick={handleSaveScore}
                                disabled={!playerName.trim() || score === 0 || isSaving || hasSaved}
                                className={`w-full py-2 text-sm font-bold rounded-lg transition-all ${hasSaved ? 'bg-green-500 text-white' : 'bg-gray-800 hover:bg-gray-900 text-white'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isSaving ? 'Kaydediliyor...' : hasSaved ? 'Kaydedildi!' : 'Puanı Kaydet'}
                            </button>
                        </div>
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
