import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = parseInt(params.id);

    try {
        const booking = await prisma.booking.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
        return NextResponse.json(booking);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
    }
}
