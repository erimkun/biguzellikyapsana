'use client';

import { useStore } from '@/lib/store';
import { useCreateBooking } from '@/hooks/useBookings';
import { useState } from 'react';

export default function BookingModal() {
    const { selectedDate, setBookingModalOpen } = useStore();
    const createBooking = useCreateBooking();

    const [formData, setFormData] = useState({
        title: '',
        ownerName: '',
        duration: '60',
        startTime: '09:00',
        notes: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dateStr = selectedDate.toISOString().split('T')[0];
        const start = new Date(`${dateStr}T${formData.startTime}:00.000Z`);
        const end = new Date(start.getTime() + parseInt(formData.duration) * 60000);

        try {
            await createBooking.mutateAsync({
                title: formData.title,
                ownerName: formData.ownerName,
                startTime: start.toISOString(),
                endTime: end.toISOString(),
                notes: formData.notes,
            });
            setBookingModalOpen(false);
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-[32px] clay-card w-full max-w-md pointer-events-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">New Booking</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 ml-1 mb-1">Meeting Title</label>
                        <input
                            required
                            className="w-full p-3 rounded-2xl border-none bg-gray-100 focus:ring-2 focus:ring-blue-300 outline-none"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 ml-1 mb-1">Your Name</label>
                        <input
                            required
                            className="w-full p-3 rounded-2xl border-none bg-gray-100 focus:ring-2 focus:ring-blue-300 outline-none"
                            value={formData.ownerName}
                            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 ml-1 mb-1">Start Time</label>
                            <input
                                type="time"
                                className="w-full p-3 rounded-2xl border-none bg-gray-100 outline-none"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 ml-1 mb-1">Duration (min)</label>
                            <select
                                className="w-full p-3 rounded-2xl border-none bg-gray-100 outline-none"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            >
                                <option value="30">30 min</option>
                                <option value="60">1 hour</option>
                                <option value="90">1.5 hours</option>
                                <option value="120">2 hours</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            className="flex-1 clay-button"
                            onClick={() => setBookingModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 clay-button clay-button-primary"
                            disabled={createBooking.isPending}
                        >
                            {createBooking.isPending ? 'Booking...' : 'Confirm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
