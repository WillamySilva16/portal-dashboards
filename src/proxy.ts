// src/proxy.ts (no Next 16 o antigo middleware.ts se chama proxy.ts)
// Primeira barreira: sem sessão, vai pro /login. A checagem completa
// (usuário ativo, permissões) acontece de novo no servidor em src/lib/dal.ts.
export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
