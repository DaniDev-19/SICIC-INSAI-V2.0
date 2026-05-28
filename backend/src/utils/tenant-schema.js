export async function ensureAreasInspeccionColumn(tenantPrisma) {
  await tenantPrisma.$executeRawUnsafe(`
    ALTER TABLE inspecciones
    ADD COLUMN IF NOT EXISTS areas_inspeccion JSONB DEFAULT '[]'::jsonb
  `);
}
