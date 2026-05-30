/**
 * Utility to synchronize status across Propiedades, Solicitudes, Planificaciones and Inspecciones.
 */

// Helper to map Inspeccion/Planificacion/Solicitud status to Propiedad status
export function mapStatusToPropiedad(status) {
  if (!status) return 'ACTIVA';
  const s = status.toUpperCase();
  switch (s) {
    case 'FINALIZADA':
    case 'NO_ATENDIDA':
    case 'RECHAZADA':
    case 'CANCELADA':
      return 'ACTIVA';
    case 'CUARENTENA':
      return 'CUARENTENA';
    case 'NO_APROBADA':
      return 'NO_APROBADA';
    case 'SEGUIMIENTO':
      return 'SEGUIMIENTO';
    case 'PENDIENTE':
    case 'INSPECCIONANDO':
    case 'PLANIFICADA':
      return 'EN_PROCESO_INSPECCION';
    case 'CREADA':
    case 'DIAGNOSTICADA':
      return 'SOLICITUD_EN_PROCESO';
    default:
      return 'ACTIVA';
  }
}

// 1. Sync when Solicitud is updated
export async function syncFromSolicitud(tx, solicitudId, estatus) {
  if (!estatus) return;
  const upperEstatus = estatus.toUpperCase();

  // Find associated planificacion and propiedad
  const solicitud = await tx.solicitudes.findUnique({
    where: { id: Number(solicitudId) },
    include: { planificaciones: true }
  });

  if (!solicitud) return;

  // Propagate to Propiedad
  if (solicitud.propiedad_id) {
    const propStatus = mapStatusToPropiedad(upperEstatus);
    await tx.propiedades.update({
      where: { id: solicitud.propiedad_id },
      data: { status: propStatus }
    });
  }

  // Propagate to Planificacion (if exists)
  if (solicitud.planificaciones) {
    let planStatus = null;
    if (['PENDIENTE', 'INSPECCIONANDO', 'FINALIZADA', 'NO_APROBADA', 'SEGUIMIENTO', 'CUARENTENA', 'NO_ATENDIDA'].includes(upperEstatus)) {
      planStatus = upperEstatus;
    } else if (upperEstatus === 'PLANIFICADA') {
      planStatus = 'PENDIENTE';
    } else if (['CREADA', 'DIAGNOSTICADA'].includes(upperEstatus)) {
      planStatus = 'PENDIENTE';
    }

    if (planStatus) {
      await tx.planificaciones.update({
        where: { id: solicitud.planificaciones.id },
        data: { status: planStatus }
      });

      // Also propagate to Inspecciones linked to this planificacion (if any)
      await tx.inspecciones.updateMany({
        where: { planificacion_id: solicitud.planificaciones.id },
        data: { status: planStatus }
      });
    }
  }
}

// 2. Sync when Planificacion is created or updated
export async function syncFromPlanificacion(tx, planificacionId, status) {
  if (!status) return;
  const upperStatus = status.toUpperCase();

  const plan = await tx.planificaciones.findUnique({
    where: { id: Number(planificacionId) },
    include: { solicitudes: true }
  });

  if (!plan) return;

  // Planificacion status to Solicitud estatus mapping
  const solEstatus = upperStatus === 'PENDIENTE' ? 'PLANIFICADA' : upperStatus;
  await tx.solicitudes.update({
    where: { id: plan.solicitud_id },
    data: { estatus: solEstatus }
  });

  // Propagate to Propiedad
  if (plan.solicitudes?.propiedad_id) {
    const propStatus = mapStatusToPropiedad(solEstatus);
    await tx.propiedades.update({
      where: { id: plan.solicitudes.propiedad_id },
      data: { status: propStatus }
    });
  }

  // Propagate to Inspecciones linked to this planificacion
  await tx.inspecciones.updateMany({
    where: { planificacion_id: Number(planificacionId) },
    data: { status: upperStatus }
  });
}

// 3. Sync when Inspeccion is created or updated (or Acta Silo is created)
export async function syncFromInspeccion(tx, planificacionId, status) {
  if (!status) return;
  const upperStatus = status.toUpperCase();

  // Find the planificacion to get the solicitud
  const plan = await tx.planificaciones.findUnique({
    where: { id: Number(planificacionId) },
    include: { solicitudes: true }
  });

  if (!plan) return;

  // Update Planificacion status
  await tx.planificaciones.update({
    where: { id: Number(planificacionId) },
    data: { status: upperStatus }
  });

  // Update Solicitud estatus
  const solEstatus = upperStatus === 'PENDIENTE' ? 'PLANIFICADA' : upperStatus;
  await tx.solicitudes.update({
    where: { id: plan.solicitud_id },
    data: { estatus: solEstatus }
  });

  // Update Propiedad status
  if (plan.solicitudes?.propiedad_id) {
    const propStatus = mapStatusToPropiedad(solEstatus);
    await tx.propiedades.update({
      where: { id: plan.solicitudes.propiedad_id },
      data: { status: propStatus }
    });
  }
}

// 4. Revert status when Planificacion is deleted
export async function syncOnPlanificacionDelete(tx, solicitudId, propiedadId) {
  if (solicitudId) {
    await tx.solicitudes.update({
      where: { id: Number(solicitudId) },
      data: { estatus: 'CREADA' }
    });
  }
  if (propiedadId) {
    await tx.propiedades.update({
      where: { id: Number(propiedadId) },
      data: { status: 'SOLICITUD_EN_PROCESO' }
    });
  }
}

// 5. Revert status when Inspeccion or Acta Silo is deleted
export async function syncOnInspeccionDelete(tx, planificacionId) {
  if (!planificacionId) return;

  const plan = await tx.planificaciones.findUnique({
    where: { id: Number(planificacionId) },
    select: { solicitud_id: true }
  });

  await tx.planificaciones.update({
    where: { id: Number(planificacionId) },
    data: { status: 'PENDIENTE' }
  });

  if (plan) {
    await tx.solicitudes.update({
      where: { id: plan.solicitud_id },
      data: { estatus: 'PLANIFICADA' }
    });

    const solicitud = await tx.solicitudes.findUnique({
      where: { id: plan.solicitud_id },
      select: { propiedad_id: true }
    });

    if (solicitud?.propiedad_id) {
      await tx.propiedades.update({
        where: { id: solicitud.propiedad_id },
        data: { status: 'EN_PROCESO_INSPECCION' }
      });
    }
  }
}

export async function syncOnActaSiloDelete(tx, planificacionId) {
  await syncOnInspeccionDelete(tx, planificacionId);
}
