// Cadastra o Dashboard de Vagas no catálogo (pode rodar mais de uma vez).
import "dotenv/config";
import pg from "pg";

async function main() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query(
    `INSERT INTO "Dashboard" (slug, title, description, category, sensitive, active)
     VALUES ('vagas', 'Dashboard de Vagas', 'Recrutamento e seleção: vagas abertas, concluídas, prazos e etapas.', 'RH', false, true)
     ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, active = true`
  );
  console.log((await client.query(`SELECT id, slug, title FROM "Dashboard"`)).rows);
  await client.end();
}

main();
