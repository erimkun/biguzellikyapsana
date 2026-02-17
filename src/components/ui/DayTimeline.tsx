'use client';

import { useStore } from '@/lib/store';
import { useBookings, useCancelBooking, Booking } from '@/hooks/useBookings';
import { useState } from 'react';

const MONTHS_TR = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
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

    const getBookingForSlot = (time: string): Booking | undefined => {
        if (!bookings) return undefined;
        const slotTime = new Date(`${dateStr}T${time}:00.000Z`);
        return bookings.find((b) => {
            const start = new Date(b.startTime);
            const end = new Date(b.endTime);
            return start <= slotTime && end > slotTime;
        });
    };

    const isSlotStart = (time: string): Booking | undefined => {
        if (!bookings) return undefined;
        return bookings.find((b) => formatTime(b.startTime) === time);
    };

    const handleSlotClick = (time: string) => {
        const booking = getBookingForSlot(time);
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
            <div className="timeline-scroll flex-1 min-h-0 space-y-1.5 overflow-y-auto pr-1">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    slots.map((time, idx) => {
                        const booking = getBookingForSlot(time);
                        const startBooking = isSlotStart(time);
                        const isOccupied = !!booking && booking.status === 'ACTIVE';
                        const isCancelled = !!booking && booking.status === 'CANCELLED';
                        const isExpanded = booking && expandedBooking === booking.id;

                        return (
                            <div
                                key={time}
                                style={{ animationDelay: `${idx * 25}ms` }}
                                className="animate-fadeIn"
                            >
                                <div
                                    onClick={() => handleSlotClick(time)}
                                    className={`time-slot ${isOccupied ? 'occupied' : ''} ${isCancelled ? 'cancelled' : ''}`}
                                >
                                    <span className="text-sm font-mono text-gray-400 w-14 flex shrink-0">
                                        {time}
                                    </span>
                                    <div className="h-px flex-1 bg-gray-200/50" />

                                    {startBooking && startBooking.status === 'ACTIVE' && (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="pill pill-active">
                                                {startBooking.title}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {startBooking.ownerName}
                                            </span>
                                        </div>
                                    )}

                                    {startBooking && startBooking.status === 'CANCELLED' && (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="pill pill-cancelled line-through">
                                                {startBooking.title}
                                            </span>
                                            <span className="text-xs text-gray-400 line-through">
                                                {startBooking.ownerName}
                                            </span>
                                        </div>
                                    )}

                                    {!booking && (
                                        <span className="text-xs text-gray-300 flex shrink-0">
                                            Müsait
                                        </span>
                                    )}
                                </div>

                                {/* Expanded booking details */}
                                {isExpanded && booking && (
                                    <div className="ml-16 mt-1 mb-2 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-blue-100 animate-scaleIn">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-gray-800">
                                                    {booking.title}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {booking.ownerName}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatTime(booking.startTime)} –{' '}
                                                    {formatTime(booking.endTime)}
                                                </p>
                                                {booking.notes && (
                                                    <p className="text-sm text-gray-600 mt-2 italic bg-gray-50/50 p-2 rounded-lg">
                                                        &ldquo;{booking.notes}&rdquo;
                                                    </p>
                                                )}
                                                <span
                                                    className={`mt-2 inline-block pill ${booking.status === 'ACTIVE' ? 'pill-active' : 'pill-cancelled'}`}
                                                >
                                                    {booking.status === 'ACTIVE'
                                                        ? 'Aktif'
                                                        : 'İptal Edildi'}
                                                </span>
                                            </div>
                                            {booking.status === 'ACTIVE' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCancelBooking(booking.id);
                                                    }}
                                                    className="clay-button clay-button-danger text-xs px-3 py-1.5"
                                                    disabled={cancelBooking.isPending}
                                                >
                                                    {cancelBooking.isPending
                                                        ? 'İptal ediliyor...'
                                                        : 'İptal Et'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
