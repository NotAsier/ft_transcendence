"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const guest = await prisma.user.upsert({
        where: { email: 'guest@transcendence.local' },
        update: {},
        create: {
            email: 'guest@transcendence.local',
            username: 'Guest',
            displayName: 'Guest',
            password: null,
        },
    });
    await prisma.channel.upsert({
        where: { name: 'general' },
        update: {},
        create: { name: 'general' },
    });
    console.log('✅ Seed completado:', { guest });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map