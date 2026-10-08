import "dotenv/config";
import { defineConfig } from "prisma/config";

// O DATABASE_URL só é obrigatório pra falar com o banco (migrate).
// O "prisma generate" do build roda sem ele, porque nem sempre a
// variável está disponível na fase de build (ex.: Railway).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  ...(process.env.DATABASE_URL && { datasource: { url: process.env.DATABASE_URL } }),
});
