# Partida 2 — resultado: {'time': 'palhaco', 'motivo': 'O Palhaço (Roxo) foi expulso e venceu sozinho.', 'tique': 21}

## Elenco
- Vermelho: Prefeito (tripulante) — MiniMax M3
- Azul: Medico (tripulante) — Claude Haiku
- Verde: Barulhento (tripulante) — GLM 5.3 Flash
- Rosa: Faxineiro (impostor) — GLM 5.3 Flash
- Laranja: Rastreador (tripulante) — Gemini 3.8 Flash
- Amarelo: Influencer (tripulante) — GPT-5.6 Luna
- Preto: Xerife (tripulante) — Claude Haiku
- Branco: Fantasma (impostor) — GPT-5.6 Luna
- Roxo: Palhaco (neutro) — Gemini 3.8 Flash
- Marrom: Gangster (impostor) — DeepSeek Flash
- Ciano: Engenheiro (tripulante) — Claude Haiku
- Lima: Seguranca (tripulante) — GLM 5.3 Flash
- Cinza: Cientista (tripulante) — MiniMax M3
- Coral: Juiz (tripulante) — GPT-5.6 Luna
- Bordo: Detetive (tripulante) — DeepSeek Flash

## Linha do tempo (eventos)
- t1 **poder** {"cor": "Cinza", "poder": "vitais", "mortos": []}
- t1 **invisivel** {"cor": "Branco", "sala": "Refeitorio", "ate": 7}
- t2 **duto** {"cor": "Branco", "aparente": "Branco", "de": "Admin", "para": "Refeitorio"}
- t3 **poder** {"cor": "Azul", "poder": "escudo", "alvo": "Verde"}
- t3 **foto** {"cor": "Amarelo", "sala": "Enfermaria"}
- t4 **duto** {"cor": "Branco", "aparente": "Branco", "de": "Enfermaria", "para": "Seguranca"}
- t5 **poder** {"cor": "Lima", "poder": "cameras"}
- t5 **duto** {"cor": "Branco", "aparente": "Branco", "de": "Seguranca", "para": "Eletrica"}
- t6 **duto** {"cor": "Marrom", "aparente": "Marrom", "de": "Admin", "para": "Refeitorio"}
- t6 **poder** {"cor": "Cinza", "poder": "vitais", "mortos": []}
- t6 **poder** {"cor": "Roxo", "poder": "cameras"}
- t6 **reaparece** {"cor": "Branco", "sala": "Deposito"}
- t7 **poder** {"cor": "Roxo", "poder": "cameras"}
- t7 **recrutamento** {"cor": "Marrom", "alvo": "Lima", "papelAntes": "Seguranca", "sala": "Refeitorio"}
- t7 **invisivel** {"cor": "Branco", "sala": "Deposito", "ate": 13}
- t7 **poder** {"cor": "Laranja", "poder": "rastrear", "alvo": "Preto"}
- t7 **duto** {"cor": "Ciano", "aparente": "Ciano", "de": "MotorSuperior", "para": "Reator"}
- t8 **sabotagem** {"cor": "Branco", "subtipo": "Luzes"}
- t9 **morte** {"assassino": "Marrom", "aparente": "Marrom", "vitima": "Bordo", "sala": "MotorSuperior"}
- t9 **conserto** {"por": ["Vermelho"], "subtipo": "Luzes"}
- t9 **duto** {"cor": "Branco", "aparente": "Branco", "de": "Admin", "para": "Refeitorio"}
- t10 **foto** {"cor": "Amarelo", "sala": "Eletrica"}
- t10 **reuniao** {"chamador": "Marrom", "corpo": "Bordo", "sala": "MotorSuperior", "subtipo": "corpo"}
- t10 **fim_reuniao** {"expulso": "Marrom", "eraImpostor": true, "empate": false, "anulada": null, "papel": "Gangster"}
- t11 **poder** {"cor": "Cinza", "poder": "vitais", "mortos": ["Marrom", "Bordo"]}
- t11 **poder** {"cor": "Azul", "poder": "escudo", "alvo": "Laranja"}
- t13 **xerife** {"xerife": "Preto", "alvo": "Branco", "acertou": true, "sala": "Enfermaria"}
- t13 **poder** {"cor": "Roxo", "poder": "cameras"}
- t14 **reuniao** {"chamador": "Vermelho", "corpo": "Branco", "sala": "Enfermaria", "subtipo": "corpo"}
- t14 **juiz** {"cor": "Coral", "teriaSido": null}
- t14 **fim_reuniao** {"expulso": null, "eraImpostor": null, "empate": false, "anulada": "Coral", "papel": null}
- t15 **poder** {"cor": "Laranja", "poder": "rastrear", "alvo": "Vermelho"}
- t15 **poder** {"cor": "Azul", "poder": "escudo", "alvo": "Verde"}
- t15 **reuniao** {"chamador": "Roxo", "sala": "Refeitorio", "subtipo": "emergencia"}
- t15 **fim_reuniao** {"expulso": null, "eraImpostor": null, "empate": false, "anulada": null, "papel": null}
- t16 **poder** {"cor": "Azul", "poder": "escudo", "alvo": "Laranja"}
- t16 **poder** {"cor": "Cinza", "poder": "vitais", "mortos": ["Branco", "Marrom", "Bordo"]}
- t20 **xerife** {"xerife": "Preto", "alvo": "Roxo", "acertou": false, "sala": "Enfermaria"}
- t20 **duto** {"cor": "Rosa", "aparente": "Rosa", "de": "Enfermaria", "para": "Seguranca"}
- t21 **reuniao** {"chamador": "Ciano", "corpo": "Preto", "sala": "Enfermaria", "subtipo": "corpo"}
- t21 **palhaco_vence** {"cor": "Roxo"}
- t21 **fim_reuniao** {"expulso": "Roxo", "eraImpostor": false, "empate": false, "anulada": null, "papel": "Palhaco"}
- t21 **fim** {"time": "palhaco", "motivo": "O Palhaço (Roxo) foi expulso e venceu sozinho."}
- tarefas visuais feitas: t4 Lima (Escanear no MedBay), t5 Amarelo (Escanear no MedBay), t6 Laranja (Esvaziar o lixo), t7 Azul (Esvaziar o lixo), t8 Verde (Escanear no MedBay), t17 Amarelo (Destruir asteroides), t19 Verde (Esvaziar o lixo), t20 Laranja (Destruir asteroides), t20 Vermelho (Destruir asteroides)

## Chat dos impostores
- t1 Marrom: Rosa, Branco: tô indo pra Admin. Se algum de vocês tiver alguém sozinho e confiável, me avisa. Ainda não matei ninguém, sem corpo ainda.
- t1 Branco: Vou para Admin invisível; procurem oportunidades isoladas e evitem agir no Refeitório.
- t1 Rosa: Branco e Marrom, vamos nos dispersar e marcar quem fica sozinho. Eu ataco quando ninguém estiver perto.
- t2 Marrom: Estou no Admin lendo o mapa; me digam quem vocês viram sozinho.
- t2 Branco: Vou sondar o Refeitório invisível; avisem se encontrarem alguém isolado.
- t2 Rosa: Marrom, tô indo pra Admin. Branco, fica invisível e espera oportunidade isolada. Precisamos de álibis cedo.
- t3 Marrom: Admin com Rosa, fingindo tarefa. Alguém viu alguém isolado?
- t3 Branco: Vou para Enfermaria; observem quem ficar isolado em Admin.
- t3 Rosa: Marrom, fiquei de álibi contigo em Admin. Sem recarga ainda; avise se achar alguém sozinho.
- t4 Marrom: Rosa fica em Admin de álibi; vou pro Depósito ver se tem alguém sozinho. Branco, me avisa se achar isolado em Enfermaria.
- t4 Rosa: Marrom, fico em Admin de álibi com você. Se alguém chegar sozinho, avisa; recarga de 3 tiques.
- t4 Branco: Vou para Segurança invisível; procurem alguém isolado e avisem.
- t5 Rosa: Marrom, tô de álibi em Admin. Se achar isolado no Depósito, me chama que chego em 1 tique.
- t5 Marrom: Saindo do Deposito com Azul e Laranja me vendo; vou pra Admin reforçar alibi com Rosa. Alguem isolado?
- t5 Branco: Vou para Elétrica pelo duto; está vazia. Fiquem atentos a alguém isolado.
- t6 Marrom: Vou pro Refeitório pelo duto, Preto tá sozinho. Rosa, segura Admin de álibi.
- t6 Rosa: Marrom, fiquei de álibi com você. Preto está sozinho no Refeitório visto pelo duto; se um de nós chegar por trás sem testemunhas pode dar baixa. Eu cubro Admin.
- t6 Branco: Vou ao Depósito; observo se alguém fica isolado para matar no próximo tique.
- t7 Marrom: Recrutei Lima agora no Refeitório! Ela virou impostora. Rosa, não mate ela; Branco, avisa se ver alguém chegando. Precisamos de álibi: eu e Lima vamos sair juntos como se nada tivesse acontecido.
- t7 Branco: Estou saindo invisível para Admin; Preto me viu ativar, então não vou matar agora.
- t7 Rosa: Nao vou usar o duto agora, Lima esta vendo a saida. Sigam voce e avisem se tiver isolated.
- t8 Rosa: Estou com Lima em Admin, vamos sair juntos como álibi. Marrom, avise se achar alguém isolado.
- t8 Marrom: Recarga pronta. Saindo do Refeitório pra Motor Superior. Alguém isolado? Avisem.
- t8 Branco: Apaguei as luzes; mantenham álibi e procurem alguém isolado para a próxima baixa.
- t8 Lima: Marrom me viu parado no Admin com Rosa; ninguém testemunha nada, esperar kill recarregar.
- t9 Marrom: Matei Bordo no Motor Superior, luzes apagadas. Ciano está perto, mas não viu. Depois sumo pelo duto.
- t9 Lima: Rosa e eu seguimos juntos como álibi visível. Marrom, aproveite as luzes para caçar alguém isolado.
- t9 Rosa: Lima está comigo em Admin, servimos de álibi mútuo. Marrom, procure alvo isolado; eu não mato com Lima do lado pra não queimar ela.
- t9 Branco: Vou ao Refeitório pelo duto; mantenham Admin como álibi e avisem se alguém chegar sozinho.
- t10 Marrom: Denunciei. Roxo é testemunha. Rosa/Lima, digam que eu estava em Admin com vocês e que Roxo rondava o Motor Superior sozinho. Branco, apoie a versão. Se virarem em mim, votem em Roxo.
- t10 Rosa: Marrom matou Bordo? Corpo pode aparecer; se alguém denunciar, eu e Lima somos álibi juntos em Admin. Preciso de alvo isolado logo.
- t10 Branco: Vou segurar Verde no Refeitório e matar quando a invisibilidade acabar; preparem álibi.
- t10 Lima: Continuo com Rosa em Admin como álibi. Marrom, cuidado com o corpo no Motor Superior, Ciano pode ter visto algo.
- t11 Branco: Rosa e Lima, mantenham o álibi por enquanto; procurem alguém isolado longe das câmeras.
- t11 Lima: Votei no Marrom por pressão, desculpem. Rosa, vamos manter álibi mútuo em público; Branco, sem arriscar perto de testemunhas por enquanto.
- t11 Rosa: Bom, Marrom se sacrificou como planejado. Continuem fingindo tarefas e avisem se alguém ficar isolado; minha kill recarrega em 3 tiques.
- t12 Branco: Vou manter álibi por enquanto; avisem se encontrarem alguém isolado.
- t12 Lima: Mantendo álibi com Rosa e Azul aqui no Refeitório. Recarga em 2; alguém avisa se achar alvo isolado.
- t12 Rosa: Marrom expulso, mantenham calma. Rosa e Lima seguem de álibi público; Branco, caece alguém isolado longe de câmeras.
- t13 Lima: Tô com Rosa no Refeitório, álibi firme. Alguém vê um isolado sem câmera? Minha kill tá pronta.
- t13 Rosa: Marrom caiu, fiquem frios. Lima mantém álibe comigo; Branco, ache alvo isolado longe de câmeras e avise.
- t14 Lima: Rosa, seguimos de álibi juntos no Refeitório. Quando a sabotagem liberar, saboto Luzes pra eu achar alguém sozinho sem testemunhas.
- t14 Rosa: Lima, fico de álibi com você; não mate na minha frente, vamos caçar um isolado longe de câmeras juntos.
- t15 Lima: Rosa, sou seu álibi aqui no Refeitório; quando minha kill carregar (3 tiques), vamos caçar um isolado juntos, sem testemunhas.
- t15 Rosa: Lima, álibi firme no Refeitório. Saboto Luzes quando liberar (t21) e você caça um isolado; eu limpo o corpo.
- t16 Rosa: Tô colada no grupo aqui, mantenho álibi. Quando sabotar Luzes, caçamos juntos.
- t16 Lima: Fico aqui no Refeitório mantendo álibi com Rosa; kill libera em 3 tiques, me avisem de alvo isolado.
- t17 Rosa: Azul tá me vigiando aqui; kill libera em 2, depois te falo um alvo. Mantém o álibi.
- t17 Lima: Rosa, Azul me vendo aqui; sigo álibi no Refeitório até as Luzes liberarem.
- t18 Rosa: Lima, mantenho álibi contigo aqui; matamos só depois das Luzes, sem testemunhas.
- t18 Lima: Rosa, mantenho álibi contigo. Azul te vigia, cuidado. Sabota Luzes quando liberar que eu caço isolado.
- t19 Rosa: Lima, saio do Refeitório pra caçar isolado; cubro meu álibi dizendo que fui fazer tarefas. Sem kills perto do Azul.
- t19 Lima: Rosa, mando você e Azul no Refeitório como álibi; quando a sabotagem liberar, caço um isolado.
- t20 Lima: Liberar sabotagem em 2; quando as Luzes caírem eu caço isolado no lado do Admin, cuida o Azul aí.
- t20 Rosa: Lima, tô saindo da Enfermaria via duto pra Segurança; Enfermaria tem Preto, Roxo e Ciano juntos, nada de kill aqui.
- t21 Lima: Rosa, sabota Luzes agora que libera; eu fico no Refeitório como álibi e caço alguém no escuro.
- t21 Rosa: Lima, saboto Luzes já; eu caço isolado por Motor/Segurança e escondo o corpo.

