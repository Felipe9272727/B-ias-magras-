// Abertura do Among Us 4: os comentários do vídeo 3 (youtube/comentarios_au3.json), no mesmo visual da folha de
// comentários do AU2/AU3, agora com um carimbo em cada um: o que ENTROU no episódio e o que FICOU DE FORA (o motivo
// está em video/youtube/au4/funcoes_ep4.md). Os textos são os dos comentários (trechos longos cortados com "...").
import React from 'react';
import {AU2Comentarios, type Comentario} from '../amongus3/Comentarios';

const ENTROU = {texto: '✅ ENTROU', cor: '#1f8f3a'};
const FORA = {texto: '❌ FICOU DE FORA', cor: '#d93025'};

export const COMENTARIOS4: Record<string, Comentario[]> = {
  // o que entrou (o mais curtido por último, no topo da lista)
  entrou: [
    {usuario: '@MateusWT10', quando: 'há 4 dias', likes: 5, texto: 'Poderia fazer que as portas não podem ser fechadas pelos impostores caso está acontecendo uma sabotagem...', destaque: 'as portas não podem ser fechadas', selo: ENTROU},
    {usuario: '@NathanResende-r8i', quando: 'há 4 dias', likes: 8, texto: 'mano mas o palhaço não é "tripulante" então o xerife deveria poder matar neutros', destaque: 'o xerife deveria poder matar neutros', selo: ENTROU},
    {usuario: '@ADumbyDummyYT', quando: 'há 4 dias', likes: 9, texto: 'depois de consertar/sabotar todas as sabotagens ganham cooldown, como no jogo.', destaque: 'ganham cooldown', selo: ENTROU},
    {usuario: '@Seuamigo_Sven', quando: 'há 3 dias', texto: 'mudasse o nome do Rastreador pra Localizador E do Fantasma para Espetro... a função de Chantagista, Impostor, que força um inocente a ficar quieto na reunião', destaque: 'Chantagista', selo: ENTROU},
    {usuario: '@EDEV.Documentando', quando: 'há 4 dias', likes: 1, texto: 'Fantasmas. Alguém ser expulso ou morto pelo Impostor, ele n sai, continua, mas como fantasma.', destaque: 'continua, mas como fantasma', selo: ENTROU},
    {usuario: '@fabiobatistadejesus8682', quando: 'há 4 dias', texto: 'Uhh pode adicionar chapéus pq eu acho legal', destaque: 'chapéus', selo: ENTROU},
  ],
  // funções novas
  funcoes: [
    {usuario: '@vertyamongus', quando: 'há 3 dias', texto: 'impostor apostador, se adivinhar a função de um tripulante ou do palhaço, elimina ela... Também o impostor bomba (ou bombardeiro)', destaque: 'impostor apostador', selo: ENTROU},
    {usuario: '@itzgreenish', quando: 'há 4 dias', texto: '...Mecânico (Tripulante) 🟦 Abra portas e bloqueie dutos', destaque: 'Mecânico', selo: ENTROU},
    {usuario: '@PumpkinAabobora', quando: 'há 4 dias', likes: 1, texto: 'Se for colocar mais funcões você terá que fazer so algumas aparecerem ne? Eu tenho uma sigestão de função: glutão', destaque: 'glutão', selo: ENTROU},
    {usuario: '@RuiSoares-rv1ni', quando: 'há 4 dias', likes: 7, texto: 'Podes por neutros assassinos tipo glutão', destaque: 'glutão', selo: ENTROU},
    {usuario: '@Samuzin-Gamer-2014', quando: 'há 4 dias', likes: 16, texto: 'Agora coloca o Canibal (come os corpos para ganhar), casal (se um dos dois morre o outro morre também)...', destaque: 'Canibal', selo: ENTROU},
    {usuario: '@LionelMessi1930-pal', quando: 'há 3 dias', likes: 32, texto: 'Cria as funções: casal (tem 2, se 1 morre, o outro tbm). Sobrevivente [neutro]. E o perito [Tripulante] (ele tem uma lupa que mostra as pegadas dos impostores).', destaque: 'casal', selo: ENTROU},
  ],
  // o que ficou de fora (o Polus vem em sequência, porque foi pedido 19 vezes pela mesma pessoa)
  fora: [
    {usuario: '@reverso_2254', quando: 'há 3 dias', likes: 5, texto: 'adicione chat específico para cada inteligência artificial como um aplicativo de conversa', destaque: 'chat específico', selo: FORA},
    {usuario: '@mr.trollermen', quando: 'há 4 dias', likes: 2, texto: '1- zumbi/neutro (ou outro nome, é um nome so de base)...', destaque: 'zumbi', selo: FORA},
    {usuario: '@AXIN425', quando: 'há 4 dias', likes: 3, texto: 'vibora coloca vibora 2 vez tentado', destaque: 'vibora', selo: FORA},
    {usuario: '@FELIPEMORAESGOMES', quando: 'há 4 dias', likes: 3, texto: 'Colocar o copilot no jogo e 20 players por fafor', destaque: '20 players', selo: FORA},
    {usuario: '@David_alves-p1f', quando: 'há 4 dias', likes: 2, texto: 'Coloca o mapa POLUS! E bem legal!', destaque: 'POLUS'},
    {usuario: '@David_alves-p1f', quando: 'há 4 dias', texto: 'Mapa POLUS!', destaque: 'POLUS'},
    {usuario: '@David_alves-p1f', quando: 'há 4 dias', texto: 'Coloca polusssssssssss plsssssssssssss!', destaque: 'polusssssssssss'},
    {usuario: '@David_alves-p1f', quando: 'há 4 dias', texto: 'Eu assisto todos seus vídeos e deixo "gostei" por favor coloque o mapa POLUS! Vou inscrever no seu canal si você fizer o mapa POLUS', destaque: 'Vou inscrever no seu canal si você fizer o mapa POLUS', selo: {texto: '⏳ NUM EP PRÓPRIO', cor: '#b06000'}},
  ],
  // o @FAMILIAGMS cobrou que não apareceu no ep 3
  familia: [
    {usuario: '@FAMILIAGMS', quando: 'há 4 dias', likes: 1, texto: 'Faz o modo cavalo', destaque: 'modo cavalo', selo: {texto: '🐴 QUEM SABE...', cor: '#7c3aed'}},
    {usuario: '@FAMILIAGMS', quando: 'há 4 dias', likes: 1, texto: 'Fauto eu aparecer. Tu disse mano', destaque: 'Fauto eu aparecer', selo: {texto: '👋 APARECEU!', cor: '#1f8f3a'}},
  ],
}

export const AU4Comentarios: React.FC<{lista?: string; passo?: number}> = ({lista = 'entrou', passo = 40}) => (
  <AU2Comentarios comentarios={COMENTARIOS4[lista] ?? []} passo={passo} />
);
