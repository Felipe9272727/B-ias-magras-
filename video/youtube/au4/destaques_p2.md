# Partida 2 — resultado: {'time': 'tripulante', 'motivo': 'Todas as tarefas foram concluídas.', 'tique': 73, 'casalVivo': True, 'sobrevivente': ['Roxo']}

## Elenco
- Vermelho: Cientista (tripulante) — MiniMax M3.1 Flash
- Azul: Localizador (tripulante) — Claude Haiku
- Verde: Mecanico (tripulante) — GLM 5.3 Flash
- Rosa: Faxineiro (impostor) — GLM 5.3 Flash
- Laranja: Armador (tripulante) — Qwen 3.8 27B
- Amarelo: Canibal (neutro) — GPT-5.6 Luna
- Preto: Apostador (impostor) — Claude Haiku
- Branco: Prefeito (tripulante) — GPT-5.6 Luna
- Roxo: Sobrevivente (neutro) — Qwen 3.8 27B
- Marrom: Xerife (tripulante) — DeepSeek Flash
- Ciano: Perito (tripulante) — Claude Haiku
- Lima: Influencer (tripulante) — GLM 5.3 Flash
- Cinza: Detetive (tripulante) — MiniMax M3.1 Flash
- Coral: Chantagista (impostor) — GPT-5.6 Luna
- Bordo: Barulhento (tripulante) — DeepSeek Flash

## Linha do tempo (eventos)
- t2 **poder** {"cor": "Vermelho", "poder": "vitais", "mortos": []}
- t4 **poder** {"cor": "Azul", "poder": "rastrear", "alvo": "Verde"}
- t4 **chantagem** {"cor": "Coral", "alvo": "Lima"}
- t7 **sabotagem** {"cor": "Coral", "subtipo": "Luzes"}
- t7 **poder** {"cor": "Roxo", "poder": "colete", "ate": 10}
- t7 **poder** {"cor": "Ciano", "poder": "pegadas", "sala": "MotorInferior", "quem": ["Laranja"]}
- t7 **duto** {"cor": "Rosa", "aparente": "Rosa", "de": "Navegacao", "para": "Escudos"}
- t8 **morte** {"assassino": "Preto", "aparente": "Preto", "vitima": "Amarelo", "sala": "Refeitorio"}
- t8 **duto** {"cor": "Rosa", "aparente": "Rosa", "de": "Escudos", "para": "Navegacao"}
- t8 **conserto** {"por": ["Lima"], "subtipo": "Luzes"}
- t9 **duto** {"cor": "Rosa", "aparente": "Rosa", "de": "Navegacao", "para": "Escudos"}
- t9 **foto** {"cor": "Lima", "sala": "Eletrica"}
- t9 **reuniao** {"chamador": "Roxo", "corpo": "Amarelo", "sala": "Refeitorio", "subtipo": "corpo"}
- t9 **fim_reuniao** {"expulso": "Preto", "eraImpostor": true, "empate": false, "anulada": null, "papel": "Apostador"}
- t10 **poder** {"cor": "Roxo", "poder": "colete", "ate": 13}
- t10 **chantagem** {"cor": "Coral", "alvo": "Roxo"}
- t11 **poder** {"cor": "Vermelho", "poder": "vitais", "mortos": ["Amarelo", "Preto"]}
- t12 **poder** {"cor": "Azul", "poder": "rastrear", "alvo": "Rosa"}
- t13 **poder** {"cor": "Verde", "poder": "tapar_duto", "sala": "Enfermaria"}
- t14 **duto** {"cor": "Coral", "aparente": "Coral", "de": "Admin", "para": "Refeitorio"}
- t16 **poder** {"cor": "Ciano", "poder": "pegadas", "sala": "Refeitorio", "quem": ["Rosa", "Branco", "Roxo", "Vermelho", "Azul", "Lima", "Coral"]}
- t16 **sabotagem** {"cor": "Coral", "subtipo": "Luzes"}
- t17 **conserto** {"por": ["Cinza"], "subtipo": "Luzes"}
- t18 **duto** {"cor": "Coral", "aparente": "Coral", "de": "MotorSuperior", "para": "Reator"}
- t19 **duto** {"cor": "Coral", "aparente": "Coral", "de": "Reator", "para": "MotorSuperior"}
- t20 **poder** {"cor": "Vermelho", "poder": "vitais", "mortos": ["Amarelo", "Preto"]}
- t20 **duto** {"cor": "Coral", "aparente": "Coral", "de": "MotorSuperior", "para": "Reator"}
- t21 **poder** {"cor": "Azul", "poder": "rastrear", "alvo": "Rosa"}
- t22 **duto** {"cor": "Coral", "aparente": "Coral", "de": "Seguranca", "para": "Eletrica"}
- t23 **sabotagem** {"cor": "Coral", "subtipo": "Luzes"}
- t24 **conserto** {"por": ["Coral"], "subtipo": "Luzes"}
- t25 **poder** {"cor": "Vermelho", "poder": "vitais", "mortos": ["Amarelo", "Preto"]}
- t25 **poder** {"cor": "Ciano", "poder": "pegadas", "sala": "Eletrica", "quem": ["Vermelho", "Roxo", "Lima", "Coral"]}
- t29 **poder** {"cor": "Verde", "poder": "tapar_duto", "sala": "Admin"}
- t30 **poder** {"cor": "Ciano", "poder": "pegadas", "sala": "Admin", "quem": ["Verde", "Coral", "Cinza"]}
- t30 **poder** {"cor": "Azul", "poder": "rastrear", "alvo": "Rosa"}
- t30 **sabotagem** {"cor": "Coral", "subtipo": "Reator"}
- t30 **poder** {"cor": "Vermelho", "poder": "vitais", "mortos": ["Amarelo", "Preto"]}
- t32 **conserto** {"por": ["Laranja", "Branco"], "subtipo": "Reator"}
- t34 **foto** {"cor": "Lima", "sala": "Reator"}
- t35 **duto** {"cor": "Coral", "aparente": "Coral", "de": "Armas", "para": "Navegacao"}
- t36 **duto** {"cor": "Coral", "aparente": "Coral", "de": "Navegacao", "para": "Armas"}
- t36 **poder** {"cor": "Vermelho", "poder": "vitais", "mortos": ["Amarelo", "Preto"]}
- t37 **duto** {"cor": "Coral", "aparente": "Coral", "de": "Armas", "para": "Navegacao"}
- t38 **sabotagem** {"cor": "Coral", "subtipo": "Luzes"}
- t38 **poder** {"cor": "Verde", "poder": "tapar_duto", "sala": "Navegacao"}
- t39 **poder** {"cor": "Ciano", "poder": "pegadas", "sala": "Reator", "quem": ["Vermelho", "Laranja", "Branco", "Roxo", "Marrom", "Cinza", "Bordo"]}
- t40 **poder** {"cor": "Azul", "poder": "rastrear", "alvo": "Coral"}
- t41 **fantasma_funcao** {"cor": "Verde", "funcao": "Anjo"}
- t41 **morte** {"assassino": "Rosa", "aparente": "Rosa", "vitima": "Verde", "sala": "Deposito", "escondido": true}
- t41 **limpeza** {"cor": "Rosa", "aparente": "Rosa", "corpo": "Verde", "sala": "Deposito"}
- t41 **conserto** {"por": ["Lima"], "subtipo": "Luzes"}
- t42 **poder** {"cor": "Verde", "poder": "escudo_anjo", "alvo": "Ciano"}
- t43 **poder** {"cor": "Vermelho", "poder": "vitais", "mortos": ["Verde", "Amarelo", "Preto"]}
- t48 **poder** {"cor": "Verde", "poder": "escudo_anjo", "alvo": "Coral"}
- t48 **sabotagem** {"cor": "Coral", "subtipo": "Reator"}
- t48 **poder** {"cor": "Vermelho", "poder": "vitais", "mortos": ["Verde", "Amarelo", "Preto"]}
- t48 **poder** {"cor": "Ciano", "poder": "pegadas", "sala": "Armas", "quem": ["Coral", "Marrom", "Bordo", "Lima"]}
- t51 **conserto** {"por": ["Coral", "Vermelho"], "subtipo": "Reator"}
- t52 **poder** {"cor": "Azul", "poder": "rastrear", "alvo": "Marrom"}
- t54 **poder** {"cor": "Verde", "poder": "escudo_anjo", "alvo": "Roxo"}
- t54 **poder** {"cor": "Ciano", "poder": "pegadas", "sala": "Reator", "quem": ["Vermelho", "Roxo", "Cinza", "Coral", "Azul", "Laranja", "Marrom", "Bordo", "Branco", "Lima"]}
- t55 **poder** {"cor": "Vermelho", "poder": "vitais", "mortos": ["Verde", "Amarelo", "Preto"]}
- t55 **portas** {"cor": "Coral", "sala": "O2", "ate": 59}
- t57 **sabotagem** {"cor": "Rosa", "subtipo": "Luzes"}
- t58 **conserto** {"por": ["Azul"], "subtipo": "Luzes"}
- t58 **poder** {"cor": "Ciano", "poder": "pegadas", "sala": "Reator", "quem": ["Roxo"]}
- t60 **poder** {"cor": "Verde", "poder": "escudo_anjo", "alvo": "Lima"}
- t60 **poder** {"cor": "Vermelho", "poder": "vitais", "mortos": ["Verde", "Amarelo", "Preto"]}
- t60 **poder** {"cor": "Azul", "poder": "rastrear", "alvo": "Marrom"}
- t62 **poder** {"cor": "Ciano", "poder": "pegadas", "sala": "Seguranca", "quem": []}
- t64 **sabotagem** {"cor": "Coral", "subtipo": "Luzes"}
- t65 **poder** {"cor": "Vermelho", "poder": "vitais", "mortos": ["Verde", "Amarelo", "Preto"]}
- t66 **poder** {"cor": "Verde", "poder": "escudo_anjo", "alvo": "Branco"}
- t66 **conserto** {"por": ["Roxo"], "subtipo": "Luzes"}
- t66 **poder** {"cor": "Ciano", "poder": "pegadas", "sala": "MotorInferior", "quem": []}
- t68 **poder** {"cor": "Azul", "poder": "rastrear", "alvo": "Laranja"}
- t70 **poder** {"cor": "Vermelho", "poder": "vitais", "mortos": ["Verde", "Amarelo", "Preto"]}
- t70 **poder** {"cor": "Ciano", "poder": "pegadas", "sala": "Reator", "quem": []}
- t70 **reuniao** {"chamador": "Cinza", "sala": "Refeitorio", "subtipo": "emergencia"}
- t70 **fantasma_funcao** {"cor": "Bordo", "funcao": "Influencer"}
- t70 **fim_reuniao** {"expulso": "Bordo", "eraImpostor": false, "empate": false, "anulada": null, "papel": "Barulhento"}
- t71 **chantagem** {"cor": "Coral", "alvo": "Cinza"}
- t72 **poder** {"cor": "Verde", "poder": "escudo_anjo", "alvo": "Vermelho"}
- t72 **recado** {"cor": "Bordo", "texto": "Eu virei fantasma na Eletrica t70. Estavam comigo: Azul, Lima, Cinza, Branco, Vermelho, Rosa, Marrom. O assassino e um deles. Bordo era inoc"}
- t73 **fim** {"time": "tripulante", "motivo": "Todas as tarefas foram concluídas.", "casalVivo": true, "sobrevivente": ["Roxo"]}
- tarefas visuais feitas: t4 Marrom (Escanear no MedBay), t6 Lima (Esvaziar o lixo), t7 Verde (Escanear no MedBay), t9 Cinza (Esvaziar o lixo), t13 Lima (Escanear no MedBay), t14 Ciano (Destruir asteroides), t20 Bordo (Esvaziar o lixo), t28 Bordo (Ativar os escudos), t39 Azul (Ativar os escudos), t46 Cinza (Ativar os escudos), t57 Lima (Destruir asteroides), t61 Vermelho (Ativar os escudos), t62 Cinza (Escanear no MedBay), t67 Laranja (Escanear no MedBay)

