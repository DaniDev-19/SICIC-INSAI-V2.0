export async function ensureAreasInspeccionColumn(tenantPrisma) {
  await tenantPrisma.$executeRawUnsafe(`
    ALTER TABLE inspecciones
    ADD COLUMN IF NOT EXISTS areas_inspeccion JSONB DEFAULT '[]'::jsonb
  `);
}

export async function ensureClientesNullableFields(tenantPrisma) {
  try {
    // Saneamiento de cadenas vacías para campos opcionales con restricción UNIQUE
    await tenantPrisma.$executeRawUnsafe(`
      UPDATE clientes 
      SET codigo_runsai = NULL 
      WHERE codigo_runsai IS NOT NULL AND TRIM(codigo_runsai) = '';
    `);
    await tenantPrisma.$executeRawUnsafe(`
      UPDATE clientes 
      SET email = NULL 
      WHERE email IS NOT NULL AND TRIM(email) = '';
    `);
  } catch (err) {
    console.warn('[tenant-schema] Advertencia al sanear clientes:', err.message);
  }
}

