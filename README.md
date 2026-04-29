# SICIC-INSAI V2.0 
### Sistema de Información para el Control de Inspecciones de Campo

[![Vercel](https://img.shields.io/badge/Production-Live-success?logo=vercel&logoColor=white)](https://sicic-insai-v2-0.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v17+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## Sobre el Proyecto

**SICIC-INSAI V2.0** es la evolución integral de la plataforma de gestión fitosanitaria del **Instituto Nacional de Salud Agrícola Integral (INSAI)**. Diseñado como una solución robusta y escalable, este sistema centraliza y digitaliza el flujo de trabajo de las inspecciones agrícolas en Venezuela, permitiendo una trazabilidad total de las actividades de campo y optimizando la toma de decisiones basada en datos reales.

Esta versión 2.0 unifica el ecosistema tecnológico en una arquitectura **Multi-Tenant dinámica**, mejorando significativamente el rendimiento, la experiencia de usuario y la integridad de la información operativa.

---

## Evolución del Sistema

| Versión | Enfoque | Logros Clave |
| :--- | :--- | :--- |
| **V1.0** | Digitalización Inicial | Sentó las bases del modelo de datos fitosanitario y el registro básico de inspecciones. |
| **V2.0 (Actual)** | **Sistema Integral - SICIC** | Arquitectura unificada, optimización de consultas, gestión dinámica de instancias y UI/UX premium. |

---

##  Stack Tecnológico

El sistema se divide en una arquitectura desacoplada para máxima eficiencia:

### **Backend (Core Services)**
- **Runtime:** Node.js (v18+) con Express.js.
- **Base de Datos:** PostgreSQL (v17+).
- **ORM:** Prisma (Gestión de esquema dual: Maestro y Operativo).
- **Seguridad:** JWT (Auth), Middleware de permisos (RBAC), Helmet y CORS modularizado.
- **Validación:** Esquemas estrictos con Zod.

### **Frontend (Interface)**
- **Framework:**  React.js + typeScript.
- **Estilos:** Vanilla CSS / Tailwind.
- **Gestión de Estado:** Hooks personalizados y Context API.

---

## Estructura del Proyecto

```bash
SICIC-INSAI-V2.0/
├── backend/        # API REST, Lógica de Negocio y Conexión Multi-Tenant
├── frontend/       # Interfaz de Usuario, Dashboard y Componentes React
```

---

## 🚀 Inicio Rápido

### 1. Requisitos Previos
*   **Node.js** (v18 o superior)
*   **PostgreSQL** (v17 o superior)
*   Un gestor de paquetes (npm o yarn)

### 2. Clonación y Configuración
```bash
# Clonar repositorio
git clone https://github.com/DaniDev-19/SICIC-INSAI-V2.0.git
cd SICIC-INSAI-V2.0
```

### 3. Instalación de Dependencias
Debes instalar las dependencias en ambos directorios:
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 4. Variables de Env torno
Crea un archivo `.env` en las carpetas `backend/` y `frontend/` siguiendo los ejemplos proporcionados en sus respectivas carpetas.

### 5. Ejecución en Desarrollo
```bash
# En terminal 1 (Backend)
cd backend && npm run dev

# En terminal 2 (Frontend)
cd frontend && npm run dev
```

---

## 🔗 Enlaces Importantes
- **Producción:** [https://sicic-insai-v2-0.vercel.app](https://sicic-insai-v2-0.vercel.app)
- **Repositorio Original:** [DaniDev-19 GitHub](https://github.com/DaniDev-19)

---
*Desarrollado con ❤️*
