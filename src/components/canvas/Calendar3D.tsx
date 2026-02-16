'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/lib/store';
import { useBookings } from '@/hooks/useBookings';

export default function Calendar3D() {
    const { selectedDate, setSelectedDate, view, setBookingModalOpen } = useStore();
    const groupRef = useRef<THREE.Group>(null);

    // Fetch bookings for the selected month (simplified for now, fetching all)
    const { data: bookings } = useBookings();

    // Month rendering logic
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.02;
        }
    });

    return (
        <group ref={groupRef}>
            {view === 'month' ? (
                <group position={[-2, 1.5, 0]}>
                    {days.map((day, idx) => {
                        const x = ((idx + startOffset) % 7) * 0.8;
                        const y = -Math.floor((idx + startOffset) / 7) * 0.8;
                        const isSelected = selectedDate.getDate() === day;

                        // Calculate booking density for this day
                        const d = new Date(selectedDate);
                        d.setDate(day);
                        const dayDateString = d.toISOString().split('T')[0];
                        const density = bookings?.filter(b => b.startTime.startsWith(dayDateString) && b.status === 'ACTIVE').length || 0;

                        return (
                            <DayTile
                                key={day}
                                day={day}
                                position={[x, y, 0]}
                                isSelected={isSelected}
                                density={density}
                                onClick={() => {
                                    const newDate = new Date(selectedDate);
                                    newDate.setDate(day);
                                    setSelectedDate(newDate);
                                }}
                            />
                        );
                    })}
                </group>
            ) : (
                <DayView3D />
            )}
        </group>
    );
}

function DayTile({ day, position, isSelected, density, onClick }: {
    day: number,
    position: [number, number, number],
    isSelected: boolean,
    density: number,
    onClick: () => void
}) {
    const [hovered, setHovered] = useState(false);

    // Color interpolates based on density
    const getDensityColor = () => {
        if (isSelected) return '#89cff0';
        if (density === 0) return '#ffffff';
        if (density < 3) return '#e0f2f1';
        if (density < 6) return '#98FF98';
        return '#4caf50';
    };

    return (
        <group
            position={position}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <RoundedBox
                args={[0.7, 0.7, 0.2]}
                radius={0.12}
                smoothness={4}
                scale={hovered ? 1.05 : 1}
            >
                <meshStandardMaterial
                    color={getDensityColor()}
                    roughness={0.1}
                    metalness={0.1}
                />
            </RoundedBox>
            <Text
                position={[0, 0, 0.11]}
                fontSize={0.25}
                color={isSelected ? 'white' : '#333333'}
            >
                {day}
            </Text>
        </group>
    );
}

function DayView3D() {
    const { selectedDate, setBookingModalOpen } = useStore();
    const dateStr = selectedDate.toISOString().split('T')[0];
    const { data: bookings } = useBookings(dateStr);

    const startHour = 8.5; // 08:30
    const endHour = 17;
    const slots = Array.from({ length: (endHour - startHour) * 2 + 1 }, (_, i) => startHour + i * 0.5);

    return (
        <group position={[0, 2, 0]}>
            {slots.map((hour, idx) => {
                const timeStr = `${Math.floor(hour).toString().padStart(2, '0')}:${(hour % 1 === 0.5 ? '30' : '00')}`;
                const slotStart = new Date(`${dateStr}T${timeStr}:00.000Z`);

                const isOccupied = bookings?.some(b =>
                    b.status === 'ACTIVE' &&
                    new Date(b.startTime) <= slotStart &&
                    new Date(b.endTime) > slotStart
                );

                return (
                    <TimeSlot
                        key={hour}
                        hour={hour}
                        timeStr={timeStr}
                        idx={idx}
                        isOccupied={isOccupied}
                        onClick={() => !isOccupied && setBookingModalOpen(true)}
                    />
                );
            })}
        </group>
    );
}

function TimeSlot({ hour, timeStr, idx, isOccupied, onClick }: any) {
    const [hovered, setHovered] = useState(false);

    return (
        <group
            position={[0, -idx * 0.45, 0]}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <RoundedBox
                args={[4, 0.35, 0.15]}
                radius={0.08}
                scale={hovered && !isOccupied ? 1.02 : 1}
            >
                <meshStandardMaterial
                    color={isOccupied ? '#e0e0e0' : (hovered ? '#e6e6fa' : '#ffffff')}
                    opacity={isOccupied ? 0.6 : 1}
                    transparent
                />
            </RoundedBox>
            <Text position={[-2.3, 0, 0]} fontSize={0.18} color="#666666">
                {timeStr}
            </Text>
            {isOccupied && (
                <Text position={[0, 0, 0.08]} fontSize={0.15} color="#999999">
                    Occupied
                </Text>
            )}
        </group>
    );
}
