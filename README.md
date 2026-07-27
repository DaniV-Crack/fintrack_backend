# FinTrack Backend

API REST para gestión de finanzas personales — control de ingresos, gastos, categorías y presupuestos mensuales.

## Stack

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js + TypeScript 6.x (strict mode) |
| Framework | Express 5 |
| ORM | Prisma 7 + adapter-pg |
| Base de datos | PostgreSQL |
| Autenticación | JWT + bcryptjs |
| Validación | Zod 4 |
| Documentación | Swagger (swagger-jsdoc + swagger-ui-express) |
| Dev server | ts-node-dev (hot reload) |

## Arquitectura

```
┌──────────┐     ┌──────────────┐     ┌──────────┐     ┌──────────────────┐
│  Routes  │ ──> │ Controllers  │ ──> │ Services │ ──> │  Prisma Client   │
│          │     │              │     │          │     │  (PostgreSQL)     │
└──────────┘     └──────────────┘     └──────────┘     └──────────────────┘
                       │                                      │
                       │ res.json(successResponse(...))       │ throw { status, message }
                       v                                      v
               ┌──────────────┐                      ┌──────────────────┐
               │ ApiResponse  │                      │ errorMiddleware  │
               │ (format)     │                      │ (errorResponse)  │
               └──────────────┘                      └──────────────────┘
```

**Flujo de datos:**
1. **Routes** definen el middleware chain (auth, validación Zod)
2. **Controllers** reciben el `Request`, llaman al service, construyen la respuesta HTTP con `successResponse()` o `errorResponse()`
3. **Services** contienen la lógica de negocio y lanzan errores como `{ status, message }`
4. **Error middleware** captura errores no manejados y responde con formato estándar

## Requisitos

- Node.js >= 20
- PostgreSQL >= 14
- npm

## Configuración rápida

```bash
# 1. Clonar e instalar dependencias
npm install

# 2. Variables de entorno
cp .env.example .env
# Editar DATABASE_URL, JWT_SECRET y demás en .env

# 3. Crear la base de datos (si no existe)
createdb fintrack_db

# 4. Ejecutar migraciones
npx prisma migrate deploy

# 5. Iniciar servidor de desarrollo
npm run dev
```

Servidor disponible en `http://localhost:3000`.
Documentación Swagger en `http://localhost:3000/api-docs`.

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|----------|------------|-------------------|
| `PORT` | Puerto del servidor | `3000` |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | `postgresql://postgres:postgres@localhost:5432/fintrack_db` |
| `NODE_ENV` | Entorno (`development`, `production`) | `development` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | — |
| `JWT_EXPIRES_IN` | Duración del token JWT | `7d` |

## Scripts

| Comando | Descripción |
|---------|------------|
| `npm run dev` | Servidor de desarrollo con recarga automática (ts-node-dev) |
| `npm run build` | Compilar TypeScript a `dist/` |
| `npm start` | Ejecutar compilación en producción |
| `npx prisma migrate dev` | Crear y aplicar migración (desarrollo) |
| `npx prisma migrate deploy` | Aplicar migraciones pendientes (producción) |
| `npx prisma studio` | UI web para explorar la base de datos |
| `npx prisma validate` | Validar schema de Prisma |
| `npx prisma generate` | Regenerar Prisma Client |

## API — Endpoints

### Formato de respuestas

