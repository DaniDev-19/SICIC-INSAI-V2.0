# Servicio de Notificaciones y Envío de Correo Electrónico - SICIC-INSAI V2.0

Este documento detalla el funcionamiento técnico del módulo de correos electrónicos y notificaciones del sistema SICIC-INSAI.

---

## 1. Arquitectura del Servicio (`MailService`)

El backend integra un servicio de correo electrónico configurable desacoplado en:
- `src/routes/mail.routes.js`: Endpoints de prueba y envío manual/programado.
- `src/controllers/mail.controller.js`: Validación de solicitudes y manejo de parámetros.
- `src/services/mail.service.js`: Lógica de integración de transporte de correo y renderizado de plantillas.
- `src/services/templates/`: Plantillas HTML responsivas para notificaciones del sistema.

---

## 2. Configuración e Integración de Proveedores

El servicio admite múltiples transportes según el entorno de despliegue mediante variables de entorno (`.env`):

| Variable            | Descripción                                                           |
| :------------------ | :-------------------------------------------------------------------- |
| `MAIL_HOST`         | Servidor SMTP (ej. `smtp.gmail.com` o servidor institucional INSAI). |
| `MAIL_PORT`         | Puerto SMTP (587 para TLS / 465 para SSL).                            |
| `MAIL_USER`         | Usuario autenticado de correo.                                        |
| `MAIL_PASS`         | Contraseña de aplicación o credencial SMTP.                           |
| `RESEND_API_KEY`    | Llave API de Resend (opcional para servicios serverless en la nube).  |

---

## 3. Plantillas de Correo Disponibles

El directorio `src/services/templates/` almacena plantillas HTML prediseñadas con la identidad visual institucional:

1. **Recuperación de Contraseña:** Envío de enlaces seguros y tokens de restablecimiento con fecha de caducidad.
2. **Alertas de Inspección Programada:** Notificación a fiscales y propietarios sobre inspecciones de campo asignadas.
3. **Emisión de Avales Sanitarios:** Confirmación de emisión de certificado sanitario con adjunto en PDF o enlace de validación.
4. **Notificaciones de Sistema y Seguridad:** Alertas sobre inicios de sesión inusuales o activación de autenticación MFA.

---

## 4. Auditoría y Registro en Bitácora

Cada correo enviado o intento fallido de transmisión genera automáticamente un registro en la **Bitácora de Auditoría** del sistema:
- **Módulo:** `NOTIFICACIONES_MAIL`
- **Acción:** `SEND_EMAIL`
- **Payload:** Destinatario, asunto, ID de transacción y estado (Éxito / Fallido).

---

[Volver al índice de documentación](../WIKI.md)

**Documentación Técnica Funcional**
**SICIC-INSAI V2.0**
