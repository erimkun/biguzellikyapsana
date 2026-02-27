import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding rooms...');

    const rooms = [
        { id: 1, name: 'Toplantı Odası 1', capacity: 10, color: 'blue' },
        { id: 2, name: 'Toplantı Odası (Zemin)', capacity: 8, color: 'red' },
        { id: 3, name: 'Toplantı Odası (Yönetim)', capacity: 12, color: 'yellow' },
    ];

    for (const r of rooms) {
        await prisma.room.upsert({
            where: { id: r.id },
            update: { name: r.name, capacity: r.capacity, color: r.color },
            create: { id: r.id, name: r.name, capacity: r.capacity, color: r.color },
        });
    }

    console.log('Rooms seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
