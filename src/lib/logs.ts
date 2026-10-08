// src/lib/logs.ts
// Filtros do log de acessos, usados pela tela e pela exportação em CSV.
import "server-only";
import type { AccessAction, Prisma } from "@/generated/prisma/client";

export const ACOES: Record<AccessAction, string> = {
  LOGIN: "Login",
  LOGIN_DENIED: "Login negado",
  VIEW_DASHBOARD: "Abriu dashboard",
  VIEW_DENIED: "Acesso negado",
  LOGOUT: "Saiu",
};

export type FiltrosLog = { email?: string; acao?: AccessAction; dashboard?: number; de?: string; ate?: string };

export function lerFiltrosLog(sp: Record<string, string | string[] | undefined>): FiltrosLog {
  const s = (k: string) => {
    const v = sp[k];
    const t = (Array.isArray(v) ? v[0] : v)?.trim();
    return t || undefined;
  };
  const acao = s("acao");
  const data = (k: string) => (s(k) && /^\d{4}-\d{2}-\d{2}$/.test(s(k)!) ? s(k) : undefined);
  return {
    email: s("email")?.toLowerCase(),
    acao: acao && acao in ACOES ? (acao as AccessAction) : undefined,
    dashboard: s("dashboard") ? Number(s("dashboard")) || undefined : undefined,
    de: data("de"),
    ate: data("ate"),
  };
}

// Datas do filtro são dias no horário de Brasília (UTC-3)
export function whereLog(f: FiltrosLog): Prisma.AccessLogWhereInput {
  return {
    ...(f.email && { email: { contains: f.email } }),
    ...(f.acao && { action: f.acao }),
    ...(f.dashboard && { dashboardId: f.dashboard }),
    ...((f.de || f.ate) && {
      createdAt: {
        ...(f.de && { gte: new Date(`${f.de}T00:00:00-03:00`) }),
        ...(f.ate && { lt: new Date(new Date(`${f.ate}T00:00:00-03:00`).getTime() + 24 * 60 * 60 * 1000) }),
      },
    }),
  };
}
