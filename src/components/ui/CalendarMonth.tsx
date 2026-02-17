'use client';

import { useStore } from '@/lib/store';
import { useMonthBookings } from '@/hooks/useBookings';

const DAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS_TR = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

export default function CalendarMonth() {
    const { selectedDate, goToNextMonth, goToPrevMonth, goToToday, selectDayAndOpenDayView } = useStore();
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const { data: bookings } = useMonthBookings(year, month);

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Monday-based

    const prevMonthDays = new Date(year, month, 0).getDate();

    // Build calendar grid
    const cells: { day: number; currentMonth: boolean }[] = [];

    // Previous month trailing days
    for (let i = startOffset - 1; i >= 0; i--) {
        cells.push({ day: prevMonthDays - i, currentMonth: false });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, currentMonth: true });
    }

    // Next month leading days (fill to 42 = 6 rows)
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
        cells.push({ day: d, currentMonth: false });
    }

    // Count active bookings per day
    const getBookingCount = (day: number): number => {
        if (!bookings) return 0;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return bookings.filter(
            (b) => b.status === 'ACTIVE' && b.startTime.startsWith(dateStr)
        ).length;
    };

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {MONTHS_TR[month]} {year}
                    </h2>
                    {isCurrentMonth && (
                        <p className="text-sm text-gray-400 mt-0.5">Bu ay</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={goToToday} className="clay-button clay-button-ghost text-xs">
                        Bugün
                    </button>
                    <button onClick={goToPrevMonth} className="clay-button clay-button-ghost px-3">
                        ‹
                    </button>
                    <button onClick={goToNextMonth} className="clay-button clay-button-ghost px-3">
                        ›
                    </button>
                </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {DAYS_TR.map((d) => (
                    <div
                        key={d}
                        className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider py-1"
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
                {cells.map((cell, idx) => {
                    const isToday =
                        cell.currentMonth && today.getDate() === cell.day && isCurrentMonth;
                    const isSelected =
                        cell.currentMonth &&
                        selectedDate.getDate() === cell.day &&
                        selectedDate.getMonth() === month;
                    const count = cell.currentMonth ? getBookingCount(cell.day) : 0;

                    return (
                        <div
                            key={idx}
                            onClick={() => {
                                if (cell.currentMonth) {
                                    selectDayAndOpenDayView(cell.day);
                                }
                            }}
                            className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${!cell.currentMonth ? 'other-month' : ''}`}
                            style={{ animationDelay: `${idx * 12}ms` }}
                        >
                            <span className="text-sm font-medium">{cell.day}</span>
                            {count > 0 && cell.currentMonth && (
                                <div className="flex gap-0.5 mt-1">
                                    {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
                                        <span
                                            key={i}
                                            className="density-dot"
                                            style={{
                                                backgroundColor:
                                                    count > 3
                                                        ? '#fa8072'
                                                        : count > 1
                                                          ? '#89cff0'
                                                          : '#98ff98',
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                    <span className="density-dot" style={{ backgroundColor: '#98ff98' }} />
                    <span>1 toplantı</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="density-dot" style={{ backgroundColor: '#89cff0' }} />
                    <span>2-3 toplantı</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="density-dot" style={{ backgroundColor: '#fa8072' }} />
                    <span>4+ toplantı</span>
                </div>
            </div>
        </div>
    );
}
