'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Float, MeshDistortMaterial } from '@react-three/drei';
import { Suspense } from 'react';

function FloatingBlob({
    position,
    color,
    scale,
    speed = 1,
    distort = 0.3,
}: {
    position: [number, number, number];
    color: string;
    scale: number;
    speed?: number;
    distort?: number;
}) {
    return (
        <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.8}>
            <mesh position={position} scale={scale}>
                <icosahedronGeometry args={[1, 1]} />
                <MeshDistortMaterial
                    color={color}
                    roughness={0.2}
                    metalness={0.1}
                    distort={distort}
                    speed={2}
                    transparent
                    opacity={0.5}
                />
            </mesh>
        </Float>
    );
}

function FloatingSphere({
    position,
    color,
    scale,
    speed = 1,
}: {
    position: [number, number, number];
    color: string;
    scale: number;
    speed?: number;
}) {
    return (
        <Float speed={speed} rotationIntensity={0.2} floatIntensity={1.2}>
            <mesh position={position} scale={scale}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.1}
                    metalness={0.2}
                    transparent
                    opacity={0.35}
                />
            </mesh>
        </Float>
    );
}

export default function Scene() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            <Canvas dpr={[1, 1.5]}>
                <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={45} />

                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffeedd" />
                    <pointLight position={[-5, -5, 5]} intensity={0.3} color="#89cff0" />

                    {/* Floating decorative blobs */}
                    <FloatingBlob position={[-6, 3, -3]} color="#89cff0" scale={1.8} speed={1.2} distort={0.4} />
                    <FloatingBlob position={[6, -2, -4]} color="#e6e6fa" scale={2.2} speed={0.8} distort={0.3} />
                    <FloatingBlob position={[-3, -4, -5]} color="#fa8072" scale={1.3} speed={1.5} distort={0.5} />

                    <FloatingSphere position={[5, 4, -6]} color="#98ff98" scale={2} speed={1} />
                    <FloatingSphere position={[-7, 0, -7]} color="#fce4ec" scale={2.8} speed={0.6} />
                    <FloatingSphere position={[0, -5, -4]} color="#e0e7ff" scale={1.6} speed={1.3} />
                    <FloatingSphere position={[3, 5, -8]} color="#ddd6fe" scale={2.5} speed={0.7} />

                    <Environment preset="apartment" />
                </Suspense>
            </Canvas>
        </div>
    );
}
