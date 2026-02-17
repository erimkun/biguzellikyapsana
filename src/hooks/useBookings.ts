import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Booking {
    id: number;
    title: string;
    ownerName: string;
    startTime: string;
    endTime: string;
    notes?: string;
    status: 'ACTIVE' | 'CANCELLED';
    createdAt: string;
}

export function useBookings(date?: string) {
    return useQuery<Booking[]>({
        queryKey: ['bookings', date],
        queryFn: async () => {
            const url = date ? `/api/bookings?date=${date}` : '/api/bookings';
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch bookings');
            return res.json();
        },
    });
}

export function useMonthBookings(year: number, month: number) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const start = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
    const end = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    return useQuery<Booking[]>({
        queryKey: ['bookings', 'month', year, month],
        queryFn: async () => {
            const res = await fetch(`/api/bookings?start=${start}&end=${end}`);
            if (!res.ok) throw new Error('Failed to fetch bookings');
            return res.json();
        },
    });
}

export function useCreateBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newBooking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBooking),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to create booking');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });
}

export function useCancelBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/bookings/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to cancel booking');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });
}
