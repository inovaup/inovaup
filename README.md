# InovaUp

Sistema interno de gestão de pessoas da Empresa Júnior ADM UFBA, que vai substituir o Impulse Up.

- **Antes de qualquer coisa, leia o [`CLAUDE.md`](CLAUDE.md)**: regras, raias e segurança.
- O plano, as tarefas e as decisões estão em [`docs/`](docs/).
- O Davi deve começar pelo [`HANDOFF_DAVI.md`](HANDOFF_DAVI.md).

## Rodar localmente (Windows)

1. Node.js 22 LTS ou mais novo.
2. Instale as dependências:

   ```bash
   npm install
   ```

3. Copie `.env.example` para `.env.local` e preencha com o **seu** projeto Supabase de desenvolvimento.
4. Suba o servidor:

   ```bash
   npm run dev
   ```

   Abra http://localhost:3000.

## Comandos

| Comando | Para quê |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Verificação de tipos (TypeScript) |
| `npm test` | Testes (Vitest) |

Base: modelo oficial `with-supabase` do Next.js (Next.js 16, Supabase SSR, Tailwind, `shadcn/ui`), com Cache Components desligado.
