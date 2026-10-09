"use client";
// Recarrega os números sozinho (pra tela da TV) e mostra o relógio.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const INTERVALO = 5 * 60 * 1000; // 5 minutos

export function Atualizar() {
  const router = useRouter();
  const [agora, setAgora] = useState<Date | null>(null);
  useEffect(() => {
    const tique = () => setAgora(new Date());
    const primeiro = setTimeout(tique, 0); // só no navegador, pra não divergir do HTML do servidor
    const relogio = setInterval(tique, 30_000);
    const recarga = setInterval(() => router.refresh(), INTERVALO);
    return () => {
      clearTimeout(primeiro);
      clearInterval(relogio);
      clearInterval(recarga);
    };
  }, [router]);
  return (
    <span className="tabular-nums">
      {agora?.toLocaleString("pt-BR", { weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })}
    </span>
  );
}
