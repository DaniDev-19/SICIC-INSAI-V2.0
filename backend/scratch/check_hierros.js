import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:123456@localhost:5432/db_insai_operativa?schema=public"
    }
  }
});

async function main() {
  const hierros = await prisma.propiedad_hierro.findMany();
  console.log(JSON.stringify(hierros, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
