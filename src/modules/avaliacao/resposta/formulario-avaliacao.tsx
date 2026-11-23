"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { enviarAvaliacao, salvarRascunho } from "./acoes";
import { pendenciasDaSecao } from "./regras";
import { SecaoQuestionario } from "./secao-questionario";
import type { RespostaRascunho, SecaoQuestionario as Secao } from "./tipos";

type Props = {
  atribuicaoId: string;
  secoes: Secao[];
  respostasIniciais: Record<string, RespostaRascunho>;
  comentariosIniciais: Record<string, string>;
  somenteLeitura: boolean;
};

type Aviso = { tipo: "ok" | "erro"; texto: string } | null;

/** A avaliação inteira numa página: todas as seções, salvar rascunho e enviar. */
export function FormularioAvaliacao({
  atribuicaoId,
  secoes,
  respostasIniciais,
  comentariosIniciais,
  somenteLeitura,
}: Props) {
  const router = useRouter();
  const [respostas, setRespostas] = useState(respostasIniciais);
  const [comentarios, setComentarios] = useState(comentariosIniciais);
  const [destacar, setDestacar] = useState(false);
  const [aviso, setAviso] = useState<Aviso>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, iniciar] = useTransition();

  /** Qualquer mudança apaga o aviso anterior e cancela a confirmação pendente. */
  function aoMudar() {
    setAviso(null);
    setConfirmando(false);
  }

  const faltando = secoes.reduce((n, s) => n + pendenciasDaSecao(s, respostas).length, 0);

  function entrada() {
    return {
      atribuicaoId,
      respostas: Object.entries(respostas).map(([competencia_id, r]) => ({ competencia_id, ...r })),
      comentarios: secoes.map((s) => ({ secao_id: s.id, texto: comentarios[s.id] ?? "" })),
    };
  }

  function salvar() {
    iniciar(async () => {
      const r = await salvarRascunho(entrada());
      setAviso(r.ok ? { tipo: "ok", texto: "Rascunho salvo." } : { tipo: "erro", texto: r.erro });
    });
  }

  function pedirEnvio() {
    if (faltando > 0) {
      setDestacar(true);
      setAviso({ tipo: "erro", texto: `Faltam ${faltando} competência(s) sem resposta.` });
      return;
    }
    // Confirmação na própria página (window.confirm é bloqueado em alguns navegadores embutidos).
    setAviso(null);
    setConfirmando(true);
  }

  function confirmarEnvio() {
    setConfirmando(false);
    iniciar(async () => {
      const r = await enviarAvaliacao(entrada());
      if (r.ok) {
        router.push("/avaliacoes");
        router.refresh();
      } else {
        setAviso({ tipo: "erro", texto: r.erro });
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {secoes.map((s) => (
        <SecaoQuestionario
          key={s.id}
          secao={s}
          respostas={respostas}
          comentario={comentarios[s.id] ?? ""}
          onResposta={(id, r) => {
            aoMudar();
            setRespostas((atual) => ({ ...atual, [id]: r }));
          }}
          onComentario={(t) => {
            aoMudar();
            setComentarios((atual) => ({ ...atual, [s.id]: t }));
          }}
          somenteLeitura={somenteLeitura}
          destacarPendentes={destacar}
        />
      ))}

      {!somenteLeitura && (
        <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t bg-background py-4">
          <Button variant="outline" onClick={salvar} disabled={enviando}>
            Salvar rascunho
          </Button>
          {confirmando ? (
            <div
              role="alertdialog"
              aria-label="Confirmar envio"
              className="flex flex-wrap items-center gap-2 rounded-md border border-destructive/50 px-3 py-2"
            >
              <span className="text-sm">Depois de enviada, a avaliação não pode ser alterada.</span>
              <Button onClick={confirmarEnvio} disabled={enviando}>
                Confirmar envio
              </Button>
              <Button variant="ghost" onClick={() => setConfirmando(false)} disabled={enviando}>
                Cancelar
              </Button>
            </div>
          ) : (
            <Button onClick={pedirEnvio} disabled={enviando}>
              Enviar avaliação
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            {faltando > 0 ? `Faltam ${faltando} competência(s).` : "Tudo respondido."}
          </span>
          {aviso && (
            <span
              role="status"
              className={aviso.tipo === "erro" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
            >
              {aviso.texto}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