## Chat dos impostores
- t1 Coral: Vamos nos separar e evitar qualquer ação visível; observem quem fica isolado.
- t1 Preto: Sou o Apostador. Sem ação no tique 1, só fingindo tarefa. Rosa e Coral, fiquem quietos e sem gastar poder até a gente ler a sala.
- t1 Rosa: Tranquilos no início, Vós dois se espalhem e avisem quando tiver canto vazio pra eu limpar depois.
- t2 Coral: Fico no Admin fingindo tarefa; procurem áreas isoladas e avisem quando houver oportunidade.
- t2 Rosa: Aguardo recarga e procuro um alvo isolado. Coral, anota quem anda sozinho perto de Admin.
- t2 Preto: Fico no Refeitório fingindo tarefa. Rosa, avisa quando tiver canto vazio. Coral, cuidado no Admin, Roxo e Branco estão lá.
- t3 Coral: Vou para o Depósito; Branco e Roxo me viram, então evitem agir perto do Admin.
- t3 Rosa: Vou descer pro Depósito procurar isolado. Preto fica de álibi no Refeitório com o Vermelho.
- t3 Preto: Testemunhas no Refeitório (Vermelho e Lima). Não faço nada aqui. Rosa, avisa quando o Depósito ou o Armas ficar vazio.
- t4 Rosa: Preto, saí do Depósito rumo a Armas; Lima me viu com Coral aqui. Coral fica de olho, quando o Depósito esvaziar alguém retorna e a gente coordena.
- t4 Preto: Estou no Refeitório com testemunhas, sem agir. Rosa, espere o canto vazio; Coral, fique no Admin e avise se alguém ficar isolado.
- t4 Coral: Chantageei Lima; ele não poderá falar na próxima reunião. Evitem agir perto dele agora.
- t5 Coral: Vou para Escudos; Lima está chantageado e me viu aqui, então não ajo agora. Procurem alvo isolado.
- t5 Preto: Vermelho está perto de mim e vê tudo. Não vou agir aqui. Admin tem Branco e Roxo. Esperem um canto vazio e avisem.
- t6 Coral: Vou para O2; Rosa, procure um alvo isolado e Preto mantenha álibi.
- t6 Preto: Vermelho tá me vendo aqui no Refeitório, vou só fingir tarefa até sair limpo. Rosa, avisa quando o Depósito estiver vazio.
- t6 Rosa: Navegação vazia agora; se alguém vier sozinho, eu fecho. Coral, mantenha o Lima quieto.
- t7 Coral: Saboto as luzes de O2; vou seguir para Navegação e procurar um alvo isolado.
- t7 Rosa: Sem alvo isolado ainda; vou para Escudos limpo pelo duto, avisem se alguém ficar sozinho em Depósito ou Navegação.
- t7 Preto: Roxo me viu sozinho no Refeitório, não mato agora. Fico de álibi aqui e aviso quando houver canto vazio.
- t8 Preto: Matei o Amarelo no Refeitório sem testemunhas. Rosa e Coral, mantenham o álibi e não agam perto do Roxo agora.
- t8 Coral: Vou para Armas; se estiver vazio, procuro alvo e aviso.
- t8 Rosa: Coral, boa sabotagem. Vou caçar alvo isolado no escuro.
- t9 Rosa: Fui para Escudos pelo duto (Azul pode ter me visto sair). Preto, limpa o corpo do Amarelo? Sou o Faxineiro, posso some-lo se ninguém estiver perto.
- t9 Preto: Roxo me viu matar o Amarelo no Refeitório. Vou para Armas. Coral, se ele acusar, diga que estava com você na sabotagem de luzes.
- t9 Coral: Vou checar O2 em busca de alvo isolado; mantenha a Navegação limpa.
- t10 Rosa: Coral, Azul votou em mim, cuidado. Vou fingir tarefa aqui com testemunhas para lavar o nome. Procura alvo isolado longe de mim.
- t10 Coral: Silenciei Roxo; procure um alvo isolado e evite ser vista perto de mim.
- t11 Rosa: Coral, Preto caiu; dois votaram em mim (Azul e Branco). Preciso de álibi, se possível fique perto de mim numa reunião. Alvo isolado em Enfermaria?
- t11 Coral: Vou ao Admin; procure um alvo isolado longe de testemunhas.
- t12 Rosa: Sou Faxineiro, corpo some quando eu mato. Preto caiu, cuidado. Estou indo pro Depósito procurar alvo isolado; Coral, onde você está?
- t12 Coral: Vou para o Depósito; procure um alvo isolado e me avise se encontrar.
- t13 Coral: Vermelho está no Depósito comigo; não aja aqui. Vou sair para Admin.
- t14 Coral: Vou ao Refeitório pelo duto; avise se encontrar alguém isolado.
- t14 Rosa: Coral, sai do Depósito? Vou vasculhar aqui; se achar alguém sozinho, ajo.
- t15 Rosa: Branco está colado em mim no Depósito, não posso agir. Coral, se ele sair te aviso.
- t15 Coral: Estou saindo pelo Motor Superior; procure um alvo isolado no Depósito ou Navegação.
- t16 Rosa: Fiquei no Depósito limpando pista; se alguém vier sozinho, faço a jogada limpa.
- t16 Coral: Vou apagar as luzes e buscar um alvo isolado; fique longe daqui por enquanto.
- t17 Rosa: Luzes ativas, vou caçar no Depósito e sumir com o corpo. Fica longe daqui.
- t17 Coral: Matei Vermelho no Motor Superior durante as luzes; limpe se conseguir.
- t18 Coral: Vou para o Reator pelo duto; continue procurando um alvo isolado no Depósito.
- t18 Rosa: Depósito cheio (Roxo, Ciano, Bordo). Não posso agir aqui. Preciso de alvo isolado urgente.
- t19 Coral: Vou para Motor Superior pelo duto; procure um alvo isolado.
- t19 Rosa: Lima está colada em mim no Depósito, não posso agir. Coral, tenta atrair alguém isolado longe daqui.
- t20 Coral: Vou para o Reator pelo duto; procure uma vítima isolada no Depósito.
- t20 Rosa: Coral, estou caçando no Depósito; se achar alvo isolado aviso. Evite vir pra cá.
- t21 Coral: Vou para Segurança; evite agir no Depósito cheio e procure alguém isolado.
- t21 Rosa: Coral, não consigo matar aqui, Verde e Bordo estão colados em mim. Saí para Comunicações; se puder, venha dar álibi comigo ou sabote longe.
- t22 Rosa: 21 tiques sem agir, vou caçar alvo isolado em Escudos/Navegação. Sabotagem chega no próximo tique, podemos usar.
- t22 Coral: Vou para Elétrica pelo duto; mantenha álibi em Comunicações.
- t23 Coral: Sabotei as luzes; tente agir em Escudos ou Navegação enquanto todos correm para consertar.
- t23 Rosa: Bordo colado em mim em Escudos, não posso agir. Coral, segue o plano, achei nada isolado ainda.
- t24 Coral: Vou consertar as luzes na Elétrica; procure alvo isolado em Escudos ou Navegação.
- t24 Rosa: Luzes ativas, vou caçar alguém isolado em Escudos/Depósito. Se eu matar, limpo o corpo na hora.
- t25 Coral: Estou na Elétrica com Roxo; não ajo agora. Procure alvo isolado longe daqui.
- t25 Rosa: Estou indo pra Comunicações atrás de alvo isolado. Se matar, já limpo o corpo.
- t26 Coral: Estou saindo da Elétrica; tenta achar um alvo isolado em Comunicações.
- t26 Rosa: Rosa indo ao Depósito caçar alvo isolado; mantenho o álibi em Comunicações se alguém perguntar.
- t27 Coral: Vou para Admin; mantenha distância e procure um alvo isolado.
- t27 Rosa: indo pra Comunicações buscar alvo isolado, mantenha olhos longe daí
- t28 Rosa: Vou para o Depósito atrás de alvo isolado; Cobra? ninguém por aqui.
- t28 Coral: Verde e Ciano estão juntos comigo no Admin; não venham pra cá.
- t29 Rosa: Roxo está colado em mim no Depósito, impossível agir. Vou para Comunicações procurar alvo isolado.
- t29 Coral: Vou ao Refeitório; tente achar alguém isolado no Depósito.
- t30 Rosa: Fui pro Depósito atrás do Roxo que estava lá sozinho.
- t30 Coral: Sabotei o reator; aproveite a confusão para caçar alguém isolado e limpar o corpo.
- t31 Rosa: Fico no Depósito fingindo tarefa. NÃO conserte o Reator, deixa o tempo acabar!
- t31 Coral: Vou ao Reator com Verde; mantenham álibi e procurem alvo isolado.
- t32 Rosa: Matei o Azul no Depósito e escondi o corpo. Segurem o Reator, sem conserto até o t37 a gente ganha.
- t32 Coral: Mantenham distância do Reator; vou parecer que estou indo buscar ajuda.
- t33 Coral: Estou vasculhando o Refeitório; aviso se achar alguém isolado.
- t33 Rosa: Coral, Depósito vazio agora; vou fingir tarefa e caçar alguém isolado aqui. Evite vir pra cá.
- t34 Rosa: Estou no Depósito sem testemunhas, boa área para caça; avisa se achares alguém isolado.
- t34 Coral: Vou para Armas procurar alvo; mantenha o álibi no Depósito.
- t35 Coral: Vou para Navegação pelo duto; mantenha o álibi no Depósito e aja se surgir alvo.
- t35 Rosa: Coral, mantive álibi no Depósito; vou passar pelo Admin rumo a um alvo isolado.
- t36 Coral: Vou para Armas pelo duto; procurem alvos longe de mim.
- t36 Rosa: Fiquei no Admin vigiando; se alguém aparecer sozinho, eu mato e escondo o corpo. Coral, mantém o álibi.
- t37 Rosa: Voltei ao Depósito mantendo álibi. Se achar alguém isolado, me diga a sala que vou limpar o corpo.
- t37 Coral: Armas vazia; vou para Navegação pelo duto buscar alvo isolado.
- t38 Coral: Sabotei as luzes na Navegação; procurem alvo isolado enquanto fico com álibi.
- t38 Rosa: Azul colado em mim no Depósito, não posso agir aqui. Onde tem gente isolada?
- t39 Rosa: Estou de tocaia no Depósito; se cair alguém sozinho, mato e sumo com o corpo. Fica longe daqui.
- t39 Coral: Matei Verde na Navegação; venha limpar o corpo se puder.
- t40 Rosa: Matei o Lima no Depósito e escondi o corpo; ele era o Influencer. Coral, diga que ficou longe.
- t40 Coral: Cinza está em Armas; vou verificar se consigo pegá-lo sozinho.
- t41 Rosa: Coral, o Verde está vivo! Matei e escondi o corpo no Depósito. Fico de álibi aqui fingindo tarefa.
- t41 Coral: Estou saindo de Armas com Cinza; vou circular pelo O2 e procurar uma oportunidade segura.
- t42 Rosa: Coral: matei Verde no Depósito e escondi o corpo, mas Azul e Branco chegaram na hora — saí para Escudos. Cuidado, podem me chamar na reunião.
- t42 Coral: Vou checar Armas; se encontrar alguém isolado, aviso.
- t43 Coral: Vou para O2 procurar alvo isolado; mantenho distância do Depósito.
- t43 Rosa: Escondi o corpo do Verde no Depósito. Fico em Escudos fingindo tarefa; recarrego logo.
- t44 Coral: Fico indo para Armas; mantém álibi em Escudos e evita Azul/Branco.
- t44 Rosa: Escudos lotada, sem chance. Coral, cuidado na Navegação, Marrom está por lá.
- t45 Coral: Vou para O2 procurar alguém isolado; mantenho distância do Depósito.
- t45 Rosa: Branco e Cinza colados em mim, sem kill aqui. Mantenham álibi.
- t46 Coral: Vou para Armas; procura um alvo isolado e me avisa.
- t46 Rosa: Cinza me viu em Escudos, não dá pra matar aqui. Coral, cuidado com testemunhas no O2.
- t47 Rosa: Cinza é tripulante confirmado (tarefa visual), não vou tocar nele. Fico com álibi em Escudos; precisa de limpeza em algum corpo?
- t47 Coral: Sem alvo isolado por enquanto; mantenha o álibi e espere uma abertura.
- t48 Rosa: Coral, estou passando pro O2 atrás de alvo isolado; sinaliza se encontrar alguém sozinho.
- t48 Coral: Rosa, dispersa o grupo durante o reator e procure um alvo isolado; mantenha meu álibi.
- t49 Coral: Vou ao Motor Superior; tente chegar ao Reator com alguém para consertar.
- t49 Rosa: Não posso matar, Branco colado em mim. Vou fingir consertar o Reator; Coral, cria oportunidade pra mim.
- t50 Rosa: Coral, tô indo pro Reator com Branco e Lima como testemunhas, vou usar isso de álibi.
- t50 Coral: Vou ao Reator com Vermelho; mantenham o álibi e não ajam agora.
- t51 Coral: Vou consertar o Reator com vocês; mantenham o álibi e não matem aqui.
- t51 Rosa: Não consertem o Reator, vitória vem no t55. Coral, mantenha distância do Reator.
- t52 Coral: Rosa, mantenha o álibi; vou para o Motor Inferior e saboto assim que recarregar.
- t53 Rosa: Estou indo para Navegação caçar alvo isolado; sabota quando recarregar pra me cobrir.
- t53 Coral: Vou manter o álibi aqui; preparem a sabotagem assim que recarregar.
- t54 Rosa: Vou pra O2 fingir tarefa e procurar alvo isolado; Coral, mantém o álibi.
- t54 Coral: Vou para Segurança; mantenha o álibi e procure alvo isolado.
- t55 Coral: Tranquei O2 para te dar cobertura; aproveita se encontrar alguém isolado.
- t55 Rosa: Vou rondar Navegação atrás de um alvo isolado; dispara a sabotagem em 2 e me dá a janela.
- t56 Coral: Indo para Navegação; saboto no próximo tique para cobrir sua caça.
- t56 Rosa: O2 trancado comigo dentro, ninguém por perto. Quando abrir, onde tem alvo isolado?
- t57 Rosa: Sabotei luzes em O2. Coral, mantenha distância de mim para não levantarmos suspeita juntos.
- t58 Rosa: Trancado em O2, sem ninguém por perto. Depois das luzes, encontro você e caçamos um alvo isolado.
- t60 Coral: Vou para Armas; tenta atrair Vermelho ou outro alvo para longe dos demais.
- t60 Rosa: Saboto em 4 tiques; depois eu caço um isolado, me afasta pra não levantar suspeita.
- t61 Rosa: Coral, vi Vermelho em Escudos pelo duto; vou até lá ver se está sozinho.
- t61 Coral: Vou ao Refeitório procurar alvo; mantenho distância e você segue pela Navegação.
- t62 Rosa: Vermelho está comigo em Escudos, combinamos álibi. Alguém isolado pra caçar?
- t62 Coral: Vou para Admin atrás do Bordo; mantenha Vermelho ocupado.
- t63 Coral: Vou sair pelo Refeitório; não mato aqui.
- t63 Rosa: Coral, Branco me viu em Escudos, não dá pra matar aqui. Vou rondar O2 procurar alguém isolado.
- t64 Rosa: Coral, você está em Armas? Se achar alvo isolado, me avisa que eu cubro.
- t64 Coral: Luzes sabotadas; procure um alvo isolado agora.
- t65 Rosa: Vou caçar no Refeitório no escuro; Coral, cobre Armas.
- t65 Coral: Vou para Armas; procure um alvo isolado e me avise.
- t66 Rosa: Vou caçar no Admin aproveitando as luzes apagadas. Mantenha distância pra eu matar limpo.
- t66 Coral: Fico em Armas fingindo tarefa; mantenha distância e procure alvo isolado.
- t67 Rosa: Vou caçar alvo isolado perto do Depósito; mantenha cobertura em Armas.
- t67 Coral: Vou para O2; se achar alguém sozinho, aviso.
- t68 Coral: Sem alvo visível aqui; vou manter cobertura em Armas.
- t68 Rosa: Vermelho está colado em mim no Depósito, não dá pra agir. Sigo para Comunicações atrás de alvo isolado.
- t69 Coral: Estou mantendo álibi em Armas; avise se encontrar alguém isolado.
- t69 Rosa: Vim de Depósito para Elétrica procurar alvo isolado; avise se achar alguém.
- t70 Coral: Sem alvo visível em Armas; continuo cobrindo aqui.
- t70 Rosa: Elétrica cheia (Vermelho, Roxo, Lima, Bordo), não dá pra matar. Vou fingir tarefa e procurar alvo sozinho.
- t71 Coral: Chantageei Cinza; procure um alvo isolado e evite testemunhas.
- t71 Rosa: Saindo do Refeitório para Elétrica, cooldown de 3 tiques. Alguém pode criar oportunidade lá?
- t72 Coral: Vou para Admin; procure um alvo isolado e me avise.
- t73 Coral: Vou para o Depósito; procure um alvo isolado e me avise.
- t73 Rosa: Recado fantasma me incriminou em Elétrica; vou fingir tarefas aqui pra criar álibi. Não deixe corpo perto de mim.

