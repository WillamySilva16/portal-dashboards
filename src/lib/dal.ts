// src/lib/dal.ts
// Camada de acesso a dados: toda página protegida passa por aqui.
// Relê o usuário no banco a cada request, então desativar alguém
// no banco corta o acesso na hora, mesmo com sessão aberta.
import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function getCurrentUser() {
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
