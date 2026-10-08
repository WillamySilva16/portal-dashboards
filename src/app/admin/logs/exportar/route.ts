// Exporta o log de acessos (com os filtros da tela) em CSV, pra abrir no Excel.
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ACOES, lerFiltrosLog, whereLog } from "@/lib/logs";

export async function GET(request: Request) {
  const session = await auth();
  const eu = session?.user?.dbId
    ? await prisma.user.findUnique({ where: { id: session.user.dbId }, select: { role: true, active: true } })
    : null;
  if (!eu?.active || eu.role !== "ADMIN") return new Response("Acesso negado", { status: 403 });

  const f = lerFiltrosLog(Object.fromEntries(new URL(request.url).searchParams));
  const logs = await prisma.accessLog.findMany({
    where: whereLog(f),
    orderBy: { createdAt: "desc" },
    take: 50000,
    include: { dashboard: { select: { title: true } } },
  });

  const esc = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const linhas = [
    ["Quando", "E-mail", "Ação", "Dashboard", "Caminho", "IP", "Navegador"],
    ...logs.map((l) => [
      l.createdAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      l.email,
      ACOES[l.action],
      l.dashboard?.title,
      l.path,
      l.ip,
      l.userAgent,
    ]),
  ];
  // ";" e BOM pra o Excel em português abrir certinho
  const csv = "﻿" + linhas.map((l) => l.map(esc).join(";")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="log-acessos-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
