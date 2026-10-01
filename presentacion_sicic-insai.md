# Presentación del Proyecto SICIC-INSAI V2.0

## 1. Descripción general
SICIC-INSAI V2.0 es un sistema integral diseñado para sistematizar y controlar las inspecciones de campo del Instituto Nacional de Salud Agrícola Integral (INSAI). El proyecto centraliza el flujo de trabajo de solicitudes, planificaciones, inspecciones y resultados técnicos, con trazabilidad de insumos y una arquitectura segura y escalable.

## 2. Objetivos principales
- Digitalizar el flujo de inspecciones fitosanitarias.
- Centralizar la gestión de solicitudes, planificaciones e inspecciones.
- Asegurar trazabilidad total de insumos mediante un sistema de inventario inteligente (Kardex).
- Soportar múltiples instancias u oficinas con arquitectura multi-tenant dinámica.
- Garantizar seguridad y control de acceso con JWT, RBAC y MFA.
- Ofrecer una experiencia de usuario moderna y eficiente con frontend en React + TypeScript.

## 3. Procesos clave del sistema
1. Solicitudes
2. Planificaciones
3. Inspecciones
4. Avales sanitarios
5. Actas de silos
6. Seguimientos
7. Gestión de inventario / Kardex

## 4. Qué se espera del proyecto
- Un sistema robusto y escalable para el control fitosanitario.
- Menos trabajo manual y menor riesgo de pérdida de información.
- Transparencia y trazabilidad de actividades en campo.
- Control seguro y auditable de consumo de insumos.
- Datos confiables para la toma de decisiones.

## 5. Qué busca lograr
- Registrar cada proceso de campo de forma completa y organizada.
- Controlar el inventario de insumos por oficina y por proceso.
- Fortalecer la seguridad de acceso y permisos de usuarios.
- Unificar el trabajo operativo en una sola plataforma digital.

## 6. Estado actual y pendientes
### Implementado
- Backend con Node.js, Express y Prisma.
- Base de datos PostgreSQL con esquema maestro y operativo.
- Multi-tenancy dinámico para instancias separadas.
- Frontend en React + TypeScript con UI moderna.
- Módulos de solicitud, planificación, inspección y resultados.
- Gestión de inventario con registros de movimientos y reversión automática.

### Pendientes por consolidar
- Pruebas de integración completas entre frontend y backend.
- Ajustes finales de despliegue y configuración en producción.
- Validación de experiencia de usuario (UX) y mejora de flujos.
- Cierre de notificaciones y alertas de stock bajo.
- Documentación final para usuarios y responsables operativos.

## 7. Beneficios esperados
- Mayor eficiencia en la gestión de inspecciones agrícolas.
- Mejor coordinación entre oficinas y equipos de campo.
- Información más precisa y disponible en tiempo real.
- Reducción de errores administrativos y operativos.
- Auditoría confiable de cada acción y consumo de insumos.

## 8. Conclusión
Este proyecto busca transformar la gestión fitosanitaria del INSAI en una plataforma digital moderna, segura y escalable. El enfoque está en integrar todos los procesos clave del ciclo de inspección, junto con el control de insumos y la trazabilidad, para mejorar el servicio y la toma de decisiones.
