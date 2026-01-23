const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Resistors', slug: 'resistors' },
    { name: 'Capacitors', slug: 'capacitors' },
    { name: 'Integrated Circuits', slug: 'integrated-circuits' },
    { name: 'Cables & Connectors', slug: 'cables-connectors' }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
  }

  console.log('Seed complete');
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
