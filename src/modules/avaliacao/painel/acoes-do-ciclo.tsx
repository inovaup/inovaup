"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { StatusCiclo } from "@/contracts/avaliacao";
import {
  abrirCiclo,
  calcularRelatorios,
  encerrarCiclo,
  liberarRelatorios,
  type ResultadoPainel,
} from "./acoes";

type Acao = {
  rotulo: string;
  executar: (cicloId: string) => Promise<ResultadoPainel>;
  /** Pede confirmação na página antes (ações que não voltam atrás). */
  confirmacao?: string;
  variante?: "default" | "outline";
};

/** Os botões que valem para cada estado do ciclo. Sem reabertura, edição nem liberação individual. */
export function acoesDoEstado(status: StatusCiclo, liberados: boolean): Acao[] {
  if (status === "rascunho") {
    return [{ rotulo: "Abrir ciclo", executar: abrirCiclo, confirmacao: "As pessoas passam a ver e responder as avaliações." }];
  }
  if (status === "aberto") {
    return [
      {
        rotulo: "Encerrar ciclo",
        executar: encerrarCiclo,
        confirmacao: "Ninguém mais poderá responder. Em seguida, os relatórios são calculados.",
      },
    ];
  }
  if (!liberados) {
    return [
      {
        rotulo: "Liberar relatórios do ciclo",
        executar: liberarRelatorios,
        confirmacao: "Cada pessoa avaliada passa a ver o próprio relatório. Não dá para desfazer.",
      },
      { rotulo: "Calcular relatórios", executar: calcularRelatorios, variante: "outline" },
    ];
  }
  return [];
}

export function AcoesDoCiclo({
  cicloId,
  status,
  liberados,
}: {
  cicloId: string;
  status: StatusCiclo;
  liberados: boolean;
}) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [confirmando, setConfirmando] = useState<Acao | null>(null);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const acoes = acoesDoEstado(status, liberados);

  function rodar(acao: Acao) {
    setConfirmando(null);
    iniciar(async () => {
      const r = await acao.executar(cicloId);
      setAviso(r.ok ? { ok: true, texto: r.mensagem } : { ok: false, texto: r.erro });
      router.refresh();
    });
  }

  if (acoes.length === 0 && !aviso) {
    return <p className="text-sm text-muted-foreground">Relatórios liberados. Nada mais a fazer neste ciclo.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {confirmando ? (
        <div
          role="alertdialog"
          aria-label={`Confirmar: ${confirmando.rotulo}`}
          className="flex flex-wrap items-center gap-2 rounded-md border border-destructive/50 px-3 py-2"
        >
          <span className="text-sm">{confirmando.confirmacao}</span>
          <Button onClick={() => rodar(confirmando)} disabled={pendente}>
            Confirmar: {confirmando.rotulo}
          </Button>
          <Button variant="ghost" onClick={() => setConfirmando(null)} disabled={pendente}>
            Cancelar
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {acoes.map((acao) => (
            <Button
              key={acao.rotulo}
              variant={acao.variante ?? "default"}
              disabled={pendente}
              onClick={() => (acao.confirmacao ? setConfirmando(acao) : rodar(acao))}
            >
              {acao.rotulo}
            </Button>
          ))}
        </div>
      )}
      {pendente && <p className="text-sm text-muted-foreground">Processando…</p>}
      {aviso && (
        <p role="status" className={aviso.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"}>
          {aviso.texto}
        </p>
      )}
    </div>
  );
}