Todas las respuestas siguen un formato estandarizado:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}
```

**Éxito (200/201):**
```json
{
  "success": true,
  "message": "Usuario obtenido correctamente",
  "data": { ... }
}
```

**Error (400/401/403/404/409/500):**
```json
{
  "success": false,
  "message": "Usuario no encontrado",
  "data": null
}
```

**Error de validación Zod (400):**
```json
{
  "success": false,
  "message": "Error de validación",
  "data": {
    "fields": {
      "email": "Email inválido",
      "password": "La contraseña debe tener al menos 6 caracteres"
    }
  }
}
```

### Health

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | No | Estado del servidor y conexión a BD |

### Autenticación

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Registrar nuevo usuario (devuelve JWT) |
| POST | `/api/auth/login` | No | Iniciar sesión (devuelve JWT) |
| GET | `/api/auth/me` | Sí | Obtener datos del usuario autenticado |

**Register** — `POST /api/auth/register`
```json
// Request
{ "name": "Juan Pérez", "email": "juan@example.com", "password": "123456" }
// Response 201
{ "success": true, "message": "Usuario registrado correctamente", "data": { "token": "jwt...", "user": { "id": "uuid", "name": "Juan Pérez", "email": "juan@example.com", "createdAt": "..." } } }
```

**Login** — `POST /api/auth/login`
```json
// Request
{ "email": "juan@example.com", "password": "123456" }
// Response 200
{ "success": true, "message": "Inicio de sesión exitoso", "data": { "token": "jwt...", "user": { "id": "uuid", "name": "Juan Pérez", "email": "juan@example.com" } } }
```

### Usuarios

| Método | Ruta | Auth | Ownership | Descripción |
|--------|------|------|-----------|-------------|
| GET | `/api/users` | Sí | No (admin) | Listar todos los usuarios |
| GET | `/api/users/:id` | Sí | No | Obtener usuario por ID |
| POST | `/api/users` | No | N/A | Crear usuario (registro público) |
| PUT | `/api/users/:id` | Sí | Sí (solo propio perfil) | Actualizar usuario |
| DELETE | `/api/users/:id` | Sí | Sí (solo propio perfil) | Eliminar usuario |

### Categorías

| Método | Ruta | Auth | Ownership | Descripción |
|--------|------|------|-----------|-------------|
| GET | `/api/categories` | Sí | Sí (filtro userId) | Listar categorías del usuario |
| GET | `/api/categories/:id` | Sí | Sí (findFirst por userId) | Obtener categoría |
| POST | `/api/categories` | Sí | Sí (userId asignado) | Crear categoría |
| PUT | `/api/categories/:id` | Sí | Sí (findFirst por userId) | Actualizar categoría |
| DELETE | `/api/categories/:id` | Sí | Sí (findFirst por userId) | Eliminar categoría |

Parámetros opcionales en GET `/api/categories`:
- `type` — filtrar por `INCOME` o `EXPENSE`

### Transacciones

| Método | Ruta | Auth | Ownership | Descripción |
|--------|------|------|-----------|-------------|
| GET | `/api/transactions` | Sí | Sí (filtro userId) | Listar transacciones (paginado) |
| GET | `/api/transactions/summary` | Sí | Sí (filtro userId) | Resumen de ingresos/gastos |
| GET | `/api/transactions/:id` | Sí | Sí (findFirst por userId) | Obtener transacción |
| POST | `/api/transactions` | Sí | Sí (userId asignado) | Crear transacción |
| PUT | `/api/transactions/:id` | Sí | Sí (findFirst por userId) | Actualizar transacción |
| DELETE | `/api/transactions/:id` | Sí | Sí (findFirst por userId) | Eliminar transacción |

Parámetros opcionales en GET `/api/transactions`:
- `categoryId` — filtrar por categoría
- `type` — `INCOME` o `EXPENSE`
- `dateFrom` / `dateTo` — rango de fechas (ISO 8601)
- `page` — página (default 1)
- `limit` — elementos por página (default 20)

Respuesta paginada:
```json
{
  "success": true,
  "message": "Transacciones obtenidas correctamente",
  "data": {
    "items": [ { "id": "...", "amount": 150.50, "type": "EXPENSE", ... } ],
    "pagination": { "page": 1, "limit": 20, "total": 50, "totalPages": 3 }
  }
}
```

### Presupuestos

| Método | Ruta | Auth | Ownership | Descripción |
|--------|------|------|-----------|-------------|
| GET | `/api/budgets` | Sí | Sí (filtro userId) | Listar presupuestos |
| GET | `/api/budgets/:id` | Sí | Sí (findFirst por userId) | Obtener presupuesto |
| GET | `/api/budgets/:id/progress` | Sí | Sí (findFirst por userId) | Progreso gasto vs presupuesto |
| POST | `/api/budgets` | Sí | Sí (userId asignado) | Crear presupuesto |
| PUT | `/api/budgets/:id` | Sí | Sí (findFirst por userId) | Actualizar presupuesto |
| DELETE | `/api/budgets/:id` | Sí | Sí (findFirst por userId) | Eliminar presupuesto |

Parámetros opcionales en GET `/api/budgets`:
- `month` — filtrar por mes (1-12)
- `year` — filtrar por año

### Dashboard

| Método | Ruta | Auth | Ownership | Descripción |
|--------|------|------|-----------|-------------|
| GET | `/api/dashboard` | Sí | Sí (filtro userId) | Resumen mensual completo |

Parámetros opcionales:
- `month` — mes (1-12, default actual)
- `year` — año (default actual)

## Autenticación y autorización

### JWT (register / login / me)

1. **Register** — hashea la contraseña con bcryptjs (salt rounds = 10), almacena solo el hash, devuelve JWT + datos del usuario
2. **Login** — busca usuario por email, compara contraseña con bcrypt, genera JWT con `{ userId, email }` y expiración configurable
3. **Middleware `authMiddleware`** — extrae token del header `Authorization: Bearer <token>`, verifica con `jwt.verify()`, adjunta `req.user`

### Ownership

Los endpoints protegidos verifican que el usuario autenticado solo acceda a sus propios recursos:

```typescript
// Ejemplo en servicios: filtrar por userId
prisma.transaction.findFirst({ where: { id, userId } });

