"use client";

import { CampoComentario } from "./campo-comentario";
import { EscalaNota } from "./escala-nota";
import { ordenarCompetencias, pendenciasDaSecao } from "./regras";
import {
  RESPOSTA_VAZIA,
  type RespostaRascunho,
  type SecaoQuestionario as Secao,
} from "./tipos-simulados";

type Props = {
  secao: Secao;
  /** Respostas por id da competência. */
  respostas: Record<string, RespostaRascunho>;
  comentario: string;
  onResposta: (competenciaId: string, resposta: RespostaRascunho) => void;
  onComentario: (texto: string) => void;
  somenteLeitura?: boolean;
  /** Destaca as competências sem resposta (ex.: depois de tentar enviar). */
  destacarPendentes?: boolean;
};

/** Uma seção do questionário: as competências com a escala e um comentário da seção. */
export function SecaoQuestionario({
  secao,
  respostas,
  comentario,
  onResposta,
  onComentario,
  somenteLeitura = false,
  destacarPendentes = false,
}: Props) {
  const pendentes = new Set(destacarPendentes ? pendenciasDaSecao(secao, respostas) : []);

  return (
    <section className="flex flex-col gap-6 rounded-lg border p-5">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{secao.nome}</h2>
        <p className="text-sm text-muted-foreground">
          Escala de {secao.escala_min} a {secao.escala_max}
          {secao.permite_na ? ", com a opção “Não se aplica”" : ""}.
        </p>
      </header>

      {ordenarCompetencias(secao).map((c) => (
        <EscalaNota
          key={c.id}
          nome={`${secao.id}-${c.id}`}
          pergunta={c.pergunta}
          min={secao.escala_min}
          max={secao.escala_max}
          permiteNa={secao.permite_na}
          resposta={respostas[c.id] ?? RESPOSTA_VAZIA}
          onChange={(r) => onResposta(c.id, r)}
          somenteLeitura={somenteLeitura}
          pendente={pendentes.has(c.id)}
        />
      ))}

      <CampoComentario
        id={`comentario-${secao.id}`}
        rotulo={`Comentário sobre ${secao.nome}`}
        valor={comentario}
        onChange={onComentario}
        somenteLeitura={somenteLeitura}
      />
    </section>
  );
}
