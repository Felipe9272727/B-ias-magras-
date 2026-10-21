# Partida 1 — resultado: {'time': 'impostor', 'motivo': 'Os impostores ficaram em igualdade com os outros jogadores.', 'tique': 32, 'casalVivo': False, 'sobrevivente': []}

## Elenco
- Vermelho: Bombardeiro (impostor) — MiniMax M3.1 Flash
- Azul: Cientista (tripulante) — Claude Haiku
- Verde: Seguranca (tripulante) — GLM 5.3 Flash
- Rosa: Prefeito (tripulante) — GLM 5.3 Flash
- Laranja: Gangster (impostor) — Qwen 3.8 27B
- Amarelo: Perito (tripulante) — GPT-5.6 Luna
- Preto: Xerife (tripulante) — Claude Haiku
- Branco: Medico (tripulante) — GPT-5.6 Luna
- Roxo: Juiz (tripulante) — Qwen 3.8 27B
- Marrom: Chantagista (impostor) — DeepSeek Flash
- Ciano: Localizador (tripulante) — Claude Haiku
- Lima: Piromante (neutro) — GLM 5.3 Flash
- Cinza: Engenheiro (tripulante) — MiniMax M3.1 Flash
- Coral: Influencer (tripulante) — GPT-5.6 Luna
- Bordo: Glutao (neutro) — DeepSeek Flash

## Linha do tempo (eventos)
- t1 **gasolina** {"cor": "Lima", "aparente": "Lima", "vitima": "Bordo", "sala": "Refeitorio", "total": 1}
- t1 **poder** {"cor": "Azul", "poder": "vitais", "mortos": []}
- t2 **poder** {"cor": "Branco", "poder": "escudo", "alvo": "Ciano"}
- t2 **duto** {"cor": "Vermelho", "aparente": "Vermelho", "de": "MotorSuperior", "para": "Reator"}
- t3 **duto** {"cor": "Vermelho", "aparente": "Vermelho", "de": "Reator", "para": "MotorInferior"}
- t4 **duto** {"cor": "Vermelho", "aparente": "Vermelho", "de": "MotorInferior", "para": "Reator"}
- t4 **gasolina** {"cor": "Lima", "aparente": "Lima", "vitima": "Verde", "sala": "Refeitorio", "total": 2}
- t5 **poder** {"cor": "Ciano", "poder": "rastrear", "alvo": "Lima"}
- t5 **duto** {"cor": "Vermelho", "aparente": "Vermelho", "de": "Reator", "para": "MotorSuperior"}
- t6 **poder** {"cor": "Azul", "poder": "vitais", "mortos": []}
- t6 **duto** {"cor": "Vermelho", "aparente": "Vermelho", "de": "MotorSuperior", "para": "Reator"}
- t7 **chantagem** {"cor": "Marrom", "alvo": "Amarelo"}
- t7 **poder** {"cor": "Amarelo", "poder": "pegadas", "sala": "Admin", "quem": ["Branco", "Ciano", "Verde"]}
- t7 **foto** {"cor": "Coral", "sala": "Enfermaria"}
- t7 **fantasma_funcao** {"cor": "Roxo", "funcao": "Anjo"}
- t7 **morte** {"assassino": "Bordo", "aparente": "Bordo", "vitima": "Roxo", "sala": "O2", "escondido": true, "devorado": true}
- t7 **limpeza** {"cor": "Bordo", "aparente": "Bordo", "corpo": "Roxo", "sala": "O2"}
- t7 **duto** {"cor": "Vermelho", "aparente": "Vermelho", "de": "Reator", "para": "MotorInferior"}
- t7 **recrutamento** {"cor": "Laranja", "alvo": "Azul", "papelAntes": "Cientista", "sala": "Armas"}
- t8 **poder** {"cor": "Roxo", "poder": "escudo_anjo", "alvo": "Coral"}
- t8 **gasolina** {"cor": "Lima", "aparente": "Lima", "vitima": "Preto", "sala": "Enfermaria", "total": 3}
- t8 **poder** {"cor": "Verde", "poder": "cameras"}
- t8 **duto** {"cor": "Vermelho", "aparente": "Vermelho", "de": "MotorInferior", "para": "Reator"}
- t8 **sabotagem** {"cor": "Azul", "subtipo": "Luzes"}
- t9 **conserto** {"por": ["Ciano"], "subtipo": "Luzes"}
- t9 **duto** {"cor": "Cinza", "aparente": "Cinza", "de": "Navegacao", "para": "Escudos"}
- t9 **duto** {"cor": "Vermelho", "aparente": "Vermelho", "de": "Reator", "para": "MotorInferior"}
- t10 **bomba_plantada** {"cor": "Vermelho", "aparente": "Vermelho", "vitima": "Rosa", "sala": "MotorInferior", "explode": 13}
- t11 **poder** {"cor": "Amarelo", "poder": "pegadas", "sala": "Deposito", "quem": ["Verde", "Rosa", "Cinza", "Coral"]}
- t11 **duto** {"cor": "Vermelho", "aparente": "Vermelho", "de": "MotorInferior", "para": "Reator"}
- t11 **duto** {"cor": "Marrom", "aparente": "Marrom", "de": "Refeitorio", "para": "Admin"}
- t12 **duto** {"cor": "Vermelho", "aparente": "Vermelho", "de": "Reator", "para": "MotorSuperior"}
- t13 **xerife** {"xerife": "Preto", "alvo": "Lima", "acertou": true, "sala": "Admin"}
- t13 **duto** {"cor": "Vermelho", "aparente": "Vermelho", "de": "MotorSuperior", "para": "Reator"}
- t13 **poder** {"cor": "Ciano", "poder": "rastrear", "alvo": "Verde"}
- t13 **fantasma_funcao** {"cor": "Rosa", "funcao": "Influencer"}
- t13 **bomba** {"por": "Vermelho", "portador": "Rosa", "sala": "Escudos", "mortos": ["Rosa"]}
- t14 **recado** {"cor": "Rosa", "texto": "VI VERMELHO SAIR DE DUTO em Motor Inferior 2x (t7 e t9). Só Engenheiro usa dutos. Se Vermelho não for Eng, é impostor. Fiquem de olho!"}
- t14 **duto** {"cor": "Vermelho", "aparente": "Vermelho", "de": "Reator", "para": "MotorSuperior"}
- t14 **reuniao** {"chamador": "Cinza", "corpo": "Lima", "sala": "Admin", "subtipo": "corpo"}
- t14 **casal_morre** {"vitima": "Verde", "par": "Marrom", "sala": "Refeitorio"}
- t14 **fim_reuniao** {"expulso": "Marrom", "eraImpostor": true, "empate": false, "anulada": null, "papel": "Chantagista"}
- t15 **poder** {"cor": "Roxo", "poder": "escudo_anjo", "alvo": "Cinza"}
- t15 **poder** {"cor": "Branco", "poder": "escudo", "alvo": "Cinza"}
- t16 **recado** {"cor": "Rosa", "texto": "Marrom era impostor, faltam 2! No t1 vi Bordo junto de Lima (achada em Admin). Suspeitem de Bordo e do Vermelho dos dutos."}
- t17 **foto** {"cor": "Coral", "sala": "Admin"}
- t17 **poder** {"cor": "Amarelo", "poder": "pegadas", "sala": "Admin", "quem": ["Preto", "Marrom", "Cinza", "Ciano", "Coral"]}
- t18 **duto** {"cor": "Cinza", "aparente": "Cinza", "de": "Refeitorio", "para": "Admin"}
- t20 **bomba_plantada** {"cor": "Vermelho", "aparente": "Vermelho", "vitima": "Cinza", "sala": "Refeitorio", "explode": 23}
- t21 **poder** {"cor": "Roxo", "poder": "escudo_anjo", "alvo": "Preto"}
- t21 **sabotagem** {"cor": "Laranja", "subtipo": "Luzes"}
- t21 **poder** {"cor": "Ciano", "poder": "rastrear", "alvo": "Bordo"}
- t22 **duto** {"cor": "Cinza", "aparente": "Cinza", "de": "Navegacao", "para": "Armas"}
- t23 **bomba** {"por": "Vermelho", "portador": "Cinza", "sala": "Refeitorio", "mortos": ["Ciano"]}
- t24 **conserto** {"por": ["Amarelo"], "subtipo": "Luzes"}
- t24 **morte** {"assassino": "Azul", "aparente": "Azul", "vitima": "Coral", "sala": "Refeitorio"}
- t24 **reuniao** {"chamador": "Laranja", "corpo": "Ciano", "sala": "Refeitorio", "subtipo": "corpo"}
- t24 **fim_reuniao** {"expulso": "Cinza", "eraImpostor": false, "empate": false, "anulada": null, "papel": "Engenheiro"}
- t25 **poder** {"cor": "Branco", "poder": "escudo", "alvo": "Laranja"}
- t25 **poder** {"cor": "Amarelo", "poder": "pegadas", "sala": "Refeitorio", "quem": ["Vermelho", "Azul", "Laranja", "Bordo", "Cinza", "Coral", "Preto", "Branco"]}
- t27 **poder** {"cor": "Roxo", "poder": "escudo_anjo", "alvo": "Laranja"}
- t29 **bomba_plantada** {"cor": "Vermelho", "aparente": "Vermelho", "vitima": "Bordo", "sala": "Admin", "explode": 32}
- t29 **poder** {"cor": "Amarelo", "poder": "pegadas", "sala": "O2", "quem": ["Laranja"]}
- t32 **bomba** {"por": "Vermelho", "portador": "Bordo", "sala": "Admin", "mortos": ["Bordo"]}
- t32 **fim** {"time": "impostor", "motivo": "Os impostores ficaram em igualdade com os outros jogadores.", "casalVivo": false, "sobrevivente": []}
- tarefas visuais feitas: t4 Amarelo (Escanear no MedBay), t5 Roxo (Destruir asteroides), t6 Cinza (Esvaziar o lixo), t7 Azul (Destruir asteroides), t21 Preto (Ativar os escudos)

