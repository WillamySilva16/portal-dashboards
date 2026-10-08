// Exporta o log de acessos (com os filtros da tela) em CSV, pra abrir no Excel.
import { auth } from "@/auth";
import { respostaCsv } from "@/lib/csv";
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

  return respostaCsv(
    [
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
    ],
    "log-acessos",
  );
}
