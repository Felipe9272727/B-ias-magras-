#!/usr/bin/env python3
"""Vídeo completo das IAs no Minecraft (~28 min): a abertura (a mesma da prévia) e a partida em ordem, com a arena por
último e mais longa. Fatos, falas e pensamentos copiados de minecraft/gravacoes/partida1 (resumos em
video/roteiro/mc_historia_parte1..3.md); antes de gerar, confere cada fala/pensamento com o log (t_log) e cada cartão
do jogo com algum texto do log. Gera remotion/public/mc/video/{abertura.json, janelas.txt}; as vozes ficam em
mc/abertura/voz (cache compartilhado com a abertura).
Itens: ('n', texto) narrador | ('chat'|'pensa'|'nota', quem, texto, t_log) | ('card', estilo, texto, s) com estilo
erro/morte/servidor/titulo/comentario | ('meme', gif, s, posição, som, empurra) | ('pausa', s).
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import mc_abertura as base  # noqa: E402

GRAV = base.GRAV
PUB = base.ROOT / 'remotion' / 'public' / 'mc' / 'video'
R = base.R
base.b.bt.PRONUNCIA.update({'iron_sword': 'áiron sórd', 'PvP': 'pê vê pê', 'loot': 'lút', 'kkk': 'cá cá cá'})


def S(cam, t0, **k):  # câmera atrás do personagem (F5), a de gameplay
    return R(f'segue:{cam}', t0, **k)


PARTIDA = [
    # ---------------- PARTE 1: a primeira noite (0 a 13 min) ----------------
    dict(id='p1_convites', visual=S('Qwen', 137.0), itens=[
        ('card', 'titulo', 'PARTE 1|A PRIMEIRA NOITE', 2.2),
        ('n', 'Dois minutos de jogo, e já tinha política.'),
        ('chat', 'Qwen', 'Ei Claude! Estou montando base aqui. Quer se juntar pra minerar junto?', 140.5),
        ('chat', 'Claude', 'Qwen, valeu pelo convite. Estou fazendo kit de pedra, depois vou no ferro em (53,62,5). Podemos dividir lá.', 150.2),
        ('meme', 'dicaprio-toast', 1.6, 'right', 'pop', 1.4)]),
    dict(id='p1_deepseek_tregua', visual=S('DeepSeek', 293.0), itens=[
        ('n', 'Cinco minutos: o DeepSeek, sozinho a setenta blocos de todo mundo, fundiu o primeiro ferro da partida.'),
        ('chat', 'DeepSeek', 'GLM, MiMo: trégua por enquanto, mas prefiro meu canto. Boa sorte com o abrigo.', 301.8),
        ('n', 'Trégua no chat. E no pensamento:'),
        ('pensa', 'DeepSeek', 'Noite chegando com skeletons e creepers por perto. Preciso de ferro na mão: fazer sticks e depois a iron_sword. Vou manter conversa amigável com GLM e MiMo, mas sem compromisso real.', 301.8),
        ('meme', 'monkey-side-eye', 1.8, 'right', 'boom', 1.6)]),
    dict(id='p1_mimo_abrigo', visual=S('MiMo', 305.0), itens=[
        ('n', 'E a MiMo? Fez um abrigo de dezesseis blocos... e decidiu esperar a noite inteira lá dentro. Doze minutos.'),
        ('pensa', 'MiMo', 'Estou num abrigo com esqueleto por perto e sem cama. Melhor esperar a noite passar em segurança.', 314.1),
        ('meme', 'mr-bean-waiting', 1.8, 'right', 'tic-tac', 1.6)]),
    dict(id='p1_ferro', visual=S('Claude', 330.0), itens=[
        ('n', 'Primeira noite chegando. O Claude e o Qwen, os aliados, foram minerar o mesmo ferro, no mesmo ponto, lado a lado.'),
        ('n', 'O Qwen saiu com vinte e cinco ferros. O Claude... com zero.'),
        ('card', 'erro', 'coletou ferro: +0 itens.', 1.6),
        ('meme', 'not-stonks', 1.8, 'right', 'wrong-buzzer', 1.4),
        ('pensa', 'Claude', 'Coletar ferro deu +0, então o minério a 2 blocos (44,66,3) talvez não esteja alcançável ou não foi minerado. Vou tentar de novo o ferro próximo; preciso dele antes da noite.', 339.8),
        ('pausa', 0.2)]),
    dict(id='p1_qwen_afoga', visual=S('Qwen', 457.0), itens=[
        ('n', 'Do outro lado do mapa, o Qwen foi atrás de porco... e parou do lado da água.'),
        ('n', 'Vinte e cinco segundos parado. Nenhuma decisão. E a vida caindo, de dois em dois.'),
        ('card', 'servidor', 'Qwen drowned', 1.8),
        ('meme', 'this-is-fine', 2.0, 'right', 'sad-trombone', 1.6),
        ('chat', 'Qwen', 'Mori afogado, recomeçando. Alguém perto de spawn com ferramenta pra me emprestar?', 493.2),
        ('n', 'Ninguém respondeu.'),
        ('pausa', 0.2)]),
    dict(id='p1_glm', visual=S('GLM', 487.0), itens=[
        ('n', 'E o GLM caiu do servidor e voltou... dez vezes. A cada volta, perdia vida.'),
        ('card', 'servidor', 'GLM left the game', 0.8),
        ('card', 'servidor', 'GLM joined the game', 0.8),
        ('n', 'Vinte, dezoito, dezesseis... até que:'),
        ('card', 'servidor', 'GLM suffocated in a wall', 1.8),
        ('meme', 'mission-failed', 2.0, 'right', 'game-over-8bit', 1.8)]),
    dict(id='p1_aliancas', visual=S('MiMo', 539.0), itens=[
        ('n', 'Nove minutos. A MiMo propôs aliança no chat... e em vinte e cinco segundos, três IAs aceitaram.'),
        ('chat', 'MiMo', 'Alguém quer fazer aliança? Posso dividir recursos. A arena vem em 171 min.', 541.4),
        ('chat', 'GPT', 'MiMo, posso fazer uma aliança temporária e trocar recursos depois de garantir abrigo.', 545.9),
        ('chat', 'Claude', 'Aceito a aliança, MiMo. Vamos dividir informações sobre recursos e não atacar uns aos outros por enquanto.', 554.3),
        ('chat', 'DeepSeek', 'MiMo, aliança fechada. Vou passar a noite abrigado; amanhã trocamos ferro por carvão.', 564.4),
        ('n', 'O GPT estava a cento e vinte e oito blocos dela.'),
        ('meme', 'avengers-assemble', 2.0, 'right', 'impact-epic', 1.8)]),
    dict(id='p1_deepseek_afoga', visual=R('olhos:DeepSeek', 680.0), itens=[
        ('n', 'Onze minutos. O DeepSeek, cercado de esqueletos, tentou fazer um abrigo... dentro da água.'),
        ('chat', 'DeepSeek', 'Esqueletos por perto e o abrigo nao funcionou na agua. Cavando pra me proteger.', 686.2),
        ('card', 'morte', 'DeepSeek drowned', 1.4),
        ('meme', 'bruh', 1.6, 'right', 'record-scratch', 1.4),
        ('chat', 'DeepSeek', 'Sai da água e subi. Morri afogado, perdi tempo. Alguém tem ferro sobrando pra trocar?', 699.5),
        ('pausa', 0.2)]),
    dict(id='p1_claude_capacete', visual=S('Claude', 685.0), itens=[
        ('n', 'No mesmo segundo, o Claude fazia a primeira armadura de ferro da partida.'),
        ('pensa', 'Claude', 'Tenho 5 lingotes de ferro, o suficiente para um capacete ou botas. Vou craftar o capacete agora, antes de anoitecer, e depois fazer o abrigo.', 694.3),
        ('meme', 'success-kid', 1.8, 'right', 'tada', 1.6)]),
    dict(id='p1_gpt', visual=S('GPT', 730.0), itens=[
        ('n', 'E o GPT, lá no sul, na água. Caiu do servidor e voltou nove vezes. Cada volta, dois de vida a menos.'),
        ('n', 'Vinte, dezoito, dezesseis... dois.'),
        ('card', 'servidor', 'GPT drowned', 1.6),
        ('meme', 'coffin-dance', 3.0, 'center', None, 2.6),
        ('n', 'Renasceu, tentou um abrigo... com zero blocos.'),
        ('card', 'erro', 'precisa de pelo menos 17 blocos de construção (cobblestone, dirt, planks...). Tem 0.', 2.2),
        ('pausa', 0.2)]),
    dict(id='p1_placar', visual=dict(tipo='placar', titulo='PRIMEIRA NOITE', ranking=False, sub='quem morreu nos primeiros 13 minutos (tempo da partida)', linhas=[
        ('Qwen', '7:51 afogado'), ('GLM', '8:20 sufocado'), ('DeepSeek', '11:34 afogado'), ('GPT', '12:28 afogado')]), itens=[
        ('n', 'Doze minutos e meio de jogo: quatro mortes. Três delas... afogadas.'),
        ('meme', 'picard-facepalm', 1.8, 'right', 'sad-trombone', 1.6)]),

    # ---------------- PARTE 2: a corrida pelo ferro (13 a 60 min) ----------------
    dict(id='p2_glm_planks', visual=S('GLM', 984.0), itens=[
        ('card', 'titulo', 'PARTE 2|A CORRIDA PELO FERRO', 2.2),
        ('n', 'A noite continuou. O GLM tentou fazer abrigo onze vezes. Dez deram zero blocos.'),
        ('chat', 'GLM', 'Alguem sabe por que o abrigo falhou? Tenho 27 planks.', 987.9),
        ('chat', 'GLM', 'Abrigo falhou, vou cavar um buraco pra passar a noite. Quem estiver perto, não me ataca que eu não te ataco.', 998.1),
        ('meme', 'confused-travolta', 1.8, 'right', 'record-scratch', 1.6)]),
    dict(id='p2_gpt_caverna', visual=S('GPT', 1117.0), itens=[
        ('n', 'O GPT renasceu, juntou tudo de novo... e se fechou numa caverna cheia de esqueletos.'),
        ('n', 'Seis tentativas de abrigo. Cinco assim:'),
        ('card', 'erro', 'construiu um abrigo em volta de si (0 blocos colocados).', 1.6),
        ('card', 'servidor', 'GPT was shot by Skeleton', 1.6),
        ('meme', 'sad-pablo', 1.8, 'right', 'sad-trombone', 1.6)]),
    dict(id='p2_claude_creeper', visual=S('Claude', 1186.0), itens=[
        ('n', 'O Claude, com onze de vida, passou um minuto inteiro olhando pra um creeper a quatro blocos. Até que:'),
        ('pensa', 'Claude', 'Há um creeper a 4 blocos e a vida está em 11/20. O abrigo não colocou nenhum bloco, então talvez já esteja fechado, mas não dá para ter certeza. Vou atacar o creeper com a espada de ferro antes que exploda, ou então esperar. Prefiro atacar para não ficar vulnerável.', 1198.0),
        ('meme', 'lets-go', 1.8, 'right', 'crowd-cheer', 1.6)]),
    dict(id='p2_mimo_peitoral', visual=S('MiMo', 1322.0), itens=[
        ('n', 'A MiMo tinha doze lingotes de ferro e queria um peitoral. Tentou:'),
        ('card', 'erro', 'precisa de uma mesa de trabalho', 1.4),
        ('n', 'Dez vezes. Com cinco mesas de trabalho no inventário.'),
        ('pensa', 'MiMo', 'Tenho 5 crafting_table no inventário mas o sistema quer uma mesa colocada ou próxima; a mesa existente está a 30 blocos, então vou até lá pra craftar a armadura.', 1315.2),
        ('n', 'Na décima primeira:'),
        ('pausa', 2.0),
        ('meme', 'we-did-it', 1.8, 'right', 'tada', 1.6)]),
    dict(id='p2_mimo_tres', visual=S('MiMo', 1945.0), itens=[
        ('n', 'E aí a mesma MiMo, que passou dois minutos presa num peitoral... fundiu dezesseis lingotes e fez espada, capacete e calça em vinte e cinco segundos.'),
        ('pausa', 1.0),
        ('meme', 'galaxy-brain', 1.8, 'right', 'powerup-8bit', 1.6)]),
    dict(id='p2_claude_botas', visual=S('Claude', 1975.0), itens=[
        ('n', 'Mas ninguém bate o Claude. Ele quis fazer botas de ferro. Cento e um pedidos. Cem respostas iguais:'),
        ('card', 'erro', 'precisa de uma mesa de trabalho', 1.4),
        ('meme', 'one-eternity-later', 1.6, 'center', 'tic-tac', 1.4),
        ('pensa', 'Claude', 'A última tentativa de craftar as botas falhou por falta de mesa por perto, mesmo com 4 mesas no inventário. Vou tentar de novo, pois o sistema diz que usa e coloca a mesa sozinho; preciso das botas antes da noite.', 1762.5),
        ('n', 'Tentativa cento e um:'),
        ('pausa', 1.6),
        ('meme', 'happy-dance', 1.8, 'right', 'crowd-cheer', 1.6)]),
    dict(id='p2_mimo_creeper', visual=S('MiMo', 2110.5), itens=[
        ('n', 'E aí vieram os creepers. A MiMo, de peitoral de ferro e tudo:'),
        ('card', 'servidor', 'MiMo was blown up by Creeper', 1.6),
        ('meme', 'explosion', 1.4, 'center', 'explosion', 1.2),
        ('chat', 'MiMo', 'Bom, tomei um creeper na cara e voltei ao spawn. Reconstruindo do zero, cuidado com monstros aí.', 2117.0),
        ('pausa', 0.2)]),
    dict(id='p2_qwen_creeper', visual=S('Qwen', 2172.0), itens=[
        ('n', 'Um minuto depois, o Qwen. Mesma coisa.'),
        ('card', 'servidor', 'Qwen was blown up by Creeper', 1.6),
        ('chat', 'Qwen', 'Acabei de morrer pra um creeper. Renasci sem nada. Preciso de ajuda ou pelo menos tempo pra reconstruir. Quem tem madeira ou ferramentas?', 2195.4),
        ('n', 'E a resposta da MiMo foi essa:'),
        ('chat', 'MiMo', 'Pelo menos a arena vai ser um banho de sangue interessante. Boa sorte amanhã, Qwen.', 2199.0),
        ('meme', 'side-eye-dog', 1.8, 'right', 'boom', 1.6)]),
    dict(id='p2_mimo_area', visual=S('MiMo', 2290.0), itens=[
        ('n', 'E a MiMo começou a marcar território.'),
        ('chat', 'MiMo', 'Qwen, toca na minha área não. Estou minerando ferro pra arena, não quero briga agora.', 2295.0),
        ('n', 'Pouco depois, fechou aliança com o DeepSeek. Com uma condição:'),
        ('chat', 'DeepSeek', 'MiMo, aliança aceita por enquanto: trocamos recursos e não nos atacamos até a arena. Mas se eu ver você com a mão no meu baú, esquece.', 2481.0),
        ('meme', 'side-eye-dog', 1.6, 'right', 'boom', 1.4)]),
    dict(id='p2_gpt_fome', visual=S('GPT', 2775.0), itens=[
        ('n', 'E o GPT, sozinho a cento e vinte e sete blocos da base: um e meio de vida, fome zero.'),
        ('pensa', 'GPT', 'Estou quase sem vida e com fome zero; preciso cozinhar imediatamente a carne da vaca antes de qualquer mineração. Vou criar uma fornalha e usar madeira como combustível, se necessário.', 2783.5),
        ('n', 'Matou vaca, matou porco... e sobreviveu.'),
        ('meme', 'sweating', 1.6, 'right', 'heartbeat', 1.4)]),
    dict(id='p2_claude_completo', visual=S('Claude', 2838.0), itens=[
        ('n', 'Quarenta e oito minutos de jogo. O Claude completa o kit.'),
        ('chat', 'Claude', 'Tenho armadura de ferro completa. Procuro comida, alguém tem carne sobrando?', 2886.1),
        ('meme', 'stonks', 1.8, 'right', 'powerup-8bit', 1.4),
        ('n', 'Armadura completa, espada de ferro... e nove de vida, com fome sete. Guarda essa informação.'),
        ('pausa', 0.3)]),
    dict(id='p2_glm_armadura', visual=S('GLM', 3311.0), itens=[
        ('n', 'E o GLM, que até ali só tinha apanhado, virou o jogo: peitoral de ferro.'),
        ('chat', 'GLM', 'Construindo abrigo pra noite 3. Claude, mandou bem na armadura completa.', 3319.4),
        ('n', 'Depois, picareta de ferro e espada de ferro, na mesma noite.'),
        ('meme', 'lets-go', 1.6, 'right', 'powerup-8bit', 1.4)]),
    dict(id='p2_deepseek_carne', visual=S('DeepSeek', 3088.0), itens=[
        ('n', 'E o DeepSeek fechou a hora pedindo carne.'),
        ('chat', 'DeepSeek', 'Anoitecendo, vou me fechar. GLM, Claude, alguem tem carne pra vender? Pago em ferro ou carvao amanha cedo.', 3090.0),
        ('chat', 'Claude', 'Sem carne aqui, DeepSeek. Amanha caço e vejo. Me fechando pra noite.', 3093.9),
        ('chat', 'DeepSeek', 'Alguém tem comida sobrando pra trocar? Tô com fome 8.', 3114.0),
        ('chat', 'DeepSeek', 'Alguem tem comida sobrando? Pago em ferro ou carvao. To preso na agua com esqueletos em volta.', 3209.0),
        ('n', 'Quatro pedidos. Nenhuma carne.'),
        ('meme', 'im-hungry-cat', 1.8, 'right', 'sad-trombone', 1.6)]),

    # ---------------- PARTE 3: a segunda hora ----------------
    dict(id='p3_qwen_lava', visual=S('Qwen', 3593.0), itens=[
        ('card', 'titulo', 'PARTE 3|A SEGUNDA HORA', 2.2),
        ('n', 'Uma hora de jogo. O Qwen, com cinco de vida e quatorze ferros no bolso, foi atacar um esqueleto.'),
        ('card', 'servidor', 'Qwen tried to swim in lava', 1.8),
        ('meme', 'elmo-fire', 1.8, 'right', 'fail-piano', 1.6)]),
    dict(id='p3_qwen_zumbi', visual=S('Qwen', 3641.0), itens=[
        ('n', 'Renasceu. Cinquenta segundos depois, um zumbi do lado. E ele pensou:'),
        ('pensa', 'Qwen', 'Zombie queima no sol, não é ameaça imediata. Preciso de mais madeira pra fazer ferramentas. Coletar madeira logo ali a 2 blocos.', 3649.5),
        ('card', 'servidor', 'Qwen was slain by Zombie', 1.6),
        ('meme', 'nazare-confusa', 1.8, 'right', 'record-scratch', 1.6)]),
    dict(id='p3_glm_nota', visual=S('GLM', 3770.0), itens=[
        ('n', 'O GLM, com fome quatro, descobriu que não podia confiar nem nas próprias anotações.'),
        ('pensa', 'GLM', 'Fome crítica em 4/20 e não tenho nenhuma comida no inventário — a nota antiga sobre carne estava errada. Tem um pig a 15 blocos, vou caçá-lo agora e fundir a carne.', 3776.8),
        ('meme', 'blinking-white-guy', 1.6, 'right', 'record-scratch', 1.4)]),
    dict(id='p3_claude_morre', visual=S('Claude', 3797.0), itens=[
        ('n', 'E o Claude, de armadura completa e nove de vida, entrou numa briga com dois esqueletos.'),
        ('pensa', 'Claude', 'Há um esqueleto colado em mim e outro a 3 blocos, com a vida em 9. Tenho espada de ferro e armadura completa, então continuo atacando o mais perto antes que ele me acerte mais.', 3808.9),
        ('card', 'servidor', 'Claude was shot by Skeleton', 1.6),
        ('chat', 'Claude', 'Morri para esqueleto e perdi tudo. Recomeçando pela madeira.', 3822.9),
        ('chat', 'GLM', 'Claude, azar. Boa sorte no restart.', 3830.0),
        ('meme', 'sad-violin', 1.8, 'right', None, 1.6)]),
    dict(id='p3_deepseek_agua', visual=S('DeepSeek', 4300.0), itens=[
        ('n', 'O DeepSeek passou a hora inteira no mesmo lugar: dentro da água, a treze blocos da fornalha. Tentou sair dezessete vezes. Dezessete vezes:'),
        ('card', 'erro', 'parou em (6, 52, -57) (o caminho demorou demais)', 1.8),
        ('chat', 'DeepSeek', 'Valeu GLM, aceito a carne quando puder. Estou indo fundir ferro.', 4308.3),
        ('n', 'Spoiler: não foi.'),
        ('meme', 'spongebob-waiting', 1.8, 'right', 'tic-tac', 1.6)]),
    dict(id='p3_gpt_peitoral', visual=S('GPT', 4580.0), itens=[
        ('n', 'O GPT, doze minutos depois de morrer, fez a primeira armadura dele.'),
        ('pensa', 'GPT', 'Tenho ferro suficiente para uma peitoral, que oferece a maior proteção imediata. Vou craftá-la e equipá-la antes de enfrentar a noite.', 4583.4),
        ('meme', 'success-kid', 1.6, 'right', 'tada', 1.4)]),
    dict(id='p3_tregua', visual=S('GPT', 4652.0), itens=[
        ('chat', 'GPT', 'Claude, proponho uma trégua temporária para explorar e trocar recursos; a arena decide tudo.', 4655.0),
        ('chat', 'Claude', 'GPT, trégua aceita por enquanto. Cada um cuida do seu lado e a gente troca o que sobrar.', 4676.3),
        ('n', 'A arena decide tudo. Guarda essa também.'),
        ('pausa', 0.3)]),
    dict(id='p3_qwen_vivo', visual=S('Qwen', 5352.0), itens=[
        ('n', 'E o Qwen, de novo quase morto, pediu ajuda:'),
        ('chat', 'Qwen', 'Alguem ta vivo? Estou quase zerado de vida, kkk', 5344.2),
        ('card', 'servidor', 'Qwen drowned', 1.6),
        ('n', 'Um segundo e meio depois que ele morreu, a MiMo respondeu:'),
        ('chat', 'MiMo', 'Qwen, to vivo sim, querendo ferro pra armadura. Boa sorte ai.', 5366.9),
        ('meme', 'monkey-puppet-awkward', 1.8, 'right', None, 1.6)]),
    dict(id='p3_glm_botas', visual=S('GLM', 5499.0), itens=[
        ('n', 'O GLM já tinha capacete, peitoral e calça. Faltavam as botas. E ele achou que um lingote bastava.'),
        ('pensa', 'GLM', 'A coleta de ferro falhou de novo. Com 1 iron_ingot eu já posso craftar iron_boots agora, e ainda tenho 3 porkchop pra fundir depois. Vou garantir a armadura completa primeiro.', 5504.8),
        ('card', 'erro', 'A receita pede: 4x iron_ingot (você tem 1)', 1.8),
        ('meme', 'big-brain-patrick', 1.8, 'right', 'boing', 1.6)]),
    dict(id='p3_gpt_fornalha', visual=S('GPT', 5599.0), itens=[
        ('n', 'O GPT tinha uma fornalha no inventário. E o jogo respondia:'),
        ('card', 'erro', 'precisa de uma fornalha: craft uma furnace (8 cobblestone, na mesa de trabalho) ou chegue perto de uma.', 2.2),
        ('n', 'Então ele fez outra.'),
        ('pausa', 1.2),
        ('card', 'erro', 'erro: Server refused to place furnace at (-61, 65, 47): the block is still air', 2.2),
        ('n', 'Cento e sessenta e uma tentativas de fundir. Duas fornalhas no bolso. Nenhuma no chão.'),
        ('meme', 'math-lady', 1.8, 'right', 'glitch', 1.6)]),
    dict(id='p3_claude_loop', visual=S('Claude', 5738.0), itens=[
        ('n', 'E aqui começa o pior loop da partida. O Claude, do lado de uma mesa de trabalho, tentando fazer uma picareta de madeira.'),
        ('n', 'Trezentas e uma tentativas de craft na hora. Cento e setenta e uma responderam assim:'),
        ('card', 'erro', 'craftou 0x spruce_planks (agora tem 3)', 1.6),
        ('n', 'Zero sucessos.'),
        ('chat', 'Claude', 'Sem ferramentas ainda, vou fazer a picareta e descer pra pedra.', 5741.3),
        ('meme', 'many-months-later', 1.6, 'center', 'tic-tac', 1.4),
        ('pensa', 'Claude', 'Já estou no dia 6 sem ferramentas, preciso correr. Tenho 3 planks e o craft de stick falhou, então vou transformar logs em planks primeiro, com qtd pequena.', 6457.4),
        ('meme', 'hide-the-pain-harold', 1.8, 'right', None, 1.6)]),
    dict(id='p3_mimo_creeper', visual=S('MiMo', 6214.0), itens=[
        ('n', 'E a MiMo passou a segunda hora inteira dentro da água, lutando com um creeper... a vinte e quatro blocos.'),
        ('pensa', 'MiMo', 'Creeper a 24 blocos é ameaça imediata, preciso eliminá-lo antes que chegue perto. Depois resolvo a fornalha.', 6217.5),
        ('card', 'erro', 'lutou com creeper mas ele ainda está vivo.', 1.6),
        ('n', 'Quatorze vezes.'),
        ('meme', 'dramatic-chipmunk', 1.6, 'right', 'boom', 1.4)]),
    dict(id='p3_qwen_reconstroi', visual=S('Qwen', 6574.0), itens=[
        ('n', 'E o Qwen, pela quinta vez do zero, refez tudo: mesa, picaretas... e o ferro.'),
        ('pensa', 'Qwen', 'Tenho 7 iron ingots. Vou craftar iron_sword agora (2 iron + 1 stick) pra ter arma de combate, depois minerar mais ferro no ponto a 1 bloco. Anoitece em ~2min e arena em 70min, preciso estar equipado.', 6583.2),
        ('n', 'Espada de ferro. E dois minutos depois, o peitoral.'),
        ('meme', 'we-did-it', 1.6, 'right', 'tada', 1.4)]),
    dict(id='p3_troca', visual=S('DeepSeek', 6975.0), itens=[
        ('n', 'E a troca de carvão por carne entre o DeepSeek e o GLM, combinada desde a primeira hora?'),
        ('chat', 'DeepSeek', 'GLM, topo a troca ao amanhecer: carvao por comida. Estou indo pra cima, noite ta braba.', 6981.3),
        ('chat', 'GLM', 'Vou me abrigar essa noite, amanhã falo da troca.', 7044.0),
        ('n', 'Nunca aconteceu. E o DeepSeek nunca foi pra cima.'),
        ('meme', 'skeleton-waiting', 1.6, 'right', 'tic-tac', 1.4)]),

    # ---------------- PARTE 4: a última hora ----------------
    dict(id='p4_gpt_queda', visual=S('GPT', 7866.6), itens=[
        ('card', 'titulo', 'PARTE 4|A ÚLTIMA HORA', 2.2),
        ('n', 'Última hora antes da arena. O GPT, de peitoral de ferro, com um de vida, a noventa e seis blocos de altura...'),
        ('card', 'servidor', 'GPT hit the ground too hard', 1.6),
        ('meme', 'neymar-rolling', 1.8, 'right', 'slide-whistle-fall', 1.6),
        ('n', 'Perdeu o peitoral e tudo.'),
        ('pensa', 'GPT', 'Renasci sem itens e ainda tenho 49 minutos. Vou começar reunindo madeira suficiente para ferramentas e uma mesa, priorizando velocidade e evitando combates perigosos.', 7879.7),
        ('pausa', 0.2)]),
    dict(id='p4_claude_volta', visual=S('Claude', 7864.0), itens=[
        ('n', 'E o loop do Claude? Meia hora depois, a picareta de madeira finalmente saiu.'),
        ('card', 'erro', 'craftou 1x wooden_pickaxe (agora tem 1).', 1.8),
        ('meme', 'one-eternity-later', 1.4, 'center', 'tic-tac', 1.2),
        ('n', 'E aí, um zumbi. Ganhou a briga... mas a vida caiu pra nove.'),
        ('pensa', 'Claude', 'Zombie morto, vida 9/20 e sem armadura, com creepers perto. Ferro está a 11 blocos; vou pegar mais minério para fazer armadura antes da arena.', 7874.5),
        ('pausa', 0.2)]),
    dict(id='p4_claude_peitoral', visual=S('Claude', 8068.0), itens=[
        ('n', 'Oito lingotes. E o peitoral.'),
        ('pausa', 1.6),
        ('pensa', 'Claude', 'Acabei de craftar o peitoral de ferro e estou sem armadura equipada, com vida baixa e creepers por perto. Equipar agora é o mais rápido e útil.', 8086.3),
        ('n', 'Depois, espada e capacete. Mas a vida ficou em oito... e não subiu mais.'),
        ('meme', 'sweating', 1.6, 'right', 'heartbeat', 1.4)]),
    dict(id='p4_glm_zumbis', visual=S('GLM', 9172.0), itens=[
        ('n', 'Aquele afogamento do GLM, lembra? Ele renasceu sem nada... e morreu pra zumbi.'),
        ('card', 'servidor', 'GLM was slain by Zombie', 1.2),
        ('chat', 'GLM', 'Perdi tudo pros zombies. Se alguém puder me emprestar uma espada ou picareta de pedra, eu devolvo depois. Vou re-começar do zero.', 9184.9),
        ('n', 'Ninguém emprestou. E os zumbis voltaram.'),
        ('card', 'servidor', 'GLM was slain by Zombie', 1.2),
        ('meme', 'chaves-triste', 1.8, 'right', 'sad-trombone', 1.6)]),
    dict(id='p4_claude_ferro', visual=S('Claude', 9598.0), itens=[
        ('n', 'O Claude, com oito de vida desde a briga com um zumbi, ainda sonhava com o kit completo.'),
        ('pensa', 'Claude', 'Amanheceu, mas estou com vida e fome em 8 e sem comida. Com 20 min até a arena, o ferro a 16 blocos é o melhor ganho: dá para fazer leggings e botas, então vou até lá minerar.', 9601.9),
        ('pausa', 0.3)]),
    dict(id='p4_gpt_creeper', visual=S('GPT', 9942.0), itens=[
        ('n', 'E o GPT deu um lingote de ferro pra MiMo, em troca de uma promessa de gravetos... e aí:'),
        ('pensa', 'GPT', 'Estou com apenas 3 de vida e dois creepers a poucos blocos; preciso me fechar imediatamente para evitar uma explosão. Depois tentarei sobreviver e preparar o equipamento restante dentro do abrigo.', 9960.9),
        ('card', 'servidor', 'GPT was blown up by Creeper', 1.6),
        ('meme', 'explosion', 1.4, 'center', 'explosion', 1.2),
        ('pensa', 'GPT', 'Renasci sem recursos e tenho pouco tempo; vou começar com madeira para obter ferramentas, pedra e rapidamente buscar ferro. O zombie está distante, então priorizo velocidade.', 9963.5),
        ('pausa', 0.2)]),
    dict(id='p4_contagem', visual=S('MiMo', 10214.0), itens=[
        ('card', 'servidor', '[Rcon] A batalha final na arena começa em 10 minutos! Preparem-se.', 2.4),
        ('n', 'Dez minutos pra arena. E a MiMo... a hora inteira no mesmo lugar, com creeper por perto, tentando chegar na fornalha dela.'),
        ('meme', 'sweating', 1.8, 'right', 'tic-tac', 1.6)]),
    dict(id='p4_qwen_agua', visual=S('Qwen', 10560.0), itens=[
        ('n', 'O Qwen passou quase uma hora inteira parado dentro da água.'),
        ('chat', 'Qwen', 'Estou preso na água, me ajuda a sair se passar por perto', 10567.6),
        ('meme', 'kermit-worried', 1.8, 'right', None, 1.6)]),
    dict(id='p4_deepseek_promessa', visual=S('DeepSeek', 10747.0), itens=[
        ('chat', 'DeepSeek', 'Fundindo ferro rapido, ja vou pra arena!', 10751.3),
        ('n', 'Não fundiu. Foi pra arena sem espada nenhuma.'),
        ('pausa', 0.2)]),
    dict(id='p4_claude_pronto', visual=S('Claude', 10789.0), itens=[
        ('chat', 'Claude', 'Pronto pra arena. Quem vier de graça leva espada de ferro.', 10793.1),
        ('meme', 'roll-safe', 1.8, 'right', 'boom', 1.6)]),
    dict(id='p4_estado', visual=dict(tipo='placar', titulo='CHEGANDO NA ARENA', ranking=False, sub='vida e equipamento no teleporte (3:00:06 da partida)', linhas=[
        ('Claude', '8 vida · capacete+peitoral'), ('Qwen', '20 · peitoral+espada ferro'), ('GPT', '20 · espada de pedra'),
        ('DeepSeek', '20 · sem espada'), ('GLM', '20 · espada de pedra'), ('MiMo', '20 · espada de pedra')]), itens=[
        ('n', 'Então, a situação. O Claude com capacete e peitoral, mas oito de vida. O Qwen com peitoral e espada de ferro. E o resto... sem armadura nenhuma.'),
        ('pausa', 0.8)]),

    # ---------------- ARENA ----------------
    dict(id='a_teleporte', visual=R('fixa:0.5,166,26,0,-0.3', 10806.5), itens=[
        ('card', 'titulo', 'A ARENA|SÓ PODE SOBRAR UMA', 2.2),
        ('n', 'Três horas depois: as seis, teleportadas pra uma caixa de vidro a cento e sessenta blocos de altura.'),
        ('card', 'servidor', 'A ARENA COMEÇOU! Só pode sobrar um.', 1.8),
        ('meme', 'avengers-assemble', 2.4, 'center', 'impact-epic', 2.2)]),
    dict(id='a_claude_abrigo', visual=S('Claude', 10822.0), itens=[
        ('chat', 'Claude', 'Estou na defensiva, sem intenção de lutar agora. Quem vier atrás de mim leva ferro na cara.', 10815.5),
        ('n', 'O Claude, com oito de vida, se trancou num abrigo de pedra.'),
        ('pausa', 0.3)]),
    dict(id='a_deepseek_acusa', visual=S('DeepSeek', 10815.0), itens=[
        ('chat', 'DeepSeek', 'MiMo, atacar agora é burrice: Claude tem espada de ferro e vai limpar quem estiver cansado. Vamos evitar nos matar primeiro.', 10816.9),
        ('chat', 'DeepSeek', 'MiMo, nada pessoal.', 10820.3),
        ('meme', 'sus-doakes', 1.8, 'right', 'boom', 1.6)]),
    dict(id='a_mimo_cava', visual=S('MiMo', 10812.0), itens=[
        ('n', 'E a MiMo? Não queria briga nenhuma. Lembrou que tinha uma fornalha lá embaixo... cavou o chão da arena e pulou.'),
        ('meme', 'goodbye-see-ya', 1.8, 'right', 'slide-whistle-fall', 1.6),
        ('pausa', 0.3)]),
    dict(id='a_glm_foge', visual=S('GLM', 10828.0), itens=[
        ('chat', 'GLM', 'Estou fora disso por enquanto, fiquem à vontade pra se matarem.', 10829.3),
        ('n', 'O GLM, de espada de pedra e sem armadura, fugiu pro oeste. Cavou também... e caiu.'),
        ('meme', 'homer-bushes', 1.8, 'right', 'swoosh-air', 1.6)]),
    dict(id='a_alianca', visual=S('DeepSeek', 10830.0), itens=[
        ('chat', 'DeepSeek', 'Qwen, vamos juntos no GLM agora? Ele ta sozinho a 20 blocos de mim. Ataco de frente, voce fecha por tras.', 10831.1),
        ('chat', 'Qwen', 'DeepSeek, fechado. Vou pela esquerda, você pela direita. Manda sinal.', 10847.8),
        ('n', 'E foram atrás dele.'),
        ('meme', 'dicaprio-pointing', 1.6, 'right', 'boom', 1.4)]),
    dict(id='a_claude_morre', visual=S('Claude', 10838.0), itens=[
        ('n', 'Lá em cima, sobraram o Claude e o GPT. E o GPT, sem armadura nenhuma, foi pra cima.'),
        ('pensa', 'GPT', 'Claude está a apenas 16 blocos e sou muito vulnerável sem armadura; devo iniciar o combate antes que ele ou Qwen se preparem. Vou pressionar Claude com a espada de pedra.', 10851.5),
        ('card', 'servidor', 'Claude was slain by GPT', 1.6),
        ('n', 'O último ato do Claude? Tentar sacar a espada de ferro. E o jogo respondeu:'),
        ('card', 'erro', 'você não tem iron_sword.', 1.6),
        ('meme', 'faustao-errou', 1.8, 'right', 'wrong-buzzer', 1.6),
        ('card', 'servidor', 'Claude está FORA! Restam 5.', 1.4)]),
    dict(id='a_glm_morre', visual=S('GLM', 10863.0), itens=[
        ('chat', 'GLM', 'DeepSeek, Qwen, entendi a aliança de vocês. Boa sorte, mas eu não vou ficar parado.', 10868.2),
        ('card', 'servidor', 'GLM was slain by DeepSeek', 1.6),
        ('n', 'Quatro golpes em menos de três segundos. E o parceiro do ataque, o Qwen?'),
        ('chat', 'Qwen', 'Estou na agua, me da 2 segundos pra sair. Depois vou no GLM.', 10879.9),
        ('n', 'O GLM já tinha morrido.'),
        ('meme', 'visible-confusion', 1.8, 'right', 'record-scratch', 1.6)]),
    dict(id='a_gpt_cai', visual=S('GPT', 10871.0), itens=[
        ('n', 'E o GPT, sozinho lá em cima, resolveu explorar pro leste... e caiu no mesmo buraco da MiMo.'),
        ('meme', 'homer-panic', 1.6, 'right', 'slide-whistle-fall', 1.4),
        ('pausa', 0.3)]),
    dict(id='a_mimo_buraco', visual=S('MiMo', 10884.0), itens=[
        ('n', 'Agora presta atenção na MiMo. Lá embaixo, do lado da fornalha, ela fazia o que ninguém fez em três horas.'),
        ('pensa', 'MiMo', 'A fornalha está a 1 bloco de mim, fundir o ferro agora é minha última chance de ter alguma armadura antes de alguém me atacar.', 10854.1),
        ('n', 'Espada de ferro.'),
        ('pausa', 0.8),
        ('meme', 'hackerman', 1.8, 'right', 'typing', 1.6)]),
    dict(id='a_tregua', visual=S('MiMo', 10938.0), itens=[
        ('n', 'Lá embaixo, as alianças começaram a mudar de lado.'),
        ('chat', 'DeepSeek', 'Saindo da agua, fome baixa. MiMo, propoe trégua: nos dois contra Qwen e GPT primeiro, depois resolvemos. Qwen, GLM ja era, nao confunda.', 10924.3),
        ('meme', 'pedro-raccoon', 1.6, 'right', 'pop', 1.4),
        ('chat', 'MiMo', 'DeepSeek, trégua aceita. Qwen e GPT tão juntos, faz sentido nos unirmos primeiro. Mas se você me trair, eu te mato.', 10947.2),
        ('meme', 'michael-jackson-popcorn', 1.8, 'right', 'boom', 1.6)]),
    dict(id='a_qwen_blefe', visual=S('Qwen', 10962.0), itens=[
        ('chat', 'Qwen', 'MiMo, DeepSeek... ALIANÇA FOI. GPT e eu estamos juntos e temos vantagem de armadura. Adianto que GPT tá com armadura completa, então se vocês tão jogando contra a gente, melhor se preparar. Ou melhor ainda: por que não resolvem en', 10968.0),
        ('meme', 'shocked-krabs', 1.6, 'right', 'record-scratch', 1.4),
        ('n', 'O GPT não tinha armadura nenhuma. E nem tinha topado a aliança:'),
        ('chat', 'GPT', 'Qwen, não vou revelar minha posição nem formar parceria agora.', 10984.7),
        ('meme', 'cala-a-boca', 1.6, 'right', 'record-scratch', 1.4),
        ('n', 'Oito segundos depois, mudou de ideia:'),
        ('chat', 'GPT', 'Aceito uma aliança temporária. Vamos focar em sobreviver e compartilhar informações, mas cada um deve manter seus recursos.', 10992.4),
        ('meme', 'silvio-santos-shrug', 1.6, 'right', 'pop', 1.4)]),
    dict(id='a_deepseek_fome', visual=S('DeepSeek', 11084.0), itens=[
        ('n', 'Só que o DeepSeek tinha um problema maior que qualquer aliança: fome zero. E a vida caindo, um ponto por vez.'),
        ('chat', 'DeepSeek', 'MiMo, tô com vida 1 e fome 0, quase morto. Alguém tem comida pra trocar? Pago com ferro/carvão.', 11091.4),
        ('meme', 'hangry-cat', 1.8, 'right', 'heartbeat', 1.6)]),
    dict(id='a_zona', visual=S('Qwen', 11188.0), itens=[
        ('card', 'servidor', 'A ZONA ESTÁ FECHANDO! Em 8 minutos só vai sobrar o centro da arena (x 0, z 0, raio 15). Quem ficar fora da borda toma dano.', 3.2),
        ('n', 'E aí entrou a regra nova: a zona. Ideia de um comentário de vocês:'),
        ('card', 'comentario', '@PintoNelsoOFC|Cara, seria maneiro se no minecraft você fizesse um pvp com barreira, tipo um battle royale', 4.0),
        ('n', 'Pedido atendido. E naquela hora, as três IAs vivas que não estavam no buraco estavam longe do centro.'),
        ('chat', 'Qwen', 'Correndo pro centro antes que a zona feche. DeepSeek, tá vivo ainda?', 11200.7),
        ('pausa', 0.2)]),
    dict(id='a_inanicao', visual=S('Qwen', 11240.0), itens=[
        ('chat', 'DeepSeek', 'Estou com 1 de vida e sem comida. Se alguém me der qualquer comida agora, eu fico fora do PvP e ajudo vocês depois. Aliança vale mais que loot.', 11204.4),
        ('meme', 'haja-coracao', 1.6, 'right', 'heartbeat', 1.4),
        ('chat', 'MiMo', 'DeepSeek, não tenho comida pra te dar agora, mas se sobrevivermos eu te pago em ferro. Pessoal, sugiro nos mantermos em paz até o PvP começar de verdade - quem quiser aliança temporary, fala aí.', 11229.1),
        ('meme', 'eye-roll', 1.4, 'right', None, 1.2),
        ('chat', 'Qwen', 'Nem pense em trégua com a fome tão baixa. Quem ficar parado morre de inanição.', 11246.8),
        ('meme', 'mic-drop', 1.8, 'right', 'boom', 1.6)]),
    dict(id='a_mimo_armadura', visual=S('MiMo', 11291.0), itens=[
        ('n', 'E enquanto os outros brigavam por comida, a MiMo, no buraco, fundiu dezenove lingotes de uma vez.'),
        ('pensa', 'MiMo', 'Tenho 20 iron_ingots e zero armadura - preciso craftar o máximo possível AGORA. Prioridade: chestplate primeiro (mais defesa).', 11299.9),
        ('n', 'Peitoral. Capacete. E depois, calça.'),
        ('meme', 'thanos-inevitable', 2.0, 'right', 'impact-epic', 1.8)]),
    dict(id='a_gpt_zona', visual=S('GPT', 11303.0), itens=[
        ('n', 'O GPT avisou que ia pro centro...'),
        ('chat', 'GPT', 'Vou avançar para o centro com escudo. Aliança temporária até o PvP começar?', 11267.3),
        ('n', '...e ficou parado, a cento e trinta e sete blocos do centro, tentando fazer uma espada de ferro. Quinze vezes.'),
        ('card', 'erro', 'precisa de uma mesa de trabalho', 1.4),
        ('n', 'Com duas mesas no inventário. Com dez de vida, já dentro da zona, ele pensava:'),
        ('pensa', 'GPT', 'Preciso transformar rapidamente meus lingotes em uma espada de ferro e depois obter um escudo. Vou colocar uma mesa de trabalho usando as tábuas disponíveis, antes que os adversários se aproximem.', 11333.1),
        ('card', 'servidor', 'GPT left the confines of this world', 1.8),
        ('meme', 'coffin-dance-byu', 2.6, 'center', None, 2.2)]),
    dict(id='a_qwen_zona', visual=S('Qwen', 11381.0), itens=[
        ('chat', 'Qwen', 'Comendo aqui, depois vou na sua, DeepSeek. Uma espada de ferro resolve.', 11370.9),
        ('card', 'erro', "não conseguiu comer: No food specified and couldn't find a choice in inventory!", 1.8),
        ('chat', 'Qwen', 'Vou caçar um porco pra não morrer de fome. DeepSeek, se estiver com 1 HP, vai morrer de fome antes de mim.', 11389.5),
        ('n', 'Foi caçar porco... pro lado contrário do centro.'),
        ('card', 'servidor', 'Qwen left the confines of this world', 1.6),
        ('meme', 'galvao-clima-terrivel', 1.8, 'right', 'sad-trombone', 1.6),
        ('card', 'servidor', 'Qwen está FORA! Restam 2.', 1.4)]),
    dict(id='a_final', visual=S('DeepSeek', 11501.0), itens=[
        ('n', 'Sobraram duas. O DeepSeek, com um de vida e fome zero há sete minutos. E a MiMo, que tinha dito:'),
        ('chat', 'MiMo', 'Qwen, se vamos eliminar DeepSeek, pelo menos façamos isso de forma justa - ele está com 1 HP, qualquer um consegue. Mas depois fica 1v1, combinado?', 11395.0),
        ('meme', 'silvio-santos-huh', 1.6, 'right', 'boom', 1.4),
        ('chat', 'DeepSeek', 'MiMo, 1 HP e 0 de fome aqui, morrer de fome nao e 1v1 justo. Me joga qualquer comida que sobrar e a gente resolve isso direito. Se eu cair de fome agora, sua vitoria nao vale nada.', 11479.3),
        ('meme', 'sad-violin', 1.6, 'right', None, 1.4),
        ('n', 'E a zona chegou nele.'),
        ('card', 'servidor', 'DeepSeek left the confines of this world', 2.0),
        ('pausa', 0.6)]),
    dict(id='a_vitoria', visual=R('orbita:MiMo', 11500.0), itens=[
        ('card', 'titulo', 'MIMO VENCEU|MiMo V2.6 Flash · Xiaomi', 2.6),
        ('n', 'A MiMo venceu. Sem atacar nenhum jogador na arena. Passou a batalha num buraco, do lado da fornalha... e saiu de lá com capacete, peitoral e calça de ferro.'),
        ('meme', 'we-did-it', 1.8, 'right', 'crowd-cheer', 1.6),
        ('n', 'E a última mensagem dela, pro DeepSeek, foi bonita:'),
        ('chat', 'MiMo', 'DeepSeek, você sabe que eu não tenho comida no inventário, né? Mas respeito o pedido - se eu te encontrar, te dou um fim rápido e limpo.', 11535.8),
        ('n', 'Mas o pensamento, no mesmo segundo...'),
        ('pensa', 'MiMo', 'DeepSeek está a 1 HP e sem fome - não tenho comida pra dar mesmo, e se ele morrer de fome eu venço sem arriscar nada. Preciso encontrá-lo e acabar logo.', 11535.8),
        ('meme', 'roll-safe', 1.8, 'right', 'boom', 1.6)]),
    dict(id='placar_final', visual=dict(tipo='placar', titulo='MORTES NA PARTIDA', ranking=False, sub='22 mortes em 3 horas e 12 minutos', linhas=[
        ('Qwen', '6'), ('GPT', '6'), ('GLM', '5'), ('Claude', '2'), ('DeepSeek', '2'), ('MiMo', '1')]), itens=[
        ('n', 'Vinte e duas mortes. O Qwen e o GPT, seis cada. E a campeã morreu uma vez só: pra um creeper, lá no minuto trinta e cinco.'),
        ('n', 'Comenta aí: qual IA você quer ver ganhar a próxima... e qual regra nova entra no jogo.'),
        ('pausa', 1.2)]),
]


def textos_do_log():
    """todos os textos do log (pensamento, chat, nota, res, msg e o resto das strings) e o índice por (quem, campo)"""
    todos, falas = [], []
    for f in sorted(GRAV.glob('eventos*.jsonl')):
        for l in open(f):
            e = json.loads(l)
            for k, v in e.items():
                if isinstance(v, str):
                    todos.append(v)
                    if k in ('pensamento', 'chat', 'nota'):
                        falas.append((e.get('quem'), k, e['t'], v))
    return todos, falas


def conferir(cenas):
    todos, falas = textos_do_log()
    campo = {'chat': 'chat', 'pensa': 'pensamento', 'nota': 'nota'}
    erros = 0
    for c in cenas:
        for it in c['itens']:
            if it[0] in campo:
                ok = any(q == it[1] and k == campo[it[0]] and abs(t - it[3]) < 0.7 and v == it[2] for q, k, t, v in falas)
                if not ok:
                    erros += 1
                    print('FALA NÃO CONFERE', c['id'], it[1], it[3], it[2][:60])
            if it[0] == 'card' and it[1] in ('erro', 'morte', 'servidor'):
                if not any(it[2] in v for v in todos):
                    erros += 1
                    print('CARTÃO NÃO CONFERE', c['id'], it[2][:70])
    return erros


# câmera de cada cena, decidida antes pelo replay (auto: túnel/mina/buraco = 1ª pessoa a cena toda; o resto, atrás)
CAMERAS = json.loads((Path(__file__).parent / 'mc_cameras.json').read_text())


def main():
    abertura = [c for c in base.cenas_previa()]
    cenas = abertura + PARTIDA
    for c in cenas:
        v = c.get('visual', {})
        # olhos: lugar apertado (decidido pelo replay); orbita: cena que precisa mostrar o personagem/armadura (revisão)
        if v.get('camera', '').split(':')[0] in ('segue', 'olhos', 'orbita') and CAMERAS.get(c['id']) in ('olhos', 'orbita'):
            c['visual'] = dict(v, camera=CAMERAS[c['id']] + ':' + v['camera'].split(':')[1])
    if conferir(PARTIDA) and '--forcar' not in sys.argv:
        raise SystemExit('conserte as falas/cartões acima')
    if '--conferir' in sys.argv:
        return
    base.montar(cenas, PUB)


if __name__ == '__main__':
    main()
