"use server";
// Ações da tela de admin. Cada uma confere de novo, no servidor,
// se quem chamou é ADMIN e está ativo: nunca confie só na tela.
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import type { Role } from "@/generated/prisma/client";

async function exigirAdmin() {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

const texto = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const id = (fd: FormData, k: string) => {
  const v = Number(fd.get(k));
  return Number.isInteger(v) && v > 0 ? v : null;
};
const erro = (pagina: string, msg: string): never => redirect(`/admin/${pagina}?erro=${encodeURIComponent(msg)}`);

// ---------- Usuários ----------

export async function criarUsuario(fd: FormData) {
  await exigirAdmin();
  const email = texto(fd, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erro("usuarios", "E-mail inválido.");
  if (await prisma.user.findUnique({ where: { email } })) erro("usuarios", `${email} já está cadastrado.`);
  await prisma.user.create({
    data: {
      email,
      name: texto(fd, "name") || null,
      role: texto(fd, "role") === "ADMIN" ? "ADMIN" : "VIEWER",
      departmentId: id(fd, "departmentId"),
    },
  });
  refresh();
}

export async function salvarUsuario(fd: FormData) {
  const eu = await exigirAdmin();
  const userId = id(fd, "id");
  if (!userId) return;
  const role: Role = texto(fd, "role") === "ADMIN" ? "ADMIN" : "VIEWER";
  const active = fd.get("active") === "on";
  // Evita o admin se trancar pra fora
  if (userId === eu.id && (role !== "ADMIN" || !active)) {
    erro("usuarios", "Você não pode tirar o seu próprio acesso de admin nem se desativar.");
  }
  await prisma.user.update({
    where: { id: userId },
    data: { name: texto(fd, "name") || null, role, active, departmentId: id(fd, "departmentId") },
  });
  refresh();
}

// ---------- Setores ----------

export async function criarSetor(fd: FormData) {
  await exigirAdmin();
  const name = texto(fd, "name");
  if (!name) erro("setores", "Informe o nome do setor.");
  if (await prisma.department.findUnique({ where: { name } })) erro("setores", `O setor ${name} já existe.`);
  await prisma.department.create({ data: { name } });
  refresh();
}

export async function excluirSetor(fd: FormData) {
  await exigirAdmin();
  const depId = id(fd, "id");
  if (!depId) return;
  // Pessoas do setor ficam sem setor; permissões do setor são apagadas (cascade)
  await prisma.$transaction([
    prisma.user.updateMany({ where: { departmentId: depId }, data: { departmentId: null } }),
    prisma.department.delete({ where: { id: depId } }),
  ]);
  refresh();
}

// ---------- Dashboards e permissões ----------

export async function salvarDashboard(fd: FormData) {
  await exigirAdmin();
  const dashId = id(fd, "id");
  if (!dashId) return;
  await prisma.dashboard.update({
    where: { id: dashId },
    data: {
      title: texto(fd, "title") || undefined,
      description: texto(fd, "description") || null,
      category: texto(fd, "category") || null,
      active: fd.get("active") === "on",
    },
  });
  refresh();
}

export async function liberarDashboard(fd: FormData) {
  await exigirAdmin();
  const dashboardId = id(fd, "dashboardId");
  const alvo = texto(fd, "alvo"); // "u:12" (pessoa) ou "d:3" (setor)
  const [tipo, n] = alvo.split(":");
  const alvoId = Number(n);
  if (!dashboardId || !Number.isInteger(alvoId)) erro("dashboards", "Escolha uma pessoa ou um setor.");
  const where = tipo === "u" ? { dashboardId: dashboardId!, userId: alvoId } : { dashboardId: dashboardId!, departmentId: alvoId };
  if (await prisma.dashboardPermission.findFirst({ where })) erro("dashboards", "Essa permissão já existe.");
  await prisma.dashboardPermission.create({ data: where });
  refresh();
}

export async function removerPermissao(fd: FormData) {
  await exigirAdmin();
  const permId = id(fd, "id");
  if (permId) await prisma.dashboardPermission.delete({ where: { id: permId } });
  refresh();
}