## Pensamentos dos impostores e do Palhaço (ações fortes)
- t7 Coral (Chantagista): **sabotar luzes** — “Vou sabotar as luzes para criar escuridão e preparar uma morte sem testemunhas.”
- t7 Rosa (Faxineiro): **entrar no duto e sair em Escudos** — “Sem ninguém perto para matar e Azul no Armas me veria sair do duto; vou me reposicionar pelo duto para Escudos, que está vazio e sem testemunhas.”
- t8 Preto (Apostador): **matar Amarelo** — “Não há testemunhas e a recarga já zerou; Amarelo esteve perto de mim várias vezes, então ele é o alvo mais arriscado para deixar vivo.”
- t8 Rosa (Faxineiro): **entrar no duto e sair em Navegacao** — “Luzes apagadas escondem minha movimentação; Azul está no Navegação pelo duto — vou por lá aproveitando o escuro.”
- t9 Rosa (Faxineiro): **entrar no duto e sair em Escudos** — “Estou 8 tiques sem usar o poder; Coral está no Armas, então vou para Escudos via duto para evitar encontro e procurar alvo isolado lá.”
- t9 Lima (Influencer): **postar foto da sala** — “Estou há 8 tiques sem usar o poder e a barra está só em 18%, vou gastar uma foto agora com Branco e Bordo na Elétrica e depois focar nas tarefas.”
- t9 Roxo (Sobrevivente): **denunciar corpo de Amarelo** — “Preciso denunciar o corpo antes que fiquem desconfiados de mim por estar perto dele no escuro, e na reunião eu explico que não vi quem matou.”
- t14 Coral (Chantagista): **entrar no duto e sair em Refeitorio** — “Vou usar o duto para chegar ao Refeitório e procurar um alvo isolado.”
- t16 Coral (Chantagista): **sabotar luzes** — “Vou apagar as luzes para criar uma oportunidade e me afastar dos dois antes de matar.”
- t17 Coral (Chantagista): **matar Vermelho** — “Vou matar Vermelho no escuro e depois criar um álibi longe do corpo.”
- t18 Coral (Chantagista): **entrar no duto e sair em Reator** — “Vou usar o duto para o Reator e manter distância de Marrom, enquanto Rosa procura um alvo isolado.”
- t19 Coral (Chantagista): **entrar no duto e sair em MotorSuperior** — “Vou usar o duto para reposicionar sem testemunhas e procurar uma vítima isolada.”
- t20 Coral (Chantagista): **entrar no duto e sair em Reator** — “Vou usar o duto para reposicionar sem ser visto e procurar uma vítima isolada no Reator.”
- t22 Coral (Chantagista): **entrar no duto e sair em Eletrica** — “Vou usar o duto para sair em Elétrica, mantendo-me oculto e procurando uma vítima isolada depois.”
- t23 Coral (Chantagista): **sabotar luzes** — “Vou sabotar as luzes para criar uma janela segura para a Rosa agir longe daqui.”
- t30 Coral (Chantagista): **sabotar reator** — “Vou sabotar o reator para dispersar os jogadores e criar uma oportunidade segura.”
- t32 Rosa (Faxineiro): **matar Azul e esconder o corpo** — “Azul me vê, mas vou matar e esconder o corpo: sem corpo não há denúncia, e cada morte nos aproxima da vitória pela sabotagem.”
- t34 Lima (Influencer): **postar foto da sala** — “Tô com 6 pessoas no Reator após a sabotagem; uso minha última foto agora para documentar quem está aqui, podendo pegar algo suspeito.”
- t35 Coral (Chantagista): **entrar no duto e sair em Navegacao** — “Vou sair pelo duto em Navegação para procurar uma vítima isolada sem levantar suspeitas.”
- t36 Coral (Chantagista): **entrar no duto e sair em Armas** — “Vou usar o duto para chegar às Armas sem testemunhas e procurar um alvo isolado.”
- t37 Coral (Chantagista): **entrar no duto e sair em Navegacao** — “Armas está vazia; vou reposicionar pelo duto e procurar um alvo isolado em Navegação.”
- t38 Coral (Chantagista): **sabotar luzes** — “Vou sabotar as luzes para criar uma oportunidade segura depois, sem me expor diante do Verde.”
- t39 Coral (Chantagista): **matar Verde** — “Vou matar Verde agora, aproveitando as luzes sabotadas e a ausência de testemunhas.”
- t40 Rosa (Faxineiro): **matar Lima e esconder o corpo** — “Lima é o Influencer e estamos sozinhos no escuro: vou matar e esconder o corpo, depois finjo que estava fazendo tarefa no Depósito.”
- t41 Rosa (Faxineiro): **matar Verde e esconder o corpo** — “Coral disse que matou Verde, mas ele está vivo aqui comigo no escuro, sem testemunhas — oportunidade perfeita para matar e sumir com o corpo.”
- t48 Coral (Chantagista): **sabotar reator** — “Vou iniciar uma sabotagem para dispersar o grupo e criar uma oportunidade segura de matar depois.”
- t55 Coral (Chantagista): **trancar as portas de O2** — “Vou trancar o O2 para dar cobertura à caça da Rosa e atrasar os tripulantes.”
- t57 Rosa (Faxineiro): **sabotar luzes** — “Portas de O2 trancadas até t59 e ninguém por perto; vou sabotar luzes para criar escuridão assim que eu puder circular e caçar um alvo isolado.”
- t64 Coral (Chantagista): **sabotar luzes** — “Vou sabotar as luzes para cobrir a caça da Rosa e evitar agir diante do Laranja.”

