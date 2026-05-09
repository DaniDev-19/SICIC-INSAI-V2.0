
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://postgres:123456@localhost:5432/db_insai_operativa?schema=public" 
      }
    }
  });

  try {
    const clientes = await prisma.clientes.findMany();
    console.log("CLIENTES EN DB:", JSON.stringify(clientes, null, 2));
    
    const propiedades = await prisma.propiedades.findMany({
      include: { clientes: true }
    });
    console.log("PROPIEDADES EN DB:", JSON.stringify(propiedades, null, 2));

  } catch (error) {
    console.error("ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
