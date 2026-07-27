import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FinTrack API",
      version: "1.2.0",
      description:
        "API REST para gestión de finanzas personales — control de ingresos, gastos, categorías y presupuestos mensuales.\n\nTodas las respuestas siguen el formato estandarizado:\n```json\n{\n  \"success\": true,\n  \"message\": \"...\",\n  \"data\": ... | null\n}\n```",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Servidor de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // ─── Base response wrappers ───────────────────────────
        ApiErrorResponse: {
          type: "object",
          description: "Respuesta de error estándar",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            data: { type: "null", example: null },
          },
        },
        ApiValidationError: {
          type: "object",
          description: "Error de validación con detalle de campos",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error de validación" },
            data: {
              type: "object",
              properties: {
                fields: {
                  type: "object",
                  description: "Mapa de campo → mensaje de error",
                  additionalProperties: { type: "string" },
                  example: { email: "Email inválido", password: "La contraseña debe tener al menos 6 caracteres" },
                },
              },
            },
          },
        },
        DeleteResponse: {
          type: "object",
          description: "Respuesta de eliminación exitosa",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Recurso eliminado correctamente" },
            data: { type: "null", example: null },
          },
        },
        PaginationInfo: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 20 },
            total: { type: "integer", example: 50 },
            totalPages: { type: "integer", example: 3 },
          },
        },

        // ─── Health ──────────────────────────────────────────
        HealthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "FinTrack API funcionando correctamente" },
            data: {
              type: "object",
              properties: {
                status: { type: "string", example: "ok" },
                server: {
                  type: "object",
                  properties: {
                    timestamp: { type: "string", format: "date-time" },
                    environment: { type: "string" },
                  },
                },
                database: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "connected" },
                    queryTimestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },

        // ─── Auth ────────────────────────────────────────────
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Inicio de sesión exitoso" },
            data: {
              type: "object",
              properties: {
                token: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
                user: { $ref: "#/components/schemas/UserPublic" },
              },
            },
          },
        },
        UserPublic: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        RegisterDto: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Juan Pérez" },
            email: { type: "string", format: "email", example: "juan@example.com" },
            password: { type: "string", format: "password", minLength: 6 },
          },
        },
        LoginDto: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "juan@example.com" },
            password: { type: "string", format: "password" },
          },
        },
        MeResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Usuario autenticado obtenido correctamente" },
            data: { $ref: "#/components/schemas/UserPublic" },
          },
        },

        // ─── Users ───────────────────────────────────────────
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CreateUserDto: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Juan Pérez" },
            email: { type: "string", format: "email", example: "juan@example.com" },
            password: { type: "string", format: "password", minLength: 6 },
          },
        },
        UpdateUserDto: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
          },
        },
        UserResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Usuario obtenido correctamente" },
            data: { $ref: "#/components/schemas/User" },
          },
        },
        UserListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Usuarios obtenidos correctamente" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/User" },
            },
          },
        },

        // ─── Categories ──────────────────────────────────────
        Category: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            name: { type: "string" },
            type: { type: "string", enum: ["INCOME", "EXPENSE"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CreateCategoryDto: {
          type: "object",
          required: ["name", "type"],
          properties: {
            name: { type: "string", example: "Comida" },
            type: { type: "string", enum: ["INCOME", "EXPENSE"], example: "EXPENSE" },
          },
        },
        UpdateCategoryDto: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string", enum: ["INCOME", "EXPENSE"] },
          },
        },
        CategoryResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Categoría obtenida correctamente" },
            data: { $ref: "#/components/schemas/Category" },
          },
        },
        CategoryListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Categorías obtenidas correctamente" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Category" },
            },
          },
        },

        // ─── Transactions ────────────────────────────────────
        Transaction: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            categoryId: { type: "string", format: "uuid" },
            amount: { type: "number", example: 150.5 },
            type: { type: "string", enum: ["INCOME", "EXPENSE"] },
            description: { type: "string", nullable: true },
            transactionDate: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            category: { $ref: "#/components/schemas/Category" },
          },
        },
        CreateTransactionDto: {
          type: "object",
          required: ["categoryId", "amount", "type", "transactionDate"],
          properties: {
            categoryId: { type: "string", format: "uuid" },
            amount: { type: "number", example: 150.5 },
            type: { type: "string", enum: ["INCOME", "EXPENSE"] },
            description: { type: "string" },
            transactionDate: { type: "string", format: "date-time" },
          },
        },
        UpdateTransactionDto: {
          type: "object",
          properties: {
            categoryId: { type: "string", format: "uuid" },
            amount: { type: "number" },
            type: { type: "string", enum: ["INCOME", "EXPENSE"] },
            description: { type: "string" },
            transactionDate: { type: "string", format: "date-time" },
          },
        },
        TransactionSummary: {
          type: "object",
          properties: {
            totalIncome: { type: "number" },
            totalExpense: { type: "number" },
            balance: { type: "number" },
          },
        },
        TransactionResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Transacción obtenida correctamente" },
            data: { $ref: "#/components/schemas/Transaction" },
          },
        },
        TransactionListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Transacciones obtenidas correctamente" },
            data: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Transaction" },
                },
                pagination: { $ref: "#/components/schemas/PaginationInfo" },
              },
            },
          },
        },
        TransactionSummaryResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Resumen obtenido correctamente" },
            data: { $ref: "#/components/schemas/TransactionSummary" },
          },
        },

        // ─── Budgets ─────────────────────────────────────────
        Budget: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            categoryId: { type: "string", format: "uuid" },
            amount: { type: "number" },
            month: { type: "integer" },
            year: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            category: { $ref: "#/components/schemas/Category" },
          },
        },
        CreateBudgetDto: {
          type: "object",
          required: ["categoryId", "amount", "month", "year"],
          properties: {
            categoryId: { type: "string", format: "uuid" },
            amount: { type: "number", example: 5000 },
            month: { type: "integer", example: 7 },
            year: { type: "integer", example: 2026 },
          },
        },
        UpdateBudgetDto: {
          type: "object",
          properties: {
            amount: { type: "number" },
            month: { type: "integer" },
            year: { type: "integer" },
          },
        },
        BudgetProgress: {
          type: "object",
          properties: {
            budgetId: { type: "string", format: "uuid" },
            categoryName: { type: "string" },
            budgeted: { type: "number" },
            spent: { type: "number" },
            remaining: { type: "number" },
            percentageUsed: { type: "number" },
          },
        },
        BudgetResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Presupuesto obtenido correctamente" },
            data: { $ref: "#/components/schemas/Budget" },
          },
        },
        BudgetListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Presupuestos obtenidos correctamente" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Budget" },
            },
          },
        },
        BudgetProgressResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Progreso del presupuesto obtenido correctamente" },
            data: { $ref: "#/components/schemas/BudgetProgress" },
          },
        },

        // ─── Dashboard ───────────────────────────────────────
        DashboardData: {
          type: "object",
          properties: {
            balance: {
              type: "object",
              properties: {
                income: { type: "number" },
                expense: { type: "number" },
                total: { type: "number" },
              },
            },
            byCategory: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  categoryId: { type: "string", format: "uuid" },
                  categoryName: { type: "string" },
                  type: { type: "string", enum: ["INCOME", "EXPENSE"] },
                  total: { type: "number" },
                },
              },
            },
            budgetAlerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  budgetId: { type: "string", format: "uuid" },
                  categoryName: { type: "string" },
                  percentageUsed: { type: "number" },
                },
              },
            },
          },
        },
        DashboardResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Dashboard obtenido correctamente" },
            data: { $ref: "#/components/schemas/DashboardData" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts", "./src/index.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
