import { z } from 'zod';

const parseNumber = (val) => {
  if (val === undefined || val === null || val === '' || val === 'null' || val === 'undefined') return undefined;
  const num = Number(val);
  return isNaN(num) ? val : num;
};

const parseJson = (val) => {
  if (typeof val === 'string') {
    try {
      return val.trim() ? JSON.parse(val) : undefined;
    } catch {
      return val;
    }
  }
  return val;
};

export const createAvalSchema = z.object({
  body: z.object({
    numero_aval: z.string({ required_error: 'El número de aval es requerido' }),
    codigo_predio: z.string().optional().nullable(),
    fecha_emision: z.string().optional().nullable(),
    fecha_vencimiento: z.string().optional().nullable(),
    certificado_vacunacion_n: z.string().optional().nullable(),
    observaciones: z.string().optional().nullable(),
    
    inspeccion_id: z.preprocess(parseNumber, z.number().optional().nullable()),
    medico_responsable_id: z.preprocess(parseNumber, z.number().optional().nullable()),
    jefe_osa_id: z.preprocess(parseNumber, z.number().optional().nullable()),

    hallazgos_bov_buf: z.preprocess(parseJson, z.object({
      t_toros: z.coerce.number().optional().default(0),
      t_vacas: z.coerce.number().optional().default(0),
      t_novillos: z.coerce.number().optional().default(0),
      t_novillas: z.coerce.number().optional().default(0),
      t_mautes_m: z.coerce.number().optional().default(0),
      t_mautes_h: z.coerce.number().optional().default(0),
      t_becerros: z.coerce.number().optional().default(0),
      t_becerras: z.coerce.number().optional().default(0),
      t_bufalos: z.coerce.number().optional().default(0),
      t_bufalas: z.coerce.number().optional().default(0),
      t_buvillos: z.coerce.number().optional().default(0),
      t_buvillas: z.coerce.number().optional().default(0),
      t_bumautes_m: z.coerce.number().optional().default(0),
      t_bumautes_h: z.coerce.number().optional().default(0),
      t_bucerros: z.coerce.number().optional().default(0),
      t_bucerras: z.coerce.number().optional().default(0),
    }).optional().nullable()),

    hallazgos_otras: z.preprocess(parseJson, z.array(z.object({
      tipo_animal_id: z.coerce.number(),
      machos: z.coerce.number().optional().default(0),
      hembras: z.coerce.number().optional().default(0),
      crias: z.coerce.number().optional().default(0),
    })).optional().nullable()),

    biologicos: z.preprocess(parseJson, z.array(z.object({
      insumo_id: z.coerce.number(),
      oficina_id: z.coerce.number(),
      cantidad: z.coerce.number().default(1),
      lote: z.string().optional().nullable(),
      fecha_vacunacion: z.string().optional().nullable(),
      pruebas_diagnosticas: z.string().optional().nullable(),
    })).optional().nullable())
  })
});

export const updateAvalSchema = z.object({
  body: z.object({
    codigo_predio: z.string().optional().nullable(),
    fecha_emision: z.string().optional().nullable(),
    fecha_vencimiento: z.string().optional().nullable(),
    certificado_vacunacion_n: z.string().optional().nullable(),
    observaciones: z.string().optional().nullable(),
    medico_responsable_id: z.preprocess(parseNumber, z.number().optional().nullable()),
    jefe_osa_id: z.preprocess(parseNumber, z.number().optional().nullable()),
    
    hallazgos_bov_buf: z.preprocess(parseJson, z.object({
      t_toros: z.coerce.number().optional().default(0),
      t_vacas: z.coerce.number().optional().default(0),
      t_novillos: z.coerce.number().optional().default(0),
      t_novillas: z.coerce.number().optional().default(0),
      t_mautes_m: z.coerce.number().optional().default(0),
      t_mautes_h: z.coerce.number().optional().default(0),
      t_becerros: z.coerce.number().optional().default(0),
      t_becerras: z.coerce.number().optional().default(0),
      t_bufalos: z.coerce.number().optional().default(0),
      t_bufalas: z.coerce.number().optional().default(0),
      t_buvillos: z.coerce.number().optional().default(0),
      t_buvillas: z.coerce.number().optional().default(0),
      t_bumautes_m: z.coerce.number().optional().default(0),
      t_bumautes_h: z.coerce.number().optional().default(0),
      t_bucerros: z.coerce.number().optional().default(0),
      t_bucerras: z.coerce.number().optional().default(0),
    }).optional().nullable()),

    hallazgos_otras: z.preprocess(parseJson, z.array(z.object({
      tipo_animal_id: z.coerce.number(),
      machos: z.coerce.number().optional().default(0),
      hembras: z.coerce.number().optional().default(0),
      crias: z.coerce.number().optional().default(0),
    })).optional().nullable()),

    biologicos: z.preprocess(parseJson, z.array(z.object({
      insumo_id: z.coerce.number(),
      oficina_id: z.coerce.number(),
      cantidad: z.coerce.number().default(1),
      lote: z.string().optional().nullable(),
      fecha_vacunacion: z.string().optional().nullable(),
      pruebas_diagnosticas: z.string().optional().nullable(),
    })).optional().nullable())
  })
});
