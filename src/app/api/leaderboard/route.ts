import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const topScores = await prisma.leaderboard.findMany({
            orderBy: {
                score: 'desc',
            },
            take: 5,
        });

        return NextResponse.json(topScores);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, score } = body;

        if (!name || typeof score !== 'number') {
            return NextResponse.json({ error: 'Invalid name or score' }, { status: 400 });
        }

        const newEntry = await prisma.leaderboard.create({
            data: {
                name,
                score,
            },
        });

        return NextResponse.json(newEntry, { status: 201 });
    } catch (error) {
        console.error('Error saving score:', error);
        return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
    }
}
