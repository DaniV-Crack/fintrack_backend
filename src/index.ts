import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import healthRouter from "./routes/health";
import usersRouter from "./routes/user.route";
import authRouter from "./routes/auth.route";
import categoryRouter from "./routes/category.route";
import transactionRouter from "./routes/transaction.route";
import budgetRouter from "./routes/budget.route";
import dashboardRouter from "./routes/dashboard.route";
import { swaggerSpec } from "./config/swagger";
import { errorMiddleware } from "./middlewares/error.middleware";
import { successResponse } from "./utils/api-response";

dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "3000", 10);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL, // ← se toma de Railway
].filter(Boolean) as string[];


// ── Middlewares globales ──────────────────────────
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api-docs.json", (_req: Request, res: Response) => {
  res.json(swaggerSpec);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/budgets", budgetRouter);
app.use("/api/dashboard", dashboardRouter);

/**
 * @openapi
 * /:
 *   get:
 *     tags: [Info]
 *     summary: Información general de la API
 *     responses:
 *       200:
 *         description: Información del proyecto y sus endpoints
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     project:
 *                       type: string
 *                     version:
 *                       type: string
 *                     endpoints:
 *                       type: object
 */
app.get("/", (_req: Request, res: Response) => {
  res.json(
    successResponse("FinTrack API", {
      project: "FinTrack API",
      version: "1.2.0",
      endpoints: {
        health: "GET /health",
        auth: "/api/auth",
        users: "/api/users",
        categories: "/api/categories",
        transactions: "/api/transactions",
        budgets: "/api/budgets",
        dashboard: "/api/dashboard",
        docs: "/api-docs",
      },
    }),
  );
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`\n🚀 FinTrack API v2 — http://localhost:${PORT}`);
  console.log(`📄 Documentación: http://localhost:${PORT}/api-docs`);
});

export default app;
