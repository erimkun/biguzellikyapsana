import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    try {
        let where: Record<string, unknown> = {};

        if (date) {
            where.startTime = {
                gte: new Date(`${date}T00:00:00.000Z`),
                lte: new Date(`${date}T23:59:59.999Z`),
            };
        } else if (start && end) {
            where.startTime = {
                gte: new Date(`${start}T00:00:00.000Z`),
                lte: new Date(`${end}T23:59:59.999Z`),
            };
        }

        const bookings = await prisma.booking.findMany({
            where,
            include: { room: true },
            orderBy: { startTime: 'asc' },
        });
        return NextResponse.json(bookings);
    } catch (error) {
        console.error('Fetch bookings error:', error);
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, ownerName, startTime, endTime, notes, roomId } = body;

        // Validate required fields
        if (!title || !ownerName || !startTime || !endTime || !roomId) {
            return NextResponse.json({ error: 'Tüm zorunlu alanlar doldurulmalıdır' }, { status: 400 });
        }

        const startDt = new Date(startTime);
        const endDt = new Date(endTime);

        // Validate operating hours (08:30 - 17:00)
        const startHour = startDt.getUTCHours() + startDt.getUTCMinutes() / 60;
        const endHour = endDt.getUTCHours() + endDt.getUTCMinutes() / 60;

        if (startHour < 8.5 || endHour > 17) {
            return NextResponse.json({ error: 'Toplantılar 08:30 - 17:00 arasında olmalıdır' }, { status: 400 });
        }

        // Validation: Check for overlaps with ACTIVE bookings
        const overlap = await prisma.booking.findFirst({
            where: {
                status: 'ACTIVE',
                roomId: Number(roomId),
                startTime: { lt: endDt },
                endTime: { gt: startDt },
            },
        });

        if (overlap) {
            return NextResponse.json({ error: 'Bu zaman dilimi başka bir toplantı ile çakışıyor' }, { status: 400 });
        }

        const booking = await prisma.booking.create({
            data: {
                title,
                ownerName,
                startTime: startDt,
                endTime: endDt,
                notes: notes || null,
                status: 'ACTIVE',
                roomId: Number(roomId),
            },
            include: { room: true },
        });

        return NextResponse.json(booking);
    } catch (error) {
        console.error('Booking error:', error);
        return NextResponse.json({ error: 'Toplantı oluşturulamadı' }, { status: 500 });
    }
}