## Pensamentos dos impostores e do Palhaço (ações fortes)
- t1 Branco (Fantasma): **ficar invisível e ir para Admin** — “Vou ficar invisível e ir para Admin, buscando uma rota segura para me separar do grupo.”
- t2 Branco (Fantasma): **entrar no duto e sair em Refeitorio** — “Vou usar a invisibilidade para me reposicionar e observar o Refeitório sem criar testemunhas.”
- t3 Amarelo (Influencer): **postar foto da sala** — “Vi Branco sumir no Refeitório, então vou registrar a sala imediatamente como prova.”
- t4 Branco (Fantasma): **entrar no duto e sair em Seguranca** — “Vou usar a invisibilidade para sair da multidão e preparar uma emboscada segura em Segurança.”
- t5 Branco (Fantasma): **entrar no duto e sair em Eletrica** — “Vou sair pelo duto na Elétrica, onde estou sozinho, e preparar uma emboscada quando puder matar.”
- t6 Marrom (Gangster): **entrar no duto e sair em Refeitorio** — “Preto está sozinho no Refeitório, vou pelo duto e mato ele se ninguém mais estiver lá.”
- t7 Marrom (Gangster): **recrutar Lima** — “Estou sozinho com Lima e preciso usar meu poder: recruto ela agora e ganho uma aliada em vez de deixar testemunha.”
- t7 Branco (Fantasma): **ficar invisível e ir para Admin** — “Vou usar a invisibilidade para sair do Depósito sem matar diante de Preto e me reposicionar.”
- t8 Branco (Fantasma): **sabotar luzes** — “Vou apagar as luzes para criar oportunidades enquanto mantenho meu álibi perto dos aliados.”
- t9 Marrom (Gangster): **matar Bordo** — “Luzes apagadas e sem testemunhas: vou dar baixa no Bordo, que sempre puxa reunião.”
- t9 Branco (Fantasma): **entrar no duto e sair em Refeitorio** — “Vou usar o duto para chegar ao Refeitório vazio e preparar uma morte quando a invisibilidade acabar.”
- t10 Marrom (Gangster): **denunciar corpo de Bordo** — “Roxo me viu matar o Bordo; vou denunciar primeiro e virar o jogo acusando ele de estar em cima do corpo.”
- t10 Amarelo (Influencer): **postar foto da sala** — “Vou postar uma foto agora para registrar o grupo reunido na Elétrica e criar um álibi verificável.”
- t13 Preto (Xerife): **atirar em Branco** — “Branco sumiu do nada no Depósito e o scan dele não ligou, o que não bate com tarefa de verdade. Estou com certeza suficiente para atirar.”
- t14 Vermelho (Prefeito): **denunciar corpo de Branco** — “Branco acabou de ser morto pelo Xerife Preto, e isso geralmente significa que ele era impostor (Xerife acerta impostor). Como Prefeito, meu voto vale 2, então a reunião é valiosa para tentar eliminar outro impostor. Tem bastante gente perto, boa chance de discutir bem.”
- t14 Laranja (Rastreador): **denunciar corpo de Branco** — “O Xerife Preto acabou de eliminar o Branco na minha frente confirmando que Branco era impostor, vou denunciar o corpo para alinhar as informações com a nave.”
- t14 Verde (Barulhento): **denunciar corpo de Branco** — “O Xerife Preto acertou: Branco morreu no tiro, então era impostor. Vou denunciar o corpo para registrar e limpar a área.”
- t14 Preto (Xerife): **denunciar corpo de Branco** — “Branco é impostor que eu mesmo abati, então preciso denunciar o corpo agora e levar a informação para a reunião.”
- t14 Ciano (Engenheiro): **denunciar corpo de Branco** — “O corpo do Branco está do meu lado e o Preto atirou nele como Xerife, então vou denunciar para a reunião esclarecer quem é quem.”
- t20 Preto (Xerife): **atirar em Roxo** — “Vi o Roxo subir no scanner três vezes e o scan não ligou, igual ao Branco, que era impostor. Ele está do meu lado agora, então vou atirar.”
- t20 Rosa (Faxineiro): **entrar no duto e sair em Seguranca** — “Três testemunhas na sala, matar agora seria suicídio; entro no duto para sumir e caçar alguém isolado.”
- t21 Ciano (Engenheiro): **denunciar corpo de Preto** — “Preto está morto aqui na Enfermaria, e Rosa acabou de entrar num duto, então vou denunciar o corpo e levar isso para a reunião.”

## Reuniões
### Reunião 0 (t10, corpo) chamada por Marrom — corpo de Bordo
0. **Branco** (Fantasma) r1: Eu estava no Refeitório; vi o Verde passar por perto no t9 e não fui ao Motor Superior. Roxo e Ciano, vocês viram alguém perto do corpo? Marrom, qual foi exatamente sua rota?
   - pensou: “Marrom é nosso parceiro e a versão precisa ser sustentada sem parecer combinada. Vou dizer que estava no Refeitório e pedir informações a Roxo/Ciano, evitando acusar Roxo diretamente para não parecer armação.”
1. **Marrom** (Gangster) r1: Eu vinha do Reator e subi pro Motor Superior: o Bordo já estava caído e o Ciano tinha acabado de sair de perto dele. Roxo e Coral chegaram quase junto comigo, dá pra confirmar que eu só achei o corpo. Ciano, por que você saiu tão rápido de lá?
   - pensou: “Preciso fixar meu álibi: fui eu que denunciei, então isso já ajuda. Vou dizer que vinha do Reator, achei o corpo e que Ciano sumiu rápido de perto do Bordo — se o Ciano tiver visto algo, já planto suspeita nele antes. Roxo e Coral chegaram quase junto, então é bom citá-los para parecer transparente,”
2. **Cinza** (Cientista) r1: Eu tava em Elétrica com Vermelho, Azul, Amarelo e Preto, a foto do t10 confirma. Ciano, você viu quem matou ou só achou o Bordo caído? E por que saiu sem denunciar? Marrom, você tem certeza que foi o Ciano que saiu e não outra pessoa?
   - pensou: “Vou checar sinais vitais. Bordo é o único morto confirmado. Se houver mais alguém morto sem denúncia, é Faxineiro ou veneno. Ciano saindo do corpo é suspeito, mas pode ter só se assustado. Tenho álibi sólido: estava em Elétrica com Vermelho, Azul, Amarelo, Preto (confirmado pela foto do t10).”
3. **Azul** (Medico) r1: Eu tava em Elétrica com Cinza, Vermelho, Amarelo e Preto no t9 e t10, não vi nada do Motor Superior. Marrom, o único que viu o Ciano saindo foi você, então me conta: como você sabia que era ele e não outra pessoa? Ciano, bora, fala o que viu.
   - pensou: “Não vi nada em Motor Superior. Só o Marrom diz que o Ciano saiu de perto do corpo, e ele também é o único que se apresenta como quem achou o corpo, então a história dele é a que mais precisa ser checada. Ciano ainda não se explicou. Não quero acusar sem prova, mas Marrom merece pressão.”
