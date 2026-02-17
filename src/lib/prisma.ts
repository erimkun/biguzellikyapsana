import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'node:fs';
import path from 'node:path';

function readEnvVercelFile(): string | undefined {
    const candidates = [
        path.join(process.cwd(), 'env.vercel'),
        path.join(process.cwd(), '.env.vercel'),
        path.join(process.cwd(), '..', 'env.vercel'),
        path.join(process.cwd(), '..', '.env.vercel'),
    ];

    for (const filePath of candidates) {
        if (!fs.existsSync(filePath)) continue;

        const content = fs.readFileSync(filePath, 'utf8');
        for (const line of content.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            const match = trimmed.match(/^(DATABASE_URL|POSTGRES_PRISMA_URL|POSTGRES_URL)\s*=\s*(.+)$/);
            if (!match) continue;

            const value = match[2].trim().replace(/^['\"]|['\"]$/g, '');
            if (value) return value;
        }
    }

    return undefined;
}

function resolveConnectionString(): string | undefined {
    return (
        process.env.DATABASE_URL ??
        process.env.POSTGRES_PRISMA_URL ??
        process.env.POSTGRES_URL ??
        readEnvVercelFile()
    );
}

const prismaClientSingleton = () => {
    const connectionString = resolveConnectionString();

    if (!connectionString) {
        throw new Error('DATABASE_URL/POSTGRES_PRISMA_URL/POSTGRES_URL is not set');
    }

    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
