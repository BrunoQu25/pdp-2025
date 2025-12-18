# 📊 Sistema de Observabilidad y Logs

## Descripción General

La aplicación cuenta con un sistema completo de logging para mejor observabilidad, debugging y monitoreo de la aplicación tanto en backend como frontend.

## 🔧 Componentes

### Backend Logger (`lib/logger.ts`)
Logger centralizado para el servidor (API routes, funciones del servidor).

### Client Logger (`lib/client-logger.ts`)
Logger para el navegador (componentes cliente, interacciones de usuario).

## 📝 Tipos de Logs

### Backend:
- **ℹ️ INFO**: Información general y eventos exitosos
- **⚠️ WARN**: Advertencias y situaciones inesperadas
- **❌ ERROR**: Errores y excepciones
- **🐛 DEBUG**: Información detallada para debugging (solo desarrollo)
- **🔌 API**: Llamadas a API y sus respuestas

### Frontend:
- **ℹ️ INFO**: Eventos e información general
- **⚠️ WARN**: Advertencias
- **❌ ERROR**: Errores
- **🐛 DEBUG**: Debugging detallado (solo desarrollo)
- **👆 ACTION**: Acciones del usuario

## 🎯 Uso

### Backend (API Routes)

```typescript
import { logger, logApiRequest, logApiResponse, logApiError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  // Log de request entrante
  logApiRequest(request, 'Context description');
  
  try {
    // Log de información
    logger.info('Processing data', 'API:Context', { dataId: 123 });
    
    // Log de debug (solo en desarrollo)
    logger.debug('Detailed info', 'API:Context', { details: {...} });
    
    // Log de respuesta exitosa
    logApiResponse(request, 200, { result: 'success' });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    // Log de error
    logger.error('Operation failed', 'API:Context', error);
    logApiError(request, 500, error);
    
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### Frontend (Componentes React)

```typescript
'use client';
import { clientLogger } from '@/lib/client-logger';

function MyComponent() {
  const handleAction = async () => {
    // Log de acción del usuario
    clientLogger.action('Button clicked', 'MyComponent', { buttonId: 'submit' });
    
    try {
      // Log de llamada API
      clientLogger.apiCall('POST', '/api/endpoint', { data: '...' });
      
      const response = await fetch('/api/endpoint', {...});
      
      // Log de éxito
      clientLogger.apiSuccess('POST', '/api/endpoint', { result: await response.json() });
      
      // Log de información
      clientLogger.info('Operation completed', 'MyComponent');
      
    } catch (error) {
      // Log de error
      clientLogger.apiError('POST', '/api/endpoint', error);
      clientLogger.error('Operation failed', 'MyComponent', error);
    }
  };
  
  return <button onClick={handleAction}>Click me</button>;
}
```

## 📍 Implementación Actual

### APIs con Logging Completo:

1. **`/api/drinks` (GET/POST)**
   - Logs de peticiones entrantes
   - Conteo de bebidas
   - Creación exitosa con detalles
   - Errores de validación y autorización

2. **`/api/drinks/[drinkId]/vote` (POST)**
   - Logs de intento de voto
   - Voto registrado exitosamente
   - Bebida eliminada por votos (🚨)
   - Errores de autorización

3. **`/api/upload` (POST)**
   - Información del archivo (nombre, tamaño, tipo)
   - Progreso de subida a Azure
   - URL resultante
   - Errores de subida

4. **`/api/leaderboard` (GET)**
   - Cálculo de posiciones
   - Líder actual
   - Estadísticas de bebidas eliminadas

5. **`lib/storage.ts`** (Azure Blob Storage)
   - Inicio de subida
   - Tiempo de subida
   - URL generada
   - Errores de Azure

6. **`lib/db.ts`** (Base de datos en memoria)
   - Inicialización
   - Sistema de votación
   - Eliminación de bebidas por comunidad (🚨)

### Componentes Frontend con Logging:

1. **Login Page** (`app/login/page.tsx`)
   - Intento de login
   - Login exitoso
   - Errores de autenticación

2. **Upload Page** (`app/upload/page.tsx`)
   - Selección de archivo
   - Inicio de subida
   - Progreso de upload a Azure
   - Creación de registro de bebida
   - Éxito y puntos ganados

3. **Drink Detail** (`app/drink/[drinkId]/page.tsx`)
   - Carga de detalles de bebida
   - Intento de voto
   - Voto registrado
   - Eliminación por comunidad (🚨)

4. **Leaderboard** (`components/Leaderboard.tsx`)
   - Actualización de tabla
   - Líder actual
   - Número de usuarios

## 🔍 Filtrado de Logs en Consola

### Chrome DevTools:

```
# Ver solo llamadas API
/📡|API/

# Ver solo errores
/❌|ERROR/

# Ver acciones de usuario
/👆|ACTION/

# Ver todo relacionado a votos
/vote|Vote/i

# Ver eliminaciones de bebidas
/🚨/
```

### Ejemplo de salida:

```
ℹ️ [14:23:45] [API] 📡 POST /api/drinks
ℹ️ [14:23:45] [API:Drinks] Retrieved 12 drinks from database
ℹ️ [14:23:45] [API] ✅ POST /api/drinks - 200

👆 [14:24:10] [DrinkDetail] Voting against drink
ℹ️ [14:24:10] [API] 📡 POST /api/drinks/drink-123/vote
⚠️ [14:24:11] [DB:Vote] 🚨 Drink deleted by community vote
⚠️ [14:24:11] [API:Vote] 🚨 Drink deleted due to votes
ℹ️ [14:24:11] [API] ✅ POST /api/drinks/drink-123/vote - 200
```

## 🚀 Mejoras Futuras

### Para Producción:

1. **Integración con Servicios Externos**:
   - Sentry para error tracking
   - Datadog para APM
   - LogRocket para session replay

2. **Métricas**:
   - Tiempo de respuesta de APIs
   - Tasas de error
   - Patrones de uso

3. **Alertas**:
   - Notificaciones cuando hay errores críticos
   - Alertas de rendimiento

### Ejemplo de Integración con Sentry:

```typescript
// lib/logger.ts
import * as Sentry from '@sentry/nextjs';

error(message: string, context?: string, error?: any, data?: any) {
  this.log('error', message, context, data, error);
  
  // Send to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      tags: { context },
      extra: { message, data }
    });
  }
}
```

## 📈 Beneficios

✅ **Debugging más fácil**: Saber exactamente qué está pasando en cada momento
✅ **Monitoreo**: Detectar problemas antes que afecten a usuarios
✅ **Auditoría**: Rastrear acciones y cambios en el sistema
✅ **Performance**: Identificar cuellos de botella (tiempos de subida, queries lentas)
✅ **Análisis**: Entender patrones de uso de la aplicación

## 🔒 Seguridad

⚠️ **Importante**: Los logs NO deben incluir:
- Contraseñas o tokens
- Información personal sensible (solo IDs)
- Connection strings completas
- Datos de tarjetas de crédito

Actualmente, todos los logs siguen estas prácticas de seguridad.

