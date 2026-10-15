// Catálogo de cosméticos do Crewmate4 (desenhos próprios em SVG; nada copiado do jogo).
// Os desenhos ficam em Crewmate4.tsx; aqui só ficam os dados.

export type TipoCosmetico = 'chapeu' | 'rosto' | 'pet';

// Cada item tem um id estável (usado no prop `cosmetico`), um nome para a legenda e um tipo.
export const COSMETICOS = [
  // chapéus e adereços de cabeça
  {id: 'coroa', nome: 'Coroa', tipo: 'chapeu'},
  {id: 'chapeu_chef', nome: 'Chapéu de chef', tipo: 'chapeu'},
  {id: 'cartola', nome: 'Cartola', tipo: 'chapeu'},
  {id: 'bone', nome: 'Boné', tipo: 'chapeu'},
  {id: 'capacete', nome: 'Capacete de obra', tipo: 'chapeu'},
  {id: 'bandana', nome: 'Bandana', tipo: 'chapeu'},
  {id: 'chifrinhos', nome: 'Chifrinhos', tipo: 'chapeu'},
  {id: 'folhinha', nome: 'Folhinha', tipo: 'chapeu'},
  // rosto (sobre o visor)
  {id: 'oculos_escuros', nome: 'Óculos escuros', tipo: 'rosto'},
  {id: 'fones', nome: 'Fones de ouvido', tipo: 'rosto'},
  {id: 'bigode', nome: 'Bigode', tipo: 'rosto'},
  {id: 'tapa_olho', nome: 'Tapa-olho', tipo: 'rosto'},
  // pets e acessórios acima ou nas costas
  {id: 'antena', nome: 'Antena', tipo: 'pet'},
  {id: 'aureola', nome: 'Auréola', tipo: 'pet'},
  {id: 'laco_mochila', nome: 'Laço na mochila', tipo: 'pet'},
] as const satisfies ReadonlyArray<{id: string; nome: string; tipo: TipoCosmetico}>;

export type CosmeticoId = (typeof COSMETICOS)[number]['id'];

// Mapeamento padrão cor -> cosmético. As 15 cores têm cosméticos diferentes entre si.
export const COSMETICO_PADRAO: Record<string, CosmeticoId> = {
  Vermelho: 'coroa',
  Azul: 'oculos_escuros',
  Verde: 'bone',
  Rosa: 'laco_mochila',
  Laranja: 'chapeu_chef',
  Amarelo: 'antena',
  Preto: 'tapa_olho',
  Branco: 'aureola',
  Roxo: 'chifrinhos',
  Marrom: 'bigode',
  Ciano: 'fones',
  Lima: 'folhinha',
  Cinza: 'capacete',
  Coral: 'bandana',
  Bordo: 'cartola',
};

// Busca o nome de um cosmético pelo id (para legendas).
export const nomeCosmetico = (id: string | undefined): string =>
  COSMETICOS.find((c) => c.id === id)?.nome ?? '';
