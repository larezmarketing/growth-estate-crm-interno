# Growth Estate CRM - TODO

## Fase 1: Autenticación y Gestión de Workspaces
- [x] Configurar autenticación con Google (ya incluida en template)
- [x] Crear tabla de workspaces (clientes) en la base de datos
- [x] Crear tabla de workspace_members con roles (Admin, Editor, Viewer)
- [x] Implementar CRUD de workspaces
- [x] Crear selector de workspace en la interfaz
- [ ] Implementar sistema de invitaciones a workspaces

## Fase 2: Conexión de Cuentas de Email
- [x] Crear tabla de email_accounts para almacenar credenciales SMTP/IMAP
- [x] Implementar formulario de conexión de cuenta de email (API)
- [x] Validar credenciales SMTP/IMAP al conectar
- [x] Soportar Gmail, Outlook, Yahoo con configuración automática
- [x] Encriptar credenciales antes de almacenar en base de datos
- [ ] Crear interfaz de conexión de email en frontend
- [ ] Mostrar estado de conexión de cuenta de email por workspace

## Fase 3: Base de Conocimiento por Cliente
- [x] Crear tabla de knowledge_base vinculada a workspaces
- [x] Crear tabla de knowledge_base_files para archivos en S3
- [x] Implementar API para agregar información del cliente
- [x] Campos: tono de voz, productos/servicios, contexto del negocio, objetivos
- [x] Integrar almacenamiento S3 para archivos adjuntos
- [x] Permitir subir documentos de referencia (API)
- [ ] Crear interfaz de edición de base de conocimiento

## Fase 4: Generación de Campañas con IA
- [x] Crear tabla de campaigns vinculada a workspaces
- [x] Crear tabla de emails vinculada a campaigns (1 campaña = 10 emails)
- [x] Implementar integración con LLM para generar emails
- [x] Crear prompt engineering para generación de secuencias de 10 emails
- [x] Usar base de conocimiento del cliente en el prompt
- [x] Generar asuntos, cuerpos y CTAs personalizados
- [x] Permitir regenerar emails individuales
- [x] Guardar borradores de emails generados
- [x] Crear interfaz para crear campañas

## Fase 5: Editor de Emails con Vista en Fila
- [x] Crear componente de editor de emails
- [x] Mostrar los 10 emails de la campaña en vista de secuencia/fila
- [x] Permitir editar cada email individualmente (UI básica)
- [x] Implementar preview de email en formato HTML
- [ ] Agregar editor rich text para personalización
- [x] Mostrar orden de envío (Email 1, 2, 3... 10)
- [ ] Permitir reordenar emails en la secuencia

## Fase 6: Programación y Envío Automático
- [x] Crear tabla de scheduled_emails para tracking de envíos
- [x] Implementar configuración de intervalos de envío (default: 3 días)
- [ ] Crear job/worker para envío automático de emails
- [ ] Usar credenciales SMTP del cliente para enviar
- [ ] Implementar sistema de colas para envíos
- [ ] Manejar errores de envío y reintentos
- [ ] Registrar logs de envíos exitosos y fallidos
- [x] Permitir pausar/reanudar campañas (UI)

## Fase 7: Tracking de Métricas
- [x] Crear tabla de email_metrics para almacenar estadísticas
- [ ] Implementar tracking de aperturas (pixel de seguimiento)
- [ ] Implementar tracking de clics (enlaces con redirect)
- [ ] Registrar conversiones (si aplica)
- [ ] Calcular tasa de apertura por email y campaña
- [ ] Calcular tasa de clics por email y campaña
- [ ] Calcular engagement general

## Fase 8: Dashboard de Métricas por Cliente
- [ ] Crear página de dashboard por workspace
- [ ] Mostrar métricas de campañas activas
- [ ] Gráficos de tasa de apertura y clics
- [ ] Lista de emails enviados con estado
- [ ] Filtros por campaña y rango de fechas
- [ ] Exportar reportes a CSV

## Fase 9: Vista de Administración Multicliente
- [x] Crear dashboard principal con resumen de todos los workspaces
- [ ] Mostrar campañas activas de todos los clientes
- [ ] Métricas agregadas (total de emails enviados, tasa de apertura promedio)
- [ ] Vista de tabla con todos los workspaces y sus métricas
- [x] Permitir cambiar rápidamente entre workspaces
- [ ] Alertas de campañas con bajo rendimiento

## Fase 10: Sistema de Notificaciones
- [x] Crear tabla de activity_logs para auditoría
- [ ] Implementar notificaciones automáticas al administrador
- [ ] Notificar cuando una campaña alcanza hitos importantes
- [ ] Notificar cuando hay problemas de entrega
- [ ] Notificar cuando la tasa de apertura es baja
- [ ] Notificar cuando hay conversiones altas
- [ ] Usar sistema de notificaciones de Manus (notifyOwner)

## Fase 11: Diseño y UX
- [x] Definir paleta de colores y tipografía
- [x] Crear layout principal con sidebar
- [x] Diseñar componentes reutilizables
- [x] Implementar diseño responsive
- [x] Agregar estados de carga y errores
- [x] Mejorar UX de formularios
- [ ] Agregar animaciones y transiciones

## Fase 12: Pruebas y Optimización
- [ ] Escribir tests para procedimientos críticos
- [ ] Probar flujo completo de generación y envío de campaña
- [ ] Optimizar consultas de base de datos
- [ ] Implementar caché donde sea necesario
- [ ] Validar seguridad de credenciales SMTP
- [ ] Revisar manejo de errores
