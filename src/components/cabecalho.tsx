import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/auth";
import { getCurrentUser } from "@/lib/dal";

// Ícone do portal (barras), em SVG pra não depender de imagem
export function Logo({ className = "size-8" }: { className?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-lg bg-white/10 ring-1 ring-white/20 ${className}`}>
      <svg viewBox="0 0 24 24" className="size-[55%]" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden>
        <path d="M5 20V12M12 20V5M19 20v-9" />
      </svg>
    </span>
  );
}

export function Cabecalho() {
  return (
    <header className="sticky top-0 z-20 bg-marca text-white shadow-[0_1px_0_rgba(255,255,255,0.06),0_4px_16px_rgba(15,27,42,0.18)]">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <Logo />
          Portal de Dashboards
        </Link>
        <Suspense fallback={<span className="text-sm text-white/60">…</span>}>
          <Usuario />
        </Suspense>
      </div>
    </header>
  );
}

const iniciais = (nome: string) =>
  nome
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

async function Usuario() {
  const user = await getCurrentUser();
  const nome = user.name ?? user.email;
  return (
    <div className="flex items-center gap-1 text-sm">
      <Link href="/" className="rounded-lg px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white">
        Dashboards
      </Link>
      {user.role === "ADMIN" && (
        <Link href="/admin" className="rounded-lg px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white">
          Admin
        </Link>
      )}
      <span className="mx-2 h-6 w-px bg-white/15" />
      <span className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-full bg-white/15 text-xs font-semibold">{iniciais(nome)}</span>
        <span className="hidden leading-tight sm:block">
          <span className="block font-medium">{nome}</span>
          <span className="block text-[11px] text-white/60">{user.role === "ADMIN" ? "Administrador" : "Visualizador"}</span>
        </span>
      </span>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button type="submit" className="ml-2 rounded-lg px-3 py-1.5 text-white/70 ring-1 ring-white/20 hover:bg-white/10 hover:text-white">
          Sair
        </button>
      </form>
    </div>
  );
}
