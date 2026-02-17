import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
        return NextResponse.json({ error: 'Geçersiz ID' }, { status: 400 });
    }

    try {
        const booking = await prisma.booking.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
        return NextResponse.json(booking);
    } catch (error) {
        console.error('Cancel booking error:', error);
        return NextResponse.json({ error: 'Toplantı iptal edilemedi' }, { status: 500 });
    }
}