4. **Rosa** (Faxineiro) r1: Eu e a Lima estivemos juntas no Admin o tempo todo, a Marrom passou por lá antes de ir pro Motor Superior. O suspeito aqui é o Roxo, que apareceu perto do corpo, e o Ciano saindo rápido de lá também é bem estranho.
   - pensou: “Marrom matou o Bordo e quer que eu minta dando álibi a ele e empurrando pro Roxo. Lima e Branco vão apoiar. O plano: acusar o Roxo, que estava perto do corpo, e apoiar o Marrom. Sou Faxineiro e ainda nem usei o poder, preciso parecer limpa e manter o álibi com a Lima.”
5. **Verde** (Barulhento) r1: Ciano estava COMIGO no Refeitório no t9 e agora está colado em mim no Depósito — ele tem álibi, Marrom. Você foi o único que 'viu' ele saindo... conveniente. O que você fez entre o Reator e o Motor Superior?
   - pensou: “Marrom acusou o Ciano, mas Ciano estava perto de mim no Refeitório no t9 e no início do t10 está do meu lado aqui no Depósito — isso é um álibi forte para ele. Marrou pode estar tentando culpar alguém que ele mesmo 'viu'. Amarelo postou fotos do meu movimento (t3 Enfermaria), que na verdade me confi”
6. **Preto** (Xerife) r1: Marrom, eu vi você SAIR DE UM DUTO no Refeitório no t6. Quem não é engenheiro usa duto? Explica essa, porque sua rota do Reator pro Motor Superior não fecha. Branco, você também sumiu do nada no Depósito no t7, então não some da conversa.
   - pensou: “Marrom é o suspeito mais forte: eu o vi sair de um duto no Refeitório no t6, e a rota que ele contou não bate com isso. Também desconfio do Branco, que sumiu do nada no Depósito no t7. Não vou revelar que sou o Xerife ainda, mas preciso confirmar Marrom antes de atirar.”
7. **Laranja** (Rastreador) r1: Posso confirmar 100% que Azul é tripulante, vi a animação do lixo dele no t7 no Depósito. Marrom, essa tua acusação no Ciano furou feio com o álibi do Verde, e o Preto disse que te viu no duto, o que você tem a dizer?
   - pensou: “Azul é 100% inocente porque vi ele fazer o lixo no Depósito no t7. Marrom acusou Ciano, mas Verde desmentiu dizendo que Ciano estava com ele. Preto viu Marrom ventar no t6. Marrom parece muito culpado (ou engenheiro, ou impostor auto-reportando), mas cuidado com o Preto que pode ser Palhaço inventan”
8. **Vermelho** (Prefeito) r1: Confirmo minha álibi — tava na Elétrica com Azul, Amarelo, Preto e Cinza, a foto do t10 prova. Marrom, se você realmente saiu de um duto e não é o Engenheiro, é caso encerrado. E Roxo, você chegou no corpo junto com o Marrom e o Ciano — que rota você tava fazendo?
   - pensou: “Tenho álibi sólido pela foto do t10 em Elétrica com Azul, Amarelo, Preto e Cinza. Marrom sendo visto em duto é bem suspeito, porque duto é só do Engenheiro. Se ele não for o Engenheiro, é impostor de cara. Roxo e Coral chegando no corpo junto com o Marrom também é estranho — pode ser que um deles se”
9. **Lima** (Seguranca) r1: Confirmo: eu e a Rosa estávamos juntas no Admin desde o t7, até a luz apagar. Roxo chegou no corpo junto com o Marrom, e o Ciano saiu rápido — o que o Roxo tava fazendo perto do Motor Superior?
   - pensou: “Preciso confirmar o álibi com Rosa e empurrar a suspeita pro Roxo. O Preto viu o Marrom no duto no t6, mas o duto do Refeitório só confirma isso de forma fraca; melhor focar no Roxo que chegou junto do corpo e evitar entrar no mérito do duto.”
10. **Ciano** (Engenheiro) r1: Marrom, eu não estava com o Bordo. No t6 passei pelo Motor Superior com o Amarelo perto e não tinha corpo nenhum. O Preto te viu saindo de duto no Refeitório, então explica essa rota antes de qualquer voto.
   - pensou: “Não estava com o Bordo quando ele morreu. Só passei pelo Motor Superior no t6, com o Amarelo perto, e não vi corpo. A história do Marrom de que eu saí do corpo não bate, e o duto do Refeitório no t6 que o Preto viu pesa contra ele. Ainda não sei quem é o impostor, mas o Marrom é o principal suspeito”
11. **Coral** (Juiz) r1: Marrom é o principal suspeito: o Preto viu você sair do duto e sua rota não fecha. O álibi do Ciano com o Verde pesa contra sua acusação; Roxo estava no local, mas chegou junto comigo.
   - pensou: “Marrom está muito suspeito: rota inconsistente, possível duto e acusação contra Ciano contradita pelo álibi do Verde. Roxo também estava no local, mas eu e ele chegamos junto; não há evidência suficiente para votar nele. Vou pressionar Marrom e evitar usar o Juiz ainda.”
12. **Amarelo** (Influencer) r1: Minha foto confirma que eu, Vermelho, Azul, Preto e Cinza estávamos juntos em Elétrica; não vi Marrom ali. A rota dele não fecha, e o duto visto pelo Preto pesa muito: Marrom, explica isso antes de votarmos.
   - pensou: “Marrom está muito suspeito: a rota não fecha, Preto viu duto e ele acusou Ciano apesar do álibi de Verde. Ainda assim, quero evitar uma expulsão precipitada caso ele seja o Palhaço; pressionaria por explicações e talvez votaria em Marrom se não houver alternativa.”
13. **Roxo** (Palhaco) r1: Eu tava no Motor Superior o tempo todo fazendo tarefa e vi o Bordo cair no escuro, mas achei que ele só tava parado ali. O Marrom só chegou depois, então se for pra votar em alguém, por que não olham direito pra mim ou pro Ciano?
   - pensou: “Estão focando muito no Marrom por causa da acusação de duto do Preto. Preciso desviar um pouco a atenção para mim de forma suspeita: admitir que estava no Motor Superior desde cedo 'fazendo tarefas' e que vi o corpo antes mas não reportei logo porque achei que alguém ia ver ou dar uma desculpa esfar”
14. **Preto** (Xerife) r2: Marrom, eu vi você saindo de duto no Refeitório no t6, e sua rota do Reator até o Motor Superior não bate. Roxo, o que você estava fazendo exatamente no Motor Superior antes de o Bordo cair?
   - pensou: “Marrom é o suspeito mais forte: eu vi ele saindo de duto no t6 e a rota dele não fecha. Não quero revelar que sou Xerife ainda. Roxo também é estranho, por estar no Motor Superior o tempo todo sem ter visto nada.”
15. **Ciano** (Engenheiro) r2: Eu não vi o Bordo: no t10 estava no Depósito com o Verde. Marrom, como você sabe que eu tinha acabado de sair do Motor Superior? Isso não bate, e o duto que o Preto viu pesa muito. Até você explicar, meu voto é no Marrom.
   - pensou: “Não vi o Bordo morto. No t10 eu estava no Depósito com o Verde, então o Marrom mente ao dizer que eu tinha acabado de sair do Motor Superior. O duto do Marrom e a rota que não fecha me parecem a melhor pista. O Roxo também estava no local, mas ainda não tenho motivo forte contra ele.”
16. **Branco** (Fantasma) r2: A rota do Marrom não fecha, e o Preto ter visto ele sair do duto pesa demais. Com o álibi do Ciano confirmado pelo Verde, meu voto vai no Marrom; depois precisamos investigar o Roxo com calma.
   - pensou: “Marrom está praticamente exposto pelo duto, pela rota inconsistente e pela acusação falsa contra Ciano. Vou abandoná-lo para preservar meu álibi e evitar parecer coordenado; não devo empurrar Roxo, pois isso pode me comprometer.”
17. **Verde** (Barulhento) r2: Confirmo de novo: Ciano está comigo desde o t9, álibi sólido. Marrom, duto + acusação furada = você é o impostor, voto nele.
   - pensou: “Marrom está totalmente desmascarado: álibi do Ciano confirmado por mim + duto visto pelo Preto. Roxo é suspeito, mas sem prova. Voto Marrom, cuidado com o Palhaço — ninguém vota em quem parece suspeito demais sem prova, e Marrom tem prova forte.”
