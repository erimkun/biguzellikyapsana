import { create } from 'zustand';

interface AppState {
    selectedDate: Date;
    view: 'month' | 'day';
    isBookingModalOpen: boolean;
    selectedTimeSlot: string | null;

    setSelectedDate: (date: Date) => void;
    setView: (view: 'month' | 'day') => void;
    setBookingModalOpen: (open: boolean) => void;
    setSelectedTimeSlot: (time: string | null) => void;

    goToNextMonth: () => void;
    goToPrevMonth: () => void;
    goToToday: () => void;
    selectDayAndOpenDayView: (day: number) => void;
}

export const useStore = create<AppState>((set, get) => ({
    selectedDate: new Date(),
    view: 'month',
    isBookingModalOpen: false,
    selectedTimeSlot: null,

    setSelectedDate: (date) => set({ selectedDate: date }),

    setView: (view) => {
        const current = get().view;
        if (current !== view) {
            set({ view });
        }
    },

    setBookingModalOpen: (open) => set({
        isBookingModalOpen: open,
        selectedTimeSlot: open ? get().selectedTimeSlot : null,
    }),
    setSelectedTimeSlot: (time) => set({ selectedTimeSlot: time }),

    goToNextMonth: () => set((state) => {
        const d = new Date(state.selectedDate);
        d.setMonth(d.getMonth() + 1);
        return { selectedDate: d };
    }),

    goToPrevMonth: () => set((state) => {
        const d = new Date(state.selectedDate);
        d.setMonth(d.getMonth() - 1);
        return { selectedDate: d };
    }),

    goToToday: () => {
        const state = get();
        if (state.view !== 'month') {
            set({ selectedDate: new Date(), view: 'month' });
        } else {
            set({ selectedDate: new Date() });
        }
    },

    selectDayAndOpenDayView: (day: number) => {
        const d = new Date(get().selectedDate);
        d.setDate(day);
        set({ selectedDate: d, view: 'day' });
    },
}));
