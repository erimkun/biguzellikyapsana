'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera, ContactShadows, Float } from '@react-three/drei';
import { Suspense } from 'react';
import BackgroundRoom from './BackgroundRoom';

export default function Scene({ children }: { children?: React.ReactNode }) {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
            <Canvas shadows dpr={[1, 2]}>
                <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />

                    <ambientLight intensity={0.7} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
                    <directionalLight position={[-5, 5, 5]} intensity={0.8} />

                    <BackgroundRoom />

                    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                        {children}
                    </Float>

                    <Environment preset="apartment" />
                    <ContactShadows
                        position={[0, -3.5, 0]}
                        opacity={0.3}
                        scale={40}
                        blur={1.5}
                        far={10}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
