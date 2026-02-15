# Growth Estate CRM - TODO

## Fase 1: Configuración Inicial
- [x] Crear esquema de base de datos
- [x] Configurar tablas de usuarios, workspaces, miembros
- [x] Configurar tablas de email accounts
- [x] Configurar tablas de knowledge base
- [x] Configurar tablas de campaigns y emails
- [x] Configurar tablas de scheduled emails y metrics

## Fase 2: Autenticación y Gestión de Workspaces
- [x] Implementar autenticación con Google (Manus OAuth)
- [x] Sistema de permisos (Admin, Editor, Viewer)
- [x] CRUD de workspaces
- [x] Gestión de miembros de workspace

## Fase 3: Conexión de Cuentas de Email
- [x] Módulo de encriptación AES-256-GCM
- [x] Validación SMTP/IMAP
- [x] Soporte para Gmail, Outlook, Yahoo
- [x] Soporte para servidores personalizados
- [x] API de email accounts

## Fase 4: Base de Conocimiento
- [x] CRUD de knowledge base
- [x] Integración con S3 para archivos
- [x] API de knowledge base files

## Fase 5: Generación de Campañas con IA
- [x] Módulo de generación de emails con LLM
- [x] Prompt engineering para 10 emails
- [x] API de campaigns
- [x] API de emails
- [x] Regeneración individual de emails

## Fase 6: Frontend - Dashboard y Workspaces
- [x] Diseño con paleta púrpura moderna
- [x] Contexto de workspace
- [x] Dashboard principal
- [x] Página de nuevo workspace
- [x] Página de workspace individual con tabs

## Fase 7: Frontend - Campañas
- [x] Página de nueva campaña con generación IA
- [x] Vista en fila de 10 emails
- [x] Preview HTML de emails
- [x] Editor de emails

## Fase 8: Testing
- [x] Tests de autenticación
- [x] Tests de workspaces

## Fase 9: Envío Automático y Métricas
- [ ] Worker para envío programado
- [ ] Sistema de colas
- [ ] Tracking de aperturas
- [ ] Tracking de clics
- [ ] Tracking de conversiones
- [ ] Dashboard de métricas

## Fase 10: Notificaciones
- [ ] Notificaciones al administrador
- [ ] Alertas de problemas de entrega
- [ ] Alertas de hitos importantes

## Fase 11: Interfaz de Base de Conocimiento
- [ ] Formulario de base de conocimiento
- [ ] Subida de archivos
- [ ] Vista de archivos adjuntos

## Fase 12: Interfaz de Conexión de Email
- [ ] Formulario de conexión SMTP
- [ ] Selector de proveedores
- [ ] Validación en tiempo real

## Fase 13: Optimización para Despliegue en Vercel, Render y Supabase
- [x] Migrar esquema de base de datos de MySQL a PostgreSQL (Supabase)
- [x] Actualizar conexiones de base de datos para usar Supabase
- [x] Crear archivo vercel.json para configuración de Vercel
- [x] Configurar variables de entorno para Vercel
- [x] Crear Dockerfile para backend en Render
- [x] Configurar render.yaml para despliegue automático
- [x] Separar frontend y backend en builds independientes
- [x] Actualizar README con instrucciones de despliegue
- [x] Crear DEPLOYMENT.md con guía completa
- [x] Exportar código a GitHub
