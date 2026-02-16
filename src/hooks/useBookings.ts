import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Booking {
    id: number;
    title: string;
    ownerName: string;
    startTime: string;
    endTime: string;
    notes?: string;
    status: 'ACTIVE' | 'CANCELLED';
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

export function useCreateBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newBooking: Omit<Booking, 'id' | 'status'>) => {
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
