# Parque del Plata 2025 - Bebidas, Carne y Fútbol 🍺⚽🥩

Aplicación web móvil para registrar actividades de bebida con amigos. Construida con Next.js, TypeScript y Tailwind CSS.

## Características

- 🔐 **Autenticación Segura con Google**: Los usuarios seleccionan su perfil y se autentican con Google OAuth (ver [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md))
- 📸 **Subida de Fotos**: Toma fotos directamente desde la cámara de tu teléfono
- 🏆 **Tabla en Tiempo Real**: Ve quién va ganando en tiempo real
- 📊 **Sistema de Puntos**: Diferentes tamaños de bebida otorgan diferentes puntos
  - Pequeño 🥃: 1 punto
  - Mediano 🍺: 2 puntos
  - Grande 🍻: 3 puntos
  - Extra Grande 🍾: 5 puntos
- 📜 **Historial**: Ver todas las bebidas subidas con marcas de tiempo
- ☁️ **Azure Storage**: Todas las fotos almacenadas de forma segura en Azure Blob Storage
- 🗳️ **Sistema de Votación**: La comunidad puede cuestionar entradas sospechosas
- 👁️ **Observabilidad Completa**: Sistema de logging para monitoreo y debugging (ver [LOGGING.md](./LOGGING.md))

## Paleta de Colores

### Colores Principales
- **Blanco** (#FFFFFF): Color base predominante para fondos y tarjetas
- **Azul** (#3B82F6 - blue-500): Color principal para elementos interactivos
- **Naranja** (#F97316 - orange-500): Color secundario para acentos y botones

### Gradientes
- **Principal**: `from-blue-500 via-orange-500 to-orange-600`
- **Fondos sutiles**: `from-gray-50 via-white to-blue-50`
- **Acentos suaves**: `from-blue-50 to-orange-50`

### Diseño
- ✨ Predominantemente blanco con toques de color
- 🎨 Gradientes suaves en lugar de colores planos
- 💫 Sombras sutiles para profundidad
- 🔲 Bordes ligeros (gray-100, gray-200)
- 🌟 Efectos de hover con transiciones suaves

## Comenzar

### Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Azure Storage (opcional para desarrollo)

### Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Crear un archivo `.env.local` en el directorio raíz:
```bash
cp .env.example .env.local
```

3. (Opcional) Agregar credenciales de Azure Storage a `.env.local`:
```
AZURE_STORAGE_CONNECTION_STRING=tu_cadena_de_conexion_aqui
AZURE_STORAGE_CONTAINER_NAME=drink-proofs
NEXTAUTH_SECRET=tu-clave-secreta-cambiar-en-produccion
NEXTAUTH_URL=http://localhost:3000
```

Si no se proporcionan credenciales de Azure, la aplicación usará imágenes de marcador de posición en modo desarrollo.

### Ejecutar la Aplicación

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador móvil.

### Construir para Producción

```bash
npm run build
npm start
```

## Personalización

### Agregar Usuarios

Edita `types/index.ts` y modifica el array `HARDCODED_USERS`:

```typescript
export const HARDCODED_USERS: User[] = [
  {
    id: '1',
    username: 'tunombre',
    displayName: 'Tu Nombre',
    photoUrl: '/avatars/tunombre.jpg',
    points: 0
  },
  // Agregar más usuarios...
];
```

### Agregar Foto de la Casa

Coloca la foto de tu casa en la carpeta `public` y actualiza `app/page.tsx`:

```tsx
<img src="/house.jpg" alt="La Casa" className="w-full h-full object-cover" />
```

### Subir Avatares de Usuarios

1. Crear una carpeta: `public/avatars/`
2. Agregar fotos de usuarios: `bruno.jpg`, `joao.jpg`, etc.
3. Actualizar el `photoUrl` en `types/index.ts`

## Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v3
- **Autenticación**: NextAuth.js
- **Almacenamiento**: Azure Blob Storage
- **Gestión de Estado**: React Hooks + API Routes
- **Observabilidad**: Sistema de logging centralizado (backend + frontend)

## Estructura del Proyecto

```
├── app/
│   ├── api/              # Rutas API
│   │   ├── auth/         # Autenticación
│   │   ├── drinks/       # Gestión de bebidas y votación
│   │   ├── leaderboard/  # Datos de tabla de posiciones
│   │   └── upload/       # Subida de fotos
│   ├── drink/[drinkId]/  # Página de detalles de bebida
│   ├── user/[userId]/    # Página de perfil de usuario
│   ├── login/            # Página de inicio de sesión
│   ├── upload/           # Página de subir bebida
│   ├── history/          # Página de historial de bebidas
│   └── page.tsx          # Página principal
├── components/           # Componentes React
├── lib/                  # Funciones utilitarias
│   ├── logger.ts         # Logger del servidor
│   ├── client-logger.ts  # Logger del cliente
│   ├── db.ts             # Base de datos en memoria
│   └── storage.ts        # Azure Storage
├── types/                # Tipos TypeScript
└── public/               # Recursos estáticos
```

## Optimización Móvil

- Diseño responsivo optimizado para pantallas móviles
- Integración de cámara para subida de fotos
- Elementos UI optimizados para táctil
- Actualizaciones en tiempo real cada 5 segundos
- Previene zoom al enfocar inputs (iOS)

## Notas

- Esta es una aplicación demo usando almacenamiento en memoria
- Para producción, integrar con una base de datos real (PostgreSQL, MongoDB, etc.)
- Agregar manejo de errores y validación apropiados
- Implementar limitación de tasa para subidas
- Agregar compresión de imágenes antes de subir
- Considerar usar WebSockets para actualizaciones en tiempo real en lugar de polling

## Licencia

MIT

---

Hecho con 🍺 por la pandilla de Parque del Plata 2025
