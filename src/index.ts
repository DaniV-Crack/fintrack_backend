import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Importar rutas
import healthRouter from "./routes/health";

// Cargar variables de entorno (SIEMPRE primero)
dotenv.config();

// Crear la aplicación Express con tipado TypeScript
const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "3000", 10);

// ────────────────────────────────────────────────────
// MIDDLEWARES GLOBALES
// Los middlewares se ejecutan en ORDEN para cada request
// ────────────────────────────────────────────────────
// Permitir requests desde otros dominios (necesario para el frontend)
app.use(cors());
// Parsear JSON del body de los requests
app.use(express.json());
// Parsear form data del body
app.use(express.urlencoded({ extended: true }));

// ────────────────────────────────────────────────────
// RUTAS
// ────────────────────────────────────────────────────
// Ruta de health check
app.use("/health", healthRouter);

// Ruta raíz informativa
app.get("/", (req: Request, res: Response) => {
  res.json({
    project: "TaskFlow API",
    version: "1.0.0",
    clase: 1,
    description: "Servidor Express con TypeScript + PostgreSQL",
    endpoints: {
      health: "GET /health",
    },
  });
});

// ────────────────────────────────────────────────────
// MANEJO DE RUTAS NO ENCONTRADAS (404)
// ────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.path,
    method: req.method,
  });
});

// ────────────────────────────────────────────────────
// INICIAR EL SERVIDOR
// ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("\n🚀 TaskFlow API iniciada");
  console.log(`📡 Puerto: ${PORT}`);
  console.log(`🔍 Health: http://localhost:${PORT}/health`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}\n`);
});

export default app;
