# Configuración de Supabase para Growth Estate CRM

## 📋 Información de tu Proyecto Supabase

- **Project URL**: https://htsuhzbjauyzuiivmyib.supabase.co
- **Publishable Key**: `sb_publishable_j2LPi7lnJcw9dONkHXwwOw_63n5wBCY`
- **Database Password**: `growthestatecrm12345`

## 🔗 Connection Strings

### Direct Connection (para migraciones)
```
postgresql://postgres:growthestatecrm12345@db.htsuhzbjauyzuiivmyib.supabase.co:5432/postgres
```

### Connection Pooling (para producción en Render)
```
postgresql://postgres.htsuhzbjauyzuiivmyib:growthestatecrm12345@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## 🚀 Paso 1: Ejecutar Migraciones Localmente

Como el sandbox no puede conectarse a Supabase por restricciones de red, debes ejecutar las migraciones desde tu máquina local.

### 1.1 Clonar el Repositorio

```bash
git clone https://github.com/larezmarketing/Growth-Estate-CRM.git
cd Growth-Estate-CRM
```

### 1.2 Instalar Dependencias

```bash
pnpm install
```

### 1.3 Configurar Variable de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL=postgresql://postgres:growthestatecrm12345@db.htsuhzbjauyzuiivmyib.supabase.co:5432/postgres
```

### 1.4 Ejecutar Migraciones

```bash
pnpm db:push
```

Esto creará todas las tablas necesarias en tu base de datos de Supabase:
- users
- workspaces
- workspace_members
- email_accounts
- knowledge_base
- knowledge_base_files
- campaigns
- emails
- scheduled_emails
- email_metrics
- activity_logs

---

## 🔧 Paso 2: Configurar Variables de Entorno en Render

Ve a tu servicio en Render (https://dashboard.render.com) y agrega estas variables de entorno:

```env
# Base de datos (usa Connection Pooling)
DATABASE_URL=postgresql://postgres.htsuhzbjauyzuiivmyib:growthestatecrm12345@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Autenticación
JWT_SECRET=<genera-un-secreto-aleatorio-seguro>
OAUTH_SERVER_URL=https://api.manus.im
OWNER_OPEN_ID=<tu-open-id>
OWNER_NAME=<tu-nombre>

# APIs de Manus (si las usas)
BUILT_IN_FORGE_API_URL=<url-api>
BUILT_IN_FORGE_API_KEY=<api-key>

# Configuración
NODE_ENV=production
PORT=3000
```

**Importante**: Para producción en Render, usa el **Connection Pooling** de Supabase en lugar de la conexión directa.

---

## 🌐 Paso 3: Configurar Variables de Entorno en Vercel

Ve a tu proyecto en Vercel (https://vercel.com/dashboard) → Settings → Environment Variables:

```env
# OAuth
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=<tu-app-id>

# APIs de Manus
VITE_FRONTEND_FORGE_API_KEY=<frontend-key>
VITE_FRONTEND_FORGE_API_URL=<frontend-url>

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=<endpoint>
VITE_ANALYTICS_WEBSITE_ID=<website-id>
```

---

## ✅ Paso 4: Verificar la Configuración

### 4.1 Verificar Tablas en Supabase

1. Ve a tu proyecto en Supabase: https://app.supabase.com/project/htsuhzbjauyzuiivmyib
2. Navega a **Database** → **Tables**
3. Deberías ver 11 tablas creadas

### 4.2 Verificar Conexión desde Render

Una vez que hayas configurado las variables de entorno en Render:

1. Ve a **Logs** en tu servicio de Render
2. Busca el mensaje: `Server running on http://localhost:3000/`
3. No debería haber errores de conexión a la base de datos

### 4.3 Verificar Frontend en Vercel

1. Abre https://growth-estate-crm.vercel.app/
2. Deberías ver la página de inicio de Growth Estate CRM
3. Las llamadas a la API deberían redirigirse correctamente a Render

---

## 🔒 Seguridad

### Habilitar SSL en Supabase

Supabase requiere SSL por defecto. Si tienes problemas de conexión, asegúrate de que tu connection string incluya `?sslmode=require`:

```
postgresql://postgres:growthestatecrm12345@db.htsuhzbjauyzuiivmyib.supabase.co:5432/postgres?sslmode=require
```

### Rotar Contraseñas

Si necesitas cambiar la contraseña de la base de datos:

1. Ve a **Settings** → **Database** en Supabase
2. Genera una nueva contraseña
3. Actualiza `DATABASE_URL` en Render
4. Reinicia el servicio en Render

---

## 🐛 Solución de Problemas

### Error: "getaddrinfo ENOTFOUND"

Esto significa que no se puede resolver el hostname de Supabase. Verifica:
- Que la URL de conexión sea correcta
- Que tu firewall no bloquee conexiones a Supabase
- Que tengas conexión a internet

### Error: "permission denied to create schema"

Supabase puede tener restricciones en la creación de schemas. Usa el usuario `postgres` y asegúrate de tener los permisos correctos.

### Error: "too many connections"

Si usas la conexión directa en producción, puedes alcanzar el límite de conexiones. Usa **Connection Pooling** en su lugar.

---

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Drizzle ORM PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql)
- [Connection Pooling en Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

---

## ✅ Checklist de Configuración

- [ ] Clonar repositorio de GitHub
- [ ] Instalar dependencias con `pnpm install`
- [ ] Crear archivo `.env` con DATABASE_URL
- [ ] Ejecutar `pnpm db:push` localmente
- [ ] Verificar tablas en Supabase Dashboard
- [ ] Configurar variables de entorno en Render (con Connection Pooling)
- [ ] Configurar variables de entorno en Vercel
- [ ] Verificar despliegue en Render
- [ ] Verificar despliegue en Vercel
- [ ] Probar conexión entre frontend y backend

---

**¡Tu base de datos está lista para producción!** 🎉