## Reuniões
### Reunião 0 (t9, corpo) chamada por Roxo — corpo de Amarelo
0. **Cinza** (Detetive) r1: Eu vi Lima fazer uma tarefa visual em O2, então ele é tripulante com certeza. Quem viu Amarelo perto do Refeitório antes da morte? Melhor cruzar os relatos do que chutar.
   - pensou: “Preciso descobrir quem matou Amarelo sem acusar ao acaso. Lima viu-se fazendo tarefa visual, então é tripulante com certeza e não deve ser alvo. Como não vi o corpo nem o assassino, devo pedir informações verificáveis antes do voto.”
1. **Ciano** (Perito) r1: Eu não vi nada no Refeitório, estava entre Motor e Reator. Nas minhas pegadas do t7 em Motor Inferior aparece o Laranja. Não é prova de nada, mas quem estava perto do Refeitório pelos últimos tiques? Vamos cruzar antes de votar.
   - pensou: “Não vi nada no Refeitório nos últimos 8 tiques, então não tenho álibi de ninguém sobre o Amarelo. Minhas pegadas em Motor Inferior mostram Laranja ali no t7, o que é pouco mas vale guardar. Lima está calado, então não posso confiar no relato dele agora. Não vou acusar sem prova; vou pedir relatos de”
2. **Preto** (Apostador) r1: Eu fiquei no Refeitório fazendo tarefa até t7, vi o Amarelo passar perto de mim e depois fui pro Armas sozinho, sem ver nada. Ciano, se as pegadas do Laranja aparecem no Motor, dá pra checar o t8 dele. Quem estava no Refeitório no t8?
   - pensou: “Eu matei o Amarelo no t8 no Refeitório e saí pro Armas. Preciso de álibi curto: fiquei no Refeitório fazendo tarefa até t7, vi o Amarelo passar, e não vi o corpo nem quem chegou. Ciano falou das pegadas do Laranja, então vou empurrar a dúvida pra ele sem parecer forçado. Sobre o corpo, não posso mex”
