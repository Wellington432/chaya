const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const defaultSchool = await prisma.school.upsert({
    where: { code: 'YARI001' },
    update: { name: 'YARI Escola Padrão', active: true },
    create: {
      name: 'YARI Escola Padrão',
      code: 'YARI001',
      active: true
    }
  });

  const adminPassword = await bcrypt.hash('Admin@123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@yari.local' },
    update: {
      name: 'Administrador YARI',
      passwordHash: adminPassword,
      role: 'ADMIN',
      schoolId: defaultSchool.id
    },
    create: {
      email: 'admin@yari.local',
      name: 'Administrador YARI',
      passwordHash: adminPassword,
      role: 'ADMIN',
      schoolId: defaultSchool.id
    }
  });

  const supportPassword = await bcrypt.hash('Support@123', 10);
  await prisma.user.upsert({
    where: { email: 'support@yari.local' },
    update: {
      name: 'Support YARI',
      passwordHash: supportPassword,
      schoolId: defaultSchool.id
    },
    create: {
      email: 'support@yari.local',
      name: 'Support YARI',
      passwordHash: supportPassword,
      role: 'USER',
      schoolId: defaultSchool.id
    }
  });

  console.log('Seed concluído com sucesso.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
