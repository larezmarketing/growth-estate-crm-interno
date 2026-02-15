# Growth Estate CRM - Guía de Inicio Rápido

**Fecha:** 15 de febrero de 2026  
**Versión:** 1.0

## Descripción del Proyecto

**Growth Estate CRM** es una aplicación web diseñada para agencias de marketing que necesitan gestionar campañas publicitarias, clientes y leads de forma eficiente. La plataforma permite la colaboración en equipo con diferentes niveles de permisos, autenticación con Google, y un diseño moderno e intuitivo.

## Stack Tecnológico

| Componente | Tecnología |
| :--- | :--- |
| **Frontend** | React + Vite + TypeScript + TailwindCSS |
| **Backend** | Node.js + Express + TypeScript |
| **Base de Datos** | MySQL/TiDB (Cloud SQL) |
| **Autenticación** | Firebase Authentication + Manus OAuth |
| **ORM** | Drizzle ORM |
| **Hosting** | Google Cloud Platform |

## Estructura del Proyecto

```
growth-estate-crm/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # Servicios de API
│   │   ├── store/         # Estado global
│   │   └── utils/         # Utilidades
│   └── public/            # Archivos estáticos
├── server/                # Backend (Node.js + Express)
│   ├── src/
│   │   ├── routes/        # Rutas de la API
│   │   ├── controllers/   # Controladores
│   │   ├── services/      # Lógica de negocio
│   │   ├── middleware/    # Middlewares
│   │   └── db/            # Configuración de base de datos
│   └── drizzle/           # Migraciones de Drizzle
└── shared/                # Código compartido entre cliente y servidor
```

## Instalación y Configuración

### Prerrequisitos

- Node.js 18 o superior
- pnpm (gestor de paquetes)
- Cuenta de Google Cloud Platform
- Cuenta de Firebase

### Paso 1: Clonar el Repositorio

```bash
cd growth-estate-crm
```

### Paso 2: Instalar Dependencias

```bash
# Instalar dependencias del cliente
cd client
pnpm install

# Instalar dependencias del servidor
cd ../server
pnpm install
```

### Paso 3: Configurar Variables de Entorno

Crear un archivo `.env` en la carpeta `server/`:

```env
# Base de Datos
DATABASE_URL=mysql://user:password@localhost:3306/growth_estate_crm

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Servidor
PORT=3000
NODE_ENV=development

# Frontend URL
CLIENT_URL=http://localhost:5173
```

Crear un archivo `.env` en la carpeta `client/`:

```env
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### Paso 4: Configurar la Base de Datos

```bash
cd server
pnpm db:push    # Sincronizar esquema con la base de datos
pnpm db:seed    # (Opcional) Poblar con datos de prueba
```

### Paso 5: Ejecutar en Modo Desarrollo

```bash
# Terminal 1 - Backend
cd server
pnpm dev

# Terminal 2 - Frontend
cd client
pnpm dev
```

La aplicación estará disponible en:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000

## Funcionalidades Principales

### 1. Autenticación con Google

Los usuarios pueden iniciar sesión utilizando sus cuentas de Google de forma segura mediante Firebase Authentication.

### 2. Sistema de Permisos

Tres niveles de acceso para colaboración en equipo:

- **Admin**: Control total del workspace
- **Editor**: Crear y editar campañas y leads
- **Viewer**: Solo visualización

### 3. Gestión de Workspaces

Cada workspace representa un cliente de la agencia. Los usuarios pueden pertenecer a múltiples workspaces con diferentes roles.

### 4. Gestión de Campañas

Crear, editar y gestionar campañas publicitarias con plantillas optimizadas para conversión.

### 5. Gestión de Leads

Capturar, visualizar y gestionar leads provenientes de las campañas.

### 6. Dashboard de Analíticas

Visualización de métricas clave, gráficos de rendimiento y estadísticas de campañas.

## Comandos Disponibles

### Frontend (client/)

```bash
pnpm dev          # Ejecutar en modo desarrollo
pnpm build        # Compilar para producción
pnpm preview      # Previsualizar build de producción
pnpm lint         # Ejecutar linter
pnpm format       # Formatear código con Prettier
```

### Backend (server/)

```bash
pnpm dev          # Ejecutar en modo desarrollo con hot-reload
pnpm build        # Compilar TypeScript a JavaScript
pnpm start        # Ejecutar versión compilada
pnpm db:push      # Sincronizar esquema con base de datos
pnpm db:studio    # Abrir Drizzle Studio (GUI para DB)
pnpm test         # Ejecutar pruebas
```

## Próximos Pasos

1. **Configurar Firebase Authentication** en la consola de Firebase
2. **Crear la base de datos** en Google Cloud SQL
3. **Implementar las primeras rutas** de la API (auth, users, workspaces)
4. **Diseñar los componentes** del dashboard basados en la referencia
5. **Configurar CI/CD** con Cloud Build

## Recursos Útiles

- [Documentación de React](https://react.dev)
- [Documentación de Vite](https://vitejs.dev)
- [Documentación de TailwindCSS](https://tailwindcss.com)
- [Documentación de Drizzle ORM](https://orm.drizzle.team)
- [Documentación de Firebase](https://firebase.google.com/docs)
- [Documentación de Google Cloud](https://cloud.google.com/docs)

## Soporte

Para preguntas o problemas, consulta la documentación completa o contacta al equipo de desarrollo.

---

**¡Comencemos a construir Growth Estate CRM!** 🚀
