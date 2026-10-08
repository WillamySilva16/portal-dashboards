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
    <nav className="flex flex-wrap gap-6 border-b border-zinc-200">
      {ABAS.map(([href, texto]) => (
        <Link
          key={href}
          href={href}
          className={`border-b-2 px-1 pb-2 text-sm font-medium ${
            path.startsWith(href) ? "border-marca text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          {texto}
        </Link>
      ))}
    </nav>
  );
}
