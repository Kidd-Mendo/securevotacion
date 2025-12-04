# Guía de Despliegue - SecureVotacion

## Cambios Importantes

Se ha eliminado completamente la autenticación de Replit y se ha implementado un sistema de autenticación robusto basado en JWT (JSON Web Tokens) y bcrypt para el hash de contraseñas.

## Características del Nuevo Sistema de Autenticación

### 1. **Autenticación JWT**
- Tokens de acceso válidos por 7 días
- Verificación automática de tokens en cada petición
- Sin dependencia de sesiones del servidor

### 2. **Seguridad de Contraseñas**
- Hash bcrypt con factor de coste 10
- Validación de fortaleza de contraseñas:
  - Mínimo 8 caracteres
  - Al menos una mayúscula
  - Al menos una minúscula
  - Al menos un número
  - Al menos un carácter especial

### 3. **Endpoints de Autenticación**

#### Registro de Usuario
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "Contraseña123!",
  "firstName": "Nombre",
  "lastName": "Apellido",
  "role": "student" // opcional: "student", "teacher", "administrator", "authority"
}
```

#### Inicio de Sesión
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "Contraseña123!"
}

Respuesta:
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "firstName": "Nombre",
    "lastName": "Apellido",
    "role": "student"
  }
}
```

#### Obtener Usuario Actual
```
GET /api/auth/user
Authorization: Bearer <token>
```

### 4. **Usuario Administrador por Defecto**

Al iniciar el sistema por primera vez, se crea automáticamente un usuario administrador:

- **Email:** admin@votacion.edu
- **Contraseña:** Admin123!
- **Rol:** administrator

⚠️ **IMPORTANTE:** Cambia esta contraseña inmediatamente después del primer inicio de sesión.

## Configuración para Despliegue

### Variables de Entorno Requeridas

Crea un archivo `.env` basado en `.env.example`:

```bash
DATABASE_URL=postgresql://usuario:contraseña@host:5432/basedatos
JWT_SECRET=tu-clave-secreta-super-segura-y-aleatoria
NODE_ENV=production
PORT=5000
```

⚠️ **CRÍTICO:** Genera una clave JWT_SECRET única y segura para producción:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Despliegue en Vercel

1. **Instalar Vercel CLI:**
```bash
npm i -g vercel
```

2. **Configurar la base de datos:**
   - Crea una base de datos PostgreSQL (recomendado: Neon, Supabase, o Vercel Postgres)
   - Copia la URL de conexión

3. **Configurar variables de entorno en Vercel:**
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
```

4. **Desplegar:**
```bash
npm run build
vercel --prod
```

### Despliegue en Otras Plataformas

#### Railway
1. Conecta tu repositorio de GitHub
2. Agrega las variables de entorno en Settings
3. Railway detectará automáticamente el proyecto Node.js

#### Render
1. Crea un nuevo Web Service
2. Conecta tu repositorio
3. Configura las variables de entorno
4. Build Command: `npm run build`
5. Start Command: `npm start`

#### Fly.io
```bash
fly launch
fly secrets set DATABASE_URL="tu_url"
fly secrets set JWT_SECRET="tu_secreto"
fly deploy
```

## Migraciones de Base de Datos

Ejecuta las migraciones antes del primer despliegue:

```bash
npm run db:push
```

Esto creará todas las tablas necesarias con los nuevos campos de autenticación:
- `password` (varchar, requerido)
- `passwordResetToken` (varchar, opcional)
- `passwordResetExpires` (timestamp, opcional)

## Seguridad en Producción

### 1. Variables de Entorno
- ✅ Nunca commits archivos `.env` al repositorio
- ✅ Usa un JWT_SECRET fuerte y único por entorno
- ✅ Mantén DATABASE_URL segura

### 2. HTTPS
- ✅ Asegúrate de que tu aplicación use HTTPS en producción
- ✅ Los tokens JWT solo se transmiten sobre conexiones seguras

### 3. CORS
Configura CORS apropiadamente para tu dominio de producción:

```typescript
// En server/index.ts (si es necesario)
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
```

## Testing Local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Verificar tipos TypeScript
npm run check

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

## Cambios en el Frontend

El frontend necesitará actualizar la lógica de autenticación:

1. **Almacenar el token JWT** en localStorage o sessionStorage
2. **Incluir el token** en cada petición:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```
3. **Manejar la expiración** del token (redirigir al login)

## Soporte

Para más información o ayuda con el despliegue, consulta la documentación de la plataforma específica o abre un issue en el repositorio.
