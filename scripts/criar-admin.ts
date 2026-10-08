import "dotenv/config";
import pg from "pg";

async function main() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query(
    `INSERT INTO "User" (email, name, role, active)
     VALUES ($1, $2, 'ADMIN', true)
     ON CONFLICT (email) DO UPDATE SET role = 'ADMIN', active = true`,
    ["willamy.silva@rsterceirizacao.com.br", "Willamy Silva"]
  );
  console.log((await client.query(`SELECT id, email, role, active FROM "User"`)).rows);
  await client.end();
}

main();