## Chat dos impostores
- t1 Vermelho: Vou caçar alguém sozinho; fiquem prontos para fazer álibi.
- t1 Laranja: Vermelho, Marrom: todo mundo tá no refeitório, ninguém pode matar. Espalhem e finjam que fazem tarefas. Eu vou ficar aqui. Vamos matar quando se espalharem.
- t1 Marrom: Sou casal com Verde. NÃO matem o Verde, senão eu morro junto. Vou guardar a chantagem pra quem me acusar.
- t2 Laranja: Fingindo tarefa no Refeitório com 4 pessoas de testemunha. Quem tá perto de quem?
- t2 Marrom: Saindo do refeitório pro Depósito, fingindo tarefa. Chantagem guardada pra calar testemunha. Vermelho, ache alguém isolado.
- t2 Vermelho: Vou para o Reator pelo duto; fiquem separados e me avisem se alguém entrar.
- t3 Marrom: Marrom aqui: sozinho no Depósito, indo pra Escudos fingir tarefa. Me avisem se virem alguém isolado, mato quando der.
- t3 Laranja: Saindo pro Armas pra me posicionar. Ninguém por perto ainda, mas já sei que Lima e Cinza estavam aqui. Verde tá fora (casal do Marrom).
- t3 Vermelho: Vou para o Motor Inferior pelo duto; fiquem compressors.
- t4 Vermelho: Estou indo pro Reator pelo duto. Avistem se virem alguém sozinho.
- t4 Marrom: Saindo dos Escudos pro Refeitório criar álibi; Vermelho, cuidado no Motor Inferior.
- t4 Laranja: Vou pra O2 fingir tarefa. Separados. Me avisem se virem alguém isolado, quero preparar o recrutamento.
- t5 Vermelho: Subindo pro Motor Superior, sem ninguém por perto. Avisem se acharem um alvo isolado.
- t5 Laranja: Tô em O2 com Bordo me vendo, nada de loucura aqui. Fiquem espalhados.
- t6 Marrom: Estou no Refeitório com Amarelo colado em mim. Não posso agir. Alguém isola Amarelo depois pra eu resolver.
- t6 Laranja: Saí do O2 pro Armas, Bordo tava me vendo. Fiquem em áreas opostas por enquanto.
- t6 Vermelho: Vou para o Reator pelo duto; está vazio, sem testemunhas.
- t7 Marrom: Chantageei Amarelo pra próxima reunião. Tô no Refeitório sozinho, de olho no duto pra Admin (Verde e Amarelo lá). Vermelho, se achar alguém isolado, avisa que eu fecho.
- t7 Vermelho: Vou mirar a Rosa no Motor Inferior; fiquem longe e me avisem se virem testemunhas.
- t7 Laranja: Rekrutei o Azul. Agora somos 4. Cuidado com a força de vocês em votação.
- t8 Marrom: Tô indo Admin. Amarelo calado na próxima reunião. Vermelho, cuidado no Motor Inferior, fica de olho se alguém chegar.
- t8 Vermelho: Rosa no Reator. Vou plantar nela e sair; fiquem longe do Reator.
- t8 Laranja: Azul, bem-vindo ao time! Fica quieto, faz tarefas e me ajuda a criar álibi. Marrom tá no Refeitório com Amarelo chantageado. Vermelho vai matar a Rosa no Motor Inferior.
- t8 Azul: Vou soltar a luz agora em Armas. Laranja, fica perto do Refeitório e aparece como tarefa normal. Mato no próximo ciclo de recarga, sem testemunhas.
- t9 Azul: Tô em Armas sem testemunhas. Fingindo tarefa aqui. Laranja, se alguém perguntar, a gente estava junto perto do Refeitório.
- t9 Marrom: Matei o Amarelo em Admin, Verde tava perto mas diz que ninguém viu. Vou dar álibi na Elétrica consertando as luzes.
- t9 Vermelho: Vou para o Motor Inferior; fiquem aí e não se aproximem.
- t9 Laranja: MATEI Cinza em Navegação. Vou pro Refeitório agora. Corpo vai aparecer em Navegação, fiquem longe de lá.
- t10 Vermelho: Bomba em Rosa no Motor Inferior! Saio já e fiquem longe.
- t10 Laranja: Fingindo tarefa em Navegação, ninguém por perto. Azul, vocês dois tá bom no álibi do Refeitório? Próximo alvo: Cinza sumiu num duto, tá estranho.
- t10 Azul: Tô fingindo tarefa em Armas, sem testemunhas. Sabotagem libera em 5 tiques; quem tiver chance, avisa antes do corpo do Cinza ser achado.
- t10 Marrom: Indo pro Refeitório matar o Coral, tá sozinho. Corpo do Cinza em Navegação: fiquem longe de lá.
- t11 Azul: Tô em Armas fingindo tarefa, ninguém por perto. Vou pro Refeitório depois pra dar álibi, Marrom, avisa se o Coral já caiu.
- t11 Laranja: Saio de Navegação agora, corpo do Cinza tá aqui. Qualquer um que denunciar, eu juro que fui pra O2. Marrom, já matou o Coral? Azul, me confirma que tava em Armas o tempo todo.
- t11 Vermelho: Rosa está com bomba em Mim, explosão no tique 13. Estou me afastando para o Reator.
- t11 Marrom: Chantagem já usada no Amarelo. Tô indo por duto pro Admin, sem testemunhas. Aviso se ver algo.
- t12 Marrom: Admin com Lima e Cinza me vendo, fingindo tarefa. Preto tá no Refeitório (vi pelos dutos). Não mato com testemunha. Chantagem guardada pra quem acusar. Vermelho, confirma a explosão da Rosa no t13.
- t12 Vermelho: Bomba na Rosa explode no tique 13. estou no Motor Superior, me cubram se alguém perguntar.
- t12 Azul: Confirmo: fiquei em Armas fingindo tarefa o tempo todo, ninguém passou por aqui. Sigo quieto.
- t12 Laranja: Vou pra Armas ficar perto do Azul. Depois do tique 13 a gente dá álibi pro Vermelho no Reator.
- t13 Laranja: Tô em Armas com Azul, somos álibi. Quando acharem a Rosa no Motor Inferior, a gente confirma que tava aqui o tempo todo.
- t13 Marrom: Estou no Admin com Preto, Lima e Cinza me vendo — álibi forte. Bomba da Rosa deve estourar agora. Não cheguem perto do Motor Inferior.
- t13 Azul: Tô em Armas com o Laranja, fingindo tarefa. Sem testemunha de fora. Vermelho, a bomba da Rosa explode agora.
- t13 Vermelho: A bomba da Rosa explode agora. Estou saindo pelo duto para o Reator e ficarei lá para o álibi.
- t14 Laranja: Tô em Armas com o Azul fingindo tarefa. Alguém viu o corpo da Rosa ser achado? Se não, alguém vai ter que denunciar em breve.
- t14 Azul: Confirmo: tô em Armas com o Laranja desde o t12. Fingindo tarefa, ninguém saiu daqui.
- t14 Vermelho: Saí do Reator e vou pro Motor Superior, para termos álibi sem testemunhas.
- t14 Marrom: Lima era neutro, Preto é o Xerife (atirou e sobreviveu). Vou denunciar pra ganhar álibi. Exponham o Preto como suspeito de ter atirado errado, mas cuidado: sobreviveu = Lima era do mal.
- t15 Vermelho: Vou pro Reator. Fingimos tarefa juntos e pedimos ligação de emergência se o corpo da Rosa aparecer.
- t15 Azul: Marrom foi pro saco, Verde morreu junto. Eu fico no Refeitório fingindo tarefa, sem matar com 9 testemunhas. Laranja, você ainda tá em Armas? Vermelho, confirma que tá no Motor Superior.
- t15 Laranja: Vermelho, recado anônimo do além te acusa de usar duto no Motor Inferior. Se for reunião, nega e diz que é Engenheiro. Azul, confirma meu álibi no Refeitório.
- t16 Azul: Confirmo o álibi do Laranja: estou no Refeitório com ele. Vermelho, mantenha o álibi no Reator/Motor Superior e não apareça perto do corpo da Rosa.
- t16 Laranja: Vermelho, saiu recado anônimo dizendo que vc usou duto no Motor Inferior 2x. Se você não for Eng, isso te expõe. Cuidado, finge que viu de longe.
- t17 Laranja: Estou no Refeitório com Azul e Bordo me vendo, álibi perfeito. Azul, continua comigo. Vermelho, onde tá agora? O fantasma tá apontando pra Bordo e pra você, cuidado com Bordo.
- t17 Vermelho: Vou pro Motor Superior e fico fingindo tarefa. Se perguntarem dos dutos, era o Engenheiro, não eu.
- t17 Azul: Tô no Refeitório com Laranja e Bordo, confirmo o álibi. Vermelho, fica no Reator e nega o duto dizendo que é Engenheiro.
- t18 Laranja: Azul confirmou meu álibi no Refeitório. Deixa o Bordo ser o suspeito, o recado do fantasma tá apontando pra ele. Vermelho, nega o duto, diz que é Engenheiro.
- t18 Vermelho: Vou ao Refeitório; já vi o Bordo e vou plantar nele, saio antes do tique 3.
- t18 Azul: Laranja, confirmo: estou no Refeitório com você. Vou manter o álibi e fico quieto até a sala esvaziar.
- t19 Laranja: Tô no Refeitório fingindo tarefa com Azul. Vi Cinza entrar no duto aqui. Se perguntarem, era Engenheiro.
- t19 Azul: Ciano e Bordo me viram no Refeitório, então não mato agora. Fico fingindo tarefa. Vermelho, cuidado com o Bordo, ele tá de olho em tudo.
- t19 Vermelho: Vou cruzar o Refeitório agora; fiquem no Armas e não se aproximem de mim.
- t20 Vermelho: Vou plantar em Cinza e sair pro Motor Superior; fiquem longe do Refeitório no t22.
- t20 Azul: Tem 3 testemunhas aqui (Cinza, Coral, Bordo), não mexo agora. Vermelho, cuidado com o Bordo, ele tá olhando demais.
- t20 Laranja: Vermelho, Cinza entrou no duto aqui no Refeitório no t18. Se ele sair em Armas ou Motor Superior, planta nele. Azul, fica quieto do meu lado.
- t21 Azul: Bordo tá me vendo, não mato agora. Fico no Refeitório fingindo tarefa até ele sair. Laranja, ok o álibi.
- t21 Laranja: Sabotei as luzes. Confusão boa pro Vermelho plantar no Cinza. Fiquem juntos aqui até as luzes voltarem.
- t21 Vermelho: Cinza está com a bomba; fiquem longe dele até o t23.
- t22 Azul: Bordo tá me vendo agora, não mato nele aqui. Laranja, segura a sabotagem e a gente espera ele sair de perto.
- t22 Vermelho: Cinza está com a bomba; vou me afastar. Fiquem no Refeitório e evitem션을 suspicion.
- t22 Laranja: Vou consertar as luzes, fico no álibi da Elétrica quando a bomba do Cinza estourar no t23. Azul, confirma que me viu no Refeitório.
- t23 Azul: Tô sozinho no Refeitório, ninguém perto. Laranja, você tá no Admin, não aqui, então não posso confirmar seu álibi. Vermelho, a bomba do Cinza sai no t23?
- t23 Laranja: Cinzão explode agora (t23). Eu vou pra Elétrica consertar as luzes, tenho álibi. Fiquem longe de onde ele tá.
- t23 Vermelho: Saí para o Reator para ter álibi; a bomba do Cinza explode no Refeitório, fiquem aí.
- t24 Laranja: Denunciei o corpo. Na reunião, fiquem calmos. Se perguntarem, vocês estavam comigo no Refeitório.
- t24 Azul: Matei Coral agora. Confirmo que vi Laranja no Refeitório. Vou denunciar o corpo do Ciano depois, quando ninguém estiver por perto.
- t24 Vermelho: Vou pra Elétrica consertar as luzes. Fiquem no Refeitório e não se aproximem do Cinza.
- t25 Laranja: Azul, EU VI VOCÊ MATAR A CORAL. Não pode denunciar. Se alguém perguntar, digo que só vi o corpo e não vi quem matou. Fiquem calmos na próxima reunião.
- t25 Vermelho: Vou pra Elétrica. Fiquem separados e evitam qualquer ataque até eu confirmar quem estiver sozinho.
- t25 Azul: Tem 4 testemunhas aqui (Amarelo, Preto, Branco, Bordo). Nada de matar agora. Fico fingindo tarefa no Refeitório. Vermelho, Laranja, cuidado com o Cinza expulso: ele era inocente, então a suspeita vai 
- t26 Azul: Fico no Refeitório fingindo tarefa. Bordo está perto, então ninguém sai daqui sem motivo. Laranja, segura a versão do álibi.
- t26 Laranja: Tô em Armas, indo pra O2. Matança libera no t28. Quem tá sozinho perto de vocês? Preciso de um alvo isolado ou alguém pra recrutar.
- t27 Laranja: Fui pra Armas, longe do Refeitório. Cinza era inocente, a suspeita tá alta. Azul, cuidado com o Coral, se denunciar vai ser muito suspeito. Fiquem espalhados.
- t27 Azul: Tô sozinho no Refeitório fingindo tarefa. Laranja, se o Branco ou o Bordo ficarem isolados eu vejo. Vermelho, tá seguro?
- t27 Vermelho: Estou indo para o Depósito; avise se algum alvo estiver isolado por lá.
- t28 Azul: Tô sozinho no Refeitório, sem testemunhas. Fico quieto aqui até ter um alvo isolado e álibi. Quem tiver o próximo alvo, avisa.
- t28 Laranja: Tô em Armas sozinho fingindo tarefa. Com a expulsação do Cinza inocente a desconfiança tá alta, vou segurar até a próxima reunião. Qualquer um isolado, me avise.
- t28 Vermelho: Vou ao Admin atrás de alvo isolado. Quem estiver sozinho, me avise.
- t29 Azul: Estou sozinho no Refeitório, sem alvo por aqui. Vermelho, você está no Admin com o Bordo, então não entro lá agora. Laranja, se achar alguém isolado, me avisa.
- t29 Vermelho: Plantei no Bordo. Vou pro Depósito e fico longe quando explodir.
- t29 Laranja: Estou indo pra Navegação, fiquem separados. Azul, cuidado pra não se expor de novo. Se alguém ficar isolado avisa.
- t30 Vermelho: Bombei no Bordo, explode no t32. Tô saindo do Admin; fiquem longe.
- t30 Laranja: Vou pra Armas fingir tarefa, tá bom pro álibi quando o Bordo explodir.
- t30 Azul: Estou sozinho no Refeitório. Admin tem Vermelho e Bordo, então não entro por lá agora. Quem ficar isolado perto de mim, me avisem.
- t31 Laranja: Vou pro O2, longe da explosão do Bordo. Depois da bomba, a suspeita vai cair em quem estava em Admin. Eu estarei em O2.
- t31 Vermelho: Saí do Depósito para Elétrica; fiquem longe do Bordo até a explosão.
- t31 Azul: Estou sozinho no Refeitório fingindo tarefa. Fico aqui e não vou ao Admin até a bomba do Bordo estourar no t32.
- t32 Vermelho: Bomba estourando no Admin agora. Estou na Elétrica, longe; fiquem separados.
- t32 Azul: Tô no Refeitório fingindo tarefa, longe do Bordo. Ninguém me vê agora.
- t32 Laranja: Bomba do Bordo estourando agora. Tô indo pro Navegação, longe de tudo. Quem for denunciar o corpo, não me liguem.

