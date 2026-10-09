"use client";
// Alterna entre modo claro e escuro. A escolha fica salva no navegador;
// sem escolha, segue o tema do sistema (ver script no layout).
// Os dois ícones vão no HTML e o CSS mostra o certo, então não pisca.

function alternar() {
  const escuro = document.documentElement.classList.toggle("dark");
  try {
    localStorage.setItem("tema", escuro ? "escuro" : "claro");
  } catch {}
}

export function BotaoTema({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={alternar} title="Alternar modo claro / escuro" aria-label="Alternar modo claro / escuro" className={`grid size-9 place-items-center rounded-lg transition ${className}`}>
      {/* lua: aparece no claro (vai pro escuro) */}
      <svg viewBox="0 0 24 24" className="size-[18px] dark:hidden" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
      {/* sol: aparece no escuro (volta pro claro) */}
      <svg viewBox="0 0 24 24" className="hidden size-[18px] dark:block" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
