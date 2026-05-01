import { z } from 'zod';

export const createAvalSchema = z.object({
  body: z.object({
    numero_aval: z.string({ required_error: 'El número de aval es requerido' }),
    codigo_predio: z.string().optional().nullable(),
    fecha_emision: z.string().optional().nullable(),
    fecha_vencimiento: z.string().optional().nullable(),
    certificado_vacunacion_n: z.string().optional().nullable(),
    observaciones: z.string().optional().nullable(),
    inspeccion_id: z.number({ required_error: 'La inspección asociada es requerida' }),
    medico_responsable_id: z.number({ required_error: 'El médico responsable es requerido' }),
    jefe_osa_id: z.number({ required_error: 'El jefe de OSA es requerido' }),

    // Hallazgos Bovinos/Bufalinos
    hallazgos_bov_buf: z.object({
      t_toros: z.number().optional().default(0),
      t_vacas: z.number().optional().default(0),
      t_novillos: z.number().optional().default(0),
      t_novillas: z.number().optional().default(0),
      t_mautes_m: z.number().optional().default(0),
      t_mautes_h: z.number().optional().default(0),
      t_becerros: z.number().optional().default(0),
      t_becerras: z.number().optional().default(0),
      t_bufalos: z.number().optional().default(0),
      t_bufalas: z.number().optional().default(0),
      t_buvillos: z.number().optional().default(0),
      t_buvillas: z.number().optional().default(0),
      t_bumautes_m: z.number().optional().default(0),
      t_bumautes_h: z.number().optional().default(0),
      t_bucerros: z.number().optional().default(0),
      t_bucerras: z.number().optional().default(0),
    }).optional(),

    // Otras especies
    hallazgos_otras: z.array(z.object({
      tipo_animal_id: z.number(),
      machos: z.number().optional().default(0),
      hembras: z.number().optional().default(0),
      crias: z.number().optional().default(0),
    })).optional(),

    // Biológicos (Consumo de inventario)
    biologicos: z.array(z.object({
      insumo_id: z.number(),
      oficina_id: z.number(), // Necesario para saber de dónde sale
      cantidad: z.number().default(1),
      lote: z.string().optional().nullable(),
      fecha_vacunacion: z.string().optional().nullable(),
      pruebas_diagnosticas: z.string().optional().nullable(),
    })).optional()
  })
});

export const updateAvalSchema = z.object({
  body: z.object({
    codigo_predio: z.string().optional(),
    fecha_emision: z.string().optional(),
    fecha_vencimiento: z.string().optional(),
    certificado_vacunacion_n: z.string().optional(),
    observaciones: z.string().optional(),
    medico_responsable_id: z.number().optional(),
    jefe_osa_id: z.number().optional(),
  })
});