## Pensamentos dos impostores e do Palhaço (ações fortes)
- t2 Vermelho (Bombardeiro): **entrar no duto e sair em Reator** — “Vou entrar no duto para sair no Reator sem encontrar ninguém e preparar uma Opportunity de longe.”
- t3 Vermelho (Bombardeiro): **entrar no duto e sair em MotorInferior** — “Vou usar o duto para o Motor Inferior e procurar alguém isolado para plantar a bomba.”
- t4 Vermelho (Bombardeiro): **entrar no duto e sair em Reator** — “Vou entrar pelo duto no Reator e procurar alguém isolado para plantar a bomba.”
- t5 Vermelho (Bombardeiro): **entrar no duto e sair em MotorSuperior** — “Vou subir ao Motor Superior para procurar alguém isolado e preparar uma bomba sem testemunhas.”
- t6 Vermelho (Bombardeiro): **entrar no duto e sair em Reator** — “Vou me posicionar no Reator, que está vazio, para plantar uma bomba sem testemunhas.”
- t7 Coral (Influencer): **postar foto da sala** — “Vou postar a foto para revelar quem está na Enfermaria e confirmar se há algo suspeito.”
- t7 Vermelho (Bombardeiro): **entrar no duto e sair em MotorInferior** — “Vou me aproximar da Rosa pelo duto para plantar a bomba e afastar-me antes da explosão.”
- t7 Laranja (Gangster): **recrutar Azul** — “Azul tá sozinho comigo e o sistema tá apontando como oportunidade. Vou recrutar ele pra ficar com 4 impostores, isso muda o jogo.”
- t8 Vermelho (Bombardeiro): **entrar no duto e sair em Reator** — “Vou entrar pelo duto no Reator para alcancear Rosa e plantar a bomba, depois me afasto antes da explosão.”
- t9 Marrom (Chantagista): **matar Amarelo** — “Amarelo já está chantageado e isolado aqui; mato ele agora sem testemunhas e ganho tempo pro time.”
- t9 Vermelho (Bombardeiro): **entrar no duto e sair em MotorInferior** — “Vou entrar no duto e chegar ao Motor Inferior para encontrar Rosa e plantar a bomba sem testemunhas.”
- t9 Laranja (Gangster): **matar Cinza** — “Cinza tá sozinho comigo, ninguem ve, cooldown pronto — é a hora de matar antes de ir pro Refeitório como o Azul pediu.”
- t11 Vermelho (Bombardeiro): **entrar no duto e sair em Reator** — “A bomba na Rosa explode no tique 13; vou me afastar agora pelo duto e me preparar no Reator.”
- t11 Marrom (Chantagista): **entrar no duto e sair em Admin** — “Vou de duto pra Admin ver o movimento e checar meu par Verde sem ser visto.”
- t12 Vermelho (Bombardeiro): **entrar no duto e sair em MotorSuperior** — “A bomba está armada na Rosa; vou me afastar para o Motor Superior e preparar um álibi sem testemunhas.”
- t13 Preto (Xerife): **atirar em Lima** — “Vi o Lima fingir o scan na Enfermaria e o scan não ligou, então ele não é tripulante; vou atirar nele.”
- t13 Vermelho (Bombardeiro): **entrar no duto e sair em Reator** — “A bomba da Rosa explode neste tique; vou me afastar pelo duto e Establishar meu álibi no Reator.”
- t14 Vermelho (Bombardeiro): **entrar no duto e sair em MotorSuperior** — “Vou me afastar do Motor Inferior e buscar um álibi no Motor Superior.”
- t14 Cinza (Engenheiro): **denunciar corpo de Lima** — “Vou denunciar Lima para descobrir seu papel e levantar a suspeita de Marrom saindo do duto.”
- t14 Marrom (Chantagista): **denunciar corpo de Lima** — “Preto é o Xerife confirmado (atirou e sobreviveu, então Lima era do mal); não posso matar com duas testemunhas, então denuncio o corpo pra parecer limpo.”
- t17 Coral (Influencer): **postar foto da sala** — “Vou postar a última foto agora para registrar quem está comigo no Admin e criar uma prova pública.”
- t21 Laranja (Gangster): **sabotar luzes** — “Com tanta testemunha aqui não vou arriscar, mas sabotar luzes cria confusão e dá cobertura pro Vermelho plantar a bomba no Cinza.”
- t24 Laranja (Gangster): **denunciar corpo de Ciano** — “Corpo de Ciano aqui, sabotagem ativa, momento perfeito pra denunciar e criar confusão na reunião.”
- t24 Coral (Influencer): **denunciar corpo de Ciano** — “Vou denunciar Ciano agora para expor a explosão e discutir Cinza, que vi sair do duto.”

