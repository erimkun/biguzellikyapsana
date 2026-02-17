'use client';

import { useStore } from '@/lib/store';
import BookingModal from '@/components/ui/BookingModal';
import Calendar3DBook from '@/components/ui/Calendar3DBook';
import ParticleOverlay from '@/components/canvas/ParticleOverlay';

export default function Home() {
    const { isBookingModalOpen, goToToday } = useStore();

    return (
        <>
            <div
                className="fixed inset-0 -z-30"
                style={{
                    background: 'radial-gradient(circle at 50% 35%, #FAEEEB 0%, #FBE8E2 36%, #F4D6D0 68%, #EEDFE3 100%)',
                }}
            />
            <div
                className="fixed inset-0 -z-20"
                style={{
                    backgroundImage: "url('/bg.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: 0.92,
                }}
            />
            <div
                className="fixed inset-0 -z-10 pointer-events-none"
                style={{
                    backgroundImage: "url('/bg.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: 'blur(6px)',
                    opacity: 0.18,
                    transform: 'scale(1.03)',
                }}
            />
            <ParticleOverlay />

            <main className="relative z-10 min-h-screen flex flex-col items-center p-4 sm:p-8">
                {/* Header */}
                <header className="w-full max-w-2xl mb-8 animate-fadeIn">
                    <div className="clay-card p-5 sm:p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-300 to-purple-300 flex items-center justify-center shadow-inner shrink-0">
                                <span className="text-xl">📅</span>
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                                    Kentaş Toplantı Odası
                                </h1>
                                <p className="text-xs text-gray-400">
                                    Toplantı Rezervasyon Sistemi
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={goToToday}
                            className="clay-button clay-button-ghost text-sm hidden sm:block"
                        >
                            Bugün
                        </button>
                    </div>
                </header>

                {/* 3D Calendar */}
                <div className="w-full max-w-2xl flex-1 pt-4">
                    <Calendar3DBook />
                </div>

                {/* Footer */}
                <footer className="w-full max-w-2xl mt-8 mb-4 text-center animate-fadeIn">
                    <p className="text-xs text-gray-400">
                        Çalışma saatleri: 08:30 – 17:00 • Kentaş Meeting Room
                    </p>
                </footer>
            </main>

            {isBookingModalOpen && <BookingModal />}
        </>
    );
}
