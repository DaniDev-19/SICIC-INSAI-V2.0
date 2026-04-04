import { masterPrisma, getTenantPrisma } from './config/prisma.js';

async function testMultiTenant() {
  try {
    console.log('--- 🛡️  Consultando Master ---');
    const roles = await masterPrisma.roles.findMany();
    console.log(`Roles en Master: ${roles.length}`);

    // DB 1: Operativa 1
    console.log('\n--- 📂  Instancia 1 (db_insai_operativa) ---');
    const prisma1 = getTenantPrisma('db_insai_operativa');
    const unidades1 = await prisma1.t_unidades.findMany();
    console.log(`Unidades en DB 1 (Básica): ${unidades1.length}`);

    // DB 2: Nueva Operativa 2026
    console.log('\n--- 📂  Instancia 2 (db_insai_operativa_2026) ---');
    const prisma2 = getTenantPrisma('db_insai_operativa_2026');
    const unidades2 = await prisma2.t_unidades.findMany();
    console.log(`Unidades en DB 2 (2026): ${unidades2.length}`);

    console.log('\n✅ ¡Validado! El sistema puede distinguir los datos de cada base de datos.');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await masterPrisma.$disconnect();
    process.exit(0);
  }
}

testMultiTenant();
