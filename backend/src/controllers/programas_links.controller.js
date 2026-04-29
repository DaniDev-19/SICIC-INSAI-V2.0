import bitacoraService from '../services/bitacora.service.js';

const linkItems = async (req, res, modelName, idField, moduloName) => {
  const tenantPrisma = req.db;
  const { programa_id, item_ids } = req.body;

  const data = item_ids.map(id => ({
    programa_id,
    [idField]: id
  }));

  const created = await tenantPrisma[modelName].createMany({
    data,
    skipDuplicates: true
  });

  bitacoraService.registrar({
    req,
    accion: 'VINCULAR',
    modulo: moduloName,
    payload_nuevo: data
  });

  res.status(201).json({
    status: 'success',
    message: `Se vincularon ${created.count} elementos al programa.`,
    data: created
  });
};

const unlinkItem = async (req, res, modelName, idField, moduloName) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const toDelete = await tenantPrisma[modelName].findUnique({ where: { id: Number(id) } });
  if (!toDelete) {
    return res.status(404).json({ status: 'error', message: 'Vínculo no encontrado' });
  }

  await tenantPrisma[modelName].delete({ where: { id: Number(id) } });

  bitacoraService.registrar({
    req,
    accion: 'DESVINCULAR',
    modulo: moduloName,
    payload_previo: toDelete
  });

  res.status(200).json({ status: 'success', message: 'Vínculo eliminado exitosamente' });
};

export const linkPlagas = (req, res) => linkItems(req, res, 'programa_plaga', 'plaga_id', 'Programas - Plagas');
export const unlinkPlaga = (req, res) => unlinkItem(req, res, 'programa_plaga', 'plaga_id', 'Programas - Plagas');

export const linkCultivos = (req, res) => linkItems(req, res, 'programa_cultivo', 'cultivo_id', 'Programas - Cultivos');
export const unlinkCultivo = (req, res) => unlinkItem(req, res, 'programa_cultivo', 'cultivo_id', 'Programas - Cultivos');

export const linkAnimales = (req, res) => linkItems(req, res, 'programa_animales', 'animal_id', 'Programas - Animales');
export const unlinkAnimal = (req, res) => unlinkItem(req, res, 'programa_animales', 'animal_id', 'Programas - Animales');

export const linkEnfermedades = (req, res) => linkItems(req, res, 'programa_enfermedades', 'enfermedad_id', 'Programas - Enfermedades');
export const unlinkEnfermedad = (req, res) => unlinkItem(req, res, 'programa_enfermedades', 'enfermedad_id', 'Programas - Enfermedades');
