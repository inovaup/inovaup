"use client";

import { cn } from "@/lib/utils";
import { alternarNaoSeAplica, escolherValor, opcoesDaEscala } from "./regras";
import type { RespostaRascunho } from "./tipos";

type Props = {
  /** Identificador único no formulário (ex.: id da competência). */
  nome: string;
  pergunta: string;
  min: number;
  max: number;
  permiteNa: boolean;
  resposta: RespostaRascunho;
  onChange: (resposta: RespostaRascunho) => void;
  somenteLeitura?: boolean;
  pendente?: boolean;
};

// Opção visual: o rádio fica escondido e o rótulo vira um botão marcável.
const opcao =
  "relative flex h-9 min-w-9 cursor-pointer select-none items-center justify-center rounded-md border border-input px-2 text-sm transition-colors " +
  "hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground " +
  "has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-ring has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60";

/** Uma competência: a pergunta, a escala (ex.: 1 a 10) e "Não se aplica" quando a seção permite. */
export function EscalaNota({
  nome,
  pergunta,
  min,
  max,
  permiteNa,
  resposta,
  onChange,
  somenteLeitura = false,
  pendente = false,
}: Props) {
  const opcoes = opcoesDaEscala(min, max);

  return (
    <fieldset className="flex flex-col gap-2" disabled={somenteLeitura}>
      <legend className="mb-2 text-sm font-medium">
        {pergunta}
        {pendente && !somenteLeitura && (
          <span className="ml-2 text-xs font-normal text-muted-foreground">(falta responder)</span>
        )}
      </legend>
      <div className="flex flex-wrap items-center gap-1.5" role="radiogroup" aria-label={pergunta}>
        {opcoes.map((valor) => (
          <label key={valor} className={opcao}>
            <input
              type="radio"
              className="sr-only"
              name={nome}
              value={valor}
              checked={!resposta.nao_se_aplica && resposta.valor === valor}
              onChange={() => onChange(escolherValor(valor))}
            />
            {valor}
          </label>
        ))}
        {permiteNa && (
          <label className={cn(opcao, "px-3 sm:ml-2")}>
            <input
              type="radio"
              className="sr-only"
              name={nome}
              value="na"
              checked={resposta.nao_se_aplica}
              onChange={() => onChange(alternarNaoSeAplica(true))}
            />
            Não se aplica
          </label>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {min} = menor nota, {max} = maior nota
      </p>
    </fieldset>
  );
}
