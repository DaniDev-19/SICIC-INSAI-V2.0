# Guía Oficial de PWA y Generación de APK con Capacitor — SICIZ-INSAI v2.0

Esta guía explica en detalle cómo funciona la arquitectura móvil de **SICIZ-INSAI**, cómo opera la **Progressive Web App (PWA)** y cuáles son los pasos exactos para compilar y generar el archivo instalable **APK para dispositivos Android** utilizando **Capacitor**.

---

## 1. ¿Cómo funciona Capacitor y la PWA?

### ¿Qué es Capacitor?
[Capacitor](https://capacitorjs.com/) es un runtime multiplataforma moderno creado por Ionic que permite tomar una aplicación web moderna (en nuestro caso, React 19 + TypeScript + Vite + Tailwind CSS) y empaquetarla como una aplicación nativa real para Android e iOS.

```
┌────────────────────────────────────────────────────────┐
│              Aplicación React (Frontend)               │
│   (Componentes UI, Tailwind, React Router, TanStack)   │
└──────────────────────────┬─────────────────────────────┘
                           │
             Capacitor Bridge (Runtime Nativo)
                           │
┌──────────────────────────┴─────────────────────────────┐
│             Android Native Container                   │
│   (WebView Optimizado + Plugins Nativos + Android SDK) │
└──────────────────────────┬─────────────────────────────┘
                           │
                 Archivo APK Instalable
```

### ¿Cuál es la diferencia entre PWA y APK?
* **PWA (Progressive Web App):** Los usuarios pueden abrir la URL del sistema en Google Chrome o Safari en su teléfono, presionar el menú del navegador y seleccionar **"Instalar aplicación"** o **"Agregar a pantalla principal"**. No requiere descargar un archivo `.apk` y se actualiza instantáneamente con cada despliegue web.
* **APK Nativo (Capacitor):** Es un paquete binario de Android (`.apk`) que se instala directamente en el teléfono como cualquier app. Ofrece integración completa con el sistema operativo Android y acceso fluido a la cámara y hardware del equipo.

---

## 2. Archivos y Configuración en el Proyecto

Los archivos principales de configuración móvil se encuentran en la carpeta `frontend/`:

| Archivo / Carpeta | Propósito |
| :--- | :--- |
| `frontend/capacitor.config.ts` | Configuración principal de Capacitor (ID de paquete: `ve.gob.insai.sicic`, nombre: `SICIZ INSAI`, carpeta web: `dist`). |
| `frontend/android/` | Proyecto nativo de Android autogenerado con Gradle, manifest y código Java/Kotlin. |
| `frontend/public/manifest.json` | Web App Manifest para que los navegadores móviles reconozcan la app como PWA instalable. |
| `frontend/public/sw.js` | Service Worker para caché inteligente de recursos estáticos e interfaz offline. |
| `frontend/src/register-pwa.ts` | Script de inicialización y registro del Service Worker en el navegador. |

---

## 3. Scripts de Ayuda en `package.json`

En la carpeta `frontend`, se añadieron los siguientes comandos rápidos:

```json
"scripts": {
  "build": "tsc -b && vite build",
  "cap:add:android": "cap add android",
  "cap:sync": "cap sync",
  "cap:build": "npm run build && cap sync",
  "cap:open": "cap open android"
}
```

---

## 4. Requisitos para Generar el APK

Para compilar el APK de Android en su computadora de desarrollo necesita:
1. **Node.js** (v18 o superior).
2. **Java Development Kit (JDK 17 o 21)** (generalmente incluido con Android Studio).
3. **Android Studio** (descarga gratuita desde [developer.android.com/studio](https://developer.android.com/studio)).
   - Durante la instalación de Android Studio, asegúrese de marcar:
     - *Android SDK*
     - *Android SDK Platform-Tools*
     - *Android Build-Tools*

---

## 5. Paso a Paso: ¿Cómo Generar el APK?

### Método 1: Usando Android Studio (Recomendado y más amigable)

#### Paso 1: Compilar el frontend web y sincronizar con Android
Abra una terminal en la carpeta `frontend/` y ejecute:
```bash
npm run cap:build
```
> **¿Qué hace este comando?** Primero ejecuta `npm run build` creando la versión de producción en `frontend/dist/`, y luego `cap sync` copia automáticamente esos archivos compilados dentro de la carpeta nativa `frontend/android/app/src/main/assets/public`.

#### Paso 2: Abrir el proyecto en Android Studio
Ejecute el comando:
```bash
npm run cap:open
```
Esto abrirá automáticamente Android Studio con la carpeta `frontend/android`.

#### Paso 3: Dejar que Gradle sincronice
La primera vez que abra el proyecto, Android Studio descargará los componentes necesarios de Gradle (puede tardar un par de minutos según su velocidad de internet). Espere a que la barra inferior diga **"Gradle build finished"** o **"Sync finished"**.

#### Paso 4: Generar el archivo APK
1. En el menú superior de Android Studio, haga clic en:
   **`Build` -> `Build Bundle(s) / APK(s)` -> `Build APK(s)`**
2. Android Studio comenzará a compilar el proyecto.
3. Cuando finalice, aparecerá una notificación flotante en la esquina inferior derecha con el mensaje:
   `APK(s) generated successfully for module 'app'`.
4. Haga clic en el enlace azul **"locate"** dentro de esa notificación para abrir directamente la carpeta de Windows donde está su archivo `app-debug.apk`.

La ruta habitual donde se guarda el archivo generado es:
```
frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

---

### Método 2: Generar el APK por Terminal (Sin abrir Android Studio)

Si ya tiene configurada la variable `ANDROID_HOME` o el SDK en su sistema, puede compilar directamente desde PowerShell:

```powershell
# 1. Compilar y sincronizar activos
npm run cap:build

# 2. Entrar a la carpeta nativa de Android
cd android

# 3. Compilar APK Debug con Gradle
.\gradlew assembleDebug
```

Al terminar, encontrará el APK listo en:
`frontend/android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 6. Publicar el APK para Descarga Directa en el Sistema

En el frontend ya se configuraron botones automáticos de descarga en:
1. **La Landing Page principal** (`/`)
2. **La pantalla de Login** (`/login`)
3. **El Centro de Ayuda interactivo** (`/home/help`)

Todos esos botones apuntan a la ruta pública `/app-release.apk`.

Para que los usuarios puedan descargar el APK generado:
1. Tome el archivo `.apk` compilado (por ejemplo `app-debug.apk`).
2. Renómbrelo a `app-release.apk`.
3. Cópielo dentro de la carpeta:
   ```
   frontend/public/app-release.apk
   ```
4. Al hacer `npm run build`, este archivo estará disponible en la raíz del servidor web y cualquier usuario que pulse **"Descargar APK Móvil"** lo descargará directamente a su teléfono.

---

## 7. Instrucciones para el Usuario Final (Instalación en Teléfono)

### Vía 1: Instalación instantánea PWA (Sin compilar APK)
Si la plataforma está publicada en un servidor o accesible en red local:
1. Abra Google Chrome o navegador móvil en el teléfono y entre a la URL del sistema.
2. Presione los 3 puntos verticales `⋮` del navegador arriba a la derecha.
3. Seleccione **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.
4. ¡Listo! Se creará el acceso directo con el icono del INSAI y se comportará como una app nativa a pantalla completa y con caché offline.

### Vía 2: Instalación manual del archivo APK
1. Descargue el archivo `SICIZ-INSAI-v2.0.apk` desde la plataforma web.
2. Al abrirlo, Android mostrará una advertencia de seguridad indicando que la aplicación proviene de una fuente externa.
3. Pulse **"Configuración"** o **"Ajustes"** y active la casilla **"Permitir desde esta fuente"**.
4. Regrese y presione **"Instalar"**.
5. ¡Listo! La app aparecerá en el menú del teléfono con el logo oficial del INSAI.

---

## 8. Diagnóstico de Problemas Frecuentes

### "¿Por qué al descargar el APK mi teléfono dice que no es válido o no lo detecta como instalable?"
> **Causa:** El archivo que se descargó no es un binario Android real, sino un archivo de texto HTML (`index.html`). Esto ocurre cuando se presiona el botón de descarga antes de haber compilado y colocado el archivo APK real en `frontend/public/app-release.apk`. Al no existir el archivo, el servidor web entrega la página web por defecto (`index.html`) renombrada como `.apk`.

> **Solución:**
> 1. Asegúrese de abrir el proyecto Android en Android Studio (`npm run cap:open`) o ejecutar `./gradlew assembleDebug`.
> 2. Una vez generado el archivo binario (`app-debug.apk`), cópielo a `frontend/public/app-release.apk`.
> 3. Ejecute `npm run build` en el frontend para que quede publicado.
> 4. Mientras tanto, puede usar la **Vía 1 (PWA)** descrita arriba que funciona de inmediato sin necesidad de compilar APK.

