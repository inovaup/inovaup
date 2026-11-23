// Relatório reduzido (A7): nota final, nota por competência, "Sua autoavaliação",
// grupos só quando a regra permite e comentários reunidos. Sem gráfico, média da
// organização, nota por seção, visão do líder ou PDF. Mostra exatamente o
// RelatorioPublicavel gravado (já suprimido); a GP vê o mesmo que a pessoa.
import { agruparPorSecao, formatarPct, lerRelatorio, NOME_DO_GRUPO } from "./formato";

const AVISO_FORMULA =
  "A nota usa uma fórmula provisória, ainda não validada pela Gestão de Pessoas.";

export function RelatorioView({
  conteudo,
  visao = "propria",
}: {
  conteudo: unknown;
  /** "gp": a GP vendo o relatório de outra pessoa (só muda o rótulo da autoavaliação). */
  visao?: "propria" | "gp";
}) {
  const r = lerRelatorio(conteudo);
  const rotuloAuto = visao === "gp" ? "Autoavaliação" : "Sua autoavaliação";
  if (!r) {
    return <p className="text-sm text-muted-foreground">Não foi possível exibir este relatório.</p>;
  }

  if (!r.disponivel) {
    return (
      <div className="flex flex-col gap-4">
        <p className="rounded-md border p-4 text-sm">{r.aviso}</p>
        <Linha rotulo={rotuloAuto} valor={formatarPct(r.autoavaliacao_pct)} />
        <p className="text-xs text-muted-foreground">{AVISO_FORMULA}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Nota final</span>
        <span className="text-4xl font-bold">{formatarPct(r.nota_final_pct)}</span>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="font-semibold">Por quem avaliou</h3>
        <Linha rotulo={rotuloAuto} valor={formatarPct(r.autoavaliacao_pct)} />
        {r.grupos ? (
          r.grupos.map((g) => (
            <Linha key={g.grupo} rotulo={NOME_DO_GRUPO[g.grupo]} valor={formatarPct(g.pct)} />
          ))
        ) : (
          <Linha rotulo="Outros avaliadores (combinado)" valor={formatarPct(r.outros_avaliadores_pct)} />
        )}
      </section>

      {agruparPorSecao(r.competencias).map((s) => (
        <section key={s.nome} className="flex flex-col gap-2">
          <h3 className="font-semibold">{s.nome}</h3>
          {s.competencias.map((c) => (
            <Linha key={c.competencia_id} rotulo={c.pergunta} valor={formatarPct(c.pct)} />
          ))}
        </section>
      ))}

      <section className="flex flex-col gap-2">
        <h3 className="font-semibold">Comentários</h3>
        {r.comentarios ? (
          <ul className="flex flex-col gap-2">
            {r.comentarios.map((texto, i) => (
              <li key={i} className="rounded-md border p-3 text-sm">
                {texto}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Indisponíveis: menos de 2 avaliadores comentaram, para preservar o anonimato.
          </p>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        &quot;Indisponível&quot; aparece quando menos de 2 avaliadores responderam, para preservar o
        anonimato. {AVISO_FORMULA}
      </p>
    </div>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b py-1.5 text-sm">
      <span>{rotulo}</span>
      <span className={valor === "indisponível" ? "text-muted-foreground" : "font-medium"}>{valor}</span>
    </div>
  );
}
