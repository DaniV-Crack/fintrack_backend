import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FinTrack API",
      version: "1.0.0",
      description:
        "API REST para gestión de finanzas personales — control de ingresos, gastos, categorías y presupuestos mensuales.",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Servidor de desarrollo",
      },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", example: "b3c8b3e0-5f7a-4b8e-9c1a-2d3e4f5a6b7c" },
            name: { type: "string", example: "Juan Pérez" },
            email: { type: "string", format: "email", example: "juan@example.com" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CreateUserDto: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Juan Pérez" },
            email: { type: "string", format: "email", example: "juan@example.com" },
            password: { type: "string", format: "password", example: "secreta123", minLength: 6 },
          },
        },
        UpdateUserDto: {
          type: "object",
          properties: {
            name: { type: "string", example: "Juan Pérez" },
            email: { type: "string", format: "email", example: "juan@example.com" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
        HealthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "ok" },
            message: { type: "string" },
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
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