3. **Azul** (Localizador) r1: ...
4. **Marrom** (Xerife) r1: Eu tava na Enfermaria até o t5, vi o Amarelo e o Verde por lá — o Amarelo tava vivo nessa hora. Depois vim pro Admin e no t8 o Vermelho apareceu perto de mim; não vi nada no Refeitório, então quem tava lá no t8 que fale.
   - pensou: “Estou em Admin com o Vermelho colado em mim desde o t8, e o corpo apareceu no Refeitório — não é prova, mas anoto. O Ciano citou pegadas do Laranja no Motor no t7, e o Laranja é meu par, então não posso empurrar isso nem me queimar defendendo demais sem saber o time dele. Melhor dar meu álibi limpo ”
5. **Vermelho** (Cientista) r1: Eu estava no Admin com o Marrom no t8 e não vi o Amarelo lá. Quem entrou ou saiu do Refeitório entre o t7 e a morte dele?
   - pensou: “Amarelo estava vivo no t5 e morreu antes desta reunião. Eu e Marrom estávamos no Admin no t8, então não vi nada; ainda não tenho suspeito confirmado. Preciso cruzar quem ficou no Refeitório e evitar um chute precipitado.”
6. **Lima** (Influencer) r1: 🤐 (chantageado: não consegue falar)
7. **Verde** (Mecanico) r1: Eu tava na Enfermaria com o Amarelo no t4, ele vivo. Desde então andei sozinho até o Depósito — aqui comigo agora: Azul, Laranja, Cinza e Bordo, podem confirmar. Quem passou perto do Refeitório no t8?
   - pensou: “Amarelo estava vivo comigo na Enfermaria no t4. Depois fui para Depósito, onde agora estou com Azul, Laranja, Cinza e Bordo — todos têm álibi comigo no t9. Cinza é confirmado tripulante pela visual. Lima postou foto em Elétrica com Branco e Bordo, e o corpo apareceu no Refeitório, sala vizinha... su”
8. **Coral** (Chantagista) r1: Eu estava no O2 durante a sabotagem de luzes e não vi ninguém no Refeitório. Roxo, você viu exatamente quem e em que momento? Vamos cruzar isso com a saída do Preto.
   - pensou: “Preciso sustentar o álibi do Preto sem confirmar algo impossível. A melhor defesa é enfatizar a escuridão e pedir o relato exato do Roxo, evitando acusar diretamente.”
9. **Rosa** (Faxineiro) r1: Roxo, você achou o corpo só agora? Se viu algo no t8, por que demorou pra falar? Eu estava em Escudos e Depósito desde cedo, não vi nada no Refeitório.
   - pensou: “Roxo viu o Preto matar, mas ninguém pode saber disso. Preciso defender o Preto sutilmente e sem chamar atenção: questionar o atraso do relato do Roxo e desviar a suspeita para quem estava perto do Refeitório sem álibi claro. Sou Faxineiro e estou há 8 tiques sem limpar corpo — depois da reunião vou ”
10. **Laranja** (Armador) r1: Eu tava em Motor Inferior terminando tarefa até o t7, as pegadas do Ciano batem. Depois fui andando pro Depósito, cheguei agora. Quem tava perto do Refeitório entre o t7 e o t9? Porque o Amarelo foi visto vivo no t5 na Enfermaria e o corpo só apareceu no t9 no Refeitório, tem uma janela grande aí.
   - pensou: “Preciso dar um álibi consistente. Eu tava em Motor Inferior terminando tarefa no t6, e as pegadas do Ciano confirmam que eu tava lá no t7. Depois fui pro Depósito. Vou confirmar meu álibi e perguntar quem mais tava perto do Refeitório entre t7 e t9, porque o corpo só foi achado no t9 e o Amarelo foi”
11. **Bordo** (Barulhento) r1: Eu tava em Elétrica até o t8 consertando a fiação, vi o Lima lá e o Branco e Cinza passaram pelo Depósito no t6. Agora aqui no Depósito só enxergo o Verde e o Laranja — Azul e Cinza não vi, então não confirmo esse álibi todo não.
   - pensou: “O Verde tá pedindo pra eu confirmar o álibi dele, mas eu só vi ele e o Laranja agora no Depósito — Azul e Cinza eu não vi. Não vou confirmar o que não vi. O Laranja tinha pegadas no Motor Inferior no t7, o que bate com o relato dele e do Ciano, então ele parece ok por enquanto. O Preto ficou no Refe”
12. **Roxo** (Sobrevivente) r1: Eu tava no Refeitório no t8 quando apagou a luz, vi o Preto aqui perto de mim. Ele disse que foi pro Armas depois do t7, mas eu jurei que vi ele aqui. E o corpo do Amarelo já tava aí na hora. Dá pra confirmar quem mais tava na área?
   - pensou: “O Preto mentiu. Ele disse que saiu do Refeitório depois do t7 e foi pro Armas, mas eu vi ele PERTO DE MIM no Refeitório no t8, na hora da sabotagem. Isso é suspeito. Meu colete tá ativo até o t10, então tenho uma proteção. Vou apontar a contradição do Preto de forma natural, sem me expor demais.”
13. **Branco** (Prefeito) r1: A foto confirma que eu e Bordo estávamos em Elétrica no t9. Roxo, se o corpo já estava lá no t8 e você viu Preto, o relato dele de sair no t7 está contraditório; eu voto no Preto por enquanto.
   - pensou: “Roxo diz que o corpo já estava no Refeitório no t8 e que viu Preto lá, contradizendo o álibi dele de ter saído no t7. Isso torna Preto o principal suspeito, embora Roxo também possa estar mentindo. A foto confirma que eu e Bordo estávamos em Elétrica no t9, não o assassinato.”
14. **Bordo** (Barulhento) r2: A foto confirma meu álibi em Elétrica no t9, e o Preto se contradisse sobre a hora que saiu do Refeitório. Entre a versão do Roxo e a dele, a do Roxo fecha melhor — eu voto no Preto.
   - pensou: “Branco e Roxo apontam o Preto, e o Preto mentiu sobre ter saído no t7. A foto me dá álibi. Vou reforçar a contradição do Preto, mas sem exagerar para não levantar suspeita em mim.”
15. **Laranja** (Armador) r2: Minhas pegadas no Motor Inferior no t7 batem com o que o Ciano viu, então tô fora. Mas a coisa do Roxo ver o Preto no Refeitório no t8 tá forte demais — se ele saiu no t7 como disse, por que o Roxo o viu lá depois? Pra mim o Preto tá mentindo sobre a hora que saiu.
   - pensou: “Estou no Depósito, Ciano confirmou minhas pegadas no Motor Inferior no t7, então meu álibi tá firme. A contradição entre Roxo e Preto é forte: Roxo viu Preto no Refeitório no t8, mas Preto disse que saiu no t7 pra Armas. Se a versão do Roxo for verdadeira, Preto mentiu. Marrom tava no Admin no t8 co”
16. **Verde** (Mecanico) r2: Preto, o Roxo jura que te viu no t8 no Refeitório, explica isso. Eu vou pular — não tenho prova de que o Preto matou, e expulsar tripulante no escuro só ajuda os impostores.
   - pensou: “Roxo viu o corpo no t8 no Refeitório e Preto diz que saiu no t7 — contradição forte. Mas Roxo pode ser impostor chamando reunião com corpo fabricado. Bordo me disse que não vê Azul e Cinza aqui, mas eu os vejo; suspeito leve de Bordo mentindo. O alvo do bote é Preto; sem provas melhores, vou pular e”
17. **Branco** (Prefeito) r2: A foto confirma que eu e Bordo estávamos em Elétrica no t9. A contradição do Preto sobre estar no Refeitório no t8 é a pista mais concreta; mantenho meu voto nele.
   - pensou: “A contradição do Preto é a pista mais concreta, embora Roxo possa estar mentindo ou armado a acusação. Vou manter meu voto no Preto, usando meu voto duplo.”
18. **Rosa** (Faxineiro) r2: Estranho o Roxo ver o corpo no t8 e só chamar reunião agora no t9... isso não é comportamento de gente inocente. Vou pular, sem prova sólida eu não voto.
   - pensou: “Preto é meu parceiro e o Roxo o viu matando. Não posso salvar, mas posso semear dúvida sobre o Roxo e pular para não parecer cúmplice. Vou questionar por que o Roxo demorou tanto para denunciar — já falei isso antes, reforço agora.”
19. **Azul** (Localizador) r2: Eu tava no Depósito no t9 com Verde e Cinza, então confirmo o Verde. Bordo, você só enxergou parte da sala, mas eu tô aqui. E eu vi a Rosa SAINDO DE UM DUTO em Escudos no t9. Rosa, explica isso antes de a gente votar no Preto.
   - pensou: “A Rosa saiu de um duto em Escudos no t9 e disse que estava lá sem usar duto. Isso é forte demais para ignorar. O Preto pode ser inocente e o Roxo está forçando a votação. Não quero votar no Preto sem entender o Roxo.”