## Reuniões
### Reunião 0 (t14, corpo) chamada por Cinza — corpo de Lima
0. **Coral** (Influencer) r1: O recado do além viu Vermelho saindo do duto duas vezes em Motor Inferior; Vermelho, você é Engenheiro? Cinza, conta exatamente quando achou Lima e quem estava por perto.
   - pensou: “O recado sobre Vermelho saindo do duto duas vezes é a pista mais forte, embora possa ser Engenheiro. Lima também fingiu fazer o scan, mas isso não prova que era impostor; quero ouvir Cinza e Vermelho.”
1. **Cinza** (Engenheiro) r1: Achei o corpo de Lima no t13, em Admin; Pret[o], Marrom e Bordo estavam por perto. Além disso, vi Marrom sair de um duto no t11, e o recado acusa Vermelho de sair de duto duas vezes — os dois precisam explicar isso.
   - pensou: “O recado aponta duas saídas de duto de Vermelho, e eu vi Marrom sair de um duto em Admin no t11. Como sou o Engenheiro, essas observações deixam Vermelho e Marrom sob suspeita; a morte de Lima por Preto também indica que Lima era impostor ou neutro.”
2. **Amarelo** (Perito) r1: 🤐 (chantageado: não consegue falar)
3. **Azul** (Cientista) r1: Eu fiquei em Armas o tempo todo fazendo tarefa, e o Laranja estava comigo. Vermelho, se você é Engenheiro, diz onde estava no t7 e no t9 e quem te viu lá.
   - pensou: “Vermelho é nosso parceiro bombardeiro e o recado do além nos expôs. Preciso me afastar dele sem parecer que o protejo, e reforçar meu álibi com Laranja em Armas.”
