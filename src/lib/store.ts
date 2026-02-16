import { create } from 'zustand';

interface AppState {
    selectedDate: Date;
    view: 'month' | 'day';
    setSelectedDate: (date: Date) => void;
    setView: (view: 'month' | 'day') => void;
    isBookingModalOpen: boolean;
    setBookingModalOpen: (open: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
    selectedDate: new Date(),
    view: 'month',
    setSelectedDate: (date) => set({ selectedDate: date }),
    setView: (view) => set({ view }),
    isBookingModalOpen: false,
    setBookingModalOpen: (open) => set({ isBookingModalOpen: open }),
}));
