'use client';

import { useStore } from '@/lib/store';
import { useCreateBooking } from '@/hooks/useBookings';
import { useState, useEffect } from 'react';

export default function BookingModal() {
    const { selectedDate, setBookingModalOpen, selectedTimeSlot } = useStore();
    const createBooking = useCreateBooking();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        ownerName: '',
        duration: '60',
        startTime: selectedTimeSlot || '09:00',
        notes: '',
    });

    useEffect(() => {
        if (selectedTimeSlot) {
            setFormData((prev) => ({ ...prev, startTime: selectedTimeSlot }));
        }
    }, [selectedTimeSlot]);

    // Generate time options from 08:30 to 16:30
    const timeOptions: string[] = [];
    for (let h = 8; h <= 16; h++) {
        if (h === 8) {
            timeOptions.push('08:30');
        } else {
            timeOptions.push(`${h.toString().padStart(2, '0')}:00`);
            if (h < 16) {
                timeOptions.push(`${h.toString().padStart(2, '0')}:30`);
            } else {
                timeOptions.push('16:30');
            }
        }
    }

    const computeEnd = () => {
        const [h, m] = formData.startTime.split(':').map(Number);
        const totalMin = h * 60 + m + parseInt(formData.duration);
        const endH = Math.floor(totalMin / 60);
        const endM = totalMin % 60;
        return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    };

    const endTime = computeEnd();
    const endHour = parseInt(endTime.split(':')[0]) + parseInt(endTime.split(':')[1]) / 60;
    const isEndTimeValid = endHour <= 17;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isEndTimeValid) {
            setError('Toplantı 17:00\'dan sonra bitemez. Lütfen süreyi kısaltın.');
            return;
        }

        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        const start = new Date(`${dateStr}T${formData.startTime}:00.000Z`);
        const end = new Date(start.getTime() + parseInt(formData.duration) * 60000);

        try {
            await createBooking.mutateAsync({
                title: formData.title,
                ownerName: formData.ownerName,
                startTime: start.toISOString(),
                endTime: end.toISOString(),
                notes: formData.notes || undefined,
            });
            setSuccess(true);
            setTimeout(() => setBookingModalOpen(false), 1500);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Bir hata oluştu';
            setError(message);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
            onClick={() => setBookingModalOpen(false)}
        >
            <div
                className="bg-white/90 backdrop-blur-xl p-8 rounded-4xl clay-card w-full max-w-md animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                {success ? (
                    <div className="text-center py-8 animate-scaleIn">
                        <div className="success-check mb-4">
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Toplantı Oluşturuldu!
                        </h2>
                        <p className="text-gray-500">
                            {formData.title} • {formData.startTime} – {endTime}
                        </p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-1 text-center text-gray-800">
                            Yeni Toplantı
                        </h2>
                        <p className="text-center text-gray-400 text-sm mb-6">
                            {selectedDate.toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>

                        {error && (
                            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm animate-scaleIn">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 ml-1 mb-1.5">
                                    Toplantı Başlığı *
                                </label>
                                <input
                                    required
                                    placeholder="Haftalık Sync, Sprint Planning..."
                                    className="clay-input"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 ml-1 mb-1.5">
                                    Adınız *
                                </label>
                                <input
                                    required
                                    placeholder="Örn: Ahmet Yılmaz"
                                    className="clay-input"
                                    value={formData.ownerName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, ownerName: e.target.value })
                                    }
                                />
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-600 ml-1 mb-1.5">
                                        Başlangıç
                                    </label>
                                    <select
                                        className="clay-input"
                                        value={formData.startTime}
                                        onChange={(e) =>
                                            setFormData({ ...formData, startTime: e.target.value })
                                        }
                                    >
                                        {timeOptions.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-600 ml-1 mb-1.5">
                                        Süre
                                    </label>
                                    <select
                                        className="clay-input"
                                        value={formData.duration}
                                        onChange={(e) =>
                                            setFormData({ ...formData, duration: e.target.value })
                                        }
                                    >
                                        <option value="30">30 dk</option>
                                        <option value="60">1 saat</option>
                                        <option value="90">1.5 saat</option>
                                        <option value="120">2 saat</option>
                                    </select>
                                </div>
                            </div>

                            <div
                                className={`text-center text-sm py-1.5 px-3 rounded-xl ${isEndTimeValid ? 'text-gray-400 bg-gray-50/50' : 'text-red-500 bg-red-50'}`}
                            >
                                {formData.startTime} → {endTime}
                                {!isEndTimeValid && ' (17:00 sonrası!)'}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 ml-1 mb-1.5">
                                    Notlar
                                </label>
                                <textarea
                                    placeholder="Toplantı hakkında notlar (isteğe bağlı)..."
                                    className="clay-input resize-none"
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({ ...formData, notes: e.target.value })
                                    }
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    className="flex-1 clay-button clay-button-ghost"
                                    onClick={() => setBookingModalOpen(false)}
                                >
                                    Vazgeç
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 clay-button clay-button-primary"
                                    disabled={createBooking.isPending || !isEndTimeValid}
                                >
                                    {createBooking.isPending ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Kaydediliyor...
                                        </span>
                                    ) : (
                                        'Onayla'
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
