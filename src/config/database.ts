import { Pool } from "pg";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Crear pool de conexiones a PostgreSQL
// Un Pool reutiliza conexiones en lugar de crear una nueva por cada consulta
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Verificar conexión al iniciar la aplicación
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Error al conectar a PostgreSQL:", err.message);
    return;
  }
  console.log("✅ Conexión a PostgreSQL establecida correctamente");
  release(); // Liberar el cliente de vuelta al pool
});

// Exportar el pool para usarlo en otras partes de la app
export default pool;
