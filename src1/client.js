import { Pool } from "pg";

const pool = new Pool({
  user: "ikuno",
  host: "localhost",
  database: "ikuno",
  password: "ikuno",
  port: 51000,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  pool.end();
  process.exit(1);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing pool...");
  await pool.end();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing pool...");
  await pool.end();
  process.exit(0);
});

export default pool;
