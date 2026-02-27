'use client';

import { useStore } from '@/lib/store';
import { useBookings, useCancelBooking, Booking } from '@/hooks/useBookings';
import { useState } from 'react';

const MONTHS_TR = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

const ROOMS = [
    { id: 1, name: 'Toplantı Odası 1', colorName: 'blue' },
    { id: 2, name: 'T. Odası (Zemin)', colorName: 'red' },
    { id: 3, name: 'T. Odası (Yön.)', colorName: 'yellow' },
];

function formatTime(isoStr: string): string {
    const d = new Date(isoStr);
    return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
}

export default function DayTimeline() {
    const { selectedDate, setView, setBookingModalOpen, setSelectedTimeSlot } = useStore();
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const { data: bookings, isLoading } = useBookings(dateStr);
    const cancelBooking = useCancelBooking();
    const [expandedBooking, setExpandedBooking] = useState<number | null>(null);

    // Generate time slots from 08:30 to 17:00 (30-min increments)
    const slots: string[] = [];
    for (let h = 8; h <= 16; h++) {
        if (h === 8) {
            slots.push('08:30');
        } else {
            slots.push(`${h.toString().padStart(2, '0')}:00`);
            slots.push(`${h.toString().padStart(2, '0')}:30`);
        }
    }
    slots.push('17:00');

    const getBookingForSlot = (roomId: number, time: string): Booking | undefined => {
        if (!bookings) return undefined;
        const slotTime = new Date(`${dateStr}T${time}:00.000Z`);
        return bookings.find((b) => {
            const start = new Date(b.startTime);
            const end = new Date(b.endTime);
            return b.roomId === roomId && start <= slotTime && end > slotTime;
        });
    };

    const isSlotStart = (roomId: number, time: string): Booking | undefined => {
        if (!bookings) return undefined;
        return bookings.find((b) => b.roomId === roomId && formatTime(b.startTime) === time);
    };

    const handleSlotClick = (roomId: number, time: string) => {
        const booking = getBookingForSlot(roomId, time);
        if (booking) {
            setExpandedBooking(expandedBooking === booking.id ? null : booking.id);
            return;
        }
        setSelectedTimeSlot(time);
        setBookingModalOpen(true);
    };

    const handleCancelBooking = async (id: number) => {
        if (confirm('Bu toplantıyı iptal etmek istediğinize emin misiniz?')) {
            try {
                await cancelBooking.mutateAsync(id);
                setExpandedBooking(null);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Bir hata oluştu';
                alert(message);
            }
        }
    };

    const dayOfWeek = selectedDate.toLocaleDateString('tr-TR', { weekday: 'long' });

    // Count active bookings
    const activeCount = bookings?.filter((b) => b.status === 'ACTIVE').length ?? 0;

    return (
        <div className="animate-fadeIn h-full min-h-0 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <button
                        onClick={() => setView('month')}
                        className="clay-button clay-button-ghost text-xs mb-3"
                    >
                        ← Takvime Dön
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {selectedDate.getDate()} {MONTHS_TR[selectedDate.getMonth()]}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-400 capitalize">{dayOfWeek}</p>
                        {activeCount > 0 && (
                            <span className="pill pill-active">{activeCount} toplantı</span>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => {
                        setSelectedTimeSlot(null);
                        setBookingModalOpen(true);
                    }}
                    className="clay-button clay-button-primary"
                >
                    + Yeni Toplantı
                </button>
            </div>

            {/* Timeline */}
            <div className="timeline-scroll flex-1 min-h-0 overflow-y-auto pr-1">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="flex flex-col relative w-full">
                        {/* Room Headers */}
                        <div className="flex z-10 sticky top-0 bg-[#e9e7ef]/90 backdrop-blur-md mb-2 pb-2 border-b border-gray-200/50 mix-blend-normal pl-16">
                            {ROOMS.map(room => (
                                <div key={room.id} className="flex-1 text-center">
                                    <span className="text-xs font-semibold text-gray-600 bg-white/50 px-3 py-1.5 rounded-full shadow-sm">
                                        {room.name}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {slots.map((time, idx) => {
                            return (
                                <div
                                    key={time}
                                    style={{ animationDelay: `${idx * 25}ms` }}
                                    className="animate-fadeIn flex w-full relative group min-h-[44px] mb-1.5"
                                >
                                    <span className="text-sm font-mono text-gray-400 w-14 flex shrink-0 items-center pl-1 font-medium">
                                        {time}
                                    </span>

                                    {/* Horizontal background line spanning the grid */}
                                    <div className="absolute left-14 right-0 top-1/2 h-px bg-gray-300/40 -z-10 group-hover:bg-gray-300 transition-colors" />

                                    <div className="flex-1 flex gap-2 w-full">
                                        {ROOMS.map(room => {
                                            const booking = getBookingForSlot(room.id, time);
                                            const startBooking = isSlotStart(room.id, time);
                                            const isOccupied = !!booking && booking.status === 'ACTIVE';
                                            const isCancelled = !!booking && booking.status === 'CANCELLED';
                                            const colorClass = room.colorName;
                                            const isExpanded = booking && expandedBooking === booking.id;

                                            return (
                                                <div key={room.id} className="flex-1 min-w-0 flex flex-col relative">
                                                    <div
                                                        onClick={() => handleSlotClick(room.id, time)}
                                                        className={`time-slot w-full h-full justify-start !px-2 !py-1 ${isOccupied ? `occupied time-slot-${colorClass}` : ''} ${isCancelled ? 'cancelled' : ''}`}
                                                    >
                                                        {startBooking && startBooking.status === 'ACTIVE' && (
                                                            <div className="flex flex-col items-start min-w-0 overflow-hidden text-left pl-1">
                                                                <span className={`pill pill-${colorClass} font-semibold truncate max-w-full text-[10px] leading-tight px-2 py-0.5`}>
                                                                    {startBooking.title}
                                                                </span>
                                                                <span className="text-[10px] text-gray-500 truncate max-w-full pl-1 mt-0.5">
                                                                    {startBooking.ownerName}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {startBooking && startBooking.status === 'CANCELLED' && (
                                                            <div className="flex flex-col items-start min-w-0 overflow-hidden text-left pl-1">
                                                                <span className={`pill pill-cancelled font-semibold truncate max-w-full text-[10px] leading-tight px-2 py-0.5 line-through opacity-70`}>
                                                                    {startBooking.title}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {!booking && (
                                                            <span className="text-[10px] font-medium text-gray-300/50 absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                +
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Handle expanded booking logic cleanly: we float it over or insert beneath */}
                                </div>
                            );
                        })}

                        {/* Render expanded booking details in a floating panel */}
                        {expandedBooking && bookings && (() => {
                            const b = bookings.find(x => x.id === expandedBooking);
                            if (!b) return null;
                            const r = ROOMS.find(x => x.id === b.roomId);

                            return (
                                <div className="fixed bottom-6 right-6 z-50 p-5 rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-100 shadow-xl animate-slideUp max-w-sm w-full">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`w-2 h-2 rounded-full bg-${r?.colorName}-400 shadow-sm`} />
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{r?.name}</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-800 leading-tight">
                                                {b.title}
                                            </h4>
                                            <p className="text-sm font-medium text-gray-500 mt-0.5">
                                                {b.ownerName}
                                            </p>
                                        </div>
                                        <button onClick={() => setExpandedBooking(null)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-1 transition-colors">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 bg-gray-50/50 py-1.5 px-3 rounded-lg border border-gray-100">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                        {formatTime(b.startTime)} – {formatTime(b.endTime)}
                                    </div>

                                    {b.notes && (
                                        <p className="text-sm text-gray-600 mb-4 bg-yellow-50/50 p-3 rounded-xl border border-yellow-100/50 italic">
                                            "{b.notes}"
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                        <span className={`pill ${b.status === 'ACTIVE' ? 'pill-active' : 'pill-cancelled'} !px-3 !py-1`}>
                                            {b.status === 'ACTIVE' ? 'Aktif' : 'İptal Edildi'}
                                        </span>
                                        {b.status === 'ACTIVE' && (
                                            <button
                                                onClick={() => handleCancelBooking(b.id)}
                                                className="clay-button clay-button-danger text-xs px-4 py-1.5 !rounded-xl"
                                                disabled={cancelBooking.isPending}
                                            >
                                                {cancelBooking.isPending ? 'İptal...' : 'İptal Et'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}