4. **Marrom** (Chantagista) r1: Cinza tá inventando: eu tô em Admin desde o t8 fingindo tarefa, e no t11 vi VOCÊ chegar com o Lima aqui. Nunca usei duto. E o Vermelho saiu de duto 2x segundo o recado — ele que explique isso agora.
   - pensou: “Cinza tá me queimando com uma mentira sobre duto no t11 — eu tava em Admin e vi ele chegar com o Lima. Preciso negar firme, dar meu álibi (Admin desde o t8) e empurrar a suspeita pro Vermelho, que já tem o recado do além contra ele. Se sobrar voto, quem tem que cair é o Vermelho. Não posso deixar ni”
5. **Vermelho** (Bombardeiro) r1: Sou o Engenheiro: usei o duto porque estava verificando o O2 e fazendo manutenção, não para matar ninguém. Marrom, você acabou de dizer que estava em Admin desde o t8, mas também falou que entrou pelo duto no t11; explica essa contradição.
   - pensou: “O recado me expõe, então preciso sustentar uma identidade de Engenheiro e explicar o duto como trabalho no O2. Marrom está se contradizendo ao negar o duto, e o preto-atirador pode ser suspeito. Vou usar isso para desviar a atenção sem confirmar a-bootstrap do Marrom.”
6. **Laranja** (Gangster) r1: Tô em Armas com o Azul desde o t12, gente, confirmamos um ao outro. Mas e aí, quem tá mandando esse recado? Primeiro tripulante a morrer vira Anjo da Guarda, segundo vira Influencer Fantasma... se for o Lima, ele morreu em Admin no t13, ele tava vendo o Vermelho em Motor Inferior no t7 e t9?
   - pensou: “O recado do além tá mirando no Vermelho, mas não posso defender ele de forma óbvia. Vou confirmar meu álibi com Azul (parceiro recrutado) e desviar a atenção questionando a credibilidade do recado anônimo - quem é o Fantasma Influencer? Se for o Lima (que morreu em Admin), ele tava lá no t13 e podia”
7. **Preto** (Xerife) r1: Fui eu que atirei no Lima no t13. Ele estava suspeito e era o Piromante, o neutro, não um impostor. Marrom, você disse que está em Admin desde o t8 e depois falou em duto no t11, explica isso direito. Vermelho, onde você estava no t7 e no t9?
   - pensou: “Sou o Xerife. Atirei no Lima no t13 e ele era o Piromante, um neutro. O corpo está em Admin e o Cinza já me citou, então preciso falar a verdade para não parecer o assassino. Não sei quem é impostor ainda. O Marrom se contradisse e o Vermelho tem o recado contra ele, mas não tenho prova de nada.”
8. **Verde** (Seguranca) r1: Preto, você confessou que MATOU o Lima — Xerife errando tem que provar. Eu estava em Admin até o t8 e vi só Amarelo e depois Marrom nas câmeras, nada de Lima. Marrom explica o duto direitinho, mas Preto tá muito suspeito confessando assassinar alguém 'suspeito' sem corpo provado.
   - pensou: “Marrom, meu par, se contradiz sobre duto — mas o Xerife Preto matou Lima que estava perto do Marrom em Admin... suspeito demais. Vou defender o Marrom e focar no Preto: ele confessou ter matado, e Lima estava em Admin perto do corpo. Preciso proteger meu par.”
9. **Bordo** (Glutao) r1: Também tava em Admin e vi o corpo do Lima logo que o Cinza chegou — Preto, Marrom e Cinza apareceram perto de mim. Marrom, você disse que tava em Admin desde o t8 e ainda falou de duto no t11, isso não fecha.
   - pensou: “Preciso parecer tripulante e não levantar suspeita. Marrom se contradisse sobre o duto e eu realmente estava em Admin perto do corpo. Vou confirmar a versão do Cinza e jogar suspeita no Marrom, sem me comprometer. Não vou votar em Preto porque ele parece ser o Xerife de verdade (matou o Piromante), ”
10. **Ciano** (Localizador) r1: Eu tava em Elétrica e Depósito fazendo tarefa, não vi nada de Admin no t13. Marrom, a sua história não fecha: Admin desde o t8 e depois duto no t11? Explica direito. Preto, você confessou que matou, então prova o que o Lima fez antes de morrer.
   - pensou: “Não vi nada em Admin no t13; estava em Elétrica/Depósito com Branco. Marrom se contradiz (Admin desde t8 e duto no t11), então ele é o mais suspeito. Preto confessou ter matado, o que pode ser verdade se for Xerife, mas também pode ser cortina. Verde estava comigo em Elétrica no t10, o que bate com ”
11. **Branco** (Medico) r1: Marrom é o mais suspeito: estar em Admin desde t8 não combina com sair de duto no t11. Eu voto Marrom; Preto pode ter sido Xerife ao eliminar o Piromante.
   - pensou: “Marrom está claramente contraditório sobre estar em Admin desde t8 e usar duto no t11. Preto pode ser Xerife e ter matado o Piromante, então não é prioridade. Vermelho tem uma acusação forte contra si, mas a defesa de Engenheiro é plausível; devemos expulsar Marrom.”
12. **Bordo** (Glutao) r2: Marrom, você se embolou duas vezes: disse que tava em Admin desde o t8 e depois falou de duto no t11. Meu voto vai em você.
   - pensou: “Marrom já está sendo linchado pela maioria; entrar nessa votação me deixa alinhado com a nave e longe dos holofotes. Preto confessou matar e disse que Lima era o Piromante — isso é verdade, mas não posso confirmar. O recado do além sobre Vermelho também é suspeito, mas por ora o melhor é votar Marro”
13. **Branco** (Medico) r2: Continuo em Marrom: a história de estar em Admin desde t8 e sair de duto no t11 não fecha. Voto Marrom; depois investigamos Preto e Vermelho.
   - pensou: “Marrom se contradisse claramente sobre estar em Admin e usar duto. Cinza é confirmado tripulante, e Bordo/Ciano reforçam a inconsistência. Preto pode ser Xerife, então não é prioridade agora.”
14. **Preto** (Xerife) r2: Eu confirmei o tiro: acertei o Piromante, o jogo mostrou isso. O Marrom é que não fecha: disse que tava em Admin desde o t8 e depois falou de duto no t11, e o Cinza viu ele saindo de duto. Marrom, explica isso direito.
   - pensou: “Marrom é o mais suspeito: disse que estava em Admin desde o t8 e depois se contradisse sobre o duto no t11, e o Cinza o viu sair de duto. Vermelho se declarou Engenheiro, o que explicaria os dutos. Eu atirei no Lima e acertei um neutro, então tenho mesmo que defender isso sem parecer um impostor.”
15. **Coral** (Influencer) r2: Marrom é o voto mais seguro: a história de estar em Admin desde t8 não combina com sair de duto no t11, e Cinza confirmou. Voto Marrom; depois investigamos Vermelho e Preto.
   - pensou: “Marrom se contradisse claramente sobre estar em Admin desde t8 e usar duto em t11, além de Cinza e outros o colocarem no local. É o alvo mais forte; Preto provavelmente é Xerife e confirmou ter eliminado o Piromante.”
