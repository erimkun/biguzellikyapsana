'use client';

import { useStore } from '@/lib/store';
import CalendarMonth from './CalendarMonth';
import DayTimeline from './DayTimeline';

export default function Calendar3DBook() {
    const { view } = useStore();

    return (
        <div className="calendar-3d-scene">
            {/* Stacked page layers behind (depth effect) */}
            <div className="calendar-3d-stack">
                <div className="calendar-stack-page calendar-stack-3" />
                <div className="calendar-stack-page calendar-stack-2" />
                <div className="calendar-stack-page calendar-stack-1" />
            </div>

            {/* Spiral binding */}
            <div className="calendar-spiral">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="spiral-ring">
                        <div className="spiral-ring-inner" />
                    </div>
                ))}
            </div>

            {/* Main calendar body */}
            <div className={`calendar-3d-body ${view === 'day' ? 'is-day' : 'is-month'}`}>
                <div className={`calendar-flip-card-inner ${view === 'day' ? 'is-day' : ''}`}>
                    <div className="calendar-page calendar-page-base calendar-face calendar-face-front h-full">
                        <div className="calendar-page-content h-full min-h-0">
                            <CalendarMonth />
                        </div>
                    </div>

                    <div className="calendar-page calendar-page-base calendar-face calendar-face-back h-full">
                        <div className="calendar-page-content h-full min-h-0">
                            <DayTimeline />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom edge / base of the calendar */}
            <div className="calendar-3d-base" />
        </div>
    );
}
