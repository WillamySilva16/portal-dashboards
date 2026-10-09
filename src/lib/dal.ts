// src/lib/dal.ts
// Camada de acesso a dados: toda página protegida passa por aqui.
// Relê o usuário no banco a cada request, então desativar alguém
// no banco corta o acesso na hora, mesmo com sessão aberta.
import "server-only";
import { after, connection } from "next/server";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { registrarLog } from "@/lib/log";

export async function getCurrentUser() {
  // Sempre no momento da requisição (nunca no pré-render): a sessão
  // depende do cookie, e o log de acesso não pode ser gravado em duplicidade.
  await connection();
  const session = await auth();
  const id = session?.user?.dbId;
  if (!id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, active: true, departmentId: true },
  });
  if (!user || !user.active) redirect("/login?error=AccessDenied");

  return user;
}

// Dashboards que o usuário pode ver: ADMIN vê todos; os demais,
// os liberados pra ele ou pro departamento dele.
export async function getMeusDashboards() {
  const user = await getCurrentUser();
  return prisma.dashboard.findMany({
    where: {
      active: true,
      ...(user.role === "ADMIN"
        ? {}
        : {
            permissions: {
              some: {
                OR: [
                  { userId: user.id },
                  ...(user.departmentId ? [{ departmentId: user.departmentId }] : []),
                ],
              },
            },
          }),
    },
    orderBy: [{ category: "asc" }, { title: "asc" }],
    select: { id: true, slug: true, title: true, description: true, category: true, icon: true },
  });
}

// Abre um dashboard do catálogo: confere permissão e registra na auditoria.
// Sem permissão, registra VIEW_DENIED e manda pra tela inicial.
type Usuario = Awaited<ReturnType<typeof getCurrentUser>>;

async function temPermissao(user: Usuario, dashboardId: number) {
  if (user.role === "ADMIN") return true;
  const n = await prisma.dashboardPermission.count({
    where: {
      dashboardId,
      OR: [{ userId: user.id }, ...(user.departmentId ? [{ departmentId: user.departmentId }] : [])],
    },
  });
  return n > 0;
}

export async function abrirDashboard(slug: string) {
  // Usuário e dashboard em paralelo: um vai-e-volta a menos no banco por página
  const [user, dashboard] = await Promise.all([getCurrentUser(), prisma.dashboard.findUnique({ where: { slug } })]);
  if (!dashboard || !dashboard.active) notFound();

  const permitido = await temPermissao(user, dashboard.id);

  const path = `/d/${slug}`;
  if (!permitido) {
    await registrarLog("VIEW_DENIED", user.email, { userId: user.id, dashboardId: dashboard.id, path });
    redirect("/?negado=1");
  }

  // Cada filtro trocado recarrega a página; pra não encher o log,
  // só registra uma visualização a cada 30 minutos por pessoa e dashboard.
  // Grava em segundo plano (after): a página não espera o log.
  const h = new Headers(await headers());
  after(() => registrarVisualizacao(user.id, user.email, dashboard.id, path, h));

  return { user, dashboard };
}

async function registrarVisualizacao(userId: number, email: string, dashboardId: number, path: string, h: Headers) {
  const recente = await prisma.accessLog.findFirst({
    where: {
      userId,
      dashboardId,
      action: "VIEW_DASHBOARD",
      createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
    },
    select: { id: true },
  });
  if (!recente) {
    await registrarLog("VIEW_DASHBOARD", email, { userId, dashboardId, path }, h);
  }
}

// Download da planilha de um dashboard: mesma permissão de quem pode abrir,
// e cada download fica no log. Devolve null se a pessoa não pode.
export async function exportarDashboard(slug: string, path: string) {
  const user = await getCurrentUser();
  const dashboard = await prisma.dashboard.findUnique({ where: { slug } });
  if (!dashboard || !dashboard.active) return null;
  if (!(await temPermissao(user, dashboard.id))) {
    await registrarLog("VIEW_DENIED", user.email, { userId: user.id, dashboardId: dashboard.id, path });
    return null;
  }
  await registrarLog("EXPORT_DASHBOARD", user.email, { userId: user.id, dashboardId: dashboard.id, path });
  return { user, dashboard };
}

// Páginas de admin: quem não é ADMIN volta pra tela inicial
export async function getAdmin() {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}