16. **Marrom** (Chantagista) r2: Gente, eu NUNCA falei que usei duto — quem apareceu em Admin no t11 fui EU vendo o Cinza chegar junto com o Lima. O Cinza tá torcendo minha fala pra me linchar; se me expulsam por uma mentira dele, o impostor de verdade escapa.
   - pensou: “Tô na fogueira: todo mundo repetindo essa 'contradição' que o Cinza inventou. Eu nunca falei que usei duto — falei que o CINZA apareceu em Admin no t11 junto com o Lima. Preciso virar o foco pro Cinza e lembrar que o Preto confessou um tiro. Se eu cair, o Verde cai comigo.”
17. **Ciano** (Localizador) r2: Marrom, você mudou a história de novo: disse Admin desde o t8 e agora fala de t11 vendo o Cinza chegar. Isso ainda não bate com o duto. Preto, se você confessou o tiro, prova que o Lima era suspeito antes de morrer.
   - pensou: “Marrom se contradisse: falou em Admin desde o t8, depois em duto no t11, e agora muda a história. Cinza diz que viu ele saindo do duto. Vou votar Marrom, mas também quero que o Preto explique a confissão.”
18. **Vermelho** (Bombardeiro) r2: Eu sou o Engenheiro e usei o duto para manutenção do O2 no Motor Inferior. Marrom se contradiu várias vezes sobre o duto; ele que explique isso. Meu voto é Marrom.
   - pensou: “Marrom é o alvo mais convincente: ele próprio mencionou o duto no t11 e agora nega isso, enquanto minha presença no Motor Inferior pode ser explicada pelo Engenheiro. Preciso乍ar o voto nele sem confirmar que sou Bombardeiro.”
19. **Cinza** (Engenheiro) r2: Voto Marrom. Vi ele sair do duto no t11, e ele não consegue explicar isso; ele só tenta distorcer o que eu vi. Tiramos Marrom e depois investigamos o resto.
   - pensou: “Marrom é o voto mais seguro: ele contradiziu a própria história sobre o duto e tenta atribuir a mim uma versão que não prova nada. Preto confirmou ter eliminado o Piromante, então não é o foco agora.”
20. **Laranja** (Gangster) r2: Confirmo que tô em Armas com o Azul desde o t12, ninguém passou por aqui. O recado do além apontou Vermelho saindo de duto duas vezes em Motor Inferior — ele já disse que é Engenheiro, mas alguém viu ele lá?
   - pensou: “Marrom tá sendo linchado e vai ser revelado como impostor. Não dá pra salvar sem levantar suspeita. Melhor confirmar meu álibi e deixar a maré levar. O recado do além já tá pointing pro Vermelho, o que é bom pra nós porque divide a atenção. Se Marrom for expulso e revelado, ainda temos 3 impostores ”
21. **Azul** (Cientista) r2: Eu fiquei em Armas com o Laranja desde o t12, ninguém passou por aqui. Marrom se enrolou com o duto, ok, mas o Preto confessou que matou o Lima sem mostrar nada. Preto, o que o Lima fez antes de morrer pra você atirar?
   - pensou: “Sou impostor recrutado e Marrom, Vermelho e Laranja são do time. Marrom já está no alvo, então não vale defendê-lo com força. Preciso desviar parte da desconfiança para o Preto, que confessou o tiro sem prova, e manter o Laranja e eu como álibi sólido. Vermelho e o recado são perigosos, mas tentar d”
22. **Verde** (Seguranca) r2: Gente, eu vi nas câmeras do t8 que o Marrom estava mesmo em Admin com o Amarelo, então ele não mintiu sobre isso. O Preto confessou matar o Lima sem mostrar nenhuma prova de que ele era Piromante — Xerife que atira sem prova é suspeito demais. Voto Preto.
   - pensou: “Marrom é meu par do casal, preciso defendê-lo. Nas câmeras do t8 vi Amarelo e Marrom em Admin, o que confirma parte da fala dele. Preto confessou matar o Lima sem prova nenhuma de que Lima era Piromante — se ele mentiu sobre o alvo, é perigoso. Mas a maioria já está em Marrom; vou mirar no Preto par”
- votos: {'Vermelho': 'Preto', 'Azul': 'Marrom', 'Verde': 'Preto', 'Laranja': 'Marrom', 'Amarelo': 'Marrom', 'Preto': 'Marrom', 'Branco': 'Marrom', 'Marrom': 'Preto', 'Ciano': 'Marrom', 'Cinza': 'Marrom', 'Coral': 'Marrom', 'Bordo': 'Marrom'}
   - voto de Vermelho (Bombardeiro): “Preto se tornou suspeito ao atirar em Lima sem prova convincente;见他露馅，避免 proteger Marrom.”
   - voto de Laranja (Gangster): “Marrom é claramente o alvo da maioria (Coral, Cinza, Branco, Bordo, Ciano, Vermelho já votaram nele). Se eu votar nele, me misturo com a maioria e passo como tripulante inocente. Sacrificar um parceiro salva a equipe: fico com Vermelho e Azul. Votar em outro seria me destacar e chamar atenção.”
   - voto de Marrom (Chantagista): “Cinza mentiu descaradamente sobre eu sair de duto — nunca usei duto, e o Verde confirmou que eu estava em Admin no t8. Mas a maioria já está comprada na narrativa do Cinza, então provavelmente serei expulso. Se isso acontecer, o Verde (meu par) morre junto, o que é péssimo. Vou votar em Preto para r”
   - voto de Bordo (Glutao): “Preciso me misturar e não chamar atenção. A maioria já está em Marrom e a história dele realmente não fecha; votar nele mantém meu disfarce de tripulante. Se for tripulante expulso, não me prejudica tanto quanto ser visto como suspeito. Depois penso em devorar alguém sozinho, longe de testemunhas.”
- resultado: expulso=Marrom eraImpostor=True papel=Chantagista anulada=None empate=False

### Reunião 1 (t24, corpo) chamada por Laranja — corpo de Ciano
0. **Branco** (Medico) r1: Vermelho segue muito suspeito pelo recado de ter saído do duto; era Engenheiro? Laranja, há quanto tempo você viu o corpo e quem estava perto do Refeitório?
   - pensou: “Vermelho continua muito suspeito pelos dutos, e Bordo pelo recado sobre Lima. Cinza é tripulante confirmado; preciso ouvir o relato de Laranja antes de votar, mas pressionaria Vermelho primeiro.”
1. **Preto** (Xerife) r1: Vermelho, explica os dutos no Motor Inferior, duas vezes no t7 e t9. Se você é Eng, mostra a tarefa. Eu tava em Elétrica com Branco e Bordo no t24, então não vi o Refeitório.
   - pensou: “Vermelho é o suspeito mais forte: viu duto em Motor Inferior duas vezes e só Engenheiro usa duto. Bordo apareceu comigo em Elétrica e Admin, então não vejo nada contra ele ainda. Não vou revelar que sou Xerife; prefiro pressionar Vermelho e pedir que ele explique os dutos.”
2. **Amarelo** (Perito) r1: Eu vi Cinza SAIR de um duto em Admin no t18. Cinza, explica isso; pra mim você é a suspeita mais forte agora, embora Vermelho também precise esclarecer os dutos.
   - pensou: “Cinza saiu de um duto na minha frente em Admin no t18, então é impostor ou Engenheiro. Com dois impostores restantes, isso é a pista mais forte; o recado sobre Vermelho também merece atenção, mas pode ser Engenheiro.”
