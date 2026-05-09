import bitacoraService from '../services/bitacora.service.js';
import storageService from '../services/storage.service.js';

export const getInventario = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantPrisma = req.db;

    const propiedad = await tenantPrisma.propiedades.findUnique({
      where: { id: parseInt(id) },
      include: {
        propiedad_cultivo: {
          include: {
            cultivo: { include: { t_cultivo: true } },
            t_unidades_propiedad_cultivo_superficie_unidad_idTot_unidades: true,
            t_unidades_propiedad_cultivo_cantidad_unidad_idTot_unidades: true,
          }
        },
        propiedad_animales: {
          include: {
            animales: { include: { t_animales: true } },
            t_unidades: true,
          }
        },
        propiedad_hierro: true
      }
    });

    if (!propiedad) {
      return res.status(404).json({ status: 'error', message: 'Propiedad no encontrada' });
    }

    // Formatear la respuesta para el frontend
    const cultivos = propiedad.propiedad_cultivo.map(pc => ({
      id: pc.id,
      propiedad_id: pc.propiedad_id,
      cultivo_id: pc.cultivo_id,
      cultivo: pc.cultivo,
      superficie: pc.superficie,
      superficie_unidad: pc.t_unidades_propiedad_cultivo_superficie_unidad_idTot_unidades,
      cantidad: pc.cantidad,
      cantidad_unidad: pc.t_unidades_propiedad_cultivo_cantidad_unidad_idTot_unidades,
      created_at: pc.created_at
    }));

    const animales = propiedad.propiedad_animales.map(pa => ({
      id: pa.id,
      propiedad_id: pa.propiedad_id,
      animal_id: pa.animal_id,
      animal: pa.animales,
      cantidad: pa.cantidad,
      cantidad_unidad: pa.t_unidades,
      observaciones: pa.observaciones,
      created_at: pa.created_at
    }));

    const hierros = propiedad.propiedad_hierro.map(ph => ({
      id: ph.id,
      propiedad_id: ph.propiedad_id,
      num_reg_hierro: ph.num_reg_hierro,
      num_reg_ganadero: ph.num_reg_ganadero,
      hierro_img_url: ph.hierro_img_url,
      created_at: ph.created_at
    }));

    res.json({
      status: 'success',
      data: {
        cultivos,
        animales,
        hierros
      }
    });

  } catch (error) {
    console.error('Error obteniendo inventario:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

export const addCultivo = async (req, res) => {
  try {
    const { id } = req.params; // propiedad_id
    const { cultivo_id, superficie, superficie_unidad_id, cantidad, cantidad_unidad_id } = req.body;
    const tenantPrisma = req.db;

    const newCultivo = await tenantPrisma.propiedad_cultivo.create({
      data: {
        propiedad_id: parseInt(id),
        cultivo_id: parseInt(cultivo_id),
        superficie: superficie ? parseFloat(superficie) : null,
        superficie_unidad_id: superficie_unidad_id ? parseInt(superficie_unidad_id) : null,
        cantidad: cantidad ? parseFloat(cantidad) : null,
        cantidad_unidad_id: cantidad_unidad_id ? parseInt(cantidad_unidad_id) : null,
      },
      include: {
        cultivo: { include: { t_cultivo: true } },
        t_unidades_propiedad_cultivo_superficie_unidad_idTot_unidades: true,
        t_unidades_propiedad_cultivo_cantidad_unidad_idTot_unidades: true,
      }
    });

    bitacoraService.registrar({
      req,
      accion: 'AGREGAR_CULTIVO_PROPIEDAD',
      modulo: 'Propiedades',
      payload_nuevo: newCultivo
    });

    res.status(201).json({ status: 'success', data: newCultivo, message: 'Cultivo añadido exitosamente' });
  } catch (error) {
    console.error('Error añadiendo cultivo:', error.message || error);
    res.status(500).json({ status: 'error', message: 'Error al añadir cultivo', error: error.message });
  }
};

export const removeCultivo = async (req, res) => {
  try {
    const { inventario_id } = req.params;
    const tenantPrisma = req.db;

    const deleted = await tenantPrisma.propiedad_cultivo.delete({
      where: { id: parseInt(inventario_id) }
    });

    bitacoraService.registrar({
      req,
      accion: 'ELIMINAR_CULTIVO_PROPIEDAD',
      modulo: 'Propiedades',
      payload_previo: deleted
    });

    res.json({ status: 'success', message: 'Cultivo removido exitosamente' });
  } catch (error) {
    console.error('Error removiendo cultivo:', error);
    res.status(500).json({ status: 'error', message: 'Error al remover cultivo' });
  }
};

export const addAnimal = async (req, res) => {
  try {
    const { id } = req.params; // propiedad_id
    const { animal_id, cantidad, cantidad_unidad_id, observaciones } = req.body;
    const tenantPrisma = req.db;

    const newAnimal = await tenantPrisma.propiedad_animales.create({
      data: {
        propiedad_id: parseInt(id),
        animal_id: parseInt(animal_id),
        cantidad: cantidad ? parseFloat(cantidad) : null,
        cantidad_unidad_id: cantidad_unidad_id ? parseInt(cantidad_unidad_id) : null,
        observaciones: observaciones || null
      },
      include: {
        animales: { include: { t_animales: true } },
        t_unidades: true,
      }
    });

    bitacoraService.registrar({
      req,
      accion: 'AGREGAR_ANIMAL_PROPIEDAD',
      modulo: 'Propiedades',
      payload_nuevo: newAnimal
    });

    res.status(201).json({ status: 'success', data: newAnimal, message: 'Animal añadido exitosamente' });
  } catch (error) {
    console.error('Error añadiendo animal:', error);
    res.status(500).json({ status: 'error', message: 'Error al añadir animal' });
  }
};

export const removeAnimal = async (req, res) => {
  try {
    const { inventario_id } = req.params;
    const tenantPrisma = req.db;

    const deleted = await tenantPrisma.propiedad_animales.delete({
      where: { id: parseInt(inventario_id) }
    });

    bitacoraService.registrar({
      req,
      accion: 'ELIMINAR_ANIMAL_PROPIEDAD',
      modulo: 'Propiedades',
      payload_previo: deleted
    });

    res.json({ status: 'success', message: 'Animal removido exitosamente' });
  } catch (error) {
    console.error('Error removiendo animal:', error);
    res.status(500).json({ status: 'error', message: 'Error al remover animal' });
  }
};

export const addHierro = async (req, res) => {
  try {
    const { id } = req.params; // propiedad_id
    const { num_reg_hierro, num_reg_ganadero } = req.body;
    const tenantPrisma = req.db;

    let hierro_img_url = null;
    if (req.file) {
      hierro_img_url = await storageService.uploadImage(req.file.buffer, `hierro-${id}`, 'propiedades');
    }

    const newHierro = await tenantPrisma.propiedad_hierro.create({
      data: {
        propiedad_id: parseInt(id),
        num_reg_hierro: num_reg_hierro || null,
        num_reg_ganadero: num_reg_ganadero || null,
        hierro_img_url: hierro_img_url
      }
    });

    bitacoraService.registrar({
      req,
      accion: 'AGREGAR_HIERRO_PROPIEDAD',
      modulo: 'Propiedades',
      payload_nuevo: newHierro
    });

    res.status(201).json({ status: 'success', data: newHierro, message: 'Hierro añadido exitosamente' });
  } catch (error) {
    console.error('Error añadiendo hierro:', error);
    res.status(500).json({ status: 'error', message: 'Error al añadir hierro' });
  }
};

export const removeHierro = async (req, res) => {
  try {
    const { inventario_id } = req.params;
    const tenantPrisma = req.db;

    const deleted = await tenantPrisma.propiedad_hierro.delete({
      where: { id: parseInt(inventario_id) }
    });

    if (deleted.hierro_img_url) {
      await storageService.deleteFile(deleted.hierro_img_url);
    }

    bitacoraService.registrar({
      req,
      accion: 'ELIMINAR_HIERRO_PROPIEDAD',
      modulo: 'Propiedades',
      payload_previo: deleted
    });

    res.json({ status: 'success', message: 'Hierro removido exitosamente' });
  } catch (error) {
    console.error('Error removiendo hierro:', error);
    res.status(500).json({ status: 'error', message: 'Error al remover hierro' });
  }
};
