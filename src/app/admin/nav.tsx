"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ABAS = [
  ["/admin/usuarios", "Usuários"],
  ["/admin/setores", "Setores"],
  ["/admin/dashboards", "Dashboards e permissões"],
  ["/admin/logs", "Log de acessos"],
];

export function NavAdmin() {
  const path = usePathname();
  return (
    <nav className="cartao inline-flex flex-wrap gap-1 p-1">
      {ABAS.map(([href, texto]) => (
        <Link
          key={href}
          href={href}
          className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
            path.startsWith(href) ? "bg-marca text-white shadow-sm dark:bg-[#2a78d6]" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
          }`}
        >
          {texto}
        </Link>
      ))}
    </nav>
  );
}