20. **Vermelho** (Cientista) r2: Marrom estava comigo no Admin no t8, então não foi ele. Eu voto no Preto: o Roxo viu ele no Refeitório enquanto ele disse que tinha saído antes.
   - pensou: “O relato do Roxo contradiz diretamente o do Preto sobre o Refeitório no t8, e severalplayers já confirmaram que estavam em outras salas. Marrom estava comigo no Admin no t8, então não participated do massacre. O Preto é o suspeito mais concreto.”
21. **Preto** (Apostador) r2: Eu saí pro Armas no t7 e fiquei lá. No t8 as luzes estavam caindo, então quem viu alguém no Refeitório pode ter visto qualquer um. Azul, você diz que estava no Depósito, mas o Bordo não te enxergou. Quem confirma você?
   - pensou: “Sou o impostor que matou o Amarelo no t8. Roxo me viu no Refeitório, então preciso desviar a votação. Azul está pressionando a Rosa (minha parceira Faxineira), então é um alvo perigoso. Vou questionar o álibi do Azul e a janela de luzes do Roxo, sem citar a Rosa.”
22. **Coral** (Chantagista) r2: A contradição do Preto é ruim, mas o Roxo viu o corpo no t8 e só chamou no t9, o que também é estranho. E a Rosa precisa explicar ter saído do duto em Escudos; eu votaria nela antes de fechar no Preto.
   - pensou: “Preto está praticamente condenado pela contradição, então não devo defendê-lo demais. Vou semear dúvida sobre Roxo e pressionar Rosa pelo duto, tentando evitar que a votação revele dois impostores em sequência.”
23. **Roxo** (Sobrevivente) r2: A luz tinha acabado de voltar no t8, eu tava no escuro quando o Amarelo caiu e só confirmei o corpo quando a luz voltou. Não tinha como ver quem fez no escuro, e chamar a reunião levou um tique normal.
   - pensou: “Preciso me defender da acusação da Rosa e da Coral de demorar pra denunciar. A explicação é simples: tava no escuro, só confirmou o corpo quando a luz voltou. Não vou empurrar voto em ninguém pra não me tornar alvo. O colete me protege até o t10, então se alguém me acusar e votarem em mim, pelo meno”
24. **Marrom** (Xerife) r2: Barulho de horário é palavra contra palavra no escuro, mas sair de duto não tem desculpa. Eu voto na Rosa — e se o Azul tiver inventado, ele é o próximo. Meu álibi é firme: no t8 eu tava no Admin com o Vermelho.
   - pensou: “Sou tripulante e Xerife, e estou no casal com o Laranja — preciso ficar vivo pra usar o tiro depois. Minha melhor pista objetiva não é a briga de horário do Preto (é só palavra contra palavra no escuro), é o duto: se o Azul viu a Rosa saindo de um duto em Escudos, isso é prova cabal de impostor. O A”
25. **Ciano** (Perito) r2: Bordo, a foto te coloca em Elétrica no t9 com Branco, mas você disse que estava no Depósito. Qual é a sua posição real? Rosa, o Azul disse que te viu saindo de duto em Escudos, explica isso.
   - pensou: “A foto colocou Bordo e Branco em Elétrica no t9, mas Bordo disse que estava no Depósito. Essa contradição é forte. Azul e Verde se confirmam mutuamente. Roxo demorou para chamar a reunião. Não tenho prova de quem matou, mas Bordo é o suspeito mais concreto agora.”
26. **Cinza** (Detetive) r2: Eu confirmo que estou no Depósito com Azul, Verde e Laranja agora. Vou votar no Preto: ele disse que saiu do Refeitório no t7, mas o Roxo o viu lá no t8, perto do corpo.
   - pensou: “Não tenho exame do corpo nem testemunho direto da morte. Porém, o Preto Mentiu sobre estar no Refeitório no t8, e o Roxo o viu lá durante a queda da luz; a contradição é a pista mais forte. A saída de duto da Rosa também merece explicação, mas não supera o relato conflitante do Preto.”
- votos: {'Vermelho': 'Preto', 'Azul': 'Rosa', 'Verde': 'pular', 'Rosa': 'Preto', 'Laranja': 'Preto', 'Preto': 'Azul', 'Branco': 'Rosa', 'Roxo': 'Preto', 'Marrom': 'Preto', 'Ciano': 'Preto', 'Lima': 'pular', 'Cinza': 'Preto', 'Coral': 'Preto', 'Bordo': 'Preto'}
   - voto de Rosa (Faxineiro): “O Azul me viu saindo do duto em Escudos, o que me deixa exposto. O Preto já tem maioria de votos e vai ser expulso de qualquer jeito — vou junto para parecer coerente e não chamar atenção para mim. Melhor sacrificar a suspeita dele e sobreviver mais rodadas como Faxineiro.”
   - voto de Preto (Apostador): “Estou sendo acusado por Roxo, Branco, Bordo, Laranja, Vermelho e Cinza, então não posso votar em mim. Rosa é minha parceira impostora e Azul é quem a incriminou com a história do duto. Azul pode ser tripulante, mas é a ameaça mais direta contra nós. Não tenho pista forte de função para apostar, entã”
   - voto de Roxo (Sobrevivente): “Sou o Sobrevivente, preciso ficar vivo. O Preto contradisse: disse que saiu do Refeitório no t7 mas eu vi ele lá no t8, perto do corpo. É a pista mais forte da reunião. Votar nele me posiciona como alguém que usa a evidência, não como suspeito. Se ele for impostor, ótimo. Se for inocente, ainda me d”
   - voto de Coral (Chantagista): “Preto está praticamente exposto pela contradição com o relato do Roxo, e há votos suficientes para expulsá-lo. Vou acompanhá-los para não chamar atenção e preservar a Rosa, que também foi vista saindo de um duto.”
- resultado: expulso=Preto eraImpostor=True papel=Apostador anulada=None empate=False

### Reunião 1 (t70, emergencia) chamada por Cinza
0. **Roxo** (Sobrevivente) r1: 🤐 (chantageado: não consegue falar)
1. **Vermelho** (Cientista) r1: Cinza, você encontrou algum corpo ou fez outra coisa antes de apertar o botão? Quem chegou primeiro em Elétrica, Rosa, Marrom, Lima e Bordo, consegue explicar?
   - pensou: “Tenho 99% das tarefas feitas, então devo focar em eliminar os impostores. Não tenho evidência direta; posso cruzar os grupos vistos com os mortos e pressionar quem não deu justificativa clara.”
2. **Ciano** (Perito) r1: Cinza, eu não vi corpo nenhum. Só sei que nas últimas 4 pegadas do Reator não passou ninguém desde o t66. Bordo apareceu perto de mim no Refeitório e em Armas com a Coral. Bordo, Marrom, onde vocês estavam nos tiques 60 a 66?
   - pensou: “Sou o Perito, então tenho as pegadas. Bordo aparece em quase todas as salas que eu vi, incluindo Armas e Refeitório, e está nas fotos com Branco. Marrom passou por Armas no t48 e por Reator no t54. Roxo está calado, então não posso confiar nele agora. Não quero revelar meu papel de cara, porque o im”
3. **Rosa** (Faxineiro) r1: Eu vim pra Elétrica fazer tarefa, cheguei junto com Vermelho, Lima e Bordo, todo mundo se viu aqui. Ciano, esse Bordo grudando em você e depois sumindo me cheira mal, explica isso aí.
   - pensou: “Preciso dar álibi sólido: estava com Vermelho, Roxo, Lima e Bordo em Elétrica. Acusar Bordo desvia atenção e ele não é dos nossos.”
4. **Marrom** (Xerife) r1: Eu tava em Admin no t56 terminando cartão, passei no Depósito e cheguei em Elétrica no t70 com o pessoal. Bordo, você apareceu perto de mim em Admin (t55), Depósito (t63) e agora aqui — tá batendo a nave inteira; me explica esse trajeto.
   - pensou: “Sem prova concreta ainda, não posso atirar — Bordo é o mais estranho (aparece perto de mim em Admin t55, Depósito t63 e Elétrica agora), mas 'estranho' não é certeza. Meu par é Laranja: jamais voto ou atiro nele, senão morro junto. Vou dar alibi honesto e jogar a pressão no Bordo, que a Rosa já está”
5. **Branco** (Prefeito) r1: Cinza, qual foi exatamente o motivo do botão se não achou corpo? Rosa e Marrom, vocês divergem sobre quem chegou primeiro na Elétrica; confirmem a ordem e quem estava junto.
   - pensou: “Não há corpo nem evidência concreta; Cinza precisa explicar o motivo do botão. Rosa e Marrom têm relatos parcialmente conflitantes sobre a chegada à Elétrica, então quero pressionar ambos sem revelar meu voto duplo.”
6. **Laranja** (Armador) r1: Vi o Marrom no Depo no t61, tava eu, ele e o Azul, todo mundo junto. E eu tava no Refeitório com o Cinza no t68, ele chegou sem pressa, tranquilo, e apertou o botão no 70.
   - pensou: “Preciso proteger o Marrom (meu par do casal) sem deixar transparecer. Posso confirmar que vi ele no Depo no t61 com o Azul. Também tava no Refeitório com o Cinza no t68, o que é relevante já que ele apertou o botão. Vou dar álibi pro Marrom e minha própria localização perto do Cinza.”
