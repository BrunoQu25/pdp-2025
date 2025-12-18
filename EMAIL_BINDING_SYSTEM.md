# Sistema de Binding Dinámico Email-Usuario

## 🔗 Cómo Funciona

Este sistema permite que cualquier persona con una cuenta de Google pueda vincularse a un usuario de la aplicación (Bruno, João, Pedro, Miguel) de forma permanente.

### Primera vez - Proceso de Vinculación

1. **Seleccionar Usuario**: El usuario selecciona su perfil (ej: João)
2. **Autenticarse con Google**: Hace clic en "Iniciar con Google"
3. **Vinculación Automática**: 
   - Si el email de Google nunca se usó antes → Se vincula a João
   - Si el usuario João ya está tomado → Error, debe elegir otro usuario
   - Si el email ya estaba vinculado a otro usuario → Inicia sesión como ese usuario

### Siguientes veces - Login Directo

1. **Solo Google Sign-In**: Ya no necesita seleccionar usuario
2. **Reconocimiento Automático**: El sistema reconoce el email y lo lleva directamente a su perfil
3. **Sin selección**: La página de login puede detectar y redirigir automáticamente

## 📊 Reglas del Sistema

### ✅ Permitido
- Un email puede vincularse a **un solo usuario**
- Un usuario puede vincularse a **un solo email**
- Emails diferentes pueden seleccionar usuarios diferentes

### ❌ No Permitido
- Un email **no puede** cambiar de usuario después de vincularse
- Un usuario **no puede** tener múltiples emails vinculados
- No se puede "robar" un usuario que ya está tomado

## 🔧 Endpoints de API

### POST `/api/auth/bind`
Vincula el email autenticado actual a un usuario.

**Request:**
```json
{
  "userId": "1"
}
```

**Response exitoso:**
```json
{
  "success": true,
  "userId": "1",
  "username": "bruno"
}
```

**Error - Usuario ya tomado:**
```json
{
  "error": "User already bound to another email",
  "code": "USER_TAKEN"
}
```

### GET `/api/auth/bind`
Verifica si el email actual está vinculado.

**Response - Vinculado:**
```json
{
  "bound": true,
  "userId": "1",
  "username": "bruno",
  "displayName": "Bruno"
}
```

**Response - No vinculado:**
```json
{
  "bound": false
}
```

### GET `/api/auth/bindings`
Lista todos los bindings activos (solo para debugging).

**Response:**
```json
{
  "bindings": [
    {
      "email": "example@gmail.com",
      "userId": "1",
      "username": "bruno",
      "displayName": "Bruno"
    }
  ],
  "count": 1
}
```

## 💾 Almacenamiento

Los bindings se almacenan en memoria en un `Map<email, userId>`:

```typescript
// lib/db.ts
let emailToUserBindings: Map<string, string> = new Map();
```

### ⚠️ Importante para Producción

En producción, esto debe guardarse en una base de datos permanente:

```sql
CREATE TABLE user_bindings (
  email VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
```

## 🧪 Probar el Sistema

### 1. Primera vinculación

```bash
# Terminal 1 - Iniciar servidor
npm run dev
```

1. Abre `http://localhost:3000`
2. Selecciona "Bruno"
3. Haz clic en "Iniciar con Google"
4. Inicia sesión con tu email de Google
5. ✅ Ahora tu email está vinculado a Bruno

### 2. Verificar binding

```bash
# En el navegador
http://localhost:3000/api/auth/bindings
```

Verás:
```json
{
  "bindings": [
    {
      "email": "tu-email@gmail.com",
      "userId": "1",
      "username": "bruno",
      "displayName": "Bruno"
    }
  ],
  "count": 1
}
```

### 3. Intentar tomar el mismo usuario

1. Cierra sesión
2. Abre en navegador privado / incógnito
3. Selecciona "Bruno"
4. Inicia con una cuenta de Google diferente
5. ❌ Error: "Usuario ya está siendo usado por otra cuenta"

### 4. Login automático

1. Cierra sesión
2. Ve a `http://localhost:3000/login`
3. Haz clic en "Iniciar con Google"
4. Usa el mismo email de antes
5. ✅ Automáticamente entras como Bruno (sin seleccionar)

## 🔐 Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                      Usuario Nuevo                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  ┌──────────────────────┐
                  │  Selecciona Usuario  │
                  │     (ej: João)       │
                  └──────────────────────┘
                              │
                              ▼
                  ┌──────────────────────┐
                  │ Click "Sign in with  │
                  │      Google"         │
                  └──────────────────────┘
                              │
                              ▼
                  ┌──────────────────────┐
                  │  Google OAuth Flow   │
                  └──────────────────────┘
                              │
                              ▼
                  ┌──────────────────────┐
                  │ POST /api/auth/bind  │
                  │  { userId: "2" }     │
                  └──────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
    ┌──────────────────┐      ┌────────────────────┐
    │  João disponible │      │  João ya tomado    │
    └──────────────────┘      └────────────────────┘
                │                           │
                ▼                           ▼
    ┌──────────────────┐      ┌────────────────────┐
    │  Binding creado  │      │  Error 409         │
    │  ✅ Success      │      │  ❌ Elegir otro    │
    └──────────────────┘      └────────────────────┘
                │
                ▼
    ┌──────────────────┐
    │ Redirect a Home  │
    │  como João       │
    └──────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Usuario Ya Vinculado                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  ┌──────────────────────┐
                  │ Click "Sign in with  │
                  │      Google"         │
                  └──────────────────────┘
                              │
                              ▼
                  ┌──────────────────────┐
                  │  Google OAuth Flow   │
                  └──────────────────────┘
                              │
                              ▼
                  ┌──────────────────────┐
                  │ GET /api/auth/bind   │
                  └──────────────────────┘
                              │
                              ▼
                  ┌──────────────────────┐
                  │  Binding encontrado  │
                  │   userId: "2"        │
                  └──────────────────────┘
                              │
                              ▼
                  ┌──────────────────────┐
                  │  Auto-login como     │
                  │       João           │
                  │   ✅ Directo         │
                  └──────────────────────┘
```

## 🎯 Ventajas del Sistema

✅ **Seguridad**: Solo Google puede validar la identidad  
✅ **Flexibilidad**: No necesitas pre-configurar emails  
✅ **First-come-first-served**: El primero en llegar toma el usuario  
✅ **Persistencia**: Una vez vinculado, siempre es el mismo usuario  
✅ **Transparente**: Los usuarios no necesitan recordar qué usuario eligieron

## 🐛 Debugging

### Ver todos los bindings activos

```bash
curl http://localhost:3000/api/auth/bindings
```

### Limpiar todos los bindings (reiniciar servidor)

Los bindings están en memoria, así que reiniciar el servidor los borra todos:

```bash
# Ctrl+C en la terminal del servidor
npm run dev
```

### En producción: Endpoint para desvincu lar

Podrías agregar un endpoint DELETE para permitir que un admin desvincule usuarios:

```typescript
// app/api/auth/unbind/route.ts
export async function DELETE(request: NextRequest) {
  const { email } = await request.json();
  // Lógica para eliminar el binding
}
```

## 📝 Mejoras Futuras

1. **Persistencia en DB**: Guardar bindings en PostgreSQL/MySQL
2. **Cambio de usuario**: Permitir cambiar de usuario (con confirmación)
3. **Admin panel**: UI para ver y gestionar bindings
4. **Tiempo de expiración**: Bindings que expiran después de X días de inactividad
5. **Múltiples emails**: Permitir vincular emails secundarios
6. **Logs de auditoría**: Registrar todos los cambios de binding
