'use client';

import { Box, Plane } from '@react-three/drei';
import * as THREE from 'three';

export default function BackgroundRoom() {
    return (
        <group position={[0, 0, -5]}>
            {/* Floor */}
            <Plane args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
                <meshStandardMaterial color="#f0f4f8" roughness={0.8} />
            </Plane>

            {/* Back Wall */}
            <Plane args={[50, 50]} position={[0, 0, -10]}>
                <meshStandardMaterial color="#ffffff" roughness={0.9} />
            </Plane>

            {/* Side Walls */}
            <Plane args={[50, 50]} rotation={[0, Math.PI / 2, 0]} position={[-15, 0, 0]}>
                <meshStandardMaterial color="#f8fafc" roughness={0.9} />
            </Plane>
            <Plane args={[50, 50]} rotation={[0, -Math.PI / 2, 0]} position={[15, 0, 0]}>
                <meshStandardMaterial color="#f8fafc" roughness={0.9} />
            </Plane>

            {/* Ceiling */}
            <Plane args={[50, 50]} rotation={[Math.PI / 2, 0, 0]} position={[0, 15, 0]}>
                <meshStandardMaterial color="#ffffff" />
            </Plane>

            {/* Decorative Minimalist Pillars/Blocks */}
            <Box args={[2, 10, 2]} position={[-10, 0, -8]}>
                <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
            </Box>
            <Box args={[1, 10, 1]} position={[12, 0, -5]}>
                <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
            </Box>

            {/* Window Simulation (Light Source Visual) */}
            <Plane args={[8, 12]} position={[-14.9, 2, -2]} rotation={[0, Math.PI / 2, 0]}>
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={0.5}
                />
            </Plane>
        </group>
    );
}
