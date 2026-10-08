// src/lib/log.ts
// Grava uma linha na auditoria (AccessLog). Nunca derruba a página se falhar.
import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import type { AccessAction } from "@/generated/prisma/client";

export async function registrarLog(
  action: AccessAction,
  email: string,
  extra: { userId?: number; dashboardId?: number; path?: string } = {}
) {
  try {
    const h = await headers();
    await prisma.accessLog.create({
      data: {
        action,
        email,
        ...extra,
        ip: h.get("x-forwarded-for")?.split(",")[0].trim() ?? null,
        userAgent: h.get("user-agent"),
      },
    });
  } catch (e) {
    console.error("Falha ao gravar AccessLog", e);
  }
}