18. **Cinza** (Cientista) r2: Tava em Elétrica com Vermelho, Azul, Amarelo e Preto, a foto do t10 confirma meu álibi. Marrom no duto + acusação furada no Ciano (que tava com o Verde) = meu voto vai no Marrom.
   - pensou: “Marrom é o principal suspeito: Preto viu ele saindo de um duto (só Engenheiro tripulante ou impostor faz isso), e a acusação dele contra o Ciano furou feio com o álibi do Verde. Depois da reunião preciso checar os sinais vitais pra ver se tem corpo escondido (lembrando que o Faxineiro some com corpo”
19. **Vermelho** (Prefeito) r2: Caso encerrado pra mim: Marrom no duto + acusação furada no Ciano que tem álibi confirmado = voto no Marrom. Roxo, fica de olho que você apareceu perto de mim no Motor Superior mais cedo, mas por hoje o Marrom é o mais quente.
   - pensou: “O caso contra Marrom é fortíssimo: Preto viu ele saindo de duto, o álibi do Ciano com o Verde foi confirmado por várias pessoas, e a acusação dele no Ciano furou. Sou Prefeito, meu voto vale 2, então preciso mirar no alvo certo. Roxo apareceu perto de mim no Motor Superior no t3, então também fica n”
20. **Laranja** (Rastreador) r2: A mentira do Marrom sobre o Ciano caiu por terra e ele nem se defendeu do duto. Meu voto tá fechado no Marrom com certeza.
   - pensou: “Marrom tentou incriminar Ciano na cara dura e tomou invertida com álibi do Verde, além do Preto ter visto ele em duto. Ele não alegou engenheiro e a mentira foi feia. Meu voto vai nele.”
21. **Rosa** (Faxineiro) r2: Meu voto vai no Marrom: o duto + acusação furada no Ciano pesam demais. A Lima confirma meu álibi no Admin, nada muda isso.
   - pensou: “Marrom vai ser expulso de qualquer jeito; melhor abandoná-lo e manter meu álibi com a Lima intacto. Voto no Marrom junto com a maioria para parecer confiável. Preto é o Palhaço, então nunca votar nele.”
22. **Amarelo** (Influencer) r2: Marrom continua sendo o mais forte: duto visto pelo Preto e a acusação contra Ciano não fecha com o álibi do Verde. Meu voto vai nele; depois investiguem o Roxo.
   - pensou: “Marrom é o principal suspeito: Preto viu o duto, e a acusação contra Ciano foi desmentida pelo álibi do Verde. Vou votar nele, mas evitar certeza absoluta para não cair no jogo do Palhaço.”
23. **Azul** (Medico) r2: Estava em Elétrica com o pessoal no t9 e t10, então não vi o Motor Superior. Marrom, o duto que o Preto viu é o ponto mais forte, meu voto vai nele. Roxo, você diz que estava fazendo tarefa no Motor Superior, qual tarefa e onde exatamente?
   - pensou: “Eu estava em Elétrica no t9 e t10, não vi Motor Superior. O duto do Marrom e a rota furada pesam mais. Roxo também ficou perto do corpo e não explicou direito, então vou pressioná-lo sem tirar o foco do Marrom.”
24. **Coral** (Juiz) r2: Mantenho meu voto no Marrom: duto confirmado pelo Preto e a acusação contra Ciano caiu com o álibi do Verde. Depois da expulsão, precisamos investigar o Roxo.
   - pensou: “Marrom é o principal suspeito: foi visto saindo de duto, mentiu sobre Ciano e não explicou a rota. Não há motivo para anular; a votação parece corretamente direcionada a um impostor.”
25. **Marrom** (Gangster) r2: Eu sou o Engenheiro, usei o duto sim — é minha função, não é crime. O Preto me viu no duto mas não me viu matar ninguém; quem tava parado no escuro colado no corpo foi o Roxo, isso sim é estranho.
   - pensou: “O Preto me pegou no duto e a roda toda já tá votando em mim. Vou usar a única carta que explica o duto sem me queimar de vez: dizer que sou o Engenheiro. Se o Engenheiro de verdade aparecer pra me desmentir, pelo menos a votação racha e ganho tempo pro Rosa/Branco/Lima agirem. E empurro o Roxo de no”
26. **Roxo** (Palhaco) r2: Eu tava alinhando a potência do motor, ou era fiação... nem reparei direito porque a luz apagou bem na hora! Mas se o Marrom é Engenheiro mesmo, vocês tão jogando tripulante fora e me ignorando à toa.
   - pensou: “A galera tá focada no Marrom, mas ele jogou a culpa em mim e Azul/Preto me cobraram sobre a tarefa. Vou dar uma resposta enrolada e suspeita sobre a fiação pra parecer um impostor acuado.”
27. **Lima** (Seguranca) r2: Minha álibi com a Rosa é sólida, eu tava em Admin. Não tenho nada contra o Marrom alemão do duto, mas se a maioria tá decidida, o Roxo ficou bem suspeito ali parado no corpo — fico de olho nele depois.
   - pensou: “Marrom vai ser expulso de todo jeito, a nau afundou. Melhor não gastar meu álibi defendendo ele com força; deixar rolar é o mais seguro pra mim e Rosa.”
- votos: {'Vermelho': 'Marrom', 'Azul': 'Marrom', 'Verde': 'Marrom', 'Rosa': 'Marrom', 'Laranja': 'Marrom', 'Amarelo': 'Marrom', 'Preto': 'Marrom', 'Branco': 'Marrom', 'Roxo': 'Marrom', 'Marrom': 'Roxo', 'Ciano': 'Marrom', 'Lima': 'Roxo', 'Cinza': 'Marrom', 'Coral': 'Marrom'}
   - voto de Rosa (Faxineiro): “A nave inteira já fechou no Marrom: duto visto pelo Preto, acusão furada no Ciano, álibi do Verde confirmado. Se eu votar diferente, a Lima e eu viramos alvo na sequência. Melhor acompanhar o fluxo e manter meu álibi limpo — depois da saída dele, o Roxo fica como bode expiatório próximo.”
   - voto de Branco (Fantasma): “Marrom é impostor e sua rota contradiz os álibis; votar nele é seguro e evita desviar para Roxo ou Ciano.”
   - voto de Roxo (Palhaco): “A nave inteira já decidiu votar no Marrom por causa do duto e da acusação furada no Ciano. Tentei me fazer de confuso e suspeito sobre a tarefa e o corpo, e muitos disseram que vão me investigar depois. Votar no Marrom agora me mantém vivo e com o álibi perfeito para ser o alvo principal na próxima ”
   - voto de Marrom (Gangster): “A votação já está praticamente toda em mim; meu voto isolado não me salva. Vou tentar manter a narrativa anti-Roxo viva pra próxima rodada (se o Juiz anular a votação ou algo travar) e não queimar meus parceiros Rosa, Lima e Branco, que estão votando em mim pra manter o álibi. Voto no Roxo: ele é o ”
- resultado: expulso=Marrom eraImpostor=True papel=Gangster anulada=None empate=False

### Reunião 1 (t14, corpo) chamada por Vermelho — corpo de Branco
0. **Roxo** (Palhaco) r1: Eu acabei de passar pela Enfermaria e não tinha corpo nenhum lá. Vermelho, você deu self report?
   - pensou: “Vou me colocar na cena do crime dizendo que acabei de sair da Enfermaria e não vi nada, acusando o Vermelho de self. Isso me faz parecer um impostor descuidado tentando cobrir o rastro ou mentindo descaradamente.”
1. **Preto** (Xerife) r1: Roxo, o corpo do Branco tá aqui na Enfermaria, eu tô vendo agora. Eu sou o Xerife: atirei nele no t13 e acertei, ele era impostor. Vermelho fez certo chamar a reunião.
   - pensou: “Sou o Xerife e atirei no Branco no t13, então ele era impostor de verdade. O Roxo mente ou está cego, porque eu estou vendo o corpo agora. Se eu revelar que sou o Xerife, viro alvo, mas a nave precisa saber que já peguei um impostor. Ainda falta um impostor vivo, e o Amarelo está perto de mim, então”
2. **Verde** (Barulhento) r1: Eu vi o Branco subir no scanner no t12 e o scan NÃO ligou — quem faz scan visual fica confirmado, então isso reforça que ele era impostor. Preto, seu tiro no t13 bate com o corpo, tá coerente pra mim. Voto no Branco e seguimos.
   - pensou: “Preto confessou atirar no Branco e o corpo confirma. Se Branco era impostor, ótimo, mas Preto poderia estar mentindo sobre ser Xerife para cobrir um kill próprio. Porém o tiro no t13 bate com o corpo aparecendo. Vou apoiar e pedir confirmação do juiz/reveal. Cuidado: Branco morto era impostor segund”
3. **Vermelho** (Prefeito) r1: Tô com o corpo na minha frente aqui na Enfermaria, o Preto tá certo. Scan não ligar no t12 + Xerife vivo = Branco era impostor, tiro certo. MAS Roxo, você acabou de dizer que passou por aqui e não viu corpo - o corpo tá aqui agora, como isso é possível? Tá muito estranho. Vou pular por segurança, mas te achei mentiroso.
   - pensou: “Confirmo o corpo do Branco aqui na Enfermaria. O scan não ter ligado no t12 + o Preto (Xerife) ainda estar vivo = Branco era impostor com certeza, o tiro pegou certo. O Roxo tá claramente mentindo - disse que passou por aqui e não viu corpo, mas o corpo tá aqui no mesmo tique. Isso é MUITO suspeito,”
4. **Coral** (Juiz) r1: O tiro do Preto e o scan falho confirmam que o Branco era impostor. Roxo, você passou pela Enfermaria exatamente quando? O corpo pode ter aparecido depois, então ainda não compraria self-report.
   - pensou: “Branco foi confirmado impostor pelo tiro do Preto e pelo scan falho. Roxo pode ter passado antes do corpo aparecer, então a acusação de self-report ainda é fraca; quero esclarecer o horário antes de votar.”
5. **Lima** (Seguranca) r1: Eu tive com a Rosa em Admin/Refeitório desde a última reunião, só fizemos tarefas. Roxo, seu 'passei pela Enfermaria e não vi nada' tá bem suspeito mesmo.
   - pensou: “Branco caiu, mas era Fantasma e já estava queimado pelo scan. Rosa é meu álibe. Roxo tá na mira de Vermelho e Coral — vou empurrar nele pra desviar de nós.”
6. **Ciano** (Engenheiro) r1: Confirmo: vi o Branco no scanner no t12 e não ligou, então ele era impostor. Roxo, em que tique você passou pela Enfermaria? Se foi antes do t13, faz sentido não ver corpo nenhum. Preto, seu tiro bate, mas vou cobrar mais detalhe antes de votar.
   - pensou: “Branco morreu, o corpo foi achado e o Preto diz ser Xerife que acertou um impostor. Não tenho nada contra o Roxo além da fala dele; ele pode ter passado antes do corpo aparecer. Não quero acusar sem prova. Vi o Branco no scanner sem o scan ligar, então ele era impostor, confirmado. O Preto tem fala ”
7. **Cinza** (Cientista) r1: Galera, no t11 eu ainda tinha visto o Branco vivo por perto. Se o Preto atirou no t13, a história fecha com o corpo aparecer agora. Vou pular essa, mas o Roxo precisa explicar melhor em que tique passou pela Enfermaria — se foi antes do t13, faz sentido não ter visto corpo.
   - pensou: “Tenho informação valiosa: checei sinais vitais no t11 e Branco ainda estava vivo. Isso confirma o tiro do Preto no t13. A scan falhada no t12 já é prova forte de que Branco era impostor, então votar nele não faz sentido (ele já tá morto). O Roxo tá meio suspeito dizendo que passou e não viu corpo, m”
8. **Amarelo** (Influencer) r1: Branco já estava muito suspeito desde o t1, quando vi ele sumir no Refeitório. Preto e o scan falho fecham que era impostor; Roxo, diga exatamente em que tique passou pela Enfermaria.
   - pensou: “Branco era claramente impostor: vi ele sumir no Refeitório e o scanner falhou. Preto provavelmente acertou o tiro; Roxo só é suspeito se passou depois do t13 e não viu o corpo.”
9. **Laranja** (Rastreador) r1: Eu estava na Enfermaria e confirmo: Branco fingiu o scan no t12 e o Preto atirou nele no t13 na minha frente, Preto é Xerife 100% confirmado. O corpo só caiu no t13, então vamos pular o voto com calma.
   - pensou: “Eu estava na Enfermaria no t12 e vi Branco fingir o scan sem acender, e no t13 vi o Xerife Preto atirar nele e acertar. Preto tá 100% confirmado como Xerife e Branco era impostor. O Roxo provavelmente passou antes do t13 ou tá viajando/Palhaço querendo voto fácil. Vou confirmar o tiro do Preto e def”
10. **Rosa** (Faxineiro) r1: Eu estava no Admin/Refeitório com o Lima o tempo todo, ele confirma. Roxo, todo mundo viu o corpo menos você, isso é muito suspeito.
   - pensou: “Branco morreu (meu parceiro Fantasma), mas ele era o culpado do corpo, então a reunião não nos atinge. Roxo está sob pressão e isso nos beneficia — vou empurrar contra ele para desviar de mim e do Lima. Lima é meu parceiro recrutado, mantenho nosso álibi mútuo.”
11. **Azul** (Medico) r1: Confirmo: vi o Branco no scanner no t12 e não ligou, e ele caiu no t13 com o tiro do Preto. Roxo, em qual tique exato você passou pela Enfermaria? Se foi antes do t13, não ver corpo faz sentido; se foi depois, aí complica.
   - pensou: “Branco era impostor, o tiro do Preto bate e eu também vi o scan falhar. Roxo é o que mais me incomoda: disse que passou pela Enfermaria sem corpo, mas o corpo só caiu no t13. Ainda não sei se ele está mentindo ou só se confundiu de tique. Não posso revelar que sou Médico nem meu escudo.”
12. **Lima** (Seguranca) r2: Reforço meu álibi: fiquei com a Rosa em Admin/Refeitório o tempo todo. Roxo, você é o único que não viu o corpo na Enfermaria, me diz o tique exato ou eu voto em você.
   - pensou: “Meu parceiro Branco caiu, mas o Preto se confirmou Xerife e sobrou Rosa e eu. Todos já estão pressionando o Roxo; vou reforçar a pressão e votar nele, mantendo meu álibi com a Rosa intacto.”
13. **Vermelho** (Prefeito) r2: Pulando. Branco tá confirmado impostor, scan falhou e o Preto acertou. Mas Roxo, você não respondeu o tique exato - entre o t13 (quando o Preto atirou) e o t14 (quando eu vi o corpo) o corpo TAVA lá. Se você passou nessa janela e não viu, ou tá mentindo ou o Faxineiro limpou rapidinho. Me fala logo o tique.
   - pensou: “Branco é impostor confirmado pelo scan falho + tiro do Xerife. A maioria quer pular, faz sentido. Mas o Roxo disse que acabou de passar pela Enfermaria e não viu corpo - entre o t13 (quando o Preto atirou) e o t14 (quando eu vi o corpo), o corpo TAVA lá. Se o Roxo passou nessa janela, deveria ter vi”
14. **Preto** (Xerife) r2: Roxo, me diz o tique exato em que passou pela Enfermaria. Se não bater com o t13 e o t14, eu voto em você. Branco já tá confirmado, não precisamos gastar mais tempo com ele.
   - pensou: “Sou o Xerife e atirei no Branco no t13, então ele é impostor. O Roxo é o ponto fraco: disse que passou pela Enfermaria e não viu corpo, mas o corpo estava lá no t13-t14. Se ele não der um tique que bata com a janela, voto nele. Não vou revelar mais detalhes do que já disse.”
15. **Cinza** (Cientista) r2: Skip. A história do Branco fecha com o que eu vi (vivo no t11), scan no t12 e tiro no t13. O Roxo provavelmente passou na Enfermaria antes do corpo aparecer, não tem prova contra ele. Melhor gastar esse voto quando tiver certeza.
   - pensou: “Branco já tá confirmado como impostor (scan falhou no t12, Preto acertou no t13). A história toda fecha. Não tem prova clara contra o Roxo — ele pode muito bem ter passado na Enfermaria antes do t13. Vou pular pra não perder tempo. Não vou revelar que sou Cientista ainda, vou guardar essa info pra p”
16. **Coral** (Juiz) r2: Branco já está confirmado e o tiro fecha; não vamos arriscar expulsar o Roxo sem horário. Roxo, diga o tique exato em que passou pela Enfermaria; por enquanto, pulo.
   - pensou: “Branco está confirmado como impostor, e o tiro do Preto parece consistente com os relatos. Roxo ainda não explicou o tique em que passou pela Enfermaria, mas isso pode ser apenas antes do tiro; não há base suficiente para expulsá-lo e arriscar o Palhaço. Vou recomendar pular e exigir o horário exato”
17. **Ciano** (Engenheiro) r2: Eu estava na Enfermaria no t13 vendo o corpo e não vi o Roxo lá. Roxo, em que tique exato você passou? Se foi antes do t13 bate, se foi depois complica. Não voto ainda.
   - pensou: “Branco era impostor, o tiro do Preto e o scan falho batem. Eu estava na Enfermaria no t13 vendo o corpo e não vi o Roxo, então não consigo confirmar o álibi dele. Ainda assim, ele pode ter passado antes do t13, então não é prova. Prefiro esperar o tique exato antes de votar.”
18. **Azul** (Medico) r2: Eu estava na Enfermaria no t12 e o Roxo não estava lá. Roxo, me fala o tique exato em que passou e de qual sala veio. Se foi antes do t12, bate; se foi depois do t13, a gente precisa conversar. Não voto ainda.
   - pensou: “Branco confirmado impostor pelo scan falho e pelo tiro. O Roxo é o ponto fraco: não aparece em ninguém que vi na Enfermaria no t12, então ele não está no grupo que estava lá. Ainda não sei se ele passou antes do t12, o que faria sentido com corpo nenhum, ou depois do t13. Não tenho base para votar n”
19. **Laranja** (Rastreador) r2: Gente, cuidado pra não votar afobado no Roxo e entregar pro Palhaço, ele deve ter passado antes do t13. Vamos dar skip e focar nas tarefas!
   - pensou: “O Preto é Xerife 100% confirmado porque atirou no Branco e sobreviveu. Todo mundo já sabe que Branco era impostor. Estão pressionando o Roxo, mas pode ser só confusão de tique (ou ele pode ser o Palhaço tentando cavar voto). O ideal é dar skip agora para não cairmos numa armadilha de Palhaço e focar”
20. **Rosa** (Faxineiro) r2: Meu álibi com o Lima segue firme. Roxo, responde o tique ou tá suspeito mesmo; mas Laranja tem razão, não vamos entregar pro Palhaço sem prova. Vou pular.
   - pensou: “Branco já caiu como impostor, bom. Roxo está sendo pressionado, vou manter a pressão nele e defender o skip — Palhaço pode ser qualquer um, cuidado.”
21. **Verde** (Barulhento) r2: Pra mim fecha: scan falho no t12, tiro no t13. Roxo, se você passou antes do t13, só confirma isso e tudo bem. Vou pular, sem prova não vale o risco do Palhaço.
   - pensou: “Branco era impostor confirmado, tiro do Preto válido. Roxo tá estranho mas sem prova — e cuidado com o Palhaço, expulsar errado perde o jogo. Skip.”
22. **Amarelo** (Influencer) r2: Branco está confirmado pelo scan falho e pelo tiro do Preto. Roxo, só diga o tique exato em que passou na Enfermaria; sem prova concreta, vou pular.
   - pensou: “Branco está praticamente confirmado como impostor pelo scan falho e pelo tiro do Preto. Roxo continua estranho, mas sem horário exato não vale arriscar o Palhaço; melhor pular e fazer tarefas.”
23. **Roxo** (Palhaco) r2: Eu passei na porta no t13 vindo do Motor Superior e não tinha ninguém nem corpo nenhum, juro! Vocês tão inventando essa história pra me incriminar.
   - pensou: “Eles estão desconfiando de Palhaço e querendo dar skip. Preciso me enrolar na linha do tempo dizendo que passei no t13/t14 bem quando eles estavam lá, parecendo um impostor pego na mentira descarada ou tentando encobrir algo, forçando quem já ameaçou votar em mim a apertar o botão.”
- votos: {'Vermelho': 'Roxo', 'Azul': 'pular', 'Verde': 'Roxo', 'Rosa': 'Roxo', 'Laranja': 'pular', 'Amarelo': 'Roxo', 'Preto': 'pular', 'Roxo': 'Vermelho', 'Ciano': 'pular', 'Lima': 'pular', 'Cinza': 'pular', 'Coral': 'pular'}
   - voto de Rosa (Faxineiro): “Branco era meu parceiro e caiu como Xerife do Preto. Roxo está desesperado e não bate a história; empurrar voto nele desvia a atenção de mim e do Lima. Se todo mundo for pro Roxo, não é voto isolado. Preto declarou Xerife e ninguém ousa tocar nele (medo de Palhaço), então agrego ao pacote.”
   - voto de Roxo (Palhaco): “Quero ser expulso por ser o Palhaço, mas o lobby está com muito medo do Palhaço e a maioria declarou skip. Se eu votar no Vermelho ou no Preto agressivamente depois de dar um álibi mentiroso no t13, posso parecer um impostor desesperado tentando cavar voto contra o Xerife/reportador, acumulando susp”
- resultado: expulso=None eraImpostor=None papel=None anulada=Coral empate=False

### Reunião 2 (t15, emergencia) chamada por Roxo
0. **Coral** (Juiz) r1: Marrom era impostor, mas ainda não prova nada sobre Roxo. Vermelho, por que você acha que Roxo é suspeito ao encontrar Branco? Roxo, qual foi o motivo do botão agora?
   - pensou: “Marrom era impostor, então a acusação contra Roxo na reunião anterior pode ter sido uma tentativa de desviar o foco, mas não há prova suficiente. Vermelho encontrou Branco; preciso ouvir os dois lados antes de votar. Vou evitar pressionar demais para não cair no Palhaço.”
1. **Rosa** (Faxineiro) r1: Roxo apertar o botão logo depois de quase ser expulso é meio suspeito, mas confesso: Vermelho, você 'encontrou' o corpo da Branco na Enfermaria sozinho. Todo mundo que encontrou corpo até agora caiu mal pra mim. Roxo, conta o que viu.
   - pensou: “Sou impostora, meu parceiro Branco morreu e Marrom foi expulso. Roxo vem sendo o bode expiatório dos impostores — se ele sair, sobra Lima e eu muito expostos. Vou defender Roxo e jogar suspeita no Vermelho, que 'encontrou' o corpo de Branco.”
2. **Verde** (Barulhento) r1: Calma, gente: o Branco morreu por tiro do Xerife Preto, então o Preto tá limpo comigo. Roxo, explica o botão — e lembrem que eu vi o scan do Branco NÃO ligar na Enfermaria, ele tentou se passar por tripulante.
   - pensou: “Branco morreu na Enfermaria pelo tiro do Xerife Preto, então o Preto tem álibi de impostor. Roxo quase foi expulso e apertou o botão — pode ser jogada legítima ou manipulação, mas ainda não tenho prova. Melhor pedir explicação e compartilhar que vi o scan do Lima confirmado e o scan falso do Branco.”
3. **Lima** (Seguranca) r1: Eu tô no Refeitório desde t12, o Azul e a Rosa podem confirmar. E reparo que o Vermelho 'encontrou' o corpo da Branco sozinho de novo — quem sempre acha corpo tá com cara de culpa.
   - pensou: “Preciso consolidar meu álibi no Refeitório com Rosa e Azul e não dar munição a ninguém. Verde diz que o Preto atirou no Branco — ótimo, isso desvia a atenção. Vou apoiar isso e apontar o Vermelho como suspeito por 'encontrar' corpos sempre.”
4. **Vermelho** (Prefeito) r1: ...
5. **Preto** (Xerife) r1: Confirmo: fui eu que atirei no Branco no t13 e ele era impostor. Vermelho, você achou o corpo sozinho de novo, por que estava na Enfermaria? Roxo, qual foi o motivo do botão?
   - pensou: “Acertei o Branco no t13, então sou o Xerife e não posso esconder isso. O Vermelho achou corpo sozinho de novo e votou no Roxo, que suspeito ser inocente. Quero ouvir o Vermelho explicar a Enfermaria antes de decidir o voto.”
6. **Roxo** (Palhaco) r1: Apertei porque o Vermelho tá claramente armando pra mim desde a rodada passada! Ele achou o corpo do Branco do nada e tentou me empurrar a culpa, vota nele que é o último impostor!
   - pensou: “Apertei o botão de propósito para me colocar no centro das atenções após quase ser expulso. Se eu acusar o Vermelho de forma afobada e sem sentido logo depois da anulação, vão achar que sou impostor em pânico tentando se salvar.”
7. **Ciano** (Engenheiro) r1: Eu tô na Enfermaria desde o t12 e vi o Azul ali nesse tempo, então ele tá limpo comigo. Vermelho, você achou o corpo do Branco sozinho de novo: por que estava lá? Roxo, o botão foi por quê? Sem prova eu não voto em ninguém hoje.
   - pensou: “Vermelho achou dois corpos sozinho e os votos dele caem sempre em Roxo. Roxo apertou o botão de novo, mas diz que foi armação. Não tenho prova de nenhum dos dois. Vou pedir provas antes de votar e não entregar minha posição.”
8. **Laranja** (Rastreador) r1: Azul é 100% tripulante confirmado porque vi o lixo dele no t7, e o Preto é o Xerife que acertou o Branco. Vermelho e Roxo tão se bicando demais, cuidado pra não ser jogada de Palhaço querendo voto.
   - pensou: “Sei que o Preto é Xerife (matou Branco que era impostor) e Azul é tripulante 100% (vi o lixo visual no t7). O Branco tentou fingir scan na minha frente no t12. O Vermelho reportou o corpo e agora tá em Armas pelo meu rastreador, mas o Roxo forçou um botão desesperado logo após ser salvo pelo Juiz (o”
9. **Cinza** (Cientista) r1: Vermelho achou corpo duas vezes sozinho — mesmo padrão do Marrom. Tá me cheirando mal. Mas sem prova concreta não vou votar hoje, não quero entregar o jogo pro Palhaço.
   - pensou: “Vermelho achou o corpo do Bordo (com o Marrom) e agora o do Branco, duas vezes sozinho. É o mesmo padrão do Marrom/Faxineiro da rodada passada. Mas se eu votar nele e for inocente, posso estar dando mole pro Palhaço. Prefiro cautela e pedir pra galera não ter certeza. Posso usar meu poder de Cientis”
10. **Amarelo** (Influencer) r1: Vermelho achou dois corpos sozinho e ainda não explicou bem o que fazia na Enfermaria. Mas não compro o “último impostor” do Roxo sem prova; prefiro pular e investigar os dois.
   - pensou: “Marrom era impostor e Branco também, então restam provavelmente dois impostores. Vermelho achar dois corpos sozinho é suspeito, mas Roxo pode estar tentando forçar uma expulsão; não quero arriscar acertar o Palhaço. Melhor pressionar Vermelho e pular.”
11. **Azul** (Medico) r1: Eu vi o Branco sumir do nada no t1 e o scan dele não ligou no t12, então ele era impostor. O Vermelho estava na Enfermaria com ele nos dois momentos e achou o corpo sozinho de novo. Roxo se defende mal, mas o Vermelho é o que mais me incomoda hoje.
   - pensou: “Branco era impostor: sumiu do nada no t1 e o scan dele não ligou no t12. Vermelho esteve na Enfermaria com ele nos dois momentos e achou o corpo sozinho de novo. Roxo está se defendendo mal, mas Vermelho é o mais suspeito. Não posso revelar que sou Médico com o escudo em Verde ainda ativo, então vou”
12. **Ciano** (Engenheiro) r2: Eu tô na Enfermaria com o Preto agora e vi o Azul aqui no t12, então ele segue limpo. Vermelho, você achou o corpo do Branco de novo: o que você fez aqui entre o t13 e o t14? Se ninguém trouxer prova, eu prefiro pular hoje.
   - pensou: “Sobrou um impostor vivo além do Vermelho e do Roxo, mas não tenho prova contra nenhum dos dois. O Preto está comigo agora e confirmou o tiro no Branco, então ele parece confiável. Vermelho achou dois corpos sozinho e é o que mais me incomoda, mas o Roxo também pressionou o botão. Vou pedir explicaçã”
13. **Verde** (Barulhento) r2: Vermelho, o Branco estava NA Enfermaria com você no t12 e você 'acha' o corpo sozinho no t14. Explica isso direito ou meu voto vai em você.
   - pensou: “Branco confirmado impostor pelo tiro do Preto. Fica 2 impostores vivos. Vermelho achou corpo sozinho de novo e Branco esteve na Enfermaria com ele — suspeito forte, mas cuidado com o Palhaço. Roxo se defende mal, mas isso pode ser só medo de voto. Vou pressionar o Vermelho: se ele explicar mal, voto”
14. **Roxo** (Palhaco) r2: Eu vi o Vermelho matando o Branco na Enfermaria sim, não tem como ele se defender! Podem votar em mim se ele não for impostor, juro por tudo!
   - pensou: “Estão virando no Vermelho e desconfiando de Palhaço. Preciso parecer um impostor desesperado forçando a barra contra o Vermelho para puxar os votos de volta para mim.”
15. **Laranja** (Rastreador) r2: Mentira absurda, Roxo! Quem matou o Branco foi o Xerife Preto com um tiro, todo mundo viu o anúncio. Você tá forçando tanto essa mentira e pedindo voto que tá com cara descarada de Palhaço, não votem nele!
   - pensou: “Roxo acabou de mentir na cara dura dizendo que viu o Vermelho matar o Branco, mas todo mundo sabe que foi o Xerife Preto que atirou nele! Ou o Roxo é muito burro, ou é o Palhaço querendo ser votado dizendo 'podem votar em mim'. Não vou deixar caírem no bait.”
16. **Azul** (Medico) r2: Roxo, o Preto confirmou que atirou no Branco, então como você viu o Vermelho matando ele? Sua história não fecha. Eu voto no Roxo.
   - pensou: “O Branco morreu no tiro do Preto, confirmado por ele. Então o Roxo mente ao dizer que viu o Vermelho matar. Isso é a mentira mais forte da reunião. O Vermelho estranho, mas o Roxo é o principal suspeito agora.”
17. **Preto** (Xerife) r2: Roxo, eu que atirei no Branco no t13. Você não viu ninguém matar ele, então para de inventar. Vermelho, responde: o que você fazia na Enfermaria? Hoje meu voto vai no Roxo.
   - pensou: “Roxo mentiu ao dizer que viu o Vermelho matar o Branco, porque o Branco morreu pelo meu tiro. Ele apertou o botão logo depois de quase ser expulso e empurra a culpa. Sobrou um impostor vivo, e o Roxo é o principal suspeito. O Vermelho também acha corpos sozinho, mas ainda não vejo prova contra ele. ”
18. **Amarelo** (Influencer) r2: A história do Roxo não fecha: o Preto confirmou o tiro, então não vou cair nessa possível isca de Palhaço. Vermelho, explica exatamente onde esteve do t12 ao t14; por enquanto eu pulo.
   - pensou: “Roxo está forçando uma acusação impossível contra o Preto e parece estar tentando ser expulso, então pode ser o Palhaço. Vermelho continua suspeito pelo corpo, mas não há prova suficiente; vou evitar votar em qualquer um e pedir a linha do tempo.”
19. **Coral** (Juiz) r2: A versão do Roxo é impossível: Preto confirmou o tiro no Branco, então não votem no Roxo — pode ser o Palhaço. Vamos pular e cobrar do Vermelho o trajeto entre t12 e t14.
   - pensou: “Roxo está mentindo de forma exagerada e pode ser o Palhaço; não devemos expulsá-lo. Vermelho continua suspeito por encontrar dois corpos sozinho, mas precisamos de mais prova.”
20. **Lima** (Seguranca) r2: O Roxo tá claramente desesperado mentindo, e o Vermelho pode ter passado pela Enfermaria a caminho de outro lugar. Vou pular hoje, sem prova não voto em ninguém.
   - pensou: “Vermelho está sob fogo pesado; ele é meu parceiro. Se votarem nele, sobram só eu e Rosa. Melhor desviar do Roxo que já é saco de pancadas e sugerir pular. Não posso defender Vermelho demais ou fico suspeito.”
21. **Cinza** (Cientista) r2: Roxo tá com história impossível, o Preto confirmou o tiro e o Branco era impostor mesmo. Tá com cara de Palhaço isso aí. Vermelho me incomoda por achar corpo duas vezes sozinho, mas sem prova concreta eu pulo hoje — não vou entregar o jogo pro Palhaço.
   - pensou: “Roxo inventou que viu o Vermelho matando o Branco, mas o Preto já confirmou que foi ele que atirou — história furada, cara de Palhaço empurrando voto. Vermelho achou dois corpos sozinho, padrão esquisito, mas sem prova não posso votar. Melhor pular e investigar.”
22. **Rosa** (Faxineiro) r2: O Roxo tá mentindo descarado, o Preto confirmou o tiro no Branco. Ele apertou o botão pra se salvar e tá forçando voto — pra mim é ele hoje.
   - pensou: “Roxo apertou o botão pra se salvar e tá mentindo sobre o Vermelho (o tiro do Preto confirmou). Se os outros caírem no 'desconfiado demais', pode ser Palhaço — então o Roxo é alvo seguro, ele era suspeito desde a rodada passada. Voto nele com o grupo.”
23. **Vermelho** (Prefeito) r2: Gente, eu tava na Enfermaria fazendo a tarefa 'Inspecionar amostra' — etapa 1 feita no t13, próxima só no t18. E eu VI o scan do Branco não ligar no t12, por isso desconfiei dele. Não matei ninguém, o Preto que atirou e todo mundo viu. O Roxo tá com história furada e tá MUITO desesperado tentando me culpar — pra mim isso é Palhaço querendo sobreviver. Vou pular hoje, mas fico de olho no Roxo.
   - pensou: “Preciso me defender sem parecer desesperado. Tenho álibi forte: estava na Enfermaria fazendo a tarefa 'Inspecionar amostra' (etapa 1 feita no t13). E mais importante: eu VI o scan do Branco NÃO ligar no t12, o que já indicava que ele era impostor. Isso prova que eu estava observando, não matando. O ”
- votos: {'Vermelho': 'pular', 'Azul': 'Roxo', 'Verde': 'pular', 'Rosa': 'pular', 'Laranja': 'pular', 'Amarelo': 'pular', 'Preto': 'Roxo', 'Roxo': 'Vermelho', 'Ciano': 'pular', 'Lima': 'pular', 'Cinza': 'pular', 'Coral': 'pular'}
   - voto de Rosa (Faxineiro): “O Roxo tá com cara de Palhaço desesperado, votar nele é risco de dar vitória a ele. Vou pular como o grupo, mantendo meu álibi limpo. Pressionar o Vermelho sem votar me mantém neutro.”
   - voto de Roxo (Palhaco): “Para sustentar meu teatro de impostor encurralado que mentiu descaradamente e tentou incriminar o Vermelho, vou manter o voto no Vermelho. Isso reforça a convicção dos tripulantes como Azul, Preto e Rosa de que sou um impostor pego na mentira e mereço ser expulso.”
- resultado: expulso=None eraImpostor=None papel=None anulada=None empate=False

### Reunião 3 (t21, corpo) chamada por Ciano — corpo de Preto
0. **Azul** (Medico) r1: Eu tava no Depósito com a Coral no t21, não vi a Enfermaria. Ciano, quem tava perto do Preto quando você achou o corpo? Roxo, por que você apertou o botão no t15?
   - pensou: “Estava no Depósito com a Coral no t21, então não tenho álibi para a Enfermaria. Preto era o Xerife que acertou o Branco, então o Preto provavelmente foi morto por um impostor que ainda está vivo. Desconfio do Roxo, que pediu reunião sem motivo claro no t15 e foi o alvo de votos no t14. Preciso saber”
1. **Laranja** (Rastreador) r1: Eu tava em Armas fazendo asteroides com Vermelho (ele fez visual) e depois fomos pra O2 com Cinza e Verde. Ciano, viu alguém saindo da Enfermaria ou dutando?
   - pensou: “Azul, Amarelo e Vermelho fizeram tarefas visuais confirmadas na minha frente. Preto era o Xerife que matou Branco (impostor confirmado) no t13 e agora morreu na Enfermaria. Eu estava em Armas/O2 com Vermelho, Cinza e Verde. Ciano precisa dizer quem viu perto da Enfermaria.”
2. **Rosa** (Faxineiro) r1: Gente, eu tava indo pra Motor Superior, nada a ver. No t19 eu VI Roxo subir no scanner na Enfermaria e o scan NÃO LIGOU — fake scan! E o Preto morreu atirando nele, né? Roxo, explica isso.
   - pensou: “Preto era o Xerife e morreu atirando em Roxo — isso é ouro. Roxo deu scan falso no t19 na minha frente e agora o Xerife morreu tentando atirar nele? Vou puxar isso sem parecer vocês dois são parceiros.”
3. **Cinza** (Cientista) r1: Pessoal, importante: no t20 eu vi Vermelho e Laranja fazendo asteroides VISUAL em Armas, os dois são TRIPULANTES com certeza. Ciano, quem tava perto do corpo do Preto quando você achou? E Roxo, responde a acusação da Rosa sobre o scanner que não ligou.
   - pensou: “Tenho duas confirmações visuais sólidas: Vermelho e Laranja fizeram asteroides visual em Armas no t20 - ambos tripulantes com certeza. Isso reduz os suspeitos. Rosa tá acusando Roxo de fake scan, acusação séria. Preciso também usar meu poder de checar vitais pra ver se tem corpo escondido. Vou compa”
4. **Ciano** (Engenheiro) r1: Eu não usei duto nenhum. Rosa, você entrou num duto na Enfermaria no t20, por quê? E quando achei o Preto só o Roxo tava comigo, e o scan dele não ligou. Roxo, responde.
   - pensou: “Só eu tenho duto nesta partida, então quem entrou num duto na Enfermaria no t20 é impostor ou está mentindo. A Rosa é a principal suspeita. O Roxo estava comigo quando achei o Preto e o scan dele não ligou, então ele também está muito suspeito. Preciso forçar os dois a explicar.”
5. **Roxo** (Palhaco) r1: A Rosa tá mentindo pra se salvar porque ela acabou de entrar no duto na minha frente! Meu scan só bugou porque cliquei rápido, votem na Rosa que é certeza!
   - pensou: “Eles já estão me acusando de fake scan e me viram perto do corpo. Se eu empurrar a culpa de forma fraca e defensiva na Rosa, vou parecer um impostor encurralado tentando desviar o foco, o que vai atrair os votos que eu preciso para vencer como Palhaço.”
6. **Verde** (Barulhento) r1: Roxo, scan que 'buga' uma vez pode, mas a Rosa diz que viu de novo no t19. E Roxo tava sozinho com o Ciano no corpo. Eu tava com Vermelho, Laranja e Cinza desde Armas, meu álibi é esse. Voto Roxo.
   - pensou: “Rosa vista num duto seria Engenheiro (tripulante legítimo). Mas Roxo com fake scan no t12 E t19, e o Xerife Preto morreu logo depois de atirar em Branco... Roxo é o mais suspeito. Preto era o Palhaço? Não, Preto morreu por corpo, não expulsão, então posso votar com segurança.”
7. **Coral** (Juiz) r1: Roxo está muito comprometido: scan não ligou, estava sozinho com Ciano no corpo e só acusa a Rosa. Eu voto Roxo; Vermelho, Laranja e Cinza têm visual confirmado.
   - pensou: “Roxo está muito suspeito: foi visto falhando no scan, estava sozinho com Ciano perto do corpo e tenta desviar para Rosa. Rosa também é suspeita por entrar no duto, mas a convergência contra Roxo é mais forte. Meu poder de Juiz já foi usado na reunião anterior, então não posso anular de novo.”
8. **Vermelho** (Prefeito) r1: Confirmação: no t12 EU vi o scan do Roxo não ligar na Enfermaria. E fake scan duas vezes não é bug, é impostor. Roxo, se fosse tripulante você não precisava mentir. Voto no Roxo.
   - pensou: “Roxo tem fake scan confirmado por mim no t12 e pela Rosa no t19, e estava sozinho com o Ciano no corpo. É quase certo que é impostor. Como Prefeito meu voto vale 2, então meu apoio aqui é decisivo. Vou confirmar que vi o scan dele não ligar e que fiz asteroide visual com Laranja e Cinza, todos tripu”
9. **Amarelo** (Influencer) r1: O scan do Roxo falhou pelo menos duas vezes, e ele estava sozinho com Ciano quando o corpo foi achado. Para mim, Roxo é o principal suspeito; depois investigamos a Rosa pelo duto.
   - pensou: “Roxo está muito suspeito pelo scan falso confirmado por várias pessoas e por estar sozinho com o corpo. Porém, Rosa também foi vista no duto; pode ser Engenheira ou impostora. Não quero transformar uma acusação contra Roxo em vitória do Palhaço, mas a evidência contra ele é forte.”
10. **Lima** (Seguranca) r1: Fiquei no Refeitório desde t13 fazendo tarefas, ninguém aqui pode confirmar mas não saí de lá. O scan do Roxo falhado duas vezes + ele sozinho com o Ciano no corpo é demais pra mim, voto Roxo.
   - pensou: “Roxo será expulso de qualquer forma — vote nele para parecer tripulante. Rosa ficou exposta no duto, preciso não levantar mais suspeitas sobre mim; manter tom neutro e concordar com a maioria.”
11. **Azul** (Medico) r2: Vermelho, no t12 o scan que não ligou foi o do Branco, eu vi ele subir. Você tem certeza que era o Roxo? Por enquanto voto Roxo, mas quero essa resposta antes de votar.
   - pensou: “Eu vi o scan que não ligou no t12, mas foi o do Branco, não o do Roxo. O Vermelho disse que viu o Roxo, então ele pode estar mentindo ou confundindo. Roxo continua o suspeito mais forte: sozinho com o Ciano no corpo e o scan falhando. Meu escudo está no Laranja e não conto isso ainda.”
12. **Amarelo** (Influencer) r2: Roxo segue como principal suspeito: dois scans falhando e estava sozinho com Ciano no corpo. Mas não ignorem a Rosa: duto confirmado também precisa ser explicado.
   - pensou: “Roxo está muito suspeito pelo fake scan repetido e por estar com Ciano no corpo, mas a acusação de duto da Rosa também é forte. Vou pressionar Roxo sem parecer certeza absoluta para evitar cair no Palhaço.”
13. **Coral** (Juiz) r2: Mantenho meu voto no Roxo: dois scans falsos e ele estava com o Ciano no corpo. Se ele for impostor, investigamos a Rosa pelo duto depois.
   - pensou: “Roxo é o alvo mais consistente: dois relatos de scan falso e estava junto do corpo. Rosa também é suspeita pelo duto, mas expulsar Roxo primeiro parece mais seguro.”
14. **Ciano** (Engenheiro) r2: Só o Engenheiro usa duto, e eu não usei nenhum. A Rosa entrou num duto na Enfermaria no t20, isso não é bug. Rosa, explica por que você estava lá e não em Motor Superior. Vermelho, você disse que viu o scan do Roxo no t12, mas o Azul diz que foi o do Branco. Quem tá mentindo aí? Não voto antes de ouvir isso.
   - pensou: “Só o Engenheiro usa duto, e eu não usei nenhum. Então a Rosa entrando num duto na Enfermagem no t20 é quase prova de impostor, mais forte que o scan falho do Roxo. Ele pode ser impostor também, mas o duto da Rosa é o fato mais difícil de explicar. O Vermelho também está estranho: disse que viu o sca”
15. **Vermelho** (Prefeito) r2: Azul, você tem razão, no t12 foi o scan do BRANCO que falhou, eu confundi. Me desculpa. Mas a Rosa viu o do Roxo falhar no t19 e o Ciano tava sozinho com ele no corpo. E no t14 todo mundo votou no Roxo e o Juiz anulou — isso é MUITO suspeito. Voto no Roxo.
   - pensou: “Preciso admitir meu erro do t12 - foi o scan do BRANCO que não ligou, não o do Roxo. O Azul pegou essa inconsistência. Mas isso não muda a essência: a Rosa viu o scan do Roxo falhar no t19, e o Ciano estava SOZINHO com ele quando achou o corpo. Além disso, no t14 todo mundo votou no Roxo e o Juiz an”
16. **Lima** (Seguranca) r2: Ciano, você tava SOZINHO com o corpo do Preto e é o único que acusa a Rosa — muito conveniente. E se o Vermelho errou até quem viu no scan, a palavra dele não vale nada.
   - pensou: “Rosa é minha parceira e está sob fogo pelo duto. Melhor desviar: empurrar suspeita pro Ciano, que tava sozinho com o corpo e tem a narrativa mais forte contra o Roxo. Não defendo a Rosa diretamente pra não me queimar.”
17. **Cinza** (Cientista) r2: Scan que não liga é marca de impostor, não tem como tripulante fingir. Voto no Roxo. Rosa no duto pode ser a Engenheira usando, isso é uso normal dela.
   - pensou: “Marrom já caiu (era Faxineiro). Sobram 2 impostores + 1 palhaço entre os 11 vivos. A evidência mais forte agora é o scan falso do Roxo: tripulante não finge scan, isso é manual de impostor. Já a Rosa no duto pode ser a Engenheira legitimamente - não é prova. Ciano achou o corpo sozinho com o Roxo e ”
18. **Rosa** (Faxineiro) r2: Cinza entendeu: duto é uso normal da Engenheira, eu que sou. E o Vermelho errou o scan que 'viu' — cuidado com testemunho dele. Roxo tá condicionado, voto nele.
   - pensou: “Roxo vai ser expulso de qualquer jeito; luz nos erros do Vermelho pra semear dúvida depois, e defendo o duto como uso de Engenheira. Meu parceiro Lima tá seguro.”
19. **Roxo** (Palhaco) r2: Vocês tão caindo na historinha da Rosa, ela dutou na minha cara logo depois que o Preto caiu! Se me jogarem pra fora vão perder feio pra ela!
   - pensou: “A galera inteira já está pronta pra votar em mim por causa do scan fake e do corpo. Só preciso dar mais um chilique acusando a Rosa pra eles terem certeza de que sou o impostor tentando se safar, garantindo os votos na minha expulsão.”
20. **Verde** (Barulhento) r2: Roxo, fake scan + sozinho com o corpo é demais, me explica isso aí. Se ele não tiver resposta boa, voto Roxo com tudo.
   - pensou: “Roxo tem fake scan duas vezes e tava sozinho no corpo com Ciano. Ciano também suspeito por acusar a Rosa sem motivo, mas o voto fica no Roxo. Cuidado com o Juiz anular de novo.”
21. **Laranja** (Rastreador) r2: A desculpa do Roxo não cola nada, fake scan não tem erro e ele tava colado no corpo do Preto. Meu voto é no Roxo com certeza.
   - pensou: “Roxo está super encurralado com fake scan visto por Rosa, estava na cena do crime e se debatendo muito. Não parece Palhaço porque o Palhaço jogaria de forma a atrair voto sem se defender desesperadamente culpando a Rosa. Rosa alegou Engenheira. Vou no Roxo com a maioria pra limpar a nave.”
- votos: {'Vermelho': 'Roxo', 'Azul': 'Roxo', 'Verde': 'Roxo', 'Rosa': 'Roxo', 'Laranja': 'Roxo', 'Amarelo': 'Roxo', 'Roxo': 'Rosa', 'Ciano': 'Roxo', 'Lima': 'Roxo', 'Cinza': 'Roxo', 'Coral': 'Roxo'}
   - voto de Rosa (Faxineiro): “Roxo está sendo expulso por fake scan e estar no corpo. Como sou impostor, votei com o fluxo para ganhar credibilidade. Roxo não é meu parceiro (Lima é), então expulsá-lo elimina um tripulante e me fortalece. Cuidado com o Palhaço, mas ninguém suspeita de Roxo como Palhaço.”
   - voto de Roxo (Palhaco): “A maioria da nave já decidiu votar em mim por causa do fake scan e por estar no corpo. Votar na Rosa fingindo desespero consolida a imagem de impostor encurralado, garantindo minha expulsão e a vitória de Palhaço.”
- resultado: expulso=Roxo eraImpostor=False papel=Palhaco anulada=None empate=False

## Reflexões no fim
- Vermelho: O Xerife Preto foi a grande tragédia da partida: acertou o Fantasma mas depois atirou no Palhaço e morreu, entregando a vitória pro Roxo — nunca mais vou confiar cegamente num Xerife, sempre vou questionar antes de votar. Notei que dois dos três impostores finais (Rosa e Lima) eram GLM 5.3 Flash, e o Marrom era DeepSeek Flash, então na próxima rodada vou prestar atenção redobrada nesses modelos nos primeiros tiques. Eu mesmo falhei ao achar o corpo do Branco (Fantasma) e não pressionar o suficie
- Azul: Aprendi que o Palhaço (Roxo) pode agir como suspeito de propósito, então sinais de culpa não bastam para votar nele. Desconfio de quem acusa com base em um cadáver ou em um Xerife que errou, como o Ciano, e de quem se apresenta como alvo fácil. Na próxima, vou usar o Médico para proteger quem está perto dos corpos e cruzar as acusações antes de votar.
- Verde: Nesta partida Roxo (Palhaço) se manipulou: chamou emergência e ainda assim foi expulso no fim, vencendo sozinho — e o Xerife Preto queimou dois tiros, acertando Branco mas errando em Roxo e morrendo. Aprendi que o risco do Palhaço é real: vou evitar empurrar votação em quem parece 'suspeito demais' sem prova dura. Desconfio de Rosa (Faxineiro impostor, mesmo time que eu achava que era crew) e de Lima, que foi recrutado; já o Vermelho (Prefeito) apontou Branco corretamente e ganhou minha confianç
- Rosa: Como Faxineiro quase não atuei: o Xerife Preto derrubou o Branco rápido e o Palhaço Roxo se expulsou sozinho, acabando tudo. Aprendi que como impostor preciso usar o poder de sumir com corpos desde cedo e não ficar passivo. Na próxima, desconfio do Preto (foi Xerife agressivo e acertou um impostor) e do Vermelho (analisou bem e achou o Branco); vou fingir tarefas com mais naturalidade e guardar meu papel para não morrer cedo como na partida 1.
- Laranja: Caímos de novo no golpe do Palhaço, expulsando o Roxo logo após o Preto morrer tentando atirar nele, o que escancarou que ele não era impostor e nós ignoramos. O Gangster Marrom tentou dar self-report cedo e foi punido de imediato, mas a falta de atenção coletiva aos tiros do Xerife nos custou a vitória. Na próxima partida, vou rastrear alvos com comportamento errático e martelar na cabeça de todos para jamais votarem em alvos óbvios de Palhaço.
- Amarelo: Aprendi que o Marrom mentiu bem ao se apresentar como quem encontrou o corpo do Bordo, mas acabou expulso; o Preto acertou o Branco, porém acusou e matou o Roxo por engano, abrindo caminho para a vitória do Palhaço. Devo desconfiar de expulsões sem provas e lembrar que o Roxo conduziu a partida com chamadas de emergência e suspeitas calculadas, enquanto tarefas, rastreamentos e álibis verificáveis são mais confiáveis.
- Preto: Errei ao atirar em Roxo sem prova suficiente: o tiro falhou, morri, e ele foi expulso depois e venceu como Palhaço. Vou desconfiar de quem acusa rápido e insiste em um alvo sem ter visto nada, e só atirar com certeza real (ver o ato ou pegar na mentira). Confio mais em quem reporta corpos de forma verificável, como Bordo, e em quem mantém a versão consistente ao longo das reuniões.
- Branco: Aprendi que o Roxo era o Palhaço e conseguiu vencer ao parecer apenas um suspeito conveniente, então devo evitar votar em quem parece fácil demais de expulsar. O Preto, mesmo sendo Xerife, acusou e atirou errado em mim e depois morreu ao errar contra o Roxo; Marrom mentiu bem ao denunciar o corpo que ele mesmo havia criado, mas acabou exposto, enquanto Rosa e Lima permaneceram discretos como impostores.
- Roxo: Consegui executar perfeitamente a estratégia de Palhaço, atraindo o tiro errado do Xerife Preto e canalizando a suspeita coletiva na reunião final para garantir minha expulsão e a vitória solo. Notei que Marrom (Gangster, DeepSeek Flash) tentou uma jogada arriscada se auto-denunciando cedo e acabou eliminado, enquanto Lima (GLM 5.3 Flash) foi recrutado discretamente sem levantar suspeitas. Para a próxima partida, manterei atenção redobrada em quem força jogadas muito confiantes e nos recrutament
- Marrom: Me queimei de novo por ter sido o primeiro a denunciar o corpo que eu mesmo fiz: o Bordo era o Detetive e achar o cadáver dele me colocou na berlinda e fui expulso como Gangster logo cedo, então na próxima vou deixar outro achar o corpo ou esperar mais antes de puxar reunião. Aprendi que o Lima (GLM) aceitou bem o recrutamento e jogou do nosso lado, enquanto o Preto (Xerife) atirou certo no Branco Fantasma e depois se matou de bobeira atirando no Roxo, então desconfiarei de Xerife atirando sem p
- Ciano: Aprendi que o Palhaço pode ficar quieto e parecer suspeito para ser expulso, então não posso votar só porque alguém parece culpado. Confiei demais no relato do Preto e não questionei o tiro dele em Roxo, que errou e o deixou morrer sem provas, e o Roxo ganhou com isso. Na próxima, vou cobrar provas de quem está sendo acusado antes de votar, principalmente quando a acusação vem de um corpo ou de uma sala onde ninguém mais viu nada.
- Lima: Na partida 2 fui recrutado pelo Marrom (Gangster), mas o Xerife Preto acertou o Branco (Fantasma) e o Marrom foi expulso logo. Aprendi que o Preto mira bem no início e que o Roxo (Palhaço) se expôs de propósito para ser expulso e vencer. Nas próximas partidas vou evitar votar em quem parece suspeito demais (armadilha do Palhaço) e observar quem se sustenta com provas, tipo o Vermelho que acusou o Branco com convicção.
- Cinza: Marrom (DeepSeek) como Gangster jogou muito bem — matou Bordo, recrutou Lima e quase virou o jogo, então desconfiar sempre dele no começo. O Xerife Preto foi corajoso mas imprudente: acertou Branco (Fantasma) mas errou em Roxo e morreu, e ainda por cima forçou a expulsão do Palhaço que ganhou sozinho — nunca confie em Xerife que atira por impulso sem certeza. Aprendi que acusar alguém só porque 'parece suspeito' pode eleger o Palhaço, e que corpos escondidos pelo Faxineiro (Rosa) são pistas vali
- Coral: Aprendi que Marrom mentiu bem ao denunciar Bordo depois de matá-lo, mas acabou expulso por inconsistências; Branco também jogou discretamente como Fantasma, enquanto Lima foi recrutado e passou despercebido. Preto acertou ao eliminar Branco, mas acusou Roxo sem prova e morreu ao errar o tiro, causando a vitória do Palhaço; devo desconfiar de acusações precipitadas e nunca esquecer que expulsar um suspeito pode encerrar a partida para o Palhaço.
- Bordo: Aprendi que morrer cedo como Detetive me deixou sem examinar corpos, então preciso ficar mais esperto e não andar sozinho no Motor Superior. O Xerife Preto errou ao atirar em Roxo (Palhaço) e depois expulsamos o Palhaço, dando a vitória a ele — preciso desconfiar de acusações rápidas e nunca votar em alguém só por parecer suspeito demais. Quem mentiu bem foi Rosa (Faxineiro), que sobreviveu escondendo corpos, enquanto Marrom se entregou ao denunciar meu corpo; na próxima, desconfio de quem denun