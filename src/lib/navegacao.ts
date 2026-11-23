// Itens do menu por papel. O menu só esconde links; quem protege é requireRole()
// em cada página. Itens de tarefas futuras entram quando a página existir.
import type { Papel } from "@/contracts/core";

export type ItemMenu = { rotulo: string; href: string; papeis: readonly Papel[] };

export const ITENS_MENU: readonly ItemMenu[] = [
  { rotulo: "Início", href: "/inicio", papeis: ["colaborador", "lider", "gp"] },
  { rotulo: "Avaliações", href: "/avaliacoes", papeis: ["colaborador", "lider", "gp"] },
  { rotulo: "Painel da GP", href: "/painel", papeis: ["gp"] },
  { rotulo: "Pessoas e squads", href: "/pessoas", papeis: ["gp"] },
];

export function itensDoMenu(papel: Papel): ItemMenu[] {
  return ITENS_MENU.filter((item) => item.papeis.includes(papel));
}
