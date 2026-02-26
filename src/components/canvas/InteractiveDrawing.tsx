'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/lib/store';

export default function InteractiveDrawing({ enabled }: { enabled: boolean }) {
    const [lines, setLines] = useState<THREE.Vector3[][]>([]);
    const [currentLine, setCurrentLine] = useState<THREE.Vector3[]>([]);
    const isDrawing = useRef(false);
    const planeRef = useRef<THREE.Mesh>(null);
    const { clearDrawingTrigger } = useStore();

    useEffect(() => {
        setLines([]);
        setCurrentLine([]);
    }, [clearDrawingTrigger]);

    const onPointerDown = useCallback((e: any) => {
        if (!enabled) return;
        e.stopPropagation();
        isDrawing.current = true;
        setCurrentLine([e.point.clone()]);
    }, [enabled]);

    const onPointerMove = useCallback((e: any) => {
        if (!enabled || !isDrawing.current) return;
        e.stopPropagation();
        setCurrentLine((prev) => [...prev, e.point.clone()]);
    }, [enabled]);

    const onPointerUp = useCallback((e: any) => {
        if (!enabled || !isDrawing.current) return;
        isDrawing.current = false;
        setLines((prev) => [...prev, currentLine]);
        setCurrentLine([]);
    }, [enabled, currentLine]);

    // Create a color scale based on the line index
    const getColor = (index: number) => {
        const colors = ['#ff69b4', '#89cff0', '#98ff98', '#e0e7ff', '#fa8072', '#ffe4e1'];
        return colors[index % colors.length];
    };

    return (
        <group>
            {/* Invisible plane to catch raycaster events. Slightly in front of the background objects but behind UI */}
            <mesh
                ref={planeRef}
                visible={false}
                position={[0, 0, 1]}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerOut={onPointerUp}
            >
                <planeGeometry args={[200, 200]} />
            </mesh>

            {lines.map((line, i) => (
                <Line
                    key={i}
                    points={line}
                    color={getColor(i)}
                    lineWidth={8}
                    transparent
                    opacity={0.8}
                />
            ))}
            {currentLine.length > 0 && (
                <Line
                    points={currentLine}
                    color={getColor(lines.length)}
                    lineWidth={8}
                    transparent
                    opacity={0.8}
                />
            )}
        </group>
    );
}