// Ejemplo en controladores (usuarios): comparar IDs
if (req.params.id !== req.user!.userId) {
  res.status(403).json(errorResponse("No tienes permiso"));
  return;
}
```

Recursos protegidos por ownership:
- **Categorías** — todas las operaciones filtran por userId
- **Transacciones** — todas las operaciones filtran por userId
- **Presupuestos** — todas las operaciones filtran por userId
- **Dashboard** — filtrado por userId
- **Usuarios** — PUT y DELETE solo sobre el propio perfil (403 si no coincide)

## Modelo de datos

```
User
 ├── 1:N ──> Category      (userId FK, CASCADE delete)
 ├── 1:N ──> Transaction    (userId FK, CASCADE delete)
 └── 1:N ──> Budget         (userId FK, CASCADE delete)

Category
 ├── N:1 ──> User
 ├── 1:N ──> Transaction    (categoryId FK, CASCADE delete)
 ├── 1:N ──> Budget         (categoryId FK, CASCADE delete)
 └── @@unique([userId, name, type])

Transaction
 ├── N:1 ──> User
 └── N:1 ──> Category

Budget
 ├── N:1 ──> User
 ├── N:1 ──> Category
 └── @@unique([userId, categoryId, month, year])
```

| Tabla | Columnas clave |
|-------|---------------|
| `users` | `id` (UUID PK), `name`, `email` (UNIQUE), `password_hash`, `created_at` |
| `categories` | `id` (UUID PK), `user_id` (FK), `name`, `type` (INCOME/EXPENSE), `created_at` |
| `transactions` | `id` (UUID PK), `user_id` (FK), `category_id` (FK), `amount` (DECIMAL 12,2), `type`, `description`?, `transaction_date` |
| `budgets` | `id` (UUID PK), `user_id` (FK), `category_id` (FK), `amount` (DECIMAL 12,2), `month`, `year` |

Todas las tablas usan snake_case con `@@map` / `@map`. IDs son UUIDs. Las claves foráneas usan `ON DELETE CASCADE`.

## Estructura del proyecto

```
src/
├── config/
│   ├── database.ts     # Pool raw de pg (solo health check)
│   ├── prisma.ts       # PrismaClient singleton (con adapter-pg)
│   └── swagger.ts      # Configuración Swagger (36 schemas, 16 paths)
├── controllers/
│   ├── auth.controller.ts       # POST register, POST login, GET me
│   ├── user.controller.ts       # CRUD usuarios
│   ├── category.controller.ts   # CRUD categorías
│   ├── transaction.controller.ts # CRUD transacciones + summary
│   ├── budget.controller.ts     # CRUD presupuestos + progress
│   └── dashboard.controller.ts  # GET resumen mensual
├── middlewares/
│   ├── auth.middleware.ts    # Extrae y verifica JWT (Bearer token)
│   ├── error.middleware.ts   # Captura errores no manejados
│   └── validate.middleware.ts # Valida body/params/query con Zod
├── models/
│   ├── auth.model.ts         # DTOs: JwtPayload, RegisterDto, LoginDto, AuthResponse
│   ├── user.model.ts         # DTOs: UserPublic, CreateUserDto, UpdateUserDto
│   ├── category.model.ts     # DTOs: CategoryPublic, Create/UpdateCategoryDto
│   ├── transaction.model.ts  # DTOs: TransactionPublic, Create/UpdateTransactionDto
│   ├── budget.model.ts       # DTOs: BudgetPublic, Create/UpdateBudgetDto
│   └── dashboard.model.ts    # DTOs: DashboardResponse, BalanceDto, etc.
├── routes/
│   ├── health.ts             # GET /health
│   ├── auth.route.ts         # /api/auth
│   ├── user.route.ts         # /api/users
│   ├── category.route.ts     # /api/categories
│   ├── transaction.route.ts  # /api/transactions
│   ├── budget.route.ts       # /api/budgets
│   └── dashboard.route.ts    # /api/dashboard
├── schemas/
│   ├── auth.schema.ts        # Zod: registerSchema, loginSchema
│   ├── user.schema.ts        # Zod: createUserSchema, updateUserSchema
│   ├── category.schema.ts    # Zod: createCategorySchema, updateCategorySchema
│   ├── transaction.schema.ts # Zod: createTransactionSchema, updateTransactionSchema
│   └── budget.schema.ts      # Zod: createBudgetSchema, updateBudgetSchema
├── services/
│   ├── auth.service.ts       # Register (bcrypt), Login (bcrypt+JWT)
│   ├── user.service.ts       # CRUD usuarios + existsByEmail
│   ├── category.service.ts   # CRUD categorías con ownership
│   ├── transaction.service.ts # CRUD transacciones + summary paginado
│   ├── budget.service.ts     # CRUD presupuestos + getProgress
│   └── dashboard.service.ts  # Resumen mensual agregado
├── utils/
│   └── api-response.ts       # ApiResponse<T>, successResponse, errorResponse
└── index.ts                  # Entrypoint: Express app, middlewares, routes
```

**Flujo completo de una petición:**

```
Request
  │
  ▼
