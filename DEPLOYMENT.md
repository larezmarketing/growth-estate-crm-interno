# Growth Estate CRM - Guía de Despliegue

Esta guía te ayudará a desplegar **Growth Estate CRM** usando Vercel (frontend), Render (backend) y Supabase (base de datos).

## 📋 Requisitos Previos

- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Render](https://render.com)
- Cuenta en [Supabase](https://supabase.com)
- Repositorio de GitHub con el código

---

## 🗄️ Paso 1: Configurar Supabase (Base de Datos)

### 1.1 Crear Proyecto en Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Haz clic en **"New Project"**
3. Completa los datos:
   - **Name**: `growth-estate-crm`
   - **Database Password**: Genera una contraseña segura (guárdala)
   - **Region**: Selecciona la región más cercana
4. Haz clic en **"Create new project"**

### 1.2 Obtener Connection String

1. En tu proyecto de Supabase, ve a **Settings** → **Database**
2. En la sección **Connection string**, copia el **URI** (Connection pooling)
3. Reemplaza `[YOUR-PASSWORD]` con la contraseña que generaste
4. Guarda esta URL, la necesitarás para Render

Ejemplo:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 1.3 Ejecutar Migraciones

1. Instala Drizzle Kit localmente:
   ```bash
   pnpm install
   ```

2. Configura la variable de entorno:
   ```bash
   export DATABASE_URL="tu-connection-string-de-supabase"
   ```

3. Ejecuta las migraciones:
   ```bash
   pnpm db:push
   ```

---

## 🚀 Paso 2: Desplegar Backend en Render

### 2.1 Crear Web Service

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Haz clic en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Completa la configuración:
   - **Name**: `growth-estate-crm-backend`
   - **Region**: Selecciona la región más cercana
   - **Branch**: `main`
   - **Root Directory**: (dejar vacío)
   - **Runtime**: `Node`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`

### 2.2 Configurar Variables de Entorno

En la sección **Environment**, agrega las siguientes variables:

```
NODE_ENV=production
DATABASE_URL=<tu-connection-string-de-supabase>
JWT_SECRET=<genera-un-secreto-aleatorio-seguro>
PORT=3000
```

**Variables de Manus OAuth** (si usas autenticación de Manus):
```
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=<tu-app-id>
OWNER_OPEN_ID=<tu-open-id>
OWNER_NAME=<tu-nombre>
```

**Variables de LLM y Storage** (si usas servicios de Manus):
```
BUILT_IN_FORGE_API_URL=<url-de-manus-api>
BUILT_IN_FORGE_API_KEY=<tu-api-key>
VITE_FRONTEND_FORGE_API_KEY=<frontend-api-key>
VITE_FRONTEND_FORGE_API_URL=<frontend-api-url>
```

### 2.3 Desplegar

1. Haz clic en **"Create Web Service"**
2. Espera a que termine el despliegue
3. Copia la URL del backend (ej: `https://growth-estate-crm-backend.onrender.com`)

---

## 🌐 Paso 3: Desplegar Frontend en Vercel

### 3.1 Preparar Configuración

1. Edita `vercel.json` y reemplaza la URL del backend:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://growth-estate-crm-backend.onrender.com/api/:path*"
       }
     ]
   }
   ```

2. Haz commit y push de los cambios:
   ```bash
   git add vercel.json
   git commit -m "Configure Vercel rewrites"
   git push origin main
   ```

### 3.2 Crear Proyecto en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en **"Add New..."** → **"Project"**
3. Importa tu repositorio de GitHub
4. Configura el proyecto:
   - **Framework Preset**: `Other`
   - **Root Directory**: (dejar vacío)
   - **Build Command**: `cd client && pnpm install && pnpm build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `pnpm install`

### 3.3 Configurar Variables de Entorno

En la sección **Environment Variables**, agrega:

```
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=<tu-app-id>
VITE_FRONTEND_FORGE_API_KEY=<frontend-api-key>
VITE_FRONTEND_FORGE_API_URL=<frontend-api-url>
VITE_ANALYTICS_ENDPOINT=<analytics-endpoint>
VITE_ANALYTICS_WEBSITE_ID=<website-id>
```

### 3.4 Desplegar

1. Haz clic en **"Deploy"**
2. Espera a que termine el despliegue
3. Tu aplicación estará disponible en `https://tu-proyecto.vercel.app`

---

## 🔧 Configuración Adicional

### Dominio Personalizado en Vercel

1. En tu proyecto de Vercel, ve a **Settings** → **Domains**
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

### CORS en Render

Si tienes problemas de CORS, agrega esta variable de entorno en Render:

```
CORS_ORIGIN=https://tu-proyecto.vercel.app
```

Y actualiza el código del servidor para usar esta variable.

---

## 📝 Variables de Entorno Completas

### Backend (Render)

```env
# Base de datos
DATABASE_URL=postgresql://...

# Autenticación
JWT_SECRET=tu-secreto-jwt
OAUTH_SERVER_URL=https://api.manus.im
OWNER_OPEN_ID=tu-open-id
OWNER_NAME=tu-nombre

# APIs
BUILT_IN_FORGE_API_URL=url-api
BUILT_IN_FORGE_API_KEY=api-key

# Configuración
NODE_ENV=production
PORT=3000
```

### Frontend (Vercel)

```env
# OAuth
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=tu-app-id

# APIs
VITE_FRONTEND_FORGE_API_KEY=frontend-key
VITE_FRONTEND_FORGE_API_URL=frontend-url

# Analytics
VITE_ANALYTICS_ENDPOINT=endpoint
VITE_ANALYTICS_WEBSITE_ID=website-id
```

---

## 🐛 Solución de Problemas

### Error de conexión a base de datos

- Verifica que el `DATABASE_URL` sea correcto
- Asegúrate de usar el **Connection pooling** de Supabase
- Verifica que las migraciones se hayan ejecutado correctamente

### Error 502 en Render

- Verifica que el comando de inicio sea correcto: `pnpm start`
- Revisa los logs en Render Dashboard
- Asegúrate de que todas las variables de entorno estén configuradas

### API no responde desde Vercel

- Verifica que la URL en `vercel.json` sea correcta
- Asegúrate de que el backend esté funcionando
- Revisa la configuración de CORS

---

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Render](https://render.com/docs)
- [Documentación de Vercel](https://vercel.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)

---

## 🆘 Soporte

Si tienes problemas con el despliegue, revisa:

1. Los logs en Render Dashboard
2. Los logs en Vercel Dashboard
3. La consola del navegador para errores del frontend
4. Los logs de Supabase para problemas de base de datos
