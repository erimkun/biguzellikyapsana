'use client';

import { useEffect, useRef } from 'react';

const config = {
    dotMinRad: 6,
    dotMaxRad: 20,
    sphereRad: 300,
    bigDotRad: 35,
    mouseSize: 120,
    massFactor: 0.002,
    defColor: 'rgba(142, 17, 0, 0.9)',
    strokeColor: 'rgba(250, 238, 235, 0.7)',
    smooth: 0.65,
};

const PARTICLE_SPRITE_SRC = '/KentasLogoWhite.png';

const TWO_PI = Math.PI * 2;

type Dot = {
    pos: { x: number; y: number };
    vel: { x: number; y: number };
    rad: number;
    mass: number;
    color: string;
};

type MouseState = {
    x: number;
    y: number;
    down: boolean;
};

export default function ParticleOverlay() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d', { alpha: true });
        if (!context) return;

        let animationFrame = 0;
        let width = 0;
        let height = 0;
        let dots: Dot[] = [];
        let spriteReady = false;
        const sprite = new Image();
        let mouse: MouseState = {
            x: 0,
            y: 0,
            down: false,
        };

        sprite.src = PARTICLE_SPRITE_SRC;
        sprite.onload = () => {
            spriteReady = true;
        };

        const random = (min: number, max: number) => Math.random() * (max - min) + min;

        const createCircle = (x: number, y: number, radius: number, fill: boolean, color: string) => {
            context.fillStyle = context.strokeStyle = color;
            context.beginPath();
            context.arc(x, y, radius, 0, TWO_PI);
            context.closePath();
            if (fill) {
                context.fill();
            } else {
                context.stroke();
            }
        };

        const createDot = (radius?: number): Dot => ({
            pos: { x: mouse.x, y: mouse.y },
            vel: { x: 0, y: 0 },
            rad: radius ?? random(config.dotMinRad, config.dotMaxRad),
            mass: (radius ?? random(config.dotMinRad, config.dotMaxRad)) * config.massFactor,
            color: config.defColor,
        });

        const drawDot = (dot: Dot, x?: number, y?: number) => {
            dot.pos.x = x ?? dot.pos.x + dot.vel.x;
            dot.pos.y = y ?? dot.pos.y + dot.vel.y;

            if (spriteReady) {
                const size = dot.rad * 2.2;
                context.save();
                context.globalAlpha = 0.86;
                context.drawImage(
                    sprite,
                    dot.pos.x - size / 2,
                    dot.pos.y - size / 2,
                    size,
                    size
                );
                context.restore();
            } else {
                createCircle(dot.pos.x, dot.pos.y, dot.rad, true, dot.color);
                createCircle(dot.pos.x, dot.pos.y, dot.rad, false, config.strokeColor);
            }
        };

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
            mouse = {
                x: width / 2,
                y: height / 2,
                down: false,
            };
            dots = [];
            dots.push(createDot(config.bigDotRad));
        };

        const updateDots = () => {
            for (let i = 1; i < dots.length; i += 1) {
                const acc = { x: 0, y: 0 };

                for (let j = 0; j < dots.length; j += 1) {
                    if (i === j) continue;
                    const a = dots[i];
                    const b = dots[j];

                    const delta = {
                        x: b.pos.x - a.pos.x,
                        y: b.pos.y - a.pos.y,
                    };
                    let dist = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
                    if (dist < 1) dist = 1;

                    let force = ((dist - config.sphereRad) / dist) * b.mass;

                    if (j === 0) {
                        const alpha = Math.max(0.08, Math.min(0.95, config.mouseSize / dist));
                        a.color = `rgba(142, 17, 0, ${alpha})`;
                        force = dist < config.mouseSize
                            ? (dist - config.mouseSize) * b.mass
                            : a.mass;
                    }

                    acc.x += delta.x * force;
                    acc.y += delta.y * force;
                }

                dots[i].vel.x = dots[i].vel.x * config.smooth + acc.x * dots[i].mass;
                dots[i].vel.y = dots[i].vel.y * config.smooth + acc.y * dots[i].mass;
            }

            for (let i = 0; i < dots.length; i += 1) {
                if (i === 0) {
                    drawDot(dots[i], mouse.x, mouse.y);
                } else {
                    drawDot(dots[i]);
                }
            }
        };

        const step = () => {
            context.clearRect(0, 0, width, height);

            if (mouse.down) {
                if (dots.length < 10000) {
                    dots.push(createDot());
                }
            }

            updateDots();

            animationFrame = window.requestAnimationFrame(step);
        };

        const onMove = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
        };

        const onMouseDown = (event: MouseEvent) => {
            if (event.button === 0) {
                mouse.down = true;
            }
        };

        const onMouseUp = (event: MouseEvent) => {
            if (event.button === 0) {
                mouse.down = false;
            }
        };

        const onContextMenu = (event: MouseEvent) => {
            event.preventDefault();
            dots.splice(1, dots.length - 1);
        };

        const onLeave = () => {
            mouse.down = false;
        };

        resize();
        step();

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('contextmenu', onContextMenu);
        window.addEventListener('mouseout', onLeave);
        window.addEventListener('blur', onLeave);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('contextmenu', onContextMenu);
            window.removeEventListener('mouseout', onLeave);
            window.removeEventListener('blur', onLeave);
            window.cancelAnimationFrame(animationFrame);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            <canvas ref={canvasRef} className="h-full w-full" />
        </div>
    );
}
