import nodemailer from 'nodemailer';
import { getPlanificacionEmailHtml } from './templates/planificacion-email.template.js';
import { masterPrisma } from '../config/prisma.js';

class MailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  /**
   * Inicializa el transporte SMTP de Nodemailer
   */
  initTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = (process.env.SMTP_USER || 'baddevprograming@gmail.com').trim();
    const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '').trim();

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      auth: user && pass ? { user, pass } : undefined,
      tls: {
        rejectUnauthorized: false
      },
    });
  }

  /**
   * Envía la ficha de notificación de planificación a los inspectores asignados.
   * 
   * @param {Object} params
   * @param {'CREACION' | 'ACTUALIZACION'} params.tipoEvento
   * @param {Object} params.planificacion
   * @param {Array<Object>} params.inspectores
   */
  async sendPlanificacionNotification({ tipoEvento = 'CREACION', planificacion, inspectores = [] }) {
    try {
      // Re-inicializar para capturar cualquier cambio en .env sin reiniciar el servidor
      this.initTransporter();

      const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '').trim();

      // Extraer correos válidos de los inspectores (o consultar usuarios_globales como fallback)
      const emailsSet = new Set();
      for (const insp of inspectores) {
        if (insp.email && typeof insp.email === 'string' && insp.email.includes('@')) {
          emailsSet.add(insp.email.trim());
        } else if (insp.usuario_global_id) {
          try {
            const globalUser = await masterPrisma.usuarios.findUnique({
              where: { id: insp.usuario_global_id },
              select: { email: true }
            });
            if (globalUser?.email && globalUser.email.includes('@')) {
              emailsSet.add(globalUser.email.trim());
            }
          } catch (e) {
            console.error(`Error obteniendo email para usuario_global_id ${insp.usuario_global_id}:`, e.message);
          }
        }
      }

      if (emailsSet.size === 0) {
        console.log('ℹ️  MailService: Ningún inspector asignado tiene correo registrado. Notificación omitida.');
        return { success: false, reason: 'NO_RECIPIENTS' };
      }

      const recipients = Array.from(emailsSet);
      const htmlContent = getPlanificacionEmailHtml({ tipoEvento, planificacion, inspectores });
      const codigoPlan = planificacion.codigo || `PLAN-${planificacion.id}`;
      const subjectText = tipoEvento === 'CREACION'
        ? `[SICIC-INSAI] Asignación de Inspección de Campo: ${codigoPlan}`
        : `[SICIC-INSAI] Actualización de Inspección Planificada: ${codigoPlan}`;

      const fromAddress = process.env.SMTP_FROM || '"SICIC-INSAI Notificaciones" <baddevprograming@gmail.com>';

      // Modo de simulación si no hay contraseña SMTP configurada
      if (!pass) {
        console.log('');
        console.log('📧 [SIMULACIÓN - SMTP_PASS no definido en .env]');
        console.log(`   📌 Asunto: ${subjectText}`);
        console.log(`   👥 Destinatarios: ${recipients.join(', ')}`);
        console.log(`   🗂️  Evento: ${tipoEvento}`);
        console.log('');
        return { success: true, simulated: true };
      }

      const mailOptions = {
        from: fromAddress,
        to: recipients.join(', '),
        subject: subjectText,
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✉️  Correo enviado exitosamente. ID: ${info.messageId} | Destinatarios: ${recipients.join(', ')}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ MailService error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new MailService();
