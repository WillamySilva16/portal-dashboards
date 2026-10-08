import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/auth";
import { getCurrentUser } from "@/lib/dal";

export function Cabecalho() {
  return (
    <header className="flex items-center justify-between bg-marca px-6 py-3 text-white">
      <Link href="/" className="font-semibold">
        Portal de Dashboards
      </Link>
      <Suspense fallback={<span className="text-sm text-white/60">…</span>}>
        <Usuario />
      </Suspense>
    </header>
  );
}

async function Usuario() {
  const user = await getCurrentUser();
  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="text-white/80">
        {user.name ?? user.email}
        {user.role === "ADMIN" && (
          <span className="ml-2 rounded bg-white/15 px-1.5 py-0.5 text-xs">admin</span>
        )}
      </span>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button type="submit" className="text-white/70 underline hover:text-white">
          Sair
        </button>
      </form>
    </div>
  );
}