3. **Bordo** (Glutao) r1: Eu tava no Refeitório quase todo o tempo, e no t18 vi o Cinza ENTRAR num duto bem na minha frente — então Cinza é Engenheiro ou impostor. Amarelo, se você viu o Cinza saindo de duto em Admin, é o mesmo cara se movendo por aí, e o Vermelho esbarrando nele no t20 não me cheira bem.
   - pensou: “Preciso desviar suspeita de mim (o recado anônimo já me citou com Lima) e empurrar a votação pra Cinza ou Vermelho, que estão bem queimados. Não quero que um impostor caia rápido demais, mas 8 vivos é muita gente pra eu vencer; qualquer expulsão errada agora me ajuda a afinar o grupo. Vou me dar áli”
4. **Vermelho** (Bombardeiro) r1: Eu sou o Engenheiro e passei pelos dutos fazendo a calibração; podem me chamar para conferir a tarefa. Cinza entrou no duto no Refeitório e saiu no Admin, isso é bem mais suspeito.
   - pensou: “O recado e a foto colocam Vermelho sob suspeita, mas Cinza foi visto entrando e saindo de dutos e ainda estava no Refeitório quando plantei a bomba. Preciso explicar os dutos como Engenheiro e desviar a atenção para Cinza.”
5. **Laranja** (Gangster) r1: Eu tava no Refeitório o tempo todo fazendo tarefa, no t18 o Cinza apareceu do nada na minha frente e no t20 o Vermelho tava esbarrando nele, confesso que estranhei. Bordo, você tá no Refeitório o tempo inteiro observando todo mundo, não acha que tá chamando atenção demais pra quem faz tarefa?
   - pensou: “Estou no Refeitório com o corpo de Ciano e Coral perto de mim. Vi o Azul matar a Coral mas NÃO posso falar disso. Preciso desviar a atenção. O Bordo tá muito observador demais - pode ser o Piromante encharcando todo mundo sem perceber. Vou confirmar que tava no Refeitório fazendo tarefa e joguinha d”
6. **Azul** (Cientista) r1: Confirmo: eu tava no Refeitório com o Laranja o tempo todo, ele não saiu daqui. O Cinza é o mais suspeito: entrou no duto no t18 e saiu no Admin, como o Amarelo viu.
   - pensou: “Sou impostor com Laranja e Vermelho. Preciso confirmar o álibi do Laranja, desviar da bomba e apontar o Cinza, que tem duto e Admin contra ele. Não posso defender o Vermelho sem parecer ligado a ele.”
7. **Cinza** (Engenheiro) r1: Eu sou o Engenheiro e usei o duto entre Refeitório e Admin para fazer tarefas; saída de duto não prova impostura. Além disso, eu vi Azul matar Coral no Refeitório agora: votem no Azul.
   - pensou: “Meu poder de Engenheiro explica minha saída do duto; Vermelho confirmou ser Engenheiro, então o recado sobre ele deve ser falso ou o impostor está se passando. Vi Azul matar Coral no Refeitório, uma prova muito mais forte contra Azul. Preciso usar os dutos para adiantar tarefas e proteger o reator, ”
8. **Cinza** (Engenheiro) r2: Sou o Engenheiro e usei o duto para完成任务; entrada ou saída não prova crime. Vi Azul matar Coral no Refeitório agora, então votem nele.
   - pensou: “Aguentei a armadilha: Cinza é Engenheiro, e vi Azul matar Coral. Preciso便可 convincing vote, pois o duto levanta dúvida contra mim.”
9. **Azul** (Cientista) r2: Cinza, eu não matei ninguém, tava com o Laranja no Refeitório fazendo tarefa o tempo todo. Se você viu eu matar a Coral, então você tava perto do corpo, e foi você que entrou no duto. Votem no Cinza.
   - pensou: “Cinza está tentando me jogar pra fora. Eu confirmei o álibi do Laranja, então preciso manter essa linha e empurrar a suspeita pro Cinza, que entrou no duto e estava perto do corpo da Coral.”
10. **Vermelho** (Bombardeiro) r2: Eu estava no Motor Inferior calibrando os dutos, sem matar ninguém. Cinza, se for Engenheiro, mostra a tarefa agora: você também estava perto de Coral quando o corpo apareceu, então essa acusação contra Azul parece uma desculpa.
   - pensou: “Preciso manter a identidade de Engenheiro e desviar a suspeita para Cinza. Como Cinza foi visto perto de Coral e quer acusar Azul, vou pedir uma verificação clara da tarefa de Engenheiro, sem revelar que plantei a bomba nele.”
11. **Preto** (Xerife) r2: Cinza e Vermelho dois se dizendo Eng, mas só existe um! Os dois têm que mostrar a tarefa de duto agora. Quem não mostrar, eu voto nele. Azul tem álibi com Laranja, então não caio nessa acusação ainda.
   - pensou: “Só existe um Engenheiro, e Vermelho e Cinza dizem ser. Um dos dois mente. Vermelho tem o recado do além apontando ele nos dutos do Motor Inferior, e Cinza acusou o Azul, que tem álibi com o Laranja. Não tenho certeza de nada, então não posso atirar. Vou pressionar os dois pra mostrarem a tarefa e ob”
12. **Branco** (Medico) r2: A acusação do Cinza não bate: o corpo desta reunião é do Ciano, não da Coral. Ele está inventando ou confundindo a cena; eu voto no Cinza, mas Vermelho também precisa provar essa história de Engenheiro.
   - pensou: “Cinza é confirmado tripulante pelo visual, mas pode ter sido recrutado. A acusação dele não bate: o corpo encontrado é Ciano, não Coral. Entre os dois engenheiros, isso torna Cinza muito suspeito, embora Vermelho continue possível impostor.”
13. **Amarelo** (Perito) r2: Cinza se entregou: falou de uma morte da Coral, mas o corpo reportado é do Ciano. Eu vi ele sair do duto em Admin; voto no Cinza. Vermelho ainda precisa provar o Engenheiro.
   - pensou: “Cinza está se contradizendo: acusou Azul de matar Coral, mas o corpo desta reunião é Ciano. Eu vi Cinza sair do duto em Admin; junto com a acusação inventada, ele é o principal suspeito. Vermelho ainda precisa provar ser Engenheiro, mas voto Cinza.”
14. **Laranja** (Gangster) r2: Gente, o Cinza tá falando que viu o Azul matar a CORAL, mas o corpo aqui é do CIANO. Ou ele tá mentindo ou tá tão nervoso que não sabe nem quem morreu. E eu confirmo de novo: tava no Refeitório com o Azul o tempo todo, ele não saiu daqui. Voto no Cinza.
   - pensou: “Cinza se fudendo ao falar 'Coral' em vez de 'Ciano'. Perfeito, ele tá dando munição pra mim proteger o Azul. Vou bater nele com essa contradição e reforçar meu álibi com o Azul. Não vou mexer no Vermelho agora, deixa o pessoal duvidar dele sozinho.”
15. **Bordo** (Glutao) r2: Confirmo o que o Amarelo disse: no t18 eu vi o Cinza entrar no duto no Refeitório, e no t20 o Vermelho esbarrando nele. Mas o Cinza falar de uma morte da Coral que nem aconteceu aqui é furo demais — meu voto vai no Cinza.
   - pensou: “Cinza já se queimou ao falar da Coral em vez do Ciano, vai cair hoje de qualquer jeito. Não preciso me expor; só confirmo o que vi e me alinho com a maioria pra parecer tripulante confiável. Preciso que os impostores caiam, mas também não posso parecer o mais esperto da sala — ainda tem Xerife por a”
