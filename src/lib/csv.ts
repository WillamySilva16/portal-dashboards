// Monta uma resposta CSV que o Excel em português abre certinho:
// separador ";" e BOM no começo (senão os acentos quebram).
export function respostaCsv(linhas: unknown[][], arquivo: string) {
  const esc = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const csv = "﻿" + linhas.map((l) => l.map(esc).join(";")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${arquivo}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