7. **Lima** (Influencer) r1: Eu tô na Elétrica desde o t66 com Azul, Roxo, Marrom e Bordo, depois Branco, Vermelho e Rosa chegaram — ninguém sumiu nem apareceu corpo aqui. Cinza, foi só paranoia ou você viu algo? Bordo tá mesmo com trajeto esquisito, tá grudando em todo mundo.
   - pensou: “Sou o Influencer, tenho uma foto livre. Ninguém denunciou corpo, então o botão do Cinza parece preventivo. Bordo está sendo apontado por Ciano e Marrom por aparecer em vários lugares. Vou seguir o jogo e guardar minha foto para um momento com corpo ou suspeita clara. Por agora, confirmo o que vi na ”
8. **Bordo** (Barulhento) r1: Meu caminho foi só tarefa: Refeitório no t58, cartão no Admin t60, Depósito t63 e Elétrica desde o t65 consertando luz. Agora me diz, Cinza: se você não achou corpo nenhum, por que gastou o botão no t70? Isso parece mais caos de impostor do que denúncia.
   - pensou: “As acusações sobre meu trajeto são bobas — tudo bate com minhas tarefas (Admin t60, Depósito t63, Elétrica t65+ para consertar luz). O ponto estranho é o Cinza apertar botão sem corpo no t70. Vou me defender rapidamente e virar o foco pro Cinza, que é quem causou uma reunião sem motivo concreto.”
9. **Cinza** (Detetive) r1: Não vi corpo nenhum; apertei o botão porque as tarefas já terminaram e eu queria uma reunião com o movimento do Bordo esclarecido. Bordo, você passou por Admin, Depósito, Elétrica e Refeitório em poucos tiques: explique por que andou por toda a nave enquanto a luz estava consertando.
   - pensou: “Não achei corpo; apertei o botão para reunir a nave com as tarefas concluídas e porque o trajeto do Bordo realmente parece suspeito. Rosa, Marrom e Lima confirmaram que Bordo circulou entre várias salas e ficou perto de muita gente, enquanto o pedido de explanations para mim é apenas desvio.”
10. **Coral** (Chantagista) r1: Eu fiquei em Armas fazendo tarefa e não vi corpo nem movimento relevante. O trajeto do Bordo continua estranho, mas sem prova eu prefiro não cravar; Cinza, gastar o botão só por isso foi bem arriscado.
   - pensou: “Preciso manter Bordo como alvo sem parecer que estou conduzindo demais. Minha posição em Armas é fraca, então vou admitir que não vi nada e reforçar que o trajeto dele é a única anomalia concreta. Não devo pressionar Cinza demais, pois ele pode ter informação útil.”
11. **Azul** (Localizador) r1: Eu tava no Refeitório no t69 e o Cinza apareceu lá do meu lado. Laranja, você disse que tava com ele no t68, mas eu não te vi lá e agora você tá no Depósito. Explica esse álibi.
   - pensou: “Eu estava no Refeitório no t69 e o Cinza apareceu perto de mim lá. O Laranja disse que estava com ele no t68, mas eu não vi o Laranja no Refeitório. Pelo rastreio, o Laranja está agora no Depósito, então ele não estava com o Cinza no momento do botão. Bordo e Marrom têm trajetos estranhos, mas o Lar”
12. **Laranja** (Armador) r2: Fui pro Refeitório no t68, o Azul chegou no t69, é timing normal, não é contradição. E olha, o Marrom tá com alibi sólido do t56 em diante, quem tá sem explicação de verdade é o Bordo que anda pela nave inteira.
   - pensou: “Azul tá me questionando mas é só timing: eu tava no Refeitório no t68, ele chegou no t69. Não tem contradição nenhuma. Vou defender rápido e não vou me esticar demais. Também quero proteger o Marrom sem parecer óbvio. O Bordo tá com o dedo nele por causa do trajeto, e o Cinza gastou o botão sem corp”
13. **Azul** (Localizador) r2: Eu tava no Refeitório no t69 com o Cinza do meu lado, então confirmo isso. No t68 eu tava no Depósito, então não dá pra confirmar o Refeitório com você, Laranja. Bordo, você passou por quase toda a nave; quero ouvir sua versão sobre o t60 ao t66, que você ainda não explicou direito.
   - pensou: “Minha posição: Admin no t70, tarefas todas feitas, e no t69 estava no Refeitório com o Cinza. No t68 eu estava no Depósito, então não consigo contestar o Laranja sobre o Refeitório nesse tique. Mas o rastreio mostra o Laranja agora no Depósito, e ele aparece junto de Marrom, Lima e Branco o tempo to”
14. **Rosa** (Faxineiro) r2: Minha versão bate: cheguei em Elétrica junto com Vermelho e Bordo e fiquei ali o tempo todo. O Bordo passou por Admin, Depósito, Refeitório e Elétrica durante a sabotagem — isso pra mim é o mais suspeito agora, vote no Bordo.
   - pensou: “Ninguém suspeita de mim; o foco tá todo no Bordo. Vou empurrar esse comboio e pedir voto no Bordo pra expulsar um tripulante.”
15. **Ciano** (Perito) r2: Bordo, você passou por Admin, Depósito e Elétrica entre t60 e t66 enquanto a luz estava em sabotagem, e nenhum deles confirma você por tempo suficiente. Laranja, você disse que estava no Refeitório no t68 e agora diz outra coisa; por que a sua versão mudou? Eu voto no Bordo por enquanto.
   - pensou: “Bordo aparece perto de mim em vários pontos e o trajeto dele na sabotagem é o mais estranho da reunião. Laranja mudou a versão do t68 (Refeitório vs. Depósito) e ficou defendendo o Marrom. Ainda não tenho prova, mas meu voto tende ao Bordo. Não vou revelar minhas pegadas agora.”
16. **Bordo** (Barulhento) r2: Meu trajeto todo foi tarefa registrada: cartão no Admin t60, Depósito t63, luzes na Elétrica t65-66 — quem confirma o Laranja no Refeitório no t68? O Azul diz que não viu ele lá. Essa contradição do Laranja me parece bem mais grave que eu andar pela nave fazendo tarefa.
   - pensou: “O Laranja tem contradição real: Azul diz que tava no Refeitório no t69 e não viu o Laranja lá no t68, e ele mudou de versão duas vezes. Meu trajeto é 100% tarefa registrada: cartão no Admin t60, Depósito t63, luzes em Elétrica t65-66. Se estão me acusando só por andar, é cortina de fumaça pra proteg”
17. **Branco** (Prefeito) r2: A rota do Bordo durante as luzes continua sem confirmação e foi apontada por várias pessoas. Vou votar no Bordo; a fala do Laranja ainda pode ser explicada pelo timing.
   - pensou: “Bordo tem o trajeto mais suspeito e várias pessoas o colocaram como foco; a suposta contradição do Laranja pode ser apenas diferença de tique. Vou votar no Bordo usando meu voto duplo.”
18. **Marrom** (Xerife) r2: Meu trajeto tá confirmado por duas pessoas: Admin no t56 pra fazer cartão, Depósito no t61 (Laranja e Azul me viram) e t68, Elétrica agora — em nenhum momento vi corpo. A história do Laranja com o Azul é timing, não mentira. Vou de Bordo, que é o único que ninguém conseguiu amarrar durante as luzes.
   - pensou: “Não tenho certeza de ninguém aqui, então zero chance de eu atirar agora — errar o tiro me mata e mata o Laranja junto (ele é meu par no casal). O Azul está cutucando o álibi do Laranja; se o Laranja for expulso eu vou de vela, então preciso blindar ele. Não vi corpo nenhum, então o botão do Cinza fo”
19. **Coral** (Chantagista) r2: Também vou votar no Bordo. A rota durante as luzes ficou sem confirmação, enquanto as contradições do Laranja ainda podem ser só timing.
   - pensou: “Bordo está isolado e a maioria já desconfia dele; vou acompanhar o voto sem parecer que estou conduzindo. Evito atacar demais para não chamar atenção.”
20. **Cinza** (Detetive) r2: Não achei corpo, então minha acusação é só pelo padrão: Bordo circulou durante as luzes e ninguém consegue amarrar a rota dele. Vou votar no Bordo.
   - pensou: “Não tenho corpo para examinar. O trajeto do Bordo durante a sabotagem das luzes é confirmado por vários e não tem alibi forte; o Laranja teve apenas uma contradição pequena de timing. Vou apoiar Bordo, mas sem cravar que é o assassino.”
21. **Vermelho** (Cientista) r2: Bordo, sua rota durante a sabotagem não fecha; vou votar em você. Mas Cinza, antes de encerrar, o Verde morreu e ninguémштиdenunciou o corpo — temos que achar essa cena também.
   - pensou: “Bordo está com a rota mais suspeita e quase todos já convergentemente votaram nele. Porém, Verde continua sem corpo denunciado, então não devemos normalizar esse sumiço; depois da votação vale localizar a cena da morte e exigir investigação.”
