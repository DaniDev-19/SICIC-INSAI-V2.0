# Patrones de Diseño y Arquitectura - SICIC-INSAI V2.0

Este documento describe los patrones de diseño de software implementados en el backend para asegurar una arquitectura robusta, escalable y de fácil mantenimiento.

---

## 1. Patrón Strategy (Estrategia)
Se utiliza principalmente en el **`StorageService`**. 
- **Problema:** El sistema debe funcionar tanto en la nube (R2) como en servidores locales (disco duro).
- **Solución:** El servicio encapsula ambas lógicas tras una interfaz única (`uploadImage`, `deleteFile`). El controlador no sabe ni le importa dónde se guarda la imagen; solo ejecuta la "estrategia" configurada en el `.env`.

## 2. Patrón Factory (Fábrica)
Implementado en el motor de **Multi-Tenancy** (`dbConex.js`).
- **Problema:** Cada petición puede requerir una conexión a una base de datos diferente (Instancia 2025, Instancia 2026, etc.).
- **Solución:** Una "fábrica" de conexiones Prisma recibe el nombre de la base de datos y devuelve la instancia de conexión correcta, gestionando el pool de conexiones de forma eficiente.

## 3. Patrón Singleton (Instancia Única)
Casi todos los servicios en la carpeta `src/services/` utilizan este patrón.
- **Implementación:** Al exportar como `export default new MiService()`, aseguramos que en toda la aplicación solo exista **una única instancia** del servicio en memoria.
- **Beneficio:** Centraliza la configuración y optimiza el uso de recursos (memoria RAM).

## 4. Patrón Middleware (Chain of Responsibility)
Es el núcleo del flujo de Express en este proyecto.
- **Funcionamiento:** Cada petición pasa por una cadena de responsabilidades (Seguridad -> Validación -> Tenant -> Lógica). 
- **Ventaja:** Permite "cortar" la petición en cualquier momento (ej: si falla el JWT) sin llegar a capas profundas del sistema.

## 5. Patrón Controller-Service
Separamos la lógica de comunicación de la lógica de negocio.
- **Controlador:** Se encarga de entender HTTP (params, body, res.send).
- **Servicio:** Se encarga de la lógica pesada (procesar imágenes, generar Excel, registrar auditoría).
- **Resultado:** Código altamente testeable y reutilizable.

---

## 6. Patrones de Base de Datos

### Escrituras Anidadas (Nested Writes)
Utilizamos las capacidades atómicas de **Prisma** para gestionar relaciones complejas (tablas puente) en una sola transacción. Esto garantiza que un registro y sus dependencias (ej: Propiedad y sus Cultivos) se guarden como una única unidad lógica.

---

[Volver al índice de documentación](../WIKI.md)

**Documentación Técnica Funcional**
**SICIC-INSAI V2.0**
