import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    try {
        const where = date ? {
            startTime: {
                gte: new Date(`${date}T00:00:00.000Z`),
                lte: new Date(`${date}T23:59:59.999Z`),
            },
        } : {};

        const bookings = await prisma.booking.findMany({
            where,
            orderBy: { startTime: 'asc' },
        });
        return NextResponse.json(bookings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, ownerName, startTime, endTime, notes } = body;

        // Validation: Check for overlaps
        const overlap = await prisma.booking.findFirst({
            where: {
                status: 'ACTIVE',
                OR: [
                    {
                        startTime: { lt: new Date(endTime) },
                        endTime: { gt: new Date(startTime) },
                    },
                ],
            },
        });

        if (overlap) {
            return NextResponse.json({ error: 'Time slot already booked' }, { status: 400 });
        }

        const booking = await prisma.booking.create({
            data: {
                title,
                ownerName,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                notes,
                status: 'ACTIVE',
            },
        });

        return NextResponse.json(booking);
    } catch (error) {
        console.error('Booking error:', error);
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }
}