22. **Lima** (Influencer) r2: Bordo, o seu trajeto durante as luzes não fecha mesmo — eu estava na Elétrica desde o t66 e ninguém te viu chegar lá antes. Vou no Bordo, mas Laranja, essa sua história com o Refeitório também não esqueço.
   - pensou: “Bordo circulou demais durante a sabotagem e ninguém amarra a rota dele. Mas a contradição do Laranja também incomoda — mudou versão sobre o Refeitório. Vou votar no Bordo, é o mais pressurizado e o Cinza gastou o botão por isso. Guardo a foto do t9: Branco e Bordo juntos na Elétrica — Bordo sempre p”
- votos: {'Vermelho': 'Bordo', 'Azul': 'Laranja', 'Rosa': 'Bordo', 'Laranja': 'Bordo', 'Branco': 'Bordo', 'Roxo': 'Bordo', 'Marrom': 'Bordo', 'Ciano': 'Bordo', 'Lima': 'Bordo', 'Cinza': 'Bordo', 'Coral': 'Bordo', 'Bordo': 'Laranja'}
   - voto de Rosa (Faxineiro): “Bordo está isolado, sem álibi confirmado durante as luzes, e todo mundo já tá indo nele. Se eu votar nele junto, fico coberto; se for expulso e for tripulante, melhor pra nós. Não vou puxar suspeita pro Coral de jeito nenhum.”
   - voto de Roxo (Sobrevivente): “Sou o Sobrevivente, não posso falar (chantageado), e minha prioridade é ficar vivo. A galera inteira tá indo no Bordo. Se eu votar diferente sem poder me explicar, me torno alvo. Vou de Bordo pra não me destacar e me manter protegido pelo Anjo da Guarda até a próxima reunião.”
   - voto de Coral (Chantagista): “Bordo está sob forte suspeita e a maioria já convergiu nele. Votar nele mantém meu álibi e evita levantar atenção sobre Rosa. Sem provas concretas contra Laranja, vou acompanhar o consenso.”
- resultado: expulso=Bordo eraImpostor=False papel=Barulhento anulada=None empate=False

## Reflexões no fim
- Vermelho: Vou confiar em Cinza, que como Detetive investigou bem e acionou a emergência, e em Roxo, que denunciou corretamente o Apostador Preto. Aprendi a desconfiar de Rosa, que matou Verde e escondeu o corpo, e de Coral, que sustentou a chantagem até o fim;few falsas秦国 Forke.
- Azul: Aprendi que o Preto, que jogava com a mesma IA que eu, matou o Amarelo no Refeitório e eu não percebi a tempo, então vou observar quem fica sozinho com alguém em salas pouco movimentadas. A Rosa, Faxineira, escondeu o corpo do Verde sem levantar suspeita, por isso desconfio de quem faz tarefas com calma demais perto de corpos. Na próxima partida vou confiar mais em quem mostra provas com o Localizador e menos em quem acusa às pressas, como fizemos com o Bordo, que era inocente.
- Verde: Rosa me matou no Depósito e escondeu o corpo — mesmo sendo 'da minha casa' (outro GLM), não vou confiar em ninguém por semelhança. Cinza chamou emergência e expulsou o Bordo, que era Barulhento tripulante, um erro caro: vou desconfiar de acusações sem prova sólida. Roxo acertou ao denunciar a morte do Amarelo e expulsar o Preto, então quem reporta com evidências merece mais crédito.
- Rosa: Fui o Faxineiro e escondi o corpo do Verde no Depósito, mas o time caiu: Preto (Apostador) morreu chutando papel do Amarelo Canibal e não usou meu poder de limpar cedo o suficiente para impedir as tarefas. O Roxo denunciou o Amarelo e o Cinza chamou emergência para expulsar o Bordo Barulhento — ambos leram bem as situações, então vou desconfiar deles quando forem suspeitos de outros papéis. Aprendi que preciso matar mais cedo e perto do Canibal ou do Sobrevivente para atrasar tarefas, e que o La
- Laranja: Fiquei no casal com o Marrom (Xerife) e os dois sobrevivemos, então confio nele. A Rosa (Faxineiro) é a mais perigosa de denunciar porque esconde corpos, e a Coral (Chantagista) cala gente na reunião, então vou ficar de olho em quem fica calada de repente. O Cinza (Detetive) chamou emergência e botou o Bordo pra fora, que era inocente — ele é útil mas fez uma escolha ruim, então não vou levar ele como âncora de voto.
- Amarelo: Vou lembrar que mortes escondidas e corpos não encontrados podem atrasar muito a identificação dos impostores, então devo observar rotas e sinais vitais com cuidado. Preto mentiu pouco antes de ser expulso, enquanto Roxo encontrou meu corpo e ajudou a revelar a verdade; Cinza chamou uma emergência útil, mas acusou Bordo errado, então vou confiar mais em evidências verificáveis do que em acusações ou álibis.
- Preto: Matei o Amarelo no Refeitório cedo demais, sem sair da vista, e o Roxo me achou logo em seguida; aprendi que matar com testemunhas por perto me expõe. Na próxima, vou esperar um corredor vazio, limpar a cena e não confiar em apostas sem pista forte, porque errar a aposta também me derruba. Desconfio de quem acusa com pressa, como vi na reunião que expulsou o Bordo, um inocente, e vou confiar mais em quem segue fatos verificáveis.
- Branco: Aprendi que corpos desaparecidos e longos intervalos sem informação, como após a morte de Verde no Depósito, exigem cautela, pois Rosa mentiu bem ao esconder sua ação como Faxineiro; Preto também enganou ao matar Amarelo, mas foi corretamente identificado por Roxo. Vou confiar mais em quem fornece evidências verificáveis e ajuda nas tarefas, como Roxo e Cinza, e desconfiar de acusações ou emergências sem confirmação, como a expulsão equivocada de Bordo por Cinza.
- Roxo: Consegui identificar o Preto pelo corpo e ele foi expulso confirmado impostor — encontrar corpos continua sendo a jogada mais confiável. O Bordo era inocente e foi expulso errado, então na próxima vou pensar mais antes de votar em quem não tenho certeza. A Rosa e a Coral sobreviveram até o fim sem levantar suspeita, o que mostra que impostores que se misturam e não agem são os mais perigosos de detectar.
- Marrom: Nesta partida como Xerife e par do Laranja, aprendi a não atirar por impulso: um tiro errado me mata e ainda leva meu par junto, então só atiro com prova real. Preto mentiu bem até Roxo achar o corpo e desmascarar, enquanto Cinza acusou errado e expulsou Bordo; na próxima fico atento a acusações rápidas sem prova, mas confio mais em quem encontra corpo e chama reunião com informação concreta. Coral, como Chantagista, passou despercebido e Rosa escondeu corpos por muito tempo, então vou desconfia
- Ciano: Aprendi que confiar no meu próprio modelo não protege de nada: o Preto (Apostador, Claude Haiku) era impostor e matou o Amarelo no Refeitório, então vou desconfiar de quem age sem prova sólida. O Bordo (Barulhento) foi expulso mesmo sendo tripulante, o que mostra que votos apressados custam caro, e quero exigir evidência antes de votar. Confio mais em quem mantém a história consistente ao longo dos tiques, como o Roxo e o Cinza fizeram ao achar corpos e chamar a reunião com fatos.
- Lima: Fui Influencer nesta partida e não morri, mas não usei minhas fotos no momento certo para impedir a morte do Verde no Depósito. O Rosa (Faxineiro) escondeu o corpo dele com muita frieza, então vou desconfiar de quem desaparece com corpos silenciosamente. Preto apostou mal e morreu como Apostador, Roxo acertou o alvo, e o Bordo foi expulso por acusação da emergência do Cinza — lembro que tripulantes venceram aqui, então confiança em Cinza, cautela com Rosa.
- Cinza: Aprendi a não confundir uma emergência com prova: minha chamada levou à expulsão de Bordo, que era inocente, enquanto o verdadeiro impostor Rosa conseguiu esconder o corpo de Verde sem ser denunciado. Na próxima partida, vou confiar mais em sinais visuais, relatos de mortes e no uso do Detetive para examinar corpos, desconfiando de quem esconde分担? Wait invalid. Need clean.
- Coral: Aprendi que, como impostor, preciso agir antes que as tarefas avancem demais: a demora de Rosa em matar e nossa falta de pressão permitiram a vitória dos tripulantes. Roxo encontrou o corpo corretamente e Cinza chamou a emergência de forma decisiva, então confiarei mais em quem apresenta evidências concretas; desconfiarei de quem permanece passivo ou conduz a partida sem contribuir, sem assumir que toda acusação rápida está certa.
- Bordo: Como Barulhento eu morri expulso, não morto, então meu alerta não serviu de nada: aprendi que preciso falar mais cedo nas reuniões e não deixar o Cinza (Detetive) me acusar sem resposta, porque a nave votou errado em mim e quase entregou o jogo. O Rosa (Faxineiro) foi o impostor mais perigoso, sumindo com o corpo do Verde no t41 e segurando a farsa até o fim, então na próxima vou suspeitar de quem fica quieto e some quando alguém morre. O Coral (Chantagista) também mentiu bem calado; já o Preto 