Route (middleware chain)
  ├── authMiddleware      (JWT → req.user)
  └── validate(schema)    (Zod → 400 si inválido)
  │
  ▼
Controller
  ├── Extrae datos de req (body, params, query, user)
  ├── Llama al Service
  └── Responde con successResponse() / errorResponse()
  │
  ▼
Service
  ├── Lógica de negocio
  ├── Consultas a Prisma (con ownership: filter by userId)
  └── throw { status, message } si error
  │
  ▼
Error Middleware (solo si el controller no capturó el error)
  └── errorResponse() con status correspondiente
```

## Códigos de error HTTP utilizados

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Respuestas exitosas GET, PUT, DELETE |
| 201 | Created | Respuestas exitosas POST |
| 400 | Bad Request | Error de validación Zod |
| 401 | Unauthorized | Token faltante, inválido o expirado |
| 403 | Forbidden | No eres propietario del recurso |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Email duplicado, categoría duplicada, presupuesto duplicado |
| 500 | Internal Server Error | Error inesperado del servidor |

## Estado del proyecto

- [x] Modelo de datos y migración inicial
- [x] CRUD usuarios (con autenticación y ownership)
- [x] Autenticación JWT con bcrypt (register, login, me)
- [x] CRUD categorías (con ownership)
- [x] CRUD transacciones (con ownership, paginación, summary)
- [x] CRUD presupuestos (con ownership, progreso)
- [x] Dashboard mensual
- [x] Validación Zod en todos los POST/PUT
- [x] Middlewares (auth, validación, errores)
- [x] Formato de respuesta ApiResponse estandarizado
- [x] Documentación Swagger (16 paths, 36 schemas)