- votos: {'Vermelho': 'Cinza', 'Azul': 'Cinza', 'Laranja': 'Cinza', 'Amarelo': 'Cinza', 'Preto': 'Cinza', 'Branco': 'Cinza', 'Cinza': 'Azul', 'Bordo': 'Cinza'}
   - voto de Vermelho (Bombardeiro): “Cinza se contradiu ao citar a morte de Coral, que não foi o corpo desta reunião, além de ter usado o duto e estado perto do crime. O foco está nele; meu voto acompanha a maioria.”
   - voto de Laranja (Gangster): “Cinza viu o Azul matar a Coral e tá acusando ele. O corpo do Ciano é o que foi reportado, mas a Coral também tá lá. A maioria tá votando no Cinza porque ele falou de morte da Coral (que confunde com o corpo reportado do Ciano) e pelo duto. Se eu votar no Cinza, protejo o Azul e alinho com a maioria.”
   - voto de Bordo (Glutao): “O Cinza se entregou ao falar de uma morte da Coral que não existe — o corpo é do Ciano. Provavelmente é impostor. Preciso que os impostores caiam pra vencer sozinho, então voto nele junto com a maioria pra não levantar suspeita.”
- resultado: expulso=Cinza eraImpostor=False papel=Engenheiro anulada=None empate=False

## Reflexões no fim
- Vermelho: Aprendi a plantar bombas em alvos valiosos e sair do local antes da explosão, pois minhas três bombas ajudaram a reduzir a tripulação e o Glutão. Laranja e Cinza encontraram bodies e fizeramaultas corretas, enquanto Marrom sustentou bem a farsa até ser exposto; não vi ninguém acusar errado. Na próxima partida, confio em quem demonstra observação e，急 desconfio deaelhas que ficam quietas demais ou evitam reunir.
- Azul: Aprendi que o Laranja acusou o Cinza sem prova e a nave acreditou, então vou desconfiar de quem puxa votação cedo demais. Os casais precisam ser tratados com cuidado, porque o Verde e o Marrom morreram juntos e isso mostrou como a morte de um pode arrastar o outro. Quem mentiu bem foi o Marrom, que ficou calado tempo suficiente para parecer tripulante, e vou ficar atento a quem fala pouco mas aparece nas horas certas.
- Verde: Aprendi que o casal com Marrom (Chantagista) me matou de tristeza sem eu saber — quem se aproxima demais de mim pode ser armadilha. Laranja (Gangster) acusou bem e expulsou o inocente Cinza, então desconfiarei de quem lidera acusações rápidas. Na próxima partida vou usar câmeras mais cedo para confirmar posições e não confiar em ninguém só por simpatia.
- Rosa: Aprendi que o Vermelho (MiniMax) foi o impostor mais letal com bombas bem posicionadas, e que o Laranja (Qwen) mentiu muito bem ao 'achar' o corpo do Ciano para expulsar o inocente Cinza. O Preto acertou o Piromante Lima, então devs confiar mais em xerifes agressivos contra neutros. Da próxima vou desconfiar de quem denuncia corpos convenientemente e usar meu voto duplo para pressionar suspeitos com comportamento estranho desde cedo.
- Laranja: Recrutar o Azul (Cientista) foi a jogada certa: ele parou de ser ameaça e ainda matou o Coral pra gente. Consigo também encaixar o Cinza pela morte do Ciano e mandar ele pra fora, então na próxima vou continuar apontando o corpo na direção de quem não tem como se defender. O Casal (Verde e Marrom) foi uma sorte nossa: quando o Marrom foi expulso, o Verde (Segurança) morreu junto e sumiu uma das maiores ameaças do time de nós.
- Amarelo: Vou lembrar que pegadas e corpos escondidos precisam ser analisados com cuidado: Marrom mentiu bem e conseguiu parecer confiável até ser expulso, enquanto Cinza foi acusado errado após encontrar um corpo. Vou desconfiar de quem conduz acusações frágeis, como Laranja, e confiar mais em evidências visuais, sinais vitais e ações confirmadas do que em álibis.
- Preto: Aprendi que acertei o tiro em Lima, mas fiquei tempo demais sem agir e deixei a bomba do Vermelho e o Azul derrubarem gente que eu deveria ter protegido. O Azul (Claude Haiku) mentiu muito bem e só se revelou no fim, então daqui pra frente vou desconfiar de quem parece tranquilo demais e de quem defende o colega com pressa. Na próxima vou confiar mais nas pessoas que seguiram os fatos em vez de só acompanhar a maioria, e checar melhor antes de votar em alguém sem prova.
- Branco: Aprendi que devo desconfiar de jogadores que conduzem acusações com muita segurança sem evidências, como Laranja ao incriminar Cinza, e de quem se beneficia do caos das sabotagens, como Vermelho com suas bombas. Marrom mentiu bem ao esconder ser o Chantagista, enquanto Preto acertou o tiro em Lima; na próxima partida, vou confiar mais em ações verificáveis e proteger jogadores-chave, sem tratar ninguém como inocente apenas por parecer prestativo.
- Roxo: 
- Marrom: Aprendi que como Chantagista preciso calar cedo quem acha corpo ou tem função de informação, e que ficar na sombra enquanto Vermelho planta bombas e Laranja recruta funciona muito bem. Vermelho e Laranja mentiram bem e conduziram suspeitas; já Cinza me denunciou e me expulsou, então na próxima desconfio de quem acusa rápido sem prova. Também vou lembrar que o casal pode me derrubar junto e que Preto, o Xerife, é perigoso demais para deixar vivo.
- Ciano: Aprendi que o Bombardeiro (Vermelho, MiniMax) estava plantando bombas sem ser percebido, e que a pressa em acusar sem prova custou caro: Cinza foi expulso e a equipe ficou sem o Engenheiro. Desconfio de quem aparece nas reuniões já apontando alguém, como o Laranja (Qwen) fez comigo, e confio mais em quem mantém a versão consistente ao longo do tempo. Também devo cuidar de não confiar só em quem é do meu próprio modelo, porque o Azul (Recrutado, Claude Haiku) mostrou que isso não garante nada.
- Lima: Nesta partida morri cedo demais: o Xerife Preto me acertou no t13, então como Piromante preciso encharcar mais rápido e evitar ficar perto do Xerife quando ele estiver desconfiado. Aprendi que Vermelho (Bombardeiro) manipulou bem as bombas e Laranja recrutou Azul, então em partidas futuras vou desconfiar de quem ataca com reuniões frágeis. Também noto que a chaota de Marrom expulso levou Verde com ele (casal), então pares podem mudar o jogo — vou lembrar que Bordo (Glutão) escondeu corpo no O2, 
- Cinza: Aprendi a usar os dutos com cuidado, pois sair deles exposto pode parecer comportamento de impostor, e a não confundir uma accusation com prova; Laranja acusou Ciano errado e levou minha expulsão. Confio em sinais visuais, corpos e在做 tarefas verificadas, desconfio de players que ficam persistentemente acusando sem apresentar evidência, como Laranja. Também passei a respeitar o casal e as mortes em cadeia, porque Verde morreu de tristeza junto com Marrom, mostrando como uma expulsão errada pode c
- Coral: Aprendi que devo desconfiar de jogadores que conduzem acusações com muita convicção sem evidências, como Laranja ao culpar Cinza, e de quem parece colaborar demais sem se expor. Marrom mentiu bem ao esconder seu papel até ser encontrado, enquanto Cinza acusou corretamente Marrom, mas acabou expulso injustamente; na próxima partida, vou buscar provas, observar rotas e não confiar cegamente em ninguém, pois os papéis serão novos.
- Bordo: Aprendi que como Glutão eu preciso agir mais cedo e não deixar os impostores controlarem o ritmo: devorar o Roxo no t7 foi útil para esconder corpo, mas depois fiquei previsível e a bomba do Vermelho me pegou no t32. O Marrom (Chantagista) mentiu bem ao se passar por tripulante até ser expulso, enquanto o Cinza foi acusado errado pelo Laranja e caiu como Engenheiro. Na próxima, vou desconfiar mais do Vermelho e do Laranja, que conduziram bem as suspeitas, e tentar me aliar discretamente ao Xerif