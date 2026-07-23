# FinTrack Backend

API REST para gestión de finanzas personales — control de ingresos, gastos, categorías y presupuestos mensuales.

## Stack

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js + TypeScript 6.x |
| Framework | Express 5 |
| ORM | Prisma 7 (PostgreSQL) |
| DB | PostgreSQL |
| Dev server | ts-node-dev (hot reload) |

## Requisitos

- Node.js >= 20
- PostgreSQL >= 14
- npm

## Configuración

```bash
# 1. Clonar e instalar dependencias
npm install

# 2. Variables de entorno
cp .env.example .env
# Editar DATABASE_URL en .env según tu conexión PostgreSQL

# 3. Crear la base de datos (si no existe)
createdb fintrack_db

# 4. Ejecutar migraciones
npx prisma migrate deploy

# 5. Iniciar servidor de desarrollo
npm run dev
```

Servidor disponible en `http://localhost:3000`.

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|----------|------------|-------------------|
| `PORT` | Puerto del servidor | `3000` |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | `postgresql://postgres:postgres@localhost:5432/fintrack_db` |
| `NODE_ENV` | Entorno (`development`, `production`) | `development` |

## Scripts

| Comando | Descripción |
|---------|------------|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Compilar TypeScript a `dist/` |
| `npm start` | Ejecutar compilación en producción |
| `npx prisma migrate dev` | Crear y aplicar migración (desarrollo) |
| `npx prisma migrate deploy` | Aplicar migraciones pendientes (producción) |
| `npx prisma studio` | UI web para explorar la base de datos |

## Estructura del proyecto

```
src/
├── config/          # Configuración (Prisma client, pool PG)
│   ├── prisma.ts    # PrismaClient singleton
│   └── database.ts  # Pool de conexiones raw (pg)
├── models/          # DTOs y tipos públicos
├── services/        # Lógica de negocio
├── controllers/     # Manejadores HTTP
├── routes/          # Definición de rutas Express
├── middlewares/     # Middlewares (pendiente)
├── utils/           # Utilidades (pendiente)
└── index.ts         # Entrypoint
```

**Flujo:** `routes/*` → `controllers/*` → `services/*` → Prisma Client / `models/*`

## API

### Health

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado del servidor y conexión a BD |

### Usuarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users` | Listar todos los usuarios |
| GET | `/api/users/:id` | Obtener usuario por ID |
| POST | `/api/users` | Crear usuario |
| PUT | `/api/users/:id` | Actualizar usuario |
| DELETE | `/api/users/:id` | Eliminar usuario |

### Categorías, Transacciones, Presupuestos

Los modelos DTO están definidos, pero la implementación (rutas, controladores y servicios) está pendiente.

## Base de datos

![Diagrama ER](https://mermaid.ink/svg/ZXJkaWFncmFtCiAgVXNlciB8fC0tb3sgQ2F0ZWdvcnkKICBVc2VyIHx8LS1veyBUcmFuc2FjdGlvbgogIFVzZXIgfHwtLW97IEJ1ZGdldAogIENhdGVnb3J5IHx8LS1veyBUcmFuc2FjdGlvbgogIENhdGVnb3J5IHx8LS1veyBCdWRnZXQ=)

- **User** → tiene muchas Categorías, Transacciones, Presupuestos
- **Category** → pertenece a un Usuario; tiene muchas Transacciones y Presupuestos
- **Transaction** → pertenece a un Usuario y una Categoría; tipo `INCOME` o `EXPENSE`
- **Budget** → pertenece a un Usuario y una Categoría; define un monto límite por mes/año

Todas las tablas usan snake_case con `@@map` / `@map`. IDs son UUIDs.

## Estado del proyecto

- [x] Modelos de datos y migración inicial
- [x] CRUD de usuarios
- [ ] CRUD de categorías
- [ ] CRUD de transacciones
- [ ] CRUD de presupuestos
- [ ] Autenticación (bcrypt para passwords)
- [ ] Middlewares (validación, auth)
- [ ] Tests
