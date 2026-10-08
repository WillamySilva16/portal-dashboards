// src/auth.ts
// Login com Google (Auth.js v5). Só entra quem está na tabela User e ativo.
// Toda tentativa fica registrada em AccessLog.
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import { registrarLog } from "@/lib/log";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, // 8h, um expediente
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    // Whitelist: e-mail precisa existir em User e estar ativo
    async signIn({ profile }) {
      const email = profile?.email?.toLowerCase();
      if (!email || profile?.email_verified === false) return false;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.active) {
        await registrarLog("LOGIN_DENIED", email, { userId: user?.id });
        return false;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          name: user.name ?? profile?.name ?? null,
        },
      });
      await registrarLog("LOGIN", email, { userId: user.id });
      return true;
    },
    // Guarda o id do banco no token pra não depender do e-mail depois
    async jwt({ token, profile }) {
      if (profile?.email) {
        const user = await prisma.user.findUnique({
          where: { email: profile.email.toLowerCase() },
          select: { id: true },
        });
        if (user) token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (typeof token.userId === "number") session.user.dbId = token.userId;
      return session;
    },
    // Usado pelo proxy: só deixa passar quem tem sessão
    authorized({ auth, request }) {
      if (request.nextUrl.pathname.startsWith("/login")) return true;
      return !!auth?.user;
    },
  },
  events: {
    async signOut(message) {
      const token = "token" in message ? message.token : null;
      if (token?.email) {
        await registrarLog("LOGOUT", token.email.toLowerCase(), {
          userId: typeof token.userId === "number" ? token.userId : undefined,
        });
      }
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: { dbId?: number } & import("next-auth").DefaultSession["user"];
  }
}
