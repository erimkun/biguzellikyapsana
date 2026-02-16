'use client';

import Scene from '@/components/canvas/Scene';
import Calendar3D from '@/components/canvas/Calendar3D';
import { useStore } from '@/lib/store';
import BookingModal from '@/components/ui/BookingModal';

export default function Home() {
  const { selectedDate, setSelectedDate, view, setView, isBookingModalOpen } = useStore();

  return (
    <main className="relative min-h-screen">
      <Scene>
        <Calendar3D />
      </Scene>

      {/* HTML UI Overlay Layer */}
      <div className="relative z-10 pointer-events-none p-8 flex flex-col items-center min-h-screen">
        <header className="w-full max-w-4xl flex justify-between items-center bg-white/30 backdrop-blur-md p-6 rounded-3xl clay-card pointer-events-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Kentaş Meeting Room</h1>
            <p className="text-gray-600">Soft & Tactile Booking Experience</p>
          </div>
          <button className="clay-button clay-button-primary">
            My Bookings
          </button>
        </header>

        <div className="flex-1" />

        <footer className="w-full max-w-md bg-white/30 backdrop-blur-md p-6 rounded-3xl clay-card mb-8 pointer-events-auto flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">
            {selectedDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric', day: view === 'day' ? 'numeric' : undefined })}
          </h2>
          <div className="flex gap-4">
            <button
              className={`clay-button ${view === 'month' ? 'clay-button-primary' : ''}`}
              onClick={() => setView('month')}
            >
              Month View
            </button>
            <button
              className={`clay-button ${view === 'day' ? 'clay-button-primary' : ''}`}
              onClick={() => setView('day')}
            >
              Day View
            </button>
          </div>
        </footer>
      </div>

      {isBookingModalOpen && <BookingModal />}
    </main>
  );
}
