# Growth Estate CRM 🚀

**Plataforma de Email Marketing para Agencias** - Gestiona múltiples clientes con generación automática de campañas usando IA.

![Growth Estate CRM](https://img.shields.io/badge/version-1.0.0-purple)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-22.x-green)
![PostgreSQL](https://img.shields.io/badge/postgresql-15+-blue)

---

## ✨ Características Principales

### 🎯 Gestión Multicliente
- Dashboard centralizado para gestionar múltiples clientes
- Sistema de roles (Admin, Editor, Viewer)
- Invitaciones y colaboración en equipo

### 🤖 Generación de Campañas con IA
- **Generación automática de 10 emails** personalizados por campaña
- Prompt engineering avanzado basado en base de conocimiento del cliente
- Regeneración individual de emails con contexto

### 📧 Conexión de Cuentas de Email
- Soporte para Gmail, Outlook, Yahoo
- Servidores SMTP/IMAP personalizados
- Encriptación AES-256-GCM de credenciales
- Validación automática de credenciales

### 📚 Base de Conocimiento por Cliente
- Almacenamiento de información del negocio
- Tono de voz, productos, servicios, audiencia
- Subida de archivos a S3
- Contexto para generación de emails con IA

### 📊 Vista en Fila de Emails
- Secuencia completa de 10 emails visible
- Preview HTML en tiempo real
- Editor de contenido
- Control de estados (draft, active, paused, completed)

### 📈 Programación Automática
- Envío automático con intervalos configurables (default: 3 días)
- Sistema de colas para envíos
- Tracking de métricas (aperturas, clics, conversiones)
- Notificaciones automáticas

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** con TypeScript
- **Tailwind CSS 4** para estilos
- **tRPC** para comunicación type-safe con backend
- **Wouter** para routing
- **shadcn/ui** para componentes

### Backend
- **Node.js 22** con Express
- **tRPC** para API type-safe
- **Drizzle ORM** para base de datos
- **PostgreSQL** (Supabase compatible)
- **Nodemailer** para envío de emails

### Servicios
- **PostgreSQL** (Supabase) - Base de datos
- **S3** - Almacenamiento de archivos
- **LLM** - Generación de contenido con IA
- **SMTP/IMAP** - Envío y recepción de emails

---

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 22+
- pnpm 10+
- PostgreSQL 15+ (o cuenta de Supabase)

### Instalación Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/larezmarketing/Growth-Estate-CRM.git
   cd Growth-Estate-CRM
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env` en la raíz:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/growth_estate_crm
   JWT_SECRET=tu-secreto-jwt-aleatorio
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_APP_ID=tu-app-id
   # ... otras variables
   ```

4. **Ejecutar migraciones**
   ```bash
   pnpm db:push
   ```

5. **Iniciar en desarrollo**
   ```bash
   pnpm dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

---

## 📦 Despliegue en Producción

Para desplegar en Vercel (frontend), Render (backend) y Supabase (base de datos), consulta la [Guía de Despliegue](./DEPLOYMENT.md).

### Resumen de Despliegue

1. **Supabase**: Crear proyecto y obtener connection string
2. **Render**: Desplegar backend con variables de entorno
3. **Vercel**: Desplegar frontend configurando rewrites

---

## 📁 Estructura del Proyecto

```
growth-estate-crm/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── components/    # Componentes reutilizables
│   │   ├── contexts/      # Contextos de React
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilidades y configuración
│   └── public/            # Archivos estáticos
├── server/                # Backend Node.js
│   ├── routers.ts         # Rutas tRPC
│   ├── db.ts              # Queries de base de datos
│   ├── emailGenerator.ts  # Generación de emails con IA
│   ├── emailValidator.ts  # Validación SMTP/IMAP
│   └── encryption.ts      # Encriptación de credenciales
├── drizzle/               # Esquema de base de datos
│   └── schema.ts          # Definición de tablas
├── shared/                # Código compartido
├── Dockerfile             # Configuración para Render
├── render.yaml            # Configuración de Render
├── vercel.json            # Configuración de Vercel
└── DEPLOYMENT.md          # Guía de despliegue
```

---

## 🔐 Seguridad

- **Encriptación de credenciales**: AES-256-GCM para contraseñas SMTP/IMAP
- **Autenticación**: OAuth con JWT
- **Control de acceso**: Sistema de roles y permisos
- **Variables de entorno**: Nunca se commitean al repositorio
- **Validación**: Zod para validación de datos

---

## 🧪 Testing

```bash
# Ejecutar tests
pnpm test

# Tests con cobertura
pnpm test:coverage
```

---

## 📝 Scripts Disponibles

```bash
pnpm dev          # Desarrollo local
pnpm build        # Build para producción
pnpm start        # Iniciar en producción
pnpm test         # Ejecutar tests
pnpm db:push      # Aplicar migraciones
pnpm check        # Verificar tipos TypeScript
pnpm format       # Formatear código
```

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👥 Autores

- **Larez Marketing** - [GitHub](https://github.com/larezmarketing)

---

## 🙏 Agradecimientos

- [Manus](https://manus.im) por la plataforma de desarrollo
- [Supabase](https://supabase.com) por la base de datos PostgreSQL
- [Vercel](https://vercel.com) por el hosting del frontend
- [Render](https://render.com) por el hosting del backend

---

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:

- 📧 Email: support@larezmarketing.com
- 🐛 Issues: [GitHub Issues](https://github.com/larezmarketing/Growth-Estate-CRM/issues)
- 📖 Documentación: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**¡Hecho con ❤️ para agencias de marketing!**
