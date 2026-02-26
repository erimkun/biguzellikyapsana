'use client';

import Image from 'next/image';
import { useStore } from '@/lib/store';
import BookingModal from '@/components/ui/BookingModal';
import Calendar3DBook from '@/components/ui/Calendar3DBook';
import ParticleOverlay from '@/components/canvas/ParticleOverlay';
import Scene from '@/components/canvas/Scene';

export default function Home() {
    const { isBookingModalOpen, goToToday, isCalendarVisible, setCalendarVisible, triggerClearDrawing } = useStore();

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
            <Scene />

            <main className="relative z-10 min-h-screen flex flex-col items-center p-4 sm:p-8 pointer-events-none">
                {/* Header */}
                <header className="w-full max-w-2xl mb-8 animate-fadeIn pointer-events-auto">
                    <div className="clay-card p-5 sm:p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-800/90 flex items-center justify-center shadow-inner shrink-0 p-2">
                                <Image
                                    src="/KentasLogoWhite.png"
                                    alt="Kentaş Logo"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                    priority
                                />
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

                {/* Toggle Controls */}
                <div className="w-full max-w-2xl flex justify-between items-center px-2 mb-2 animate-fadeIn transition-all pointer-events-auto">
                    {!isCalendarVisible && (
                        <button
                            onClick={triggerClearDrawing}
                            className="clay-button clay-button-ghost text-sm flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Çizimi Temizle
                        </button>
                    )}
                    <button
                        onClick={() => setCalendarVisible(!isCalendarVisible)}
                        className={`clay-button text-sm flex items-center gap-2 z-50 ${!isCalendarVisible ? 'bg-indigo-500/10 border-indigo-200 text-indigo-700 ml-auto' : 'clay-button-ghost ml-auto'}`}
                    >
                        {isCalendarVisible ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                Takvimi Gizle
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                Takvimi Göster
                            </>
                        )}
                    </button>
                </div>

                {/* 3D Calendar */}
                <div className={`w-full max-w-2xl flex-1 pt-4 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform origin-top pointer-events-auto ${isCalendarVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8 pointer-events-none'}`}>
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
