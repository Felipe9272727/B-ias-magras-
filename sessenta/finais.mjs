// Finais do "60 Segundos das IAs". Fonte: docs/eventos_cadeias_finais.md (seção 3).
// CONTAGEM: 12 finais = 7 vitórias ou ambíguos (militar, gemeos, veiculo; agentes, dona_dos_gatos, estrelas, sovietico)
//           + 5 derrotas (ninguem_adulto, expulso, invasao, dominacao_felina, marlon).
// Não são final: "Seguro por enquanto" (fim do modo de coleta) e as conquistas.
//
// Dois tipos de final:
//  - por condição: `checar(e)` devolve o motivo ou null, e o motor chama todo fim de dia.
//  - dentro de um passo de cadeia: o evento chama terminar(e, id, ...) no resolver. Aparecem aqui com
//    checar null para a lista ficar completa. Ids: militar, gemeos, veiculo (eventos das cadeias).
//    agentes, dona_dos_gatos, estrelas, dominacao_felina (gatos e cientista), invasao (bandidos).
//
// Sem condição escrita na fonte: marlon (não informada) e sovietico (só no desafio "Contagem final",
// fora de sessenta/ não existe). Ambos ficam com checar null.
import {adultosVivos, noAbrigo, vivos} from './estado.mjs'

export const FINAIS = [
  {
    id: 'expulso', tipo: 'derrota',
    // ninguém no abrigo nem em expedição, mas ainda há gente viva (todos fugiram ou foram levados); vem antes de ninguem_adulto
    checar: (e) => (vivos(e).length > 0 && noAbrigo(e).length === 0 && !vivos(e).some((p) => p.fora) ? 'ninguém dentro do abrigo' : null),
  },
  {
    id: 'ninguem_adulto', tipo: 'derrota',
    // nenhum adulto (pai ou mãe) vivo: no abrigo ou numa expedição que ainda pode voltar (as crianças não se viram sozinhas)
    checar: (e) => {
      const adulto = adultosVivos(e).some((p) => !p.fugiu && (p.noAbrigo || p.fora))
      return adulto ? null : 'nenhum adulto vivo no abrigo'
    },
  },
  {
    id: 'invasao', tipo: 'derrota',
    checar: () => null, // acontece dentro de bandidos_1 (terminar)
  },
  {
    id: 'dominacao_felina', tipo: 'derrota',
    checar: () => null, // acontece dentro de gatos_final_x (terminar)
  },
  {
    id: 'marlon', tipo: 'derrota',
    checar: () => null, // condição não informada na fonte (a página Endings só cita "Marlon")
  },
  {
    id: 'militar', tipo: 'vitoria',
    checar: () => null, // terminar em militar_5 (resgate)
  },
  {
    id: 'gemeos', tipo: 'vitoria',
    checar: () => null, // terminar em gemeos_5 (abrir a porta)
  },
  {
    id: 'veiculo', tipo: 'vitoria',
    checar: () => null, // terminar em veiculo_6 (ligar com cinco latas)
  },
  {
    id: 'agentes', tipo: 'ambiguo',
    checar: () => null, // terminar em gatos_6 (abrir a porta)
  },
  {
    id: 'dona_dos_gatos', tipo: 'ambiguo',
    checar: () => null, // terminar em gatos_final_9
  },
  {
    id: 'estrelas', tipo: 'ambiguo',
    checar: () => null, // terminar em cientista_3 (foguete)
  },
  {
    id: 'sovietico', tipo: 'ambiguo',
    checar: () => null, // só no desafio "Contagem final"; fora do desafio não existe
  },
]
