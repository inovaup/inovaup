"use client";

import { LIMITE_COMENTARIO } from "./regras";

type Props = {
  /** Identificador único no formulário (ex.: id da seção). */
  id: string;
  rotulo: string;
  valor: string;
  onChange: (texto: string) => void;
  somenteLeitura?: boolean;
};

/** Comentário opcional de uma seção, com o limite combinado de 2.000 caracteres. */
export function CampoComentario({ id, rotulo, valor, onChange, somenteLeitura = false }: Props) {
  const idAjuda = `${id}-ajuda`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {rotulo} <span className="font-normal text-muted-foreground">(opcional)</span>
      </label>
      <textarea
        id={id}
        value={valor}
        onChange={(e) => onChange(e.target.value.slice(0, LIMITE_COMENTARIO))}
        maxLength={LIMITE_COMENTARIO}
        rows={4}
        readOnly={somenteLeitura}
        aria-describedby={idAjuda}
        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring read-only:opacity-70"
        placeholder={somenteLeitura ? "" : "Escreva aqui, se quiser. Comentários aparecem sem autor."}
      />
      <p id={idAjuda} className="text-right text-xs text-muted-foreground">
        {valor.length} / {LIMITE_COMENTARIO}
      </p>
    </div>
  );
}
