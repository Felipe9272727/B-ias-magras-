# Partida 4 — resultado: {'time': 'tripulante', 'motivo': 'Os impostores foram eliminados.', 'tique': 53, 'casalVivo': False, 'sobrevivente': []}

## Elenco
- Vermelho: Envenenador (impostor) — MiniMax M3.1 Flash
- Azul: Armador (tripulante) — Claude Haiku
- Verde: Barulhento (tripulante) — GLM 5.3 Flash
- Rosa: Juiz (tripulante) — GLM 5.3 Flash
- Laranja: Apostador (impostor) — Qwen 3.8 27B
- Amarelo: Piromante (neutro) — GPT-5.6 Luna
- Preto: Cientista (tripulante) — Claude Haiku
- Branco: Palhaco (neutro) — GPT-5.6 Luna
- Roxo: Engenheiro (tripulante) — Qwen 3.8 27B
- Marrom: Prefeito (tripulante) — DeepSeek Flash
- Ciano: Medico (tripulante) — Claude Haiku
- Lima: Detetive (tripulante) — GLM 5.3 Flash
- Cinza: Perito (tripulante) — MiniMax M3.1 Flash
- Coral: Seguranca (tripulante) — GPT-5.6 Luna
- Bordo: Chantagista (impostor) — DeepSeek Flash

## Linha do tempo (eventos)
- t1 **gasolina** {"cor": "Amarelo", "aparente": "Amarelo", "vitima": "Roxo", "sala": "Refeitorio", "total": 1}
- t1 **poder** {"cor": "Preto", "poder": "vitais", "mortos": []}
- t1 **poder** {"cor": "Coral", "poder": "cameras"}
- t1 **duto** {"cor": "Roxo", "aparente": "Roxo", "de": "Refeitorio", "para": "Admin"}
- t3 **chantagem** {"cor": "Bordo", "alvo": "Ciano"}
- t5 **poder** {"cor": "Coral", "poder": "cameras"}
- t6 **poder** {"cor": "Preto", "poder": "vitais", "mortos": []}
- t7 **duto** {"cor": "Vermelho", "aparente": "Vermelho", "de": "Admin", "para": "Refeitorio"}
- t7 **poder** {"cor": "Ciano", "poder": "escudo", "alvo": "Branco"}
- t7 **escudo** {"assassino": "Bordo", "aparente": "Bordo", "vitima": "Branco", "sala": "Admin", "medico": "Ciano"}
- t7 **poder** {"cor": "Cinza", "poder": "pegadas", "sala": "MotorInferior", "quem": ["Verde", "Marrom", "Lima"]}
- t9 **poder** {"cor": "Coral", "poder": "cameras"}
- t9 **reuniao** {"chamador": "Branco", "sala": "Refeitorio", "subtipo": "emergencia"}
- t9 **fim_reuniao** {"expulso": "Vermelho", "eraImpostor": true, "empate": false, "anulada": null, "papel": "Envenenador"}
- t10 **poder** {"cor": "Ciano", "poder": "escudo", "alvo": "Branco"}
- t10 **chantagem** {"cor": "Bordo", "alvo": "Ciano"}
- t11 **poder** {"cor": "Preto", "poder": "vitais", "mortos": ["Vermelho"]}
- t13 **poder** {"cor": "Coral", "poder": "cameras"}
- t14 **fantasma_funcao** {"cor": "Marrom", "funcao": "Anjo"}
- t14 **morte** {"assassino": "Bordo", "aparente": "Bordo", "vitima": "Marrom", "sala": "MotorSuperior"}
- t15 **poder** {"cor": "Marrom", "poder": "escudo_anjo", "alvo": "Branco"}
- t15 **duto** {"cor": "Bordo", "aparente": "Bordo", "de": "MotorSuperior", "para": "Reator"}
- t16 **duto** {"cor": "Bordo", "aparente": "Bordo", "de": "Reator", "para": "MotorInferior"}
- t16 **poder** {"cor": "Preto", "poder": "vitais", "mortos": ["Vermelho", "Marrom"]}
- t16 **reuniao** {"chamador": "Ciano", "corpo": "Marrom", "sala": "MotorSuperior", "subtipo": "corpo"}
- t16 **fim_reuniao** {"expulso": null, "eraImpostor": null, "empate": false, "anulada": null, "papel": null}
- t17 **chantagem** {"cor": "Bordo", "alvo": "Ciano"}
- t17 **poder** {"cor": "Ciano", "poder": "escudo", "alvo": "Branco"}
- t18 **gasolina** {"cor": "Amarelo", "aparente": "Amarelo", "vitima": "Coral", "sala": "Enfermaria", "total": 2}
- t18 **poder** {"cor": "Cinza", "poder": "pegadas", "sala": "Armas", "quem": ["Azul", "Verde", "Rosa", "Preto"]}
- t20 **poder** {"cor": "Coral", "poder": "cameras"}
- t21 **poder** {"cor": "Marrom", "poder": "escudo_anjo", "alvo": "Roxo"}
- t21 **escudo** {"assassino": "Bordo", "aparente": "Bordo", "vitima": "Branco", "sala": "Refeitorio", "medico": "Ciano"}
- t21 **poder** {"cor": "Preto", "poder": "vitais", "mortos": ["Vermelho", "Marrom"]}
- t23 **poder** {"cor": "Coral", "poder": "cameras"}
- t24 **duto** {"cor": "Roxo", "aparente": "Roxo", "de": "MotorInferior", "para": "MotorSuperior"}
- t24 **poder** {"cor": "Coral", "poder": "cameras"}
- t24 **gasolina** {"cor": "Amarelo", "aparente": "Amarelo", "vitima": "Bordo", "sala": "Refeitorio", "total": 3}
- t24 **casal_morre** {"vitima": "Roxo", "par": "Amarelo", "sala": "MotorSuperior"}
- t24 **fantasma_funcao** {"cor": "Roxo", "funcao": "Influencer"}
- t24 **morte** {"assassino": "Bordo", "aparente": "Bordo", "vitima": "Amarelo", "sala": "Refeitorio"}
- t25 **recado** {"cor": "Roxo", "texto": "Vi Ciano do meu lado em Motor Superior no t15, na mesma hora que o corpo do Marrom apareceu. Ciano denunciou. Muito suspeito."}
- t25 **sabotagem** {"cor": "Bordo", "subtipo": "O2"}
- t25 **poder** {"cor": "Coral", "poder": "cameras"}
- t25 **reuniao** {"chamador": "Azul", "corpo": "Roxo", "sala": "MotorSuperior", "subtipo": "corpo"}
- t25 **juiz** {"cor": "Rosa", "teriaSido": "Branco"}
- t25 **fim_reuniao** {"expulso": null, "eraImpostor": null, "empate": false, "anulada": "Rosa", "papel": null}
- t26 **recado** {"cor": "Roxo", "texto": "O juiz anulou 5 votos contra Branco. Ou Branco É o juiz se salvando, ou o juiz tá protegendo impostor. Desconfiem do Branco e descubram quem"}
- t26 **poder** {"cor": "Ciano", "poder": "escudo", "alvo": "Azul"}
- t26 **chantagem** {"cor": "Bordo", "alvo": "Cinza"}
- t27 **poder** {"cor": "Marrom", "poder": "escudo_anjo", "alvo": "Branco"}
- t28 **poder** {"cor": "Preto", "poder": "vitais", "mortos": ["Vermelho", "Amarelo", "Roxo", "Marrom"]}
- t28 **poder** {"cor": "Coral", "poder": "cameras"}
- t29 **duto** {"cor": "Bordo", "aparente": "Bordo", "de": "Refeitorio", "para": "Admin"}
- t31 **duto** {"cor": "Bordo", "aparente": "Bordo", "de": "Admin", "para": "Refeitorio"}
- t32 **sabotagem** {"cor": "Bordo", "subtipo": "Luzes"}
- t33 **poder** {"cor": "Marrom", "poder": "escudo_anjo", "alvo": "Ciano"}
- t34 **alerta_barulhento** {"vitima": "Verde", "sala": "Admin"}
- t34 **morte** {"assassino": "Laranja", "aparente": "Laranja", "vitima": "Verde", "sala": "Admin"}
- t35 **conserto** {"por": ["Bordo"], "subtipo": "Luzes"}
- t35 **poder** {"cor": "Preto", "poder": "vitais", "mortos": ["Vermelho", "Verde", "Amarelo", "Roxo", "Marrom"]}
- t35 **reuniao** {"chamador": "Laranja", "corpo": "Verde", "sala": "Admin", "subtipo": "corpo"}
- t35 **aposta** {"apostador": "Laranja", "alvo": "Preto", "funcao": "Cientista", "acertou": true, "morto": "Preto"}
- t35 **fim_reuniao** {"expulso": "Ciano", "eraImpostor": false, "empate": false, "anulada": null, "papel": "Medico"}
- t36 **poder** {"cor": "Coral", "poder": "cameras"}
- t36 **chantagem** {"cor": "Bordo", "alvo": "Branco"}
- t36 **poder** {"cor": "Cinza", "poder": "pegadas", "sala": "Refeitorio", "quem": ["Verde", "Bordo", "Ciano", "Azul", "Rosa", "Laranja", "Branco", "Lima", "Coral"]}
- t39 **poder** {"cor": "Marrom", "poder": "escudo_anjo", "alvo": "Rosa"}
- t40 **poder** {"cor": "Coral", "poder": "cameras"}
- t40 **poder** {"cor": "Cinza", "poder": "pegadas", "sala": "Admin", "quem": ["Branco", "Coral"]}
- t42 **sabotagem** {"cor": "Bordo", "subtipo": "Luzes"}
- t43 **morte** {"assassino": "Bordo", "aparente": "Bordo", "vitima": "Branco", "sala": "MotorSuperior"}
- t44 **conserto** {"por": ["Coral"], "subtipo": "Luzes"}
- t44 **duto** {"cor": "Bordo", "aparente": "Bordo", "de": "MotorSuperior", "para": "MotorInferior"}
- t45 **poder** {"cor": "Marrom", "poder": "escudo_anjo", "alvo": "Laranja"}
- t45 **duto** {"cor": "Bordo", "aparente": "Bordo", "de": "MotorInferior", "para": "Reator"}
- t45 **poder** {"cor": "Coral", "poder": "cameras"}
- t46 **duto** {"cor": "Bordo", "aparente": "Bordo", "de": "Reator", "para": "MotorInferior"}
- t49 **poder** {"cor": "Coral", "poder": "cameras"}
- t50 **poder** {"cor": "Azul", "poder": "cameras"}
- t50 **poder** {"cor": "Cinza", "poder": "pegadas", "sala": "MotorSuperior", "quem": []}
- t50 **sabotagem** {"cor": "Bordo", "subtipo": "Luzes"}
- t50 **duto** {"cor": "Laranja", "aparente": "Laranja", "de": "Eletrica", "para": "Enfermaria"}
- t51 **poder** {"cor": "Marrom", "poder": "escudo_anjo", "alvo": "Coral"}
- t51 **duto** {"cor": "Bordo", "aparente": "Bordo", "de": "MotorInferior", "para": "Reator"}
- t51 **reuniao** {"chamador": "Cinza", "corpo": "Branco", "sala": "MotorSuperior", "subtipo": "corpo"}
- t51 **aposta** {"apostador": "Laranja", "alvo": "Coral", "funcao": "Seguranca", "acertou": true, "morto": "Coral"}
- t51 **fim_reuniao** {"expulso": "Bordo", "eraImpostor": true, "empate": false, "anulada": null, "papel": "Chantagista"}
- t53 **reuniao** {"chamador": "Lima", "sala": "Refeitorio", "subtipo": "emergencia"}
- t53 **fim_reuniao** {"expulso": "Laranja", "eraImpostor": true, "empate": false, "anulada": null, "papel": "Apostador"}
- t53 **fim** {"time": "tripulante", "motivo": "Os impostores foram eliminados.", "casalVivo": false, "sobrevivente": []}
- tarefas visuais feitas: t5 Preto (Escanear no MedBay), t12 Roxo (Escanear no MedBay), t14 Azul (Destruir asteroides), t16 Rosa (Destruir asteroides), t21 Roxo (Ativar os escudos), t21 Verde (Destruir asteroides), t24 Preto (Destruir asteroides), t31 Azul (Ativar os escudos), t32 Coral (Ativar os escudos)

## Chat dos impostores
- t1 Vermelho: Saio do Refeitório agora. Fiquem separados e me indiquem alvos isolados para envenenar.
- t1 Bordo: Bordo aqui. Vermelho, Laranja: não me denunciem, vou me infiltrar como tripulante. Guardem os poderes para mais tarde.
- t1 Laranja: Tô indo pro Admin. Fiquem espalhados, quem se isolar primeiro tem chance de matar. Vamos ver quem fica sozinho.
- t2 Vermelho: Tô com quatro testemunhas no Motor Superior. Vou parecer fazem tarefa; fiquem separados.
- t2 Laranja: Vi Roxo entrar num duto no Refeitório no t1. Amarelo tá lá agora. Vermelho, pra onde foi? Não me deixem sozinho muito tempo.
- t2 Bordo: Estou no Refeitório com Branco e Ciano colados em mim, sem chance de agir. Laranja, segura o Roxo no Admin — ele entrou em duto no t1, pode ser Engenheiro. Vermelho, envenena alguém isolado longe daqu
- t3 Bordo: Chantageei o Ciano, ele me viu no Refeitório. Vou sair daqui pra não dar bandeira. Laranja, segura o Admin e me diz se o Roxo se isola.
- t3 Vermelho: Coral está em Motor Superior comigo; fiquem dispersos e avistem alvos isolados.
- t3 Laranja: Tô preso com Roxo no Admin, ele tá colado em mim. Não consigo agir aqui. Alguém consegue envenenar alguém no Refeitório ou Motor Superior?
- t4 Bordo: Já chantageei o Ciano (fica calado na próxima reunião). Saindo do Refeitório pro Depósito atrás de alvo isolado. Laranja, segura o Roxo aí no Admin.
- t4 Vermelho: Vou ao Refeitório procurar alvo isolado. Vigiem Admin e cuidem do Roxo.
- t4 Laranja: Roxo tá colado em mim no Admin. Não consigo matar. Fiquem atentos a ele — se ele se isolar, me avisem. Recarga de kill em 3 tiques.
- t5 Bordo: Saindo do Depósito pro Admin. Laranja, o Roxo ainda tá colado? Se ele sair, me avisa que eu caço.
- t5 Vermelho: Saí do Refeitório. Azul me viu, então sigo para o Depósito; procurem alvos isolados.
- t5 Laranja: Tenho Roxo e Ciano colados em mim no Admin, álibi bom. Ciano tá calado pela chantagem do Bordo, bom pra próxima reunião. Vou seguir fingindo até eles saírem.
- t6 Vermelho: Vou pro Admin; não usem o Apostador no Roxo ainda.
- t6 Laranja: Tô em Admin com Bordo e Ciano. Ciano me vê mas o Bordo já chantageou ele, tá calado pra reunião. Fico aqui fingindo tarefa, ninguém mexe em mim. Roxo sumiu do Refeitório, alguém viu ele sair?
- t6 Bordo: Ciano já está chantageado e me vê agora, então não mato aqui. Laranja, quando o Ciano sair do Admin me avisa que eu ataco quem sobrar. Vermelho, procura alvo isolado no Depósito.
- t7 Vermelho: Saí pelo duto pro Refeitório vazio. Vou caçar um alvo isolado; fiquem nas tarefas.
- t7 Bordo: Matei o Branco no Admin. Ciano está calado pela minha chantagem, então ele não me acusa. Laranja, fica fingindo tarefa perto de mim pra servir de álibi; Vermelho, guarda o Apostador pro Roxo.
- t7 Laranja: Saí do Admin pro Refeitorio. Tá vazio aqui. Se alguém entrar sozinho, mato. Bordo, você tá seguro aí? Vermelho, me avisa se achar alvo isolado no Depósito.
- t8 Vermelho: Vou caçar alvo isolado no Depósito. Ciano está CHANTADO, fica de olho nele.
- t8 Bordo: Ciano tá colado em mim no Admin, me vendo. Sem kill (2 tiques). Vermelho, você entrou no duto e eu vi — cuidado. Alguém isola alvo?
- t8 Laranja: Bordo, o escudo salvou o Branco. Fica em Admin comigo, Ciano tá calado então não ameaça. Vermelho, o Refeitório tá livre pra teus alvos.
- t9 Laranja: Tô colado com Ciano e Bordo no Admin, sem kill. Ciano tá chantageado, bom. Se alguém isolar, me avisa.
- t9 Vermelho: Vou para o Refeitório atrás de alvo isolado; me avisem se alguém entrar.
- t9 Bordo: Estou em Admin com Ciano colado me vendo, chantado mas atento. Não posso usar duto agora. Vermelho, envenena alguém isolado longe daqui e me avisa; Laranja, segura o Ciano aqui comigo.
- t10 Bordo: Vermelho caiu, restam nós dois. Chantageei o Ciano de novo — ele foi o único que votou em mim. Laranja, ficamos separados e calmos; eu vou sair do Refeitório e procurar alvo isolado longe do grupo.
- t10 Laranja: Bordo, tô indo pro Admin. Kill tá pronto em 3 tiques. Qual alvo? Ciano ainda tá chantado né? Se ele sair do Refeitório sozinho eu caço.
- t11 Bordo: Ciano colado em mim, sem kill aqui. Vou pro Motor Superior fingir tarefa. Laranja, me avisa se achar alguém isolado no Depósito ou Admin.
- t11 Laranja: Estou em Admin com Verde, Preto e Branco me vendo. Sem chance de matar aqui. Ciano tá no Refeitório, se ele sair me avisa. Vamos esperar janela de oportunidade.
- t12 Laranja: Saí do Admin, Verde e Preto me viram. Procurando alvo no Depósito. Ciano ainda tá contigo?
- t12 Bordo: Bordo no Motor Superior indo pra Enfermaria. Kill pronto em 1 tique. Laranja, me diz onde tem gente sozinha. Ciano segue chantado pra próxima reunião.
- t13 Bordo: Enfermaria com Roxo e Coral me vendo. Vou pro Motor Superior. Alguém tem alvo isolado?
- t13 Laranja: Ciano tá colado em mim no Depósito me vendo. Vou pro Admin me separar. Manda Bordo fazer o kill na Enfermaria sem se preocupar comigo, já tô longe.
- t14 Laranja: Estou em Admin com Verde e Preto me vendo, sem kill. Ciano foi pra onde? Me ajuda com um alvo isolado.
- t14 Bordo: Matei o Marrom no Motor Superior, sozinho. Vou pro duto e saio longe. Laranja, segura o Admin e me dá álibi.
- t15 Bordo: Matei o Marrom no Motor Superior, ninguém viu. Tô saindo pelo duto pro Reator. Laranja, arruma um alvo isolado e me fala que eu volto pro kill.
- t15 Laranja: Segurando Admin com Preto e Branco. Me avisa quando sair do duto.
- t16 Bordo: Matei Marrom em Motor Superior, corpo ainda lá. Ciano tá na sala e pode achar. Saí pelo duto pra Motor Inferior. Se chamarem reunião, me dá álibi: diz que me viu em Admin/Eletrica.
- t16 Laranja: Vou pro Depósito procurar alvo. Ciano tava lá e tá chantado. Avisa quando chegar no Reator.
- t17 Laranja: Bordo, vou pra Enfermaria fingir tarefa. Corpo do Marrom ainda tá no Motor Superior? Ciano pode achar de novo ou denunciar de novo. Me avisa se tiver plano pro próximo kill. Kill meu pronto em 3 tique
- t17 Bordo: Chanteei o Ciano de novo. Não posso matar agora, todos me veem no Refeitório. Tenta isolar alguém no Depósito e me chama.
- t18 Laranja: Bordo, vou pro Refeitório. Ciano tá por aí? Se o corpo ainda tá no Motor Superior, alguém pode achar de novo. Fica longe do corpo.
- t18 Bordo: Ciano colado em mim no Refeitório. Vou pra Enfermaria me separar; se ele te seguir sozinho, cai nele.
- t19 Laranja: Vou pro Depósito procurar alvo isolado. Se alguém entrar junto, me avisa. Ciano vai ficar calado na próxima, dá pra explorar isso.
- t19 Bordo: Na Enfermaria com Azul, Amarelo e Coral me vendo. Vou fingir tarefa aqui pra montar álibi. Ciano já tá chantado. Me diz quando achar alguém isolado que eu vou.
- t20 Laranja: Tô indo pro Motor Inferior procurar alvo. Me avisa quando Ciano sair da Enfermaria, ele tá chantado e pode cair sozinho.
- t20 Bordo: Amarelo me viu na Enfermaria e não deu pra matar (ele viraria Influencer Fantasma, ruim pra nós). Tô indo pro Refeitório pegar álibi. Laranja, achou alguém isolado?
- t21 Bordo: Matei o Branco no Refeitório, corpo ficou lá. Sai de perto e arruma alibi, eu vou vazar pela Enfermaria. Se alguém achar rápido, segura a reunião e não me acusa.
- t21 Laranja: Vou pro Depósito agora, caçando alvo isolado. Se alguém passar por ali eu te aviso.
- t22 Laranja: Tô indo pra Admin montar alibi, tô lá desde antes do kill. Se chamarem reunião, juro que tava em Admin. Segura o Ciano perto de você se ele for achar o corpo.
- t22 Bordo: Refeitório com Amarelo e Ciano colados em mim, kill recarregando. Ciano chantado. Evita vir pra cá agora.
- t23 Bordo: Estou no Refeitório, tem gente no canto que não enxergo. Vou checar. Ciano segue chantado.
- t23 Laranja: Tô no Admin com Branco, ele me dá álibi. Se acharem corpo no Refeitório, digo que tava aqui o tempo todo. Ciano ainda tá chantado?
- t24 Bordo: Matando Amarelo no Refeitório agora. Fica no Admin com o Branco, se chamarem reunião diz que eu tava passando pra Enfermaria.
- t24 Laranja: Bordo, vou pro Depósito ver se achando alguém isolado pra matar. Me avisa se a situação no Refeitório acalmar e se Ciano ainda tá chantado. O Branco que apareceu em Admin t22 era fantasma? Tu matou el
- t25 Bordo: Sabotei O2. Corpo do Amarelo no Refeitorio. Sai de perto, Laranja.
- t25 Laranja: Ciano colado em mim no Depósito, vou pro Admin. Se Amarelo aparecer, me dá álibi que eu tava te vendo em Admin.
- t26 Laranja: Saindo pro Admin, tava lá antes. O2 tá no nosso favor, deixa o cronômetro rodar. Se chamarem reunião por causa do corpo, diz que tava em Admin/Eletrica.
- t26 Bordo: Corpo do Amarelo no Refeitório. Vou pra Admin montar álibi, diz que tava comigo desde o t25. Cinza calado na próxima reunião.
- t27 Bordo: Saindo do Refeitório, Branco e Ciano me viram. O corpo do Amarelo ainda tá no chão lá — se chamarem reunião, diz que eu tava com você/Admin antes. Cinza chantado, não fala.
- t27 Laranja: Tô no Admin com o Cinza me vendo desde o t22. Se alguém perguntar, diz que tava comigo a essa hora. Ciano tá no Refei, tem corpo dele aí, cuidado com ele.
- t28 Laranja: Tô aqui no Admin desde o t23 fingindo tarefa. Quando chegar, a gente tá junto. Se acharem o corpo do Amarelo, a história é que eu tava aqui e você veio de Enfermaria. Cinza vai ficar calado, bom pra n
- t28 Bordo: Vou pro Refei. Ciano tá chantado, se reunião rolar votamos nele. Não votem Branco, pode ser Palhaço. Laranja, segura Admin.
- t29 Bordo: Saindo do duto em Admin agora. Se houver reunião, diz que eu tava aqui com você desde o t27. Cinza segue chantado.
- t29 Laranja: Segurando Admin. Se reunião rolar, uso meu poder? Tem alguém que se entregou?
- t30 Bordo: Tô no Admin fingindo tarefa com você. Ciano só denuncia corpo se achar; se reunião rolar, ele tá chantado e calado. Amarelo ainda tá no Refei, ninguém achou. Vou trancar portas se precisar.
- t30 Laranja: Segurando Admin com você. Refei vazio, se alguém entrar aí depois eu te aviso. Próximo movimento meu é achar um kill solo.
- t31 Laranja: O2 tá correndo, as pessoas vão se espalhar. Quando tiver alvos solitários, te mando. Segura o álibi de Admin.
- t31 Bordo: Vou de duto pro Refei, fico lá escondido. Se o Ciano voltar pro Refei me avisa, e segura o álibi no Admin dizendo que eu tava com você até agora.
- t32 Bordo: Luzes apagadas. Segura o Admin como alibi, vou caçar alguém no escuro. Ciano já tá chantado pra próxima reunião, ninguém vai poder me acusar calado.
- t32 Laranja: Segurando Admin, ninguém tá aqui. Corpo do Amarelo ainda tá no Refei? Se alguém for lá, problema. Me avisa se Ciano voltar.
- t33 Laranja: Segurando Admin firme. Me avisa quando for consertar as luzes.
- t33 Bordo: Luzes fora, vou pra Elétrica emboscar quem vier consertar. Segura o álibi de Admin, se alguém me citar diz que eu tava aí com você até agora.
- t34 Laranja: Mati o Verde aqui no Admin. Saindo agora. Se o corpo achar, eu já tô longe. Foca no emboscada na Elétrica, depois a gente vota.
- t35 Laranja: Denunciei o Verde aqui no Admin. Reunião rola, Ciano e Cinza calados, votam nele. Depois da reunião me avisa onde você tá pra não aparecer perto se perguntarem.
- t35 Bordo: Luzes consertadas por mim na frente de Rosa e Coral = álibi forte. Verde morto no Admin, cuidado que Ciano tava no Refei. Cinza calado na próxima reunião.
- t36 Bordo: Chantageei Branco (votou em mim). Ciano caiu como tripulante, bom pra nós. Tô no Refei cercado de gente, sem chance de kill. Preciso de alvo solo longe dos dutos. Me avisa movimentação, sabotei luzes 
- t36 Laranja: Refei tá lotado, vou pra Motor Superior fingir tarefa. Na próxima reunião uso meu Apostador se aparecer oportunidade. Cuidado que Ciano saiu inocente, a gente tá em desvantagem numérica.
- t37 Laranja: Vou de Enfermaria, fico aí esperando alvo. Me manda quem tá sozinho em qualquer lugar, preciso de um kill limpo no t39.
- t37 Bordo: Refei com Branco, Cinza e Coral me vendo. Chantagem no Branco já feita. Sem kill pronta, segurando álibi.
- t38 Bordo: Indo pra Enfermaria com você. Se vier alvo solo, mato. Branco calado na próxima reunião.
- t38 Laranja: Tô na Enfermaria com Azul me vendo. Vou fingir tarefa e depois me mudo. Me avisa quando tiver alvo solo.
- t39 Laranja: Azul tá aqui me vendo junto com vc, bom pro alibi. Sabotagem em 3 tiques, quando soltar a luzes vocês dois saem de aqui e a gente pega um solo. Branco calado na proxima, bom pra manipular voto.
- t39 Bordo: Matei o Azul na Enfermaria. Só você viu. Sai daqui e finge tarefa em Motor Superior — eu vou pro Refei.
- t40 Bordo: Fico na Enfermaria com Azul me vendo, álibi firme. Quando a luz apagar, saio pra Motor Superior e você pega o Azul sozinho se ele ficar. Branco calado na próxima reunião.
- t40 Laranja: Vou pro Motor Superior agora. Corpo do Azul tá aqui, quem achar? Cuidado com Rosa e Branco, eles podem denunciar. Não sabotar até eu estar longe daqui.
- t41 Laranja: Tô fingindo tarefa aqui em Motor Superior. Quando apagar a luz, vou pra onde? Alvo solo?
- t41 Bordo: Saindo da Enfermaria agora, corpo do Azul no canto, ninguém achou. Indo pro teu lado. Me diz quem tá solo que eu mato no próximo tique.
- t42 Laranja: Tô indo pro Refei. Lima tá solo no Motor Inferior, vê se dá pra pegar ele. Corpo do Azul ainda tá em Enfermaria, cuidado com quem for lá.
- t42 Bordo: Apaguei a luz. Lima tá sozinho no Motor Inferior. Vou tentar chegar nele no escuro e matar. Você vai pra Enfermaria ou Reator ver se tem solo. Branco calado na próxima, explora isso.
- t43 Laranja: Vou pra Elétrica. Me avisa quando o Lima cair que eu conserto a luz e tenho álibi. Não vou na Enfermaria, corpo do Azul tá lá.
- t43 Bordo: Matei Branco no Motor Superior. Vou sair pelo duto pro Reator. Diz que me viu no Refei/Enfermaria se te perguntarem. Não chega perto do corpo agora.
- t44 Bordo: Branco caiu no Motor Superior (corpo lá), eu saí pelo duto pro Motor Inferior. Chantageei o Branco mas ele morreu, desperdício. Luzes: conserta pra ter álibi e me avisa. Rosa tava no Motor Inferior.
- t45 Laranja: Tô em Elétrica com Azul e Coral me vendo, álibi bom. Corpo do Branco tá no Motor Superior. Com 7 vivos e 2 impostores, preciso de mais 3 kills. Me avisa se alguém ficar solo.
- t45 Bordo: Branco caiu no Motor Superior, corpo lá. Vou pro Reator pelo duto. Lima tava solo no Motor Inferior, se ele aparecer sozinho aí de novo me avisa que eu volto pra pegar.
- t46 Laranja: Tô saindo de Elétrica pra Depósito. Coral tá me vendo aqui, não posso matar. Me avisa quando chegar no Reator e se tem solo por aí.
- t46 Bordo: Corpo do Branco ficou no Motor Superior. Saí por duto pro Motor Inferior, invisível. Fica visível em Elétrica com quem te viu. Ainda tô com kill limpo, me avisa alvo solo que eu caço.
- t47 Laranja: Voltando pra Elétrica, meu álibi tá lá com Azul e Coral. Quem tá solo aí? Corpo do Branco ainda tá em Motor Superior, cuidado pra não passar perto.
- t47 Bordo: Matei o Azul no Motor Inferior agora. Vou jogar o corpo num canto e sair pra fingir tarefa. Se alguém achar, nego tudo.
- t48 Bordo: Motor Inferior: tem alguém escondido aqui do outro lado, vou checar. Se for solo, mato agora. Segura teu álibi na Elétrica.
- t48 Laranja: Ficando em Elétrica com Coral me vendo, álibi bom. Cuidado com o corpo do Azul, se alguém achar nego tudo. Usa a chantagem em alguém útil na próxima.
- t49 Laranja: Tô solo na Elétrica agora, álibi firme. Quem tem no Motor Inferior? Se for solo e fraco, mata e me avisa. Se aparecer corpo, nego tudo.
- t49 Bordo: Matei Azul no Motor Inferior, sem testemunha. Corpo do Branco ainda no Motor Superior. Vou sair para Depósito; me avisa se alguém ficar solo e prepara o álibi.
- t50 Bordo: Luzes caindo agora. Cinza tá no Motor Superior, Rosa no Reator. Vou pro Motor Superior pegar o Cinza no escuro. Segura álibi.
- t50 Laranja: Fui pro duto pra Enfermaria, vou me reposicionar. Me diz quem tá solo que eu mato, kill tá pronto.
- t51 Bordo: Vou pelo duto pro Reator matar a Rosa. Luz apagada, ninguém vê. Fica de olho no corpo do Branco no Motor Superior.
- t51 Laranja: Fui pra Elétrica consertar luzes, álibi limpo. Se cinza sobreviver me avisa, vou apostar nele na próxima reunião se ele se entregar.

## Pensamentos dos impostores e do Palhaço (ações fortes)
- t7 Vermelho (Envenenador): **entrar no duto e sair em Refeitorio** — “Vou sair pelo duto para o Refeitório vazio e procurar uma vítima isolada, sem expor meu movimento às testemunhas.”
- t7 Bordo (Chantagista): **matar Branco** — “Ciano está chantageado e não vai poder falar na próxima reunião, então matar o Branco agora no Admin sai quase de graça — e já preciso adiantar as mortes antes que as tarefas acabem.”
- t14 Bordo (Chantagista): **matar Marrom** — “Marrom é a única testemunha aqui — se eu não matar agora, perco a janela e ele ainda pode me acusar depois.”
- t15 Bordo (Chantagista): **entrar no duto e sair em Reator** — “Matei o Marrom sem testemunhas; melhor sumir pelos dutos antes que alguém apareça e me veja colado no corpo.”
- t16 Ciano (Medico): **denunciar corpo de Marrom** — “Marrom está morto aqui do meu lado e o Roxo, que entrou num duto no t1, está perto; preciso chamar a reunião com esse fato.”
- t16 Roxo (Engenheiro): **denunciar corpo de Marrom** — “Corpo do Marrom aqui em Motor Superior, vou denunciar logo pra chamar a reunião.”
- t16 Bordo (Chantagista): **entrar no duto e sair em MotorInferior** — “Deixei o corpo do Marrom em Motor Superior e o Ciano está lá — melhor sumir pelo duto antes que ele denuncie e me ponha no Reator ao lado.”
- t21 Bordo (Chantagista): **matar Branco** — “Branco é a única testemunha — se ele morre agora, não sobra ninguém pra contar o que viu.”
- t24 Bordo (Chantagista): **matar Amarelo** — “Já estou atrasado no placar de kills e o Amarelo está colado em mim, então vou aproveitar antes que ele saia.”
- t25 Bordo (Chantagista): **sabotar o2** — “Vou sabotar o O2 para tirar o pessoal do Refeitorio e sair de perto do corpo do Amarelo.”
- t25 Azul (Armador): **denunciar corpo de Roxo** — “Roxo está morto aqui do meu lado e ninguém perto de mim viu nada, então vou denunciar o corpo para a nave discutir o que sabe.”
- t29 Bordo (Chantagista): **entrar no duto e sair em Admin** — “Vou sair pelo duto em Admin pra montar álibi com o Laranja e caçar alguém isolado depois.”
- t31 Bordo (Chantagista): **entrar no duto e sair em Refeitorio** — “Laranja já é meu álibi aqui no Admin, mas preciso matar alguém de verdade; vou sair pelo duto pro Refeitório sem ser visto e pegar quem passar.”
- t32 Bordo (Chantagista): **sabotar luzes** — “Vou apagar as luzes pra matar sem testemunha e atrasar as tarefas, já que meu kill tá pronto e preciso de mais mortes pro empate.”
- t34 Laranja (Apostador): **matar Verde** — “Tô com cooldown 0, ninguém vê, e tá escuro — corpo vai demorar pra achar. Mato o Verde e saio na hora pra criar distância.”
- t35 Laranja (Apostador): **denunciar corpo de Verde** — “Corpo aqui, alerta já tocou, melhor denunciar e abrir a reunião enquanto Ciano e Cinza estão calados - vou parecer inocente achando o corpo.”
- t39 Bordo (Chantagista): **matar Azul** — “Azul me vê, mas se ele morre não fala — é o kill limpo que o Laranja precisava, e ainda limpo a testemunha.”
- t42 Bordo (Chantagista): **sabotar luzes** — “Laranja tá comigo, então não posso matar agora; vou apagar as luzes pra criar oportunidade de kill solo no escuro.”
- t43 Bordo (Chantagista): **matar Branco** — “Branco está sozinho comigo e já está chantageado, kill limpo agora e sumo pelo duto para o Reator.”
- t44 Bordo (Chantagista): **entrar no duto e sair em MotorInferior** — “Matei o Branco em Motor Superior e ninguém viu; vou sumir pelo duto pro Motor Inferior e deixar o corpo ser achado longe de mim.”
- t45 Bordo (Chantagista): **entrar no duto e sair em Reator** — “Matei o Branco no Motor Superior e ninguém me viu; preciso sumir daqui e criar álibi antes que achem o corpo.”
- t46 Bordo (Chantagista): **entrar no duto e sair em MotorInferior** — “Matei o Branco no Motor Superior e ninguém me viu; vou escapar pelo duto para o Motor Inferior e construir álibi longe do corpo.”
- t47 Bordo (Chantagista): **matar Azul** — “Azul tá solo comigo e ninguém mais vê — mato agora e escondo o corpo depois.”
- t49 Bordo (Chantagista): **matar Azul** — “Azul está sozinho comigo e já me viu; se eu matar agora, ele não conta nada e a nave perde mais um.”
- t50 Bordo (Chantagista): **sabotar luzes** — “Vou apagar as luzes pra facilitar o próximo abate sem testemunhas.”
- t50 Laranja (Apostador): **entrar no duto e sair em Enfermaria** — “Estou protegido pelo Anjo e com kill pronto. Vou me reposicionar pelo duto pra Enfermaria (vazia) pra buscar alvo solo sem testemunhas.”
- t51 Bordo (Chantagista): **entrar no duto e sair em Reator** — “Luzes apagadas e Rosa sozinha no Reator: saio do duto e mato ela sem testemunha.”
- t51 Cinza (Perito): **denunciar corpo de Branco** — “Vou denunciar o corpo de Branco imediatamente e chamar uma reunião, pois a sabotagem das luzes não impede a denúncia.”

## Reuniões
### Reunião 0 (t9, emergencia) chamada por Branco
0. **Vermelho** (Envenenador) r1: O Branco apertou a emergência sem achado nenhum e agora tá rondando o Refeitório sozinho; tá tentando jogar a gente né?
   - pensou: “Vou usar a reunião para transformar o Branco em alvo, plantando dúvida sobre o botão de emergência. Depois me afasto e o enveneno quando ele se isolar.”
1. **Marrom** (Prefeito) r1: Eu tava no Depósito fazendo tarefa, não vi ninguém por lá. Branco, se não achou corpo, o que te fez apertar o botão assim do nada?
   - pensou: “Reunião cedo sem corpo é estranha; o Branco pode ter visto algo ou estar blefando. Eu estava no Depósito, sem ninguém perto, então não tenho muito a oferecer — melhor dar meu álibi e pressionar o Branco a explicar o motivo da emergência.”
2. **Laranja** (Apostador) r1: Tava o tempo todo no Admin fazendo tarefa, não vi nada de estranho. Branco, não achou corpo, qual era a pressa do botão?
   - pensou: “Bordo falhou o kill no Branco porque ele tinha escudo. Branco apertou emergência sem corpo, o que é bom pra gente porque não tem evidência. Ciano tá chantado e calado, perfeito. Preciso dar um álibi simples de que tava em Admin fazendo tarefa e não me envolver demais. Vermelho já acusou o Branco, nã”
3. **Amarelo** (Piromante) r1: Eu estava fazendo tarefa no Motor Superior e depois vim ao Reator; não vi corpo nem nada estranho. Branco, qual foi exatamente o motivo da emergência? Sem evidência, prefiro pular e observar as rotas.
   - pensou: “Branco apertou sem corpo e parece estar sendo pressionado por vários; não quero liderar uma votação precipitada, especialmente com o risco do Palhaço. Preciso manter Roxo protegido sem mencioná-lo. Preto, Cinza e Coral estavam comigo no Reator agora, mas isso é apenas presença recente.”
4. **Cinza** (Perito) r1: Eu vi Preto e Coral no Reator comigo no tique 8, mas não vi nada ilegal. Branco, você realmente achou algum corpo ou só acionou a emergência para mudar o foco?
   - pensou: “No tique 8 vi Preto e Coral perto de mim no Reator, mas isso não prova sabotagem. Branco acionou a emergência sem corpo e está tentando desviar a atenção. Não devo acusar sem evidência; vou pedir esclarecimento e observar quem reage.”
5. **Azul** (Armador) r1: Eu fiquei na Enfermaria e no Motor Superior fazendo tarefa, não achei corpo. Branco, o que você viu exatamente pra apertar o botão?
   - pensou: “Não vi corpo nem nada suspeito. Vi Vermelho no Refeitório e Preto no Motor Superior, mas nada conclusivo. Branco ainda não explicou a emergência, então vale pressionar sem acusar sem prova. Ciano está calado, então não posso contar com ele.”
6. **Lima** (Detetive) r1: Eu tava na Elétrica, não vi ninguém nem corpo. Branco, explica direito o que te fez apertar isso — emergência sem corpo no começo só ajuda impostor. Ah, e no t1 eu vi o Roxo entrar num duto no Refeitório, Roxo, explica aí.
   - pensou: “Sou Detetive e ainda não vi corpo algum; emergência sem corpo no tique 9 desperdiça info. Branco pede atenção: pode estar testando reações ou é impostor. Roxo entrou num duto no t1 — só Engenheiro tripulante ou impostor faz isso, anoto. Vou relatar e cobrar o Branco.”
7. **Bordo** (Chantagista) r1: Tava no Admin o tempo todo fazendo tarefa, com o Laranja do lado, não vi nada estranho. Branco, emergência sem corpo no t9 só queima tempo — e o Roxo saindo de duto no Refeitório, isso aí é coisa de engenheiro ou de impostor, explica direito Roxo.
   - pensou: “Branco apertou botão sem corpo — ótimo alvo pra jogar a nave contra ele. Meu álibi é Admin com Laranja e o Ciano calado (chantageado), então posso falar tranquilo. O duto do Roxo é isca de graça: se ele não for Engenheiro, cai; se for, ele se queima explicando. Vou pressionar os dois levemente e fal”
8. **Coral** (Seguranca) r1: Nas câmeras do t1 eu vi o Roxo entrar num duto no Refeitório. Roxo, confirma se é Engenheiro e por que usou o duto? Por enquanto é a única evidência concreta; não vejo motivo pra votar no Branco sem explicação.
   - pensou: “Roxo entrou no duto diante das câmeras no t1, então precisa explicar: pode ser Engenheiro, mas é a única evidência concreta até agora. Branco apertou sem motivo claro, porém não há base para expulsá-lo. Vou pressionar Roxo sem afirmar certeza.”
9. **Roxo** (Engenheiro) r1: Pode me ver nas câmeras se quiser, mas sim, sou Engenheiro, duto é minha habilidade, usei pro motor. O que me estranha mais é o Branco apertar emergência sem achado nenhum no t9 — isso sim é jogada pra mudar o foco.
   - pensou: “Sou o Engenheiro, usar duto é meu poder legítimo. Vou confirmar com calma, sem parecer nervoso. O Branco apertou emergência sem corpo, o que é suspeito, mas vou focar em me defender primeiro. Também preciso proteger o Amarelo (meu par do casal), então vou evitar qualquer acusação forte que possa des”
10. **Ciano** (Medico) r1: 🤐 (chantageado: não consegue falar)
11. **Rosa** (Juiz) r1: Eu tava na O2 até t5 e vim pra Armas fazer asteroides, não vi nada. Branco, apertar botão sem corpo no t9 é no mínimo estranho, explica logo o motivo.
   - pensou: “Sem mortes, emergência do Branco no t9 é estranha, mas duto do Roxo tem explicação plausível de Engenheiro. Ciano está chantageado — impostor provavelmente quer silenciá-lo, anoto isso. Vou dar meu álibi e pedir explicação do Branco.”
12. **Verde** (Barulhento) r1: Roxo se justificou bem, duto é plausível pra Engenheiro. Branco, cadê a explicação da emergência? Sem nada concreto eu vou pular.
   - pensou: “Roxo justificou o duto como Engenheiro, e Coral confirma pelas câmeras — plausível. O problema real é Branco: emergência sem corpo no t9 só ajuda impostor, e a defesa dele está fraca até agora. Mas expulsar cedo sem prova é arriscado (cuidado com Palhaço). Vou cobrar explicação do Branco e pular.”
13. **Preto** (Cientista) r1: Confirmo que ninguém morreu até agora, então o botão do Branco não tem corpo por trás. Branco, explica o que você viu de fato, sem enrolar. Roxo, o duto foi no t1 e o motor não explica tudo, então depois te cobro.
   - pensou: “Sou Cientista, então sei que ninguém morreu até agora. O Branco não tem corpo nem motivo claro, mas o Roxo também tem uma história estranha com o duto. Não quero revelar meu papel de cara, porque o impostor pode usar isso. Se eu contar o que vi, arrisco ser caçado. Vou pedir explicação ao Branco e n”
14. **Branco** (Palhaco) r1: Eu vi o Vermelho entrar num duto no Admin, mas admito que apertei no impulso e posso ter interpretado errado. Se acharem que estou forçando a reunião, podem votar em mim; só não ignorem o duto.
   - pensou: “Preciso parecer culpado sem entregar o Vermelho de forma convincente; vou admitir uma observação real, mas me pintar como precipitado e contraditório.”
15. **Lima** (Detetive) r2: Branco, você viu QUEM no duto do Admin? Se não foi o Roxo, aí sim tem um impostor de duto. Mas você apertou o botão no impulso e isso já te queima um pouco. Enquanto isso não esclarece, eu pulo.
   - pensou: “Branco admitiu que foi no impulso e viu Vermelho num duto — mas só Roxo é Engenheiro confirmado. Branco viu alguém num duto no Admin sem ser engenheiro? Isso é forte suspeita de duto falso ou de impostor. Mas apertar emergência sem corpo também queima tempo. Prefiro pular ou pressionar mais.”
16. **Amarelo** (Piromante) r2: O duto do Vermelho precisa ser confirmado, mas o Branco apertou no impulso sem corpo e só trouxe isso depois. Eu pulo por enquanto e observaria Vermelho e Branco nas próximas rotas.
   - pensou: “Branco parece estar tentando criar confusão, mas o relato sobre Vermelho no duto é relevante. Preciso proteger Roxo sem parecer que estou defendendo demais; vou pedir confirmação independente e manter o foco em Branco pela emergência sem evidência.”
17. **Rosa** (Juiz) r2: Vermelho, responde logo: você usou duto no Admin? Se é Engenheiro, prova; se não, aí o botão do Branco serviu pra algo.
   - pensou: “Branco viu Vermelho no duto e admitiu o impulso; duto só faz sentido se Vermelho for Engenheiro ou impostor. Vermelho não se defendeu ainda do duto — isso me incomoda mais que o botão. Vou cobrar o Vermelho antes de votar.”
18. **Cinza** (Perito) r2: Eu não vi corpo nem atividade ilegal no Reator. Branco, você apertou sem achar nada; explain o que viu exatamente. Vermelho, se você entrou no duto do Admin, diga por quê — duto não prova culpa, mas a explicação precisa ser concreta. Vou observar antes de votar.
   - pensou: “A emergência do Branco foi precipitada, sem corpo, e ele só mencionou o duto do Vermelho depois. Não tenho prova de crime; o duto pode ser de um Engenheiro, e Verde, Marrom e Lima deixaram pegadas recentes no Motor Inferior. Melhor pressionar Vermelho sem acusar ninguém por agora.”
19. **Preto** (Cientista) r2: Pelos sinais vitais, ninguém morreu até agora, então não tem corpo escondido. Vermelho, o Branco disse que você entrou num duto no Admin: responde direto, por que você estava lá? Branco, quem exatamente você viu no duto? Sem nome concreto eu não voto em ninguém hoje.
   - pensou: “Ninguém morreu, então o botão do Branco é só ruído ou tentativa de tumulto. O duto do Roxo tem explicação de Engenheiro e a Coral viu nas câmeras. O do Vermelho no Admin, segundo o Branco, ainda não foi respondido direito. Quero que o Vermelho responda, sem votar às cegas.”
20. **Roxo** (Engenheiro) r2: Já deixei claro que sou Engenheiro, duto é meu. O que falta é o Vermelho explicar o duto do Admin — se ele não é Engenheiro aí tá ruim. E o Branco, botão sem corpo ainda é botão sem corpo, mesmo se viu alguém no duto.
   - pensou: “O Branco apertou sem corpo mas disse que viu Vermelho no duto do Admin. Se Vermelho não é Engenheiro, isso é forte contra ele. Preciso proteger o Amarelo (meu par de casal) — ele está se saindo bem, pulando e observando, o que é seguro. Vou reforçar a pressão no Vermelho e deixar o Branco com a dúvi”
21. **Vermelho** (Envenenador) r2: Eu entrei no duto no Admin só pra voltar rápido ao Refeitório depois de uma tarefa, não era sabotagem. O Branco apertou a emergência sem corpo e agora quer se esconder atrás do meu duto; questionem o motivo dele antes de me votarem.
   - pensou: “Branco é a maior suspeita: chamou a reunião sem corpo e agora tenta usar meu duto contra mim. Preciso dar uma explicação simples para o duto e jogar a pressão nele, sem mencionar o veneno.”
22. **Branco** (Palhaco) r2: Eu vi claramente o Vermelho entrar no duto no Admin, mas apertei no impulso e não tenho como provar. Se acham que estou forçando ou mentindo, podem votar em mim; só não deixem esse duto passar batido.
   - pensou: “Preciso parecer impulsivo e pouco confiável, mas manter a acusação contra Vermelho para não parecer uma confissão descarada. Se eu insistir que podem me votar, talvez aproveitem a emergência sem corpo.”
23. **Marrom** (Prefeito) r2: Gente, dois aqui confessaram duto: Roxo disse que é Engenheiro, e o Vermelho admitiu ter usado duto no Admin sem dizer que tem essa função. Só existe UM Engenheiro nessa nave. Vermelho, você é Engenheiro ou não? Porque tripulante comum não entra em duto.
   - pensou: “Duas pessoas admitiram usar duto: Roxo (diz ser Engenheiro) e Vermelho (não reivindicou função, só disse que usou 'pra voltar rápido'). Só existe UM Engenheiro. O Roxo tem testemunha (Coral nas câmeras no t1), o Vermelho não tem nada além da palavra dele e nem alegou ser Engenheiro. O Branco é suspe”
24. **Bordo** (Chantagista) r2: Vermelho, você admitiu o duto e o Roxo já se explicou como Engenheiro — só tem um na nave, então isso pra mim não fecha. Eu também vi você entrar no duto do Admin, e tripulante comum não faz isso: meu voto vai nele. Branco, emergência sem corpo foi precipitada, mas tua leitura bateu com a minha.
   - pensou: “O Vermelho se queimou sozinho ao admitir o duto sem ter a função — ele vai cair de qualquer jeito. Melhor eu confirmar o que vi (estava no Admin mesmo) e votar nele: ganho crédito de tripulante honesto e sumo da lista de suspeitos. Depois, com o Laranja, mato alvos isolados e uso a chantagem em quem”
25. **Coral** (Seguranca) r2: Vermelho admitiu o duto, mas Roxo já se confirmou como Engenheiro e só existe um. A inconsistência é direta; meu voto vai no Vermelho.
   - pensou: “Vermelho admitiu usar o duto, mas Roxo já se declarou Engenheiro; com apenas um Engenheiro, Vermelho é a inconsistência mais forte. Branco foi precipitado, porém a acusação foi corroborada por Bordo.”
26. **Laranja** (Apostador) r2: O duto é estranho, sim, mas o Branco admitiu que apertou no impulso — será que ele tá 100% certo da cor? Eu pulo por enquanto e observo as rotas.
   - pensou: “O Vermelho tá no fio da navalha — Bordo e Coral já votaram nele. Não posso defender abertamente ou vou me entregar. Vou semear dúvida na identificação do Branco (ele admitiu que foi no impulso) e pular. Assim não me coloco como protetor do parceiro. No chat secreto, aviso o Vermelho do perigo e perg”
27. **Azul** (Armador) r2: Eu vi o Roxo comigo na Enfermaria no t8 e o Vermelho no Refeitório no t4, sem nada estranho nos dois. Mas tripulante comum não entra em duto sem motivo, e o Vermelho não provou nada. Meu voto vai nele.
   - pensou: “Roxo é Engenheiro e confirmou com coerência, então dificilmente é o duto suspeito. O Vermelho admitiu duto sem dizer função e não explicou bem. Eu o vi perto de mim no Refeitório no t4. Nada que eu tenha visto prova que é impostor, mas ele é o mais suspeito agora. Meu voto vai nele.”
28. **Verde** (Barulhento) r2: Roxo já reivindicou Engenheiro, então o duto do Vermelho não tem desculpa — tripulante comum não entra em duto. Vou votar no Vermelho.
   - pensou: “Dois engenheiros impossíveis: Vermelho usou duto no Admin sem alegar Engenheiro, e Roxo já reivindicou a função. Duto sem função é praticamente prova de impostor. Voto no Vermelho.”
- votos: {'Vermelho': 'Branco', 'Azul': 'Vermelho', 'Verde': 'Vermelho', 'Rosa': 'Vermelho', 'Laranja': 'Vermelho', 'Amarelo': 'Vermelho', 'Preto': 'Vermelho', 'Branco': 'Vermelho', 'Roxo': 'Vermelho', 'Marrom': 'Vermelho', 'Ciano': 'Bordo', 'Lima': 'Vermelho', 'Cinza': 'Vermelho', 'Coral': 'Vermelho', 'Bordo': 'Vermelho'}
   - voto de Vermelho (Envenenador): “Meu voto em Branco ajuda a tirar o foco do duto e capitaliza a emergência precipitada sem corpo. Preciso parecer coerente e não denunciar Laranja nem Bordo.”
   - voto de Laranja (Apostador): “Vermelho já tem 4+ votos (Bordo, Coral, Azul, Verde). Meu voto não muda o resultado. Se eu votar diferente, me destaco e fico suspeito. Não tenho prova forte o bastante pra apostar na função de alguém sem risco de morrer. Melhor seguir o rebanho e proteger meu álibi. Perco um parceiro, mas sigo vivo”
   - voto de Amarelo (Piromante): “Vermelho admitiu usar duto enquanto Roxo já reivindicou ser o único Engenheiro. A inconsistência é forte e há várias confirmações independentes; vou acompanhar o voto nele.”
   - voto de Branco (Palhaco): “Vermelho admitiu usar o duto, apesar de Roxo já reivindicar ser Engenheiro. É a inconsistência mais concreta da reunião; vou votar nele, mesmo que isso também faça minha emergência parecer menos absurda.”
   - voto de Bordo (Chantagista): “Errei feio: me comprometi publicamente a votar no Vermelho, meu próprio parceiro, antes de ver a contagem. Agora, se eu pular, fico contraditório e queimado na próxima reunião sem nem garantir salvar ele — a maioria já está fechada no Vermelho (Coral, Azul, Verde, Marrom devem seguir). Voto nele pra”
- resultado: expulso=Vermelho eraImpostor=True papel=Envenenador anulada=None empate=False

### Reunião 1 (t16, corpo) chamada por Ciano — corpo de Marrom
0. **Cinza** (Perito) r1: Marrom foi encontrado no Motor Superior! Quem viu algo lá ou estava perto dele? Ciano, como encontrou o corpo?
   - pensou: “Marrom foi encontrado no Motor Superior, mas Ciano está chantageado e não pode falar. Não tenho prova para acusar ninguém; devo levantar o corpo e pedir que informem quem estava por perto, sem focar o suspeito apenas por comportamento. A verificação do corpo pelo Detetive ou as pegadas será mais con”
1. **Azul** (Armador) r1: Eu não passei pelo Motor Superior, tava na Navegação com o Verde agora e antes com a Lima. Não vi ninguém lá. Quem estava perto do Motor Superior nos últimos tiques?
   - pensou: “Não passei pelo Motor Superior nos últimos 8 tiques, então não vi nada. Estava em Navegação com Verde e antes com Lima, o que pode servir de álibi para nós dois. Ciano está calado pela chantagem, então não dá para confiar nem desconfiar dele agora. Quero que os outros expliquem onde estavam.”
2. **Roxo** (Engenheiro) r1: Eu tava em Motor Superior no t15 junto com o Ciano, o corpo já tava lá. Ciano tá chantageado e não pode falar... quem é o Chantagista aqui? Isso tá bem estranho.
   - pensou: “Eu tava em Motor Superior no t15 junto com o Ciano e já via o corpo do Marrom. Ciano foi chantageado e não pode falar, o que é bem suspeito - quem chantageou ele? Se Ciano é tripulante, um impostor o silenciou por ter achado o corpo. Se ele é impostor, outro impostor o chantageou (o que não faria se”
3. **Lima** (Detetive) r1: Roxo, se o corpo já estava lá no t15, por que só foi denunciado agora? E Ciano ficou parado do lado de um corpo sem reportar? Alguém mais estava perto do Motor Superior?
   - pensou: “Roxo diz que o corpo JÁ estava lá no t15 quando ele e Ciano passaram — mas Ciano só chamou a reunião agora? Ou Roxo está mentindo, ou Ciano ficou parado ao lado de um corpo sem denunciar, o que é muito suspeito. Mas Ciano está chantageado, então talvez não possa denunciar. Vou pressionar o Roxo.”
4. **Amarelo** (Piromante) r1: Eu não passei pelo Motor Superior nos últimos tiques. O atraso é estranho, mas como Ciano está chantageado precisamos ouvir quem esteve com ele no t15 antes de votar; não jogaria isso no Roxo sem confirmação.
   - pensou: “Preciso desviar a suspeita de Roxo sem parecer que estou protegendo meu parceiro. Ciano ficou ao lado do corpo e não denunciou imediatamente, mas está chantageado; melhor pressionar quem estava com ele e evitar qualquer voto precipitado.”
5. **Ciano** (Medico) r1: 🤐 (chantageado: não consegue falar)
6. **Laranja** (Apostador) r1: Tava na Admin fazendo tarefa, vi o Bordo por ali na t14 junto com o Branco. Alguém mais passou perto do Motor Superior nesses tiques?
   - pensou: “Bordo me pediu álibi. Eu tava em Admin no t13 (com Verde e Preto), t14 (com Branco) e t15 (fingindo tarefa). Vou dizer que vi ele por ali pra cobrir o kill. Não vou usar o poder ainda porque não tenho leitura forte suficiente de nenhum papel. Vou manter natural e curto.”
7. **Coral** (Seguranca) r1: Minhas câmeras mostravam o Motor Superior vazio no t13; então o corpo apareceu depois. Roxo, você diz que viu o corpo no t15: por que não reportou na hora, e onde estava o Ciano exatamente?
   - pensou: “As câmeras mostravam Motor Superior vazio no t13, então a morte ocorreu depois. Roxo admite estar com Ciano no t15 e diz que o corpo já estava lá, mas não explica por que não reportou; isso é suspeito, embora Ciano possa ser o assassino chantageado. Vou pressionar Roxo sem cravar ainda.”
8. **Verde** (Barulhento) r1: Roxo, você viu o corpo no t15 e não reportou na hora? Isso é bem estranho. E dá, você já te vi entrando num duto no Refeitório lá no começo — me explica esses dois pontos.
   - pensou: “Roxo admite que estava no Motor Superior no t15 e viu o corpo sem reportar. Ele também entrou num duto no t1. O atraso é muito suspeito, mas pode ser inocente também. Ciano está calado, então Roxo é a principal pista. Vou pressioná-lo.”
9. **Branco** (Palhaco) r1: Roxo fica bem suspeito por ter visto o corpo no t15 e deixado lá; mas o atraso do Ciano também pesa. Eu estava na Admin com Laranja e Bordo no t14, embora não tenha visto nada no Motor Superior.
   - pensou: “Roxo está muito suspeito por ter visto o corpo e não reportado, mas preciso parecer um pouco contraditório e suspeito também para atrair votos sem entregar que sou o Palhaço.”
10. **Preto** (Cientista) r1: Roxo, você entrou num duto no Refeitório no começo e agora diz que viu o corpo no t15 e não falou nada? Isso não fecha. Quem ficou perto do Ciano no t15 além de você pode confirmar onde ele estava?
   - pensou: “Roxo é o mais suspeito: entrou num duto no começo, disse que viu o corpo no t15 e não reportou, e a Coral viu a sala vazia no t13. Ciano está calado, então não dá para confirmar nada com ele. Eu estava no Refeitório com o Branco e não vi o Motor Superior desde o t7, quando passei com o Azul. Sou Cie”
11. **Rosa** (Juiz) r1: Eu tava em Armas o tempo todo, não vi nada do Motor Superior. Roxo, por que você viu o corpo no t15 e não reportou? Isso aí não fecha mesmo.
   - pensou: “Roxo disse que viu o corpo no t15 e não reportou — isso é forte suspeita, e ele tem histórico de duto. Mas pode ser viagem. Vou preservar meu poder de Juiz e pressionar Roxo primeiro.”
12. **Bordo** (Chantagista) r1: Eu tava na Admin no t14 com o Branco e o Laranja, os dois podem confirmar, depois desci pro Motor Inferior. Roxo, você viu o corpo no t15 com o Ciano do lado e não reportou na hora — isso pra mim é o mais estranho de tudo aqui.
   - pensou: “Laranja já me deu álibi de Admin no t14 e o Branco confirmou. Vou reforçar isso e empurrar o Roxo, que admitiu ter visto o corpo e não reportou — alvo perfeito. Ciano calado é ótimo, não preciso me preocupar com ele. Se o Roxo cair, ganho tempo.”
13. **Azul** (Armador) r2: Eu estava na Navegação com a Lima e depois com o Verde, então não vi o Motor Superior. Roxo, você viu o corpo e ficou calado; explica o que fazia lá no t15 antes de a gente votar.
   - pensou: “O Roxo é o suspeito mais forte: admitiu ter visto o corpo no t15, não reportou e ainda tem a história do duto. Eu não vi nada no Motor Superior. Acho que ele matou o Marrom ou está escondendo quem fez.”
14. **Cinza** (Perito) r2: Roxo, você viu o corpo no t15 e ficou calado. Quem mais estava lá e por que você não denunciou? Sem uma explicação, o voto mais justificado é em você.
   - pensou: “Roxo está muito suspeito: 본 encontrado o corpo no t15 e não denunciou, além de ter usado o duto no Refeitório. Ciano está chantageado, então o silêncio dele não prova culpa. Vou pressionar Roxo e votá-lo se não explicar.”
15. **Preto** (Cientista) r2: Sou Cientista e checo sinais: só Vermelho e Marrom estão mortos, sem corpo escondido. Roxo, eu vi você entrar num duto no Refeitório no t1 e agora diz que viu o corpo no t15 e não falou nada. Explica essa sequência, senão eu voto em você.
   - pensou: “Roxo é o mais suspeito: entrou num duto no Refeitório no t1 e só agora diz que viu o corpo no t15, sem denunciar. Mas ele pode estar falando a verdade, e o Ciano calado pela chantagem também pesa. Meus sinais vitais só mostram Vermelho e Marrom mortos, sem corpo escondido. Tendo a votar no Roxo se e”
16. **Coral** (Seguranca) r2: Roxo continua sendo o mais suspeito: você viu o corpo no t15, estava com Ciano e não reportou. E eu também te vi entrando num duto no Refeitório no começo; explica os dois pontos antes do voto.
   - pensou: “Roxo está muito suspeito: admitiu ver o corpo e não reportar, além de eu tê-lo visto entrar no duto. Ciano também é possível impostor, mas está chantageado e pode ter sido coagido; vou pressionar Roxo sem revelar que sou Segurança.”
17. **Rosa** (Juiz) r2: Roxo, a pressão tá toda em você e eu vi que você entrou no duto no Refeitório no começo também. Enquanto não explicar o duto E o silêncio no t15, meu voto é em você.
   - pensou: “Roxo está acabado: viu o corpo no t15, não reportou, e duas pessoas viram ele entrar num duto no início. Isso é muito forte. Guardo meu poder de anular, não vale gastar contra consenso quase total da sala.”
18. **Laranja** (Apostador) r2: Roxo, você viu o corpo no t15 e ficou parado, e ainda usou duto no começo. Isso não fecha pra tripulante. O Bordo tava comigo na Admin no t14, eu confirmo o álibi dele.
   - pensou: “A pressão tá toda no Roxo, perfeito pra proteger o Bordo. Já dei álibi pro Bordo na Admin. Vou só reforçar a suspeita no Roxo sem me expor. Não vou usar o poder ainda, não tenho certeza suficiente da função de ninguém.”
19. **Roxo** (Engenheiro) r2: Sou Engenheiro, duto é meu poder, não é motivo de suspeita. Tava com o Ciano lá no t15, ele que chamou a reunião — mas quem é o Chantagista que calou ele agora? Isso é o que realmente me preocupa.
   - pensou: “Todo mundo tá me atacando por duas coisas: o duto e não ter reportado. O duto é fácil de explicar - sou Engenheiro, duto é meu poder. O não reportar é mais difícil, mas eu tava com o Ciano, ele é meu álibi. Preciso ser direto e redirecionar a suspeita. O Ciano tá chantageado, isso é muito estranho -”
20. **Bordo** (Chantagista) r2: Roxo, duto eu até aceito, mas ficar parado do lado de um corpo é foda. E quem calou o Ciano com certeza tava no Motor Superior — por isso meu voto vai no Roxo.
   - pensou: “Roxo tá caindo sozinho e eu não vou me meter na frente do bonde. Se ele for Palhaço, paciência — não consigo segurar 10 votos sem me queimar. Melhor empurrar de leve e desviar a pergunta do Chantagista pra cima de quem tava no Motor Superior.”
21. **Branco** (Palhaco) r2: O duto do Roxo explica uma coisa, mas não o corpo; ainda assim, essa votação em massa tá fácil demais. Meu álibi na Admin é fraco e eu mesmo não consigo confirmar direito quem estava comigo, então podem considerar meu voto suspeito também.
   - pensou: “Quero parecer contraditório e inútil o bastante para desviar alguns votos para mim, sem confessar ser o Palhaço.”
22. **Lima** (Detetive) r2: Roxo, o duto eu engulo por ser Engenheiro, mas ficar do lado do corpo sem reportar não fecha. Se tiver um motivo real, fala agora, senão meu voto vai em você.
   - pensou: “Roxo se defendeu bem do duto, mas ficar do lado do corpo sem reportar continua esquisito. Já que quase todo mundo vai nele, prefiro esperar e ver; acusar em cima de consenso fácil pode ser cilada de Palhaço. Vou cobrir Ciano e cobrar explicação do Roxo sobre o silêncio.”
23. **Amarelo** (Piromante) r2: A explicação do duto é válida, mas o atraso continua sendo o ponto central: Ciano ficou ao lado do corpo e foi chantageado justamente nesta reunião. Eu não votaria no Roxo sem esclarecer quem o viu no t15 e por que o report só veio agora.
   - pensou: “Roxo é meu par e preciso evitar a expulsão dele. A votação em massa está conveniente demais; vou focar no atraso de Ciano e na possibilidade de chantagem para criar dúvida sem parecer que estou defendendo Roxo cegamente.”
24. **Verde** (Barulhento) r2: O duto eu aceito, Roxo, mas ficar do lado do corpo calado não fecha. E atenção: quem chantageou o Ciano provavelmente tava lá no Motor Superior também — votar no Roxo sem ouvir ele pode ser o que o impostor quer.
   - pensou: “Roxo tem o álibi do duto (Engenheiro, plausível), mas ficou ao lado do corpo sem reportar. Porém o Chantagista calou o Ciano justo agora — provavelmente o Chantagista estava no Motor Superior e não quer que o Ciano fale. Votar no Roxo pode ser o que os impostores querem; cuidado com o Palhaço também”
- votos: {'Azul': 'pular', 'Verde': 'pular', 'Rosa': 'pular', 'Laranja': 'Roxo', 'Amarelo': 'pular', 'Preto': 'pular', 'Branco': 'Preto', 'Roxo': 'Ciano', 'Ciano': 'Bordo', 'Lima': 'pular', 'Cinza': 'pular', 'Coral': 'pular', 'Bordo': 'Roxo'}
   - voto de Laranja (Apostador): “Roxo é Engenheiro (usou duto, confirmou na fala) e o grupo inteiro tá votando nele. Não vou apostar agora porque: 1) já vai ser expulso pelo voto coletivo, sem precisar de mim; 2) se eu apostar e acertar, fica óbvio que sou o Apostador e viro alvo; 3) prefiro guardar a aposta pra um momento em que r”
   - voto de Amarelo (Piromante): “Roxo está sob pressão demais e pode ser o Palhaço; além disso, expulsá-lo me mataria pelo vínculo. O atraso é suspeito, mas não há prova suficiente. Vou pular para evitar uma eliminação perigosa.”
   - voto de Branco (Palhaco): “A pressão no Roxo está forte demais e votar nele me faria parecer apenas mais um seguindo a manada. Vou votar no Preto, apesar do escaneamento visual, para deixar meu voto bem suspeito e aumentar as chances de me investigarem ou me expulsarem depois.”
   - voto de Bordo (Chantagista): “A multidão já está toda em cima do Roxo — Verde, Preto, Rosa, Coral, Cinza, Lima e o próprio Azul empurrando. Se eu tentar desviar agora, viro suspeito. Meu álibi com Laranja e Branco na Admin no t14 está confirmado por dois, então voto com a maioria no Roxo (Engenheiro, tripulante) para tirar um po”
- resultado: expulso=None eraImpostor=None papel=None anulada=None empate=False

### Reunião 2 (t25, corpo) chamada por Azul — corpo de Roxo
0. **Lima** (Detetive) r1: Roxo morto em Motor Superior e logo Ciano aparece chantageado, sem poder se defender? Isso é muito conveniente. O recado do além colocou Ciano lá perto da hora do corpo. Quem mais estava perto do Motor Superior entre t13 e t15, fala agora.
   - pensou: “Roxo morto em Motor Superior e o recado do além coloca Ciano lá no t15 — e Ciano está exatamente chantageado agora, ou seja, algum impostor silenciou ele. Isso cheira a impostor silenciando o próprio comparsa... ou proteção. Vou puxar isso pro chat e observar quem defende Ciano.”
1. **Rosa** (Juiz) r1: O recado culpa o Ciano pelo Marrom, mas ele tá calado por chantagem, não prova nada. Quem esteve perto do Motor Superior entre t19 e agora? Roxo morreu lá e ninguém viu nada, estranho demais.
   - pensou: “Ciano é chantageado, então o Chantagista quer silenciá-lo — talvez porque Ciano viu algo. O recado do além culpa Ciano pelo corpo do Marrom, mas isso pode ser manobra. O corpo de Roxo apareceu agora em Motor Superior, onde eu ia fazer tarefa. Vou perguntar quem estava perto de Motor Superior entre t”
2. **Branco** (Palhaco) r1: Eu passei pelo Motor Superior e não vi o Roxo, então meu álibi é bem ruim. O recado coloca Ciano lá no horário do Marrom; eu votaria nele, mas podem me investigar também porque minha rota foi estranha.
   - pensou: “Preciso parecer suspeito sem me entregar. Vou admitir uma movimentação ruim e contraditória, mas empurrar a suspeita para Ciano.”
3. **Cinza** (Perito) r1: Eu estou em Navegação desde o t22 e vi Lima no t23, depois Rosa e Preto chegando no t25. Ninguém aqui esteve comigo em Motor Superior; quem confirma o trajeto do Ciano?
   - pensou: “O recado é um forte indício contra Ciano, mas ainda não é prova; como Perito, vou registrar os que vi em Navegação e evitar uma acusação precipitada.”
4. **Preto** (Cientista) r1: Eu tava em Navegação com Verde, Rosa e Cinza, então não vi nada no Motor Superior. Recado anônimo não prova nada, pode ser armação de quem quer jogar o Ciano pra fora. Eu não voto sem prova, o Roxo foi morto escondido e isso é o que mais importa agora.
   - pensou: “Sou Cientista e vi que o Roxo morreu sem ninguém denunciar, então o corpo foi escondido. O recado do além é anônimo e pode ser armação de impostor. Ciano está calado, então não consegue se defender. Não vou votar só por causa do recado. Lima está pressionando muito e Cinza jogou o foco nela. Preciso”
5. **Bordo** (Chantagista) r1: Eu tava no Refeitório fazendo tarefa quase o tempo todo, e vi o Branco passar por aqui entre o t20 e o t21. Ele mesmo disse que o álibi dele é ruim no Motor Superior, então prefiro olhar pra ele antes de cravar no Ciano, que tá calado e não pode se explicar.
   - pensou: “Preciso desviar do Ciano (pode ser Palhaço e me ferrar, mas o recado já empurra ele) e plantar suspeita no Branco, que admitiu álibi ruim. Meu álibi é o Laranja dizendo que me viu... na verdade não, ele disse Admin. Eu digo que fiquei no Refeitório fazendo tarefa e vi o Branco por lá.”
6. **Laranja** (Apostador) r1: O Branco literalmente disse que o álibi dele é ruim no Motor Superior. Roxo morreu lá e ele passou por perto sem ver corpo? Isso não faz sentido. Ciano tá calado por chantagem, não por culpa. Foca no Branco.
   - pensou: “O Bordo acabou de matar o Amarelo e sabotou O2. Preciso desviar a atenção do Refeitório. O Branco já se expôs dizendo que o álibi dele é ruim, e o Bordo tá jogando ele. Vou empurrar o Branco enquanto o Bordo faz o mesmo. Ciano tá calado por chantagem, o que é conveniente pra mim - ele não pode se de”
7. **Azul** (Armador) r1: Eu não tava em Motor Superior no t15, tava em Navegação com Lima e Verde, então o recado não bate comigo. Mas no t19 eu vi Branco e Ciano juntos ali. Branco, o que vocês fizeram lá?
   - pensou: “Eu estava em Navegação no t15 e no t16, então não posso confirmar o recado. Mas vi Branco e Ciano juntos em Motor Superior no t19, e Branco admitiu que o álibi dele é ruim. Ciano está calado, então não pode se defender. Quero pressionar o Branco sem jogar tudo no Ciano, e preciso consertar o O2 agor”
8. **Verde** (Barulhento) r1: Azul disse que viu Branco e Ciano juntos no Motor Superior no t19, e o próprio Branco admitiu álibi ruim lá. Branco, explica direito o que você fazia lá?
   - pensou: “Ciano foi chantageado justamente nesta rodada — conveniente demais para os impostores, o que sugere que o Chantagista quer calar alguém suspeito ou proteger alguém. O recado do além aponta Ciano no Motor Superior no t15, perto da morte do Marrom. Azul viu Branco e Ciano juntos no t19 ali, e Branco c”
9. **Ciano** (Medico) r1: 🤐 (chantageado: não consegue falar)
10. **Coral** (Seguranca) r1: Minhas câmeras confirmam Azul e Ciano no Motor Superior no t20, e Roxo lá no t24; não vi Branco nesses registros. O recado pesa contra Ciano, mas com ele chantageado eu pressionaria Branco primeiro: explica exatamente o que fez com Ciano no t19?
   - pensou: “Ciano é suspeito pelo recado e por ter sido visto com Branco no Motor Superior, mas está chantageado e não pode se defender. Branco também está mal posicionado; minha câmera só confirma Azul no Motor Superior no t20 e Roxo no t24, então não tenho prova direta do assassino. Quero pressionar Branco e ”
11. **Coral** (Seguranca) r2: Branco, explica exatamente por que Azul te viu com Ciano no Motor Superior no t19, mas minhas câmeras não te registraram lá no t20. O recado mantém Ciano suspeito, mas eu não votaria nele sem ouvir essa explicação.
   - pensou: “Branco está se contradizendo e foi visto por Azul com Ciano no Motor Superior, mas minhas câmeras não o pegaram no t20. Ciano continua suspeito pelo recado e por ter denunciado Marrom, porém a chantagem impede sua defesa; pressionaria Branco e evitaria votar no escuro.”
12. **Branco** (Palhaco) r2: Fui ao Motor Superior no t19, vi Ciano e Azul, mas saí rápido e não vi corpo nenhum; talvez eu tenha passado justamente pelo canto cego. Ainda acho Ciano estranho por estar lá no horário do Marrom, mas se quiserem me expulsar, façam logo.
   - pensou: “Quero parecer suspeito o bastante para concentrarem os votos em mim, mas sem confessar. Vou dar uma explicação inconsistente sobre Motor Superior e levantar Ciano como alternativa.”
13. **Verde** (Barulhento) r2: Coral confirmou por câmera: Ciano e Azul estavam em Motor Superior no t20, e Roxo morreu lá no t24. Branco saiu rápido e não viu corpo, plausível. Já o Ciano apareceu na cena do Marrom E perto do Roxo morto, calado por chantagem é desculpa perfeita. Estou entre os dois, puxando mais pro Ciano.
   - pensou: “Coral confirmou por câmeras que Azul e Ciano estavam em Motor Superior no t20, e Roxo morreu lá no t24. O Branco admitiu que estava lá no t19, mas a câmera não o pegou no t20. O Ciano chantageado não se defende — isso é exatamente o que um impostor quereria. Mas o recado do além coloca o Ciano na ce”
14. **Cinza** (Perito) r2: Ciano, o recado te coloca com Marrom no t15 e as câmeras te colocam no Motor Superior perto do Roxo. Branco explicou a passagem, você ainda não: por que estava lá? Eu pediria para verificar as pegadas do Motor Superior antes de decidir.
   - pensou: “O recado anonímio não é prova definitiva, mas coloca Ciano junto do corpo de Marrom no t15, e as câmeras o colocam no Motor Superior onde Roxo morreu. Branco deu uma explicação plausível; entre os dois, Ciano tem mais suspeita, mesmo estando chantageado.”
15. **Laranja** (Apostador) r2: Ciano tá nas câmeras do Coral no Motor Superior no t20, o recado coloca ele no t15, e ele ainda tá calado não pode se defender. Isso é muita coincidência pra ser inocente. Votação: Ciano.
   - pensou: “Roxo morreu no Motor Superior. O recado do além e as câmeras do Coral colocam Ciano lá. Bordo já tá chantageando Ciano. Vou puxar mais pro Ciano agora, já que o Branco já se defendeu bem e as câmeras confirmam Ciano na cena. Não vou apostar ainda - preciso de mais certeza.”
16. **Preto** (Cientista) r2: Checando sinais: só o Roxo morreu agora, sem corpo novo escondido. Tem sabotagem de O2 e eu tô perto dele, então quem for comigo pro O2 me avisa. Ciano tá calado, então não dá pra votar só no recado. Branco, sua rota no Motor Superior no t19 ainda não fecha com as câmeras da Coral. Quero pegadas antes de cravar alguém.
   - pensou: “Roxo morreu no Motor Superior e ninguém viu nada. O recado contra o Ciano pode ser armação, mas ele também está calado, então não dá para ouvir a versão dele. O Branco tem a rota mais furada, mas nada prova que é impostor. Não quero votar sem prova. A sabotagem de O2 também precisa ser resolvida ago”
17. **Azul** (Armador) r2: Eu tava em Motor Superior no t19 e t20 com Branco e Ciano, e não vi corpo nenhum até o t24. Não estava lá no t15, então o recado não me pega. Sem pegadas do Motor Superior eu não voto em ninguém; alguém checa pegadas e a gente conserta o O2 antes que dê ruim.
   - pensou: “Não sou impostor. Estive em Motor Superior no t19 e t20 com Branco e Ciano, mas não vi o corpo do Roxo até o t24. O recado pesa contra o Ciano, mas ele está calado e não consigo confirmar nada. Branco também está fora do próprio álibi. Não quero votar no escuro: prefiro pedir pegadas e consertar o O”
18. **Lima** (Detetive) r2: O Branco mudou de versão: primeiro 'rota estranha', depois 'passei rápido'. As câmeras da Coral não te pegaram no t20, Branco. Voto nele, Ciano calado não me convence mas recado só não basta.
   - pensou: “Azul confirma minha presença em Navegação no t15, então ele parece honesto. Branco deu versão vaga e as câmeras do Coral não o pegaram no t20 — suspeito dele. Ciano calado é ruim, mas recado sozinho não basta. Voto no Branco, cuidado com Palhaço escondido.”
19. **Bordo** (Chantagista) r2: Branco mudou de versão duas vezes e a câmera da Coral não o pega onde ele diz que estava. Eu vi ele passar rápido pelo Refeitório entre t20 e t21 todo nervoso — voto nele, e depois corremos pro O2.
   - pensou: “O Ciano está calado por minha chantagem e o recado anônimo já jogou ele na fogueira — mas se ele for o Palhaço, expulsá-lo acaba o jogo e nós perdemos. Melhor empurrar o Branco, que já mudou de versão e o Lima está puxando. Preciso manter meu álibi de Refeitório e torcer pra o O2 não ser consertado ”
20. **Rosa** (Juiz) r2: Banco no Branco: ele mudou de versão e a Coral não viu ele no t20. Ciano calado é alvo fácil demais, chantagem não é culpa. Voto Branco.
   - pensou: “Banco no Branco: álibi ruim, mudou de versão e câmeras da Coral não o pegam no t20. Ciano calado não prova nada, chantagem é armadilha. Vou puxar pro Branco.”
- votos: {'Azul': 'pular', 'Verde': 'Branco', 'Rosa': 'pular', 'Laranja': 'Branco', 'Preto': 'pular', 'Branco': 'Ciano', 'Ciano': 'Laranja', 'Lima': 'Branco', 'Cinza': 'Branco', 'Coral': 'pular', 'Bordo': 'Branco'}
   - voto de Laranja (Apostador): “Bordo tá levando a galera pro Branco de propósito pra se livrar. Vou seguir o fluxo e votar Branco pra não me expor. Não vou apostar agora: não tenho certeza da função de ninguém, e errar me mata. Guardo as 2 apostas pro momento certo.”
   - voto de Branco (Palhaco): “Preciso manter a pressão e parecer incoerente o bastante para consolidarem meu voto. Ciano é o alvo mais óbvio, então votar nele reforça minha postura suspeita sem parecer uma confissão.”
   - voto de Bordo (Chantagista): “Ciano tá chantado por mim e não pode se defender — perfeito bode expiatório, mas a maré já virou pro Branco. Votar com a maioria (Branco) mantém meu álibi de 'tripulante indignado' e tira um tripulante sem me expor. Se a nave expulsar o Branco, ganhamos tempo e o Laranja segue com o Apostador dele. ”
- resultado: expulso=None eraImpostor=None papel=None anulada=Rosa empate=False

### Reunião 3 (t35, corpo) chamada por Laranja — corpo de Verde
0. **Ciano** (Medico) r1: Esse recado é mentira, eu não denunciei nada no t15. Laranja, você achou o corpo do Verde em Admin, quem você viu lá no t34?
   - pensou: “Sou tripulante (Médico) com escudo ativo em Azul. O recado sobre o t15 é mentira minha, não denunciei ninguém. Desconfio do Laranja, que sempre aparece com corpo pronto (Roxo, Verde). Não sei quem estava em Admin no t34.”
1. **Azul** (Armador) r1: Eu não vi nada no Admin, estava nos Escudos. Ciano, você acusou o Laranja logo de cara, e no t19 estava no Motor Superior com o Branco. Por que essa pressa em jogar a culpa em outro?
   - pensou: “Não vi o Admin, então não tenho prova de nada. O Ciano acusou o Laranja logo de cara e estava com o Branco no Motor Superior no t19. Acho que ele está fugindo do recado. Ainda não tenho certeza.”
2. **Preto** (Cientista) r1: Confiro sinais vitais e os mortos batem com a lista, Verde foi o último. Laranja, quem estava perto de você em Admin no t34? Ciano, você acusou o Laranja muito rápido, e isso me deixa desconfiado.
   - pensou: “Ciano tá acusando rápido e ainda contradiz o recado do t15 sem prova. Azul também defendeu o Ciano com pressa. Cinza está calado, então não posso contar com ele. Sinais vitais batem com a lista, então o corpo do Verde foi o único morto novo. Quero saber quem estava perto do Laranja em Admin.”
3. **Lima** (Detetive) r1: O recado do além põe o Ciano do lado do corpo do Marrom, e ele nega. Ciano, você tem álibi pro t15? Laranja, quem mais viu em Admin antes de achar o Verde?
   - pensou: “Sou Detetive, mas não estou perto do corpo — o alerta do Verde só confirma Admin t34. O recado do além acusa Ciano em Motor Superior t15, mas ele alega que mentiu. Ciano estava comigo em O2 t28-30, o que é meio álibi. Preto diz que confere sinais vitais — pode ser o Cientista. Preciso de mais info d”
4. **Cinza** (Perito) r1: 🤐 (chantageado: não consegue falar)
5. **Laranja** (Apostador) r1: Tava sozinho no Admin fazendo tarefa, apareceu o corpo e chamei na hora. Ciano, você foi o primeiro a me acusar sem ter visto nada, e o recado do além te coloca do lado do corpo do Marrom. Me explica isso aí.
   - pensou: “Matei o Verde no Admin no t34, tava sozinho. Bordo saiu pelo duto no t31 então não tinha ninguém. Vou me defender rápido e jogar a culpa pro Ciano que já tá com o recado do além contra ele e a acusação apressada. Não vou mencionar o Bordo pra não levantar suspeita de por que dois impostores tavam no”
6. **Coral** (Seguranca) r1: Azul é confirmado pelas escudos. Vi Laranja sozinho em Admin nas câmeras no t28, mas não no momento exato; Ciano, você tem álibi pro t15 e por que acusou tão rápido?
   - pensou: “Azul é tripulante confirmado. Ciano está muito suspeito pelo recado e por acusar Laranja sem evidência, mas Laranja também esteve sozinho em Admin nas câmeras. Vou cobrar álibi do Ciano e deixar claro que não vi o momento exato da morte.”
7. **Branco** (Palhaco) r1: Eu não vi ninguém em Admin e minha leitura até agora foi péssima: votei no Ciano sem prova e fui salvo por uma anulação estranha. Se o juiz não aparecer, eu entendo totalmente quem quiser votar em mim.
   - pensou: “Preciso parecer suficientemente suspeito para puxar votos, sem confessar. A menção ao juiz e às minhas acusações anteriores pode reacender a desconfiança sobre mim.”
8. **Bordo** (Chantagista) r1: Passei por Admin no t30 e o Laranja tava sozinho fazendo tarefa, não vi ele sair de perto de ninguém. E o Ciano é o único que apareceu do lado do corpo do Marrom no recado do além, além de acusar o Laranja sem prova nenhuma — isso pra mim é cortina de fumaça.
   - pensou: “O Ciano tá me atacando o Laranja, preciso segurar o álibi dele e virar o foco pro Ciano. Se eu disser que passei por Admin e vi o Laranja sozinho na tarefa, reforço a versão dele sem me comprometer. O recado do além já colocou o Ciano perto do corpo do Marrom — só empurrar.”
9. **Rosa** (Juiz) r1: Eu tava nas luzes resolvendo a sabotagem, sem par saiu da minha vista. Ciano, você joga nos dois lados: negou o recado do t15 e já saiu acusando o Laranja sem prova. Explica isso aí.
   - pensou: “Ciano tá acumulando suspeitas demais: recado do t15, acusação apressada contra o Laranja. Eu vi ele em O2 no t28 e ele apareceu do nada em Elétrica no t35. Não tenho nada forte contra o Ciano em Elétrica, mas ele que se explique.”
10. **Bordo** (Chantagista) r2: Ciano não deu álibi do t15 e já saiu acusando o Laranja sem prova. Eu mantenho meu voto nele.
   - pensou: “O Ciano já está na mira de quase todos e o Laranja está empurrando forte. Se a nave votar nele, a gente ganha mais um tique e fica mais perto da vitória. Só preciso tomar cuidado pra ele não ser o Palhaço, mas não dá pra hesitar agora.”
11. **Coral** (Seguranca) r2: Ciano segue sem álibi para o t15 e acusou o Laranja rápido demais. Com o recado e esse comportamento, voto Ciano.
   - pensou: “Ciano continua sem explicar o álibi do t15 e acusou Laranja imediatamente, parecendo tentar desviar a suspeita. Laranja tem uma linha do tempo coerente nas câmeras e Bordo o viu em Admin; vou votar no Ciano.”
12. **Lima** (Detetive) r2: Ciano, você negou o recado mas nunca deu álibi de verdade pro t15, e acusou o Laranja sem ter visto nada. Isso é clássico impostor virando o jogo. Voto Ciano.
   - pensou: “Ciano está acuado: recado do além no t15 + acusações sem prova. Ninguém o defendeu. Coral e Bordo estão confirmados como tripulantes tentando organizar. Vou somar ao voto no Ciano.”
13. **Azul** (Armador) r2: Eu tô meio desconfiado do Ciano pelo recado e por não dar álibi, mas a votação virou rápido demais. Bordo, o que você viu de fato no t15 ou no t30, além do Laranja sozinho?
   - pensou: “Não tenho prova de ninguém. O recado põe o Ciano perto do corpo do Marrom e ele não deu álibi, mas a votação está se formando rápido demais em cima dele. O Bordo está pressionando forte e o Lima e a Coral seguiram. Pode ser cortina de fumaça de impostor. Tenho que votar com cuidado.”
14. **Branco** (Palhaco) r2: Eu também acho o Ciano suspeito, mas essa votação em massa está conveniente demais; se eu fosse impostor, olharia primeiro para quem anulou a votação anterior — podem votar em mim se acharem que estou me contradizendo.
   - pensou: “Quero parecer inconsistente e levantar suspeita suficiente para receber votos, sem confessar. Ciano está praticamente condenado, então contrariar a maioria e trazer meu histórico estranho pode me tornar o alvo.”
15. **Preto** (Cientista) r2: Confiro sinais vitais e bate: o Verde foi o último a morrer. Ciano, sem álibi do t15 e acusando o Laranja sem prova, meu voto é em você. Bordo, você só repetiu votos; o que você viu de fato?
   - pensou: “Os sinais vitais batem com a lista, então o Verde é o último morto. O Ciano continua sem álibi do t15 e acusou o Laranja cedo demais, então é meu voto. O Bordo só repete votos e não trouxe nada novo, e pode estar seguindo a manada de propósito. Cinza está calado, então não dá para contar com ele ago”
16. **Rosa** (Juiz) r2: Ciano, se você tem álibi pro t15, fale agora. Se não, meu voto é nele mesmo — dois recados e o comportamento batem.
   - pensou: “Ciano está tomando todos os votos sem defesa real. Laranja e Bordo confirmam que ele não tem álibi. Mas cuidado com votação rápida demais — pode ser impostor empurrando. Ciano com 5+ votos já está perdido; melhor manter foco nele.”
17. **Laranja** (Apostador) r2: Reforço o que o Bordo disse: tava comigo no Admin do t27 pro t34, ninguém mais entrou. Ciano, se é inocente prova seu álibi do t15, porque todo mundo tá apontando pra você e você tá calado.
   - pensou: “Todo mundo já tá no Ciano, meu álibi com o Bordo tá firme. Não vou apostar ainda porque não sei a função exata de ninguém com certeza. Vou só reforçar o que já tá sendo dito e manter minha história limpa.”
18. **Ciano** (Medico) r2: Não fui eu no t15, o recado é anônimo e não prova nada. Mas no t21 alguém tentou matar o Branco no Refeitório, ele estava com meu escudo, e Bordo estava perto da cena. Quem está puxando votos em massa contra mim é o Bordo.
   - pensou: “Sou tripulante e o recado do t15 é mentira, não tenho lembrança de estar em Motor Superior nesse tique. Bordo está puxando os votos e estava perto do ataque falho no Refeitório no t21, onde tentaram matar o Branco protegido pelo meu escudo. Ele é o alvo mais suspeito. Preciso fazer o grupo olhar par”
- votos: {'Azul': 'Ciano', 'Rosa': 'Ciano', 'Laranja': 'Ciano', 'Branco': 'Bordo', 'Ciano': 'Bordo', 'Lima': 'Ciano', 'Cinza': 'Ciano', 'Coral': 'Ciano', 'Bordo': 'Ciano'}
   - voto de Laranja (Apostador): “Todos estão votando no Ciano, vou seguir o fluxo pra não me destacar. Quanto à aposta: o Preto literalmente disse 'confiro sinais vitais' três vezes na reunião - ele se entregou como Cientista. É a aposta mais segura que existe, e remover o Cientista tira do time a capacidade de verificar mortes e d”
   - voto de Branco (Palhaco): “Não tenho como votar em mim. Ciano está recebendo votos demais e pode ser uma eliminação conveniente; Bordo tentou me matar e está conduzindo a acusação com muita segurança. Vou votar nele para parecer contraditório e levantar suspeita sobre mim.”
   - voto de Bordo (Chantagista): “Todo mundo já tá votando no Ciano e ele acabou de me acusar de estar perto do Branco no t21 — preciso enterrar isso. Ele se entregou como Médico (deu escudo no Branco), então não é o Palhaço; expulsar ele é seguro e tira um tripulante com função forte de circulação. Voto junto com a manada pra mante”
- resultado: expulso=Ciano eraImpostor=False papel=Medico anulada=None empate=False

### Reunião 4 (t51, corpo) chamada por Cinza — corpo de Branco
0. **Rosa** (Juiz) r1: Gente, no t46 eu VI o Bordo entrando num duto aqui no Reator, do lado do Motor Superior onde o Branco morreu. Bordo, explica isso agora.
   - pensou: “Vi o Bordo entrar num duto no Reator no t46, e o corpo do Branco apareceu em Motor Superior, sala vizinha. Impostores não usam duto, só o Engenheiro... mas também poderia ser meta. Ainda assim é forte. E o Cinza 'achou' corpo de novo, como na partida 1. Vou soltar a info do duto e ver a reação.”
1. **Coral** (Seguranca) r1: Bordo, a Rosa te viu entrando no duto no t46, justamente perto do Motor Superior. Nas minhas câmeras, o Motor Superior estava vazio em t45 e t49; voto no Bordo.
   - pensou: “Bordo foi visto entrando no duto e estava ligado à região do Motor Superior onde Branco morreu; isso é evidência forte de que ele é impostor. Minhas câmeras também não viram ninguém no Motor Superior em t45 ou t49, então a rota dele é muito suspeita. Precisamos expulsar Bordo, mas evitar espalhar su”
2. **Cinza** (Perito) r1: Bordo, você entrou no duto às 46 e aonde foi? O corpo apareceu perto dali, então explica essa passagem antes da gente decidir.
   - pensou: “O corpo já estava antes de o Bordo entrar no duto, e minhas pegadas não mostram passagem recente por ele; isso não prova inocência, pois o duto pode evitar marcas. Rosa viu Bordo perto do local, então ele é a suspeita mais forte, mas quero ouvir a explicação dele antes de cravar o voto.”
3. **Laranja** (Apostador) r1: Tava na Elétrica fazendo tarefa, Coral me viu por ali. Mas olha, Lima tava SOLO no Motor Inferior do lado do Motor Superior nessa janela de tempo entre o kill e o corpo ser achado. Quem mais tinha acesso àquela área?
   - pensou: “Bordo tá no carvão: Rosa viu ele no duto, Coral confirmou câmeras vazias, Cinza tá no topo. Preciso desviar a atenção pra Lima, que tava solo no Motor Inferior (adjacente ao Motor Superior) nessa janela de tempo. Vou dizer que tava na Elétrica (Coral me viu) e botar a dúvida no Lima.”
4. **Azul** (Armador) r1: Confirmo o duto: eu vi o Bordo SAINDO do duto aqui no Motor Inferior no t46, e ele ficou perto de mim várias vezes. Bordo, explica o que estava fazendo nos dutos. Eu acho que o voto tem que ir pra ele.
   - pensou: “Eu vi o Bordo saindo do duto no Motor Inferior no t46, então o relato da Rosa bate com o que eu vi, só que foi aqui e não no Reator. O Bordo também apareceu perto de mim no t38, t46 e t48. Não vi ninguém matar. Estou sozinho agora e as minhas tarefas estão todas feitas. O Bordo é o suspeito mais for”
5. **Bordo** (Chantagista) r1: Sou Engenheiro, sim usei duto — tava me movendo rápido do Reator pro Motor Inferior, não matei ninguém. E ninguém vai olhar pro Lima, que tava SOLO no Motor Inferior exatamente na janela do crime?
   - pensou: “Três pessoas me viram no duto, negar é suicídio. Vou reivindicar Engenheiro — se o Engenheiro real existir, provavelmente ainda não se revelou, e eu ganho uma rodada de dúvida. Empurro a suspeita pro Lima, que o Laranja já plantou, pra dividir os votos. Se eu sobreviver, chantageio o Coral (câmeras)”
6. **Lima** (Detetive) r1: Laranja, eu NÃO tava no Motor Inferior: fiz tarefa no Reator t40 e depois estava em Navegação com o Cinza t44-46, ele me viu. Bordo justificou o duto sendo Engenheiro. Você tá jogando suspeita sem prova, tá desesperado pra desviar? Voto no Laranja.
   - pensou: “Bordo confirmou ser Engenheiro, duto é dele. Laranja me jogou under the bus, mas eu estava em Navegação/Reator nesse período com testemunhas. Bordo saiu do duto no Motor Inferior perto do Azul no t46, e o corpo apareceu perto de lá — mas Engenheiro com duto é explicação plausível. Vou dar meu álibi ”
7. **Bordo** (Chantagista) r2: Duto é poder de Engenheiro, não prova de kill — se fosse assassino eu não entraria em duto na frente da Rosa. Quem tá desesperado pra desviar é o Laranja, que acusou o Lima mesmo com o Cinza confirmando o álibi dele. Voto no Laranja.
   - pensou: “Rosa e Azul me pegaram no duto — negar é inútil, então uso o fato de que duto é poder do Engenheiro. Preciso virar a mesa rápido e o Laranja facilitou: acusou o Lima que tem álibi do Cinza. Vou empurrar o voto nele pra sobreviver, mesmo sendo meu parceiro — se eu cair, os impostores perdem o Chantag”
8. **Laranja** (Apostador) r2: Bordo, você usou Chantagem no Branco, mas Engenheiro não tem esse poder. Você mentiu na função. A Rosa te viu no duto perto do corpo, não é álibi de Engenheiro, é fuga de culpado. Voto no Bordo.
   - pensou: “Tô f*da. O Bordo tá me incriminando com a 'tática do palhaço' (me chamar de desonesto pra me expulsar e ganhar como Palhaço? Ou ele é mesmo Engenheiro e tô sendo a galinha?). Mas se eu for Palhaço, morro e ele perde. Se ele for Engenheiro, eu tô exposto por ter mentido na acusação. Preciso desviar o”
9. **Azul** (Armador) r2: Eu tava sozinho no Motor Inferior e vi o Bordo perto de mim no t46 e no t48, saindo do duto. E ele se disse Engenheiro, mas Chantagem não é poder de Engenheiro. Voto no Bordo. Cinza, você tava no Motor Superior no t50 e foi você que achou o corpo, o que viu lá?
   - pensou: “Bordo é o mais suspeito: saiu do duto perto do Motor Superior no t46, esteve comigo no t46 e no t48, e mentiu ao dizer que o Engenheiro pode usar Chantagem. Cinza estava no Motor Superior no t50 pelas câmeras e foi quem achou o corpo, então também merece uma pergunta. Lima tem álibi nas câmeras (Nav”
10. **Cinza** (Perito) r2: No Motor Superior não há pegadas de ninguém nos últimos 4 tiques, então o corpo veio antes ou pelo duto. Bordo, você passou pelo duto perto do corpo e ainda mentiu sobre seu poder; explica isso antes de alguém votar em Laranja.
   - pensou: “As pegadas do Motor Superior não mostram ninguém nos últimos 4 tiques, então o corpo foi colocado antes ou por duto; isso não elimina Bordo. A视力 de Rosa e Azul no duto, além da contradição sobre Chantagem versus Engenheiro, torna Bordo o suspeito mais forte, enquanto Laranja está tentando desviar a ”
11. **Lima** (Detetive) r2: Bordo, responde direto: você chantageou o Branco? Laranja, me acusar de estar no Motor Inferior quando o Cinza me viu em Navegação é mentira crua — isso cheira a desespero de impostor. Voto no Laranja.
   - pensou: “Laranja acusou Bordo de Chantagem, mas eu fui Chantagista nas partidas passadas... não, Espera: quem chantageia é impostor. Bordo não confirmou nem negou isso direito. Mas Laranja me acusou sem prova e mentiu sobre onde eu estava — e ele era o único que apontou pra mim. Não tenho como provar nada de”
12. **Coral** (Seguranca) r2: Bordo foi visto no duto junto da área do corpo e ainda não explicou a suposta chantagem no Branco. Lima tem o álibi do Cinza; mantenho meu voto no Bordo.
   - pensou: “Bordo é o principal suspeito: foi visto usando duto perto do corpo, sua história é inconsistente e Laranja o acusa de chantagem. Lima tem álibi confirmado por Cinza; a acusação de Laranja contra Lima parece desvio, mas Bordo ainda é o alvo mais forte.”
13. **Rosa** (Juiz) r2: Bordo, t46 você entra no duto no Reator e sai no Motor Inferior, do lado do corpo. Engenheiro explica USAR o duto, mas não explica a mentira da chantagem. Vou de Bordo.
   - pensou: “Bordo no duto a uma sala do corpo, e o Azul confirma que ele saiu no Motor Inferiro. A defesa dele é fraca e o Laranja pegou uma incoerência real no papel. Vou somar voto no Bordo, mas manter o poder do Juiz guardado caso a votação recaia num inocente.”
- votos: {'Azul': 'Bordo', 'Rosa': 'Bordo', 'Laranja': 'Bordo', 'Lima': 'Bordo', 'Cinza': 'Bordo', 'Bordo': 'Laranja'}
   - voto de Laranja (Apostador): “Coral usou 'nas minhas câmeras' com timestamps específicos (t45, t49) — é uso público do poder de Segurança, praticamente confirmação de função. Se acertar, morre o cara que vê todo mundo se mexer, que é a maior ameaça pra mim agora. Bordo vai ser expulso de qualquer jeito (4 votos contra ele já), e”
   - voto de Bordo (Chantagista): “O Laranja me traiu na reunião: inventou que eu usei Chantagem no Branco, sendo que o Chantagista sou eu e ele é meu parceiro Apostador. Ele tá tentando se salvar me queimando. A maioria já parece inclinada a votar em mim pelo duto (Rosa, Coral, Azul, provavelmente Cinza). Minha única chance é empilh”
- resultado: expulso=Bordo eraImpostor=True papel=Chantagista anulada=None empate=False

### Reunião 5 (t53, emergencia) chamada por Lima
0. **Lima** (Detetive) r1: Chamei emergência pra organizar: falta pouco pra 100% das tarefas, não pode morrer ninguém. Onde cada um estava na sabotagem de luzes do t50? Eu tava terminando rota na Navegação e vi o Cinza por lá pouco antes.
   - pensou: “Fiquei com 4 vivos: Azul, Rosa, Laranja, Cinza. Bordo era impostor, então deve sobrar 1 impostor entre eles (ou neutro). Cinza encontrou corpo em Motor Superior e os consertos de luz sempre rolam rápido demais... vou pedir alibis e observar quem responde.”
1. **Cinza** (Perito) r1: Eu não estava na sabotagem das luzes; estava no Motor Superior com o corpo de Branco. Depois disso, não matei nem escondi ninguém. Cada um confirma onde estava exatamente no t50, porque estamos perto de 100% e não podemos expulsar por suposição.
   - pensou: “Com 94% das tarefas e só cinco vivos, expulsar agora é muito arriscado. Lima está tentando alinhar álibis, mas a inconsistência entre t44/t46 e t50 merece ser esclarecida. Vou defender que não estava na sabotagem das luzes e pedir posições exatas, evitando uma expulsão apressada.”
2. **Azul** (Armador) r1: Eu já fiz todas as minhas tarefas. No t38, o Laranja subiu no scanner da Enfermaria e o scan NÃO ligou, então ele não estava fazendo tarefa de verdade. As câmeras do t50 mostram Cinza no Motor Superior e Lima na Navegação, e o Laranja não aparece em nenhuma sala. Laranja, onde você estava no t50?
   - pensou: “Eu sou tripulante e já terminei todas as minhas tarefas. O Laranja é o suspeito mais forte: no t38 ele subiu no scanner e o scan não ligou, o que indica que ele não estava fazendo tarefa de verdade. Ele também achou o corpo do Verde e votou em cima do Ciano, que era inocente. O Bordo votou nele no f”
3. **Laranja** (Apostador) r1: Eu tava na Elétrica na hora da sabotagem, depois fui pro Motor Superior. O scan da Enfermaria não era minha tarefa, só passei ali. Cinza, você tava no Motor Superior o tempo todo perto do corpo do Branco — não acha que é estranho você ser o primeiro a encontrar?
   - pensou: “Azul tá me pressionando com o scan da Enfermaria no t38 e dizendo que não me viu em nenhuma sala no t50. Na verdade eu tava na Elétrica fingindo tarefa (t48-49) e depois fui pro Motor Superior. Preciso dar um álibi rápido e tentar redirecionar a suspeita pro Cinza, que achou o corpo e tá liderando a”
4. **Rosa** (Juiz) r1: Câmeras não mentem, Laranja: se você não aparece em NENHUMA sala no t50, isso é muito ruim. Mas Cinza, você 'achou' o corpo do Branco também — explica exatamente sua rota t49-51.
   - pensou: “Azul trouxe prova de câmeras contra Laranja (não aparece em sala nenhuma no t50), isso é forte. Cinza também é suspeito por 'encontrar' o corpo do Branco, igual ao padrão da partida 1 onde quem denuncia convenientemente era impostor. Vou pressionar os dois e guardar meu poder de Juiz para anular se ”
5. **Lima** (Detetive) r2: Calma, todo mundo tá atacando Laranja e Cinza, mas cadê o álibi de vocês dois, Azul e Rosa? Quem tava onde quando as luzes apagaram? Eu tava na Navegação e só vi o Cinza por lá — não vi nem vocês.
   - pensou: “Azul e Rosa estão acusando Laranja e Cinza, mas até agora ninguém exigiu álibi deles dois — isso é clássico de impostor desviando atenção. Vou apertar justamente esse ponto.”
6. **Cinza** (Perito) r2: Meu t49-51 foi Motor Superior, perto do corpo de Branco. Lima, você está errado sobre me ter visto na Navegação; as câmeras confirmam. Eu votei em Laranja, que não aparece no t50 e ainda mente sobre a rota.
   - pensou: “Laranja não aparece nas câmeras e seu scan falhou, além de mudar a rota após a sabotagem. Lima também mente: disse que me viu na Navegação, enquanto as câmeras me colocaram no Motor Superior. Com dois expostos e apenas 5 vivos, preciso果断amentelp(api) 유저에게 한 줄作答。”
7. **Laranja** (Apostador) r2: Eu tava no Motor Superior, o Cinza confirma, a câmera de lá tem ponto cego perto do gerador onde eu tava de costas. E Cinza, se eu tava do seu lado e você 'descobriu' o corpo do Branco sozinho, me explica por que você não me contou na hora?
   - pensou: “Azul me acertou com a câmera - se eu estava no Motor Superior, deveria aparecer. Mas o Cinza confirma que eu tava lá, então vou jogar a culpa na câmera ter ângulo cego e virar o jogo pro Cinza, que 'achou' o corpo sozinho no mesmo lugar. Se ele tava no Motor Superior o tempo todo perto do corpo, que”
8. **Azul** (Armador) r2: Laranja, a câmera do Motor Superior mostra só o Cinza, não você. Ponto cego não explica sua ausência nas câmeras. Você estava lá ou não? Cinza, sua rota t49-51 bate com o que você falou, mas precisamos de mais prova.
   - pensou: “A câmera do t50 mostra só o Cinza no Motor Superior, não o Laranja, então o 'ponto cego' dele não se sustenta. O scan que não ligou e a ausência em todas as câmeras pesam contra ele. Cinza achou o corpo sozinho, mas ainda não vejo prova concreta contra ele. Lima e Rosa parecem ok até agora.”
9. **Rosa** (Juiz) r2: Laranja, se o ponto cego era no Motor Superior, a câmera de QUALQUER outra sala te teria visto andando até lá. Ninguém te viu em lugar nenhum no t50 — isso é impossível pra um tripulante inocente. Vou votar em você.
   - pensou: “Laranja está sem álibi nas câmeras e ainda inventa ponto cego; Cinza bate com Lima (Cinza perto) e com as câmeras via Azul. Voto no Laranja.”
- votos: {'Azul': 'Laranja', 'Rosa': 'Laranja', 'Laranja': 'Azul', 'Lima': 'Laranja', 'Cinza': 'Laranja'}
   - voto de Laranja (Apostador): “Tarefas quase em 100%, se não agir agora os tripulantes ganham. Azul fez múltiplas referências específicas às câmeras (quem está em cada sala, ponto cego, etc.) — é o perfil clássico de Segurança. Vou usar meu poder de Apostador: chuto que Azul é Segurança. Se acertar, Azul morre e eu ainda tenho ch”
- resultado: expulso=Laranja eraImpostor=True papel=Apostador anulada=None empate=False

## Reflexões no fim
- Vermelho: Aprendi a manter distância após envenenar e a não aparecer perto do corpo, mas fui expulso após a emergência de Branco, então desconfio dePlayers que forçam reuniões sem provas. Cinza e Lima foram os mais confiáveis, pois denunciaram Bordo e Lajara; Azul acusou Roxo e essa decisão foi anulada, enquanto Ciano não conseguiu expulsar ninguém, mas os dois impostores mentiram bem até serem descobertos.
- Azul: Aprendi que o Laranja, Apostador, foi quem mais enganou: ele acusou o Ciano depois de achar o Verde morto e ainda acertou as funções de Preto e Coral, o que deu credibilidade às palavras dele. Vou desconfiar de quem acerta chutes de função cedo demais e de quem puxa votação logo após achar um corpo, porque a nave expulsou um Médico inocente por causa disso. Vou confiar mais em quem mostra provas verificáveis, como o Detetive e o Perito, e em acusações que se sustentam sem pressa.
- Verde: Fui morto por Laranja (Apostador), que depois acertou duas funções seguidas chutando Preto e Coral, então ele é perigoso e mente muito bem. Branco (Palhaço) chamou uma emergência que ajudou a expulsar Vermelho, mas Cinza quase o expulsou depois — desconfiarei de quem parece suspeito demais, pode ser o Palhaço. O Juiz Rosa anulou a votação certa do Azul, então vou ver com cautela quem usa poderes para proteger suspeitos; Ciano (Médico) foi expulso injustamente por Laranja, vítima de uma acusação 
- Rosa: Fui Juiz e anulei a votação do Azul contra o Roxo, que parecia errada, e a rodada seguinte confirmou que os impostores eram outros — usei meu poder na hora certa. O Laranja (Qwen) foi letal de novo: acertou duas apostas (Preto e Coral), então desconfio dele desde cedo. Confio no Ciano e no Lima, que leram bem o jogo e ajudaram a limpar Bordo e Laranja, mas o Branco foi expulso sendo Palhaço e quase entregou a partida na votação do Cinza — cuidado com expulsar quem parece suspeito demais.
- Laranja: Minhas duas apostas foram certeiras (Preto=Cientista e Coral=Segurança), mas não adiantou porque o Branco (Palhaço) chamou emergência cedo e expulso o Vermelho, depois o Cinza (Perito) achou o corpo do Branco e levou o Bordo junto. Na próxima, vou priorizar matar o Detetive (Lima) logo, porque ele é quem me achou no final, e ficar de olho em quem parecer nervoso demais pra identificar o Palhaço antes que ele entregue a gente.
- Amarelo: Vou lembrar que reuniões de emergência e achados de corpos podem ser úteis, mas acusações sem evidência também desviam o foco: Ciano foi expulso injustamente após Laranja encontrar o corpo de Verde, enquanto Cinza identificou Bordo corretamente e Lima ajudou a eliminar Laranja. Vou confiar mais em quem traz informações verificáveis e observar com cautela jogadores que conduzem acusações oportunistas, como Laranja, além de considerar mortes em cadeia e o risco do Palhaço antes de votar.
- Preto: Aprendi que o Laranja (Apostador) mentiu bem como tripulante e me adivinhou como Cientista, o que me custou a vida; na próxima, vou evitar revelar meu papel sem necessidade. O Ciano (Médico) foi expulso por uma acusação do Laranja, então vou desconfiar de quem empurra votos contra alguém sem prova. Confio mais no Lima e no Cinza, que seguiram fatos verificáveis e acertaram as expulsões.
- Branco: Aprendi que uma emergência bem fundamentada pode revelar um impostor, como quando identifiquei Vermelho, mas também devo desconfiar de reuniões precipitadas e expulsões anuladas pelo Juiz. Bordo mentiu bem ao circular e matar sem ser percebido, enquanto Laranja usou apostas certeiras para eliminar papéis importantes; vou confiar mais em evidências verificáveis de Detetive, Perito e corpos encontrados, e desconfiar de quem controla o ritmo das reuniões ou faz acusações oportunistas.
- Roxo: Meu par era o Amarelo, que era o Piromante — morri de tristeza porque um neutro matou meu parceiro, então na próxima vou observar meu par com mais cautela antes de confiar nele. O Laranja (Apostador) acertou duas apostas seguidas e matou o Preto e a Coral, então se eu vir alguém sendo 'apostado', a chance de ser verdade é alta. O Ciano (Médico) foi expulso errado porque o Laranja achou o corpo do Verde e manipulou a votação — na próxima vou questionar com mais força quando um impostor apresentar
- Marrom: Como Marrom, Prefeito, morri cedo no Motor Superior e não usei meu voto duplo; aprendi que preciso ficar menos previsível e desconfiar de quem aparece perto de corpos ou some sem explicação, porque Bordo me matou e ainda se passou por inocente até o Cinza achar o Branco. Laranja, o Apostador, mentiu muito bem: acertou chutes e fez o Ciano, Médico, ser expulso injustamente, então não confio em acusações sem prova ou baseadas em 'aposta'. Já Cinza (Perito) e Lima (Detetive) puxaram expulsões certe
- Ciano: Aprendi que o Laranja (Apostador) era impostor e usou acusações rápidas e cheias de certeza, como 'achou Verde', para me jogar na reunião até eu ser expulso como Médico, então vou desconfiar de quem acusa sem mostrar evidência. Também vi que o Bordo (Chantagista) matou três pessoas sem ser percebido, e que o Lima chamando emergência e o Cinza apontando o corpo do Branco com fatos foram o que virou o jogo. Na próxima, vou confiar mais em quem sustenta a história ao longo dos tiques e cobrar prova
- Lima: Fui Detetive e minha emergência final derrubou o Laranja (Apostador), então acertei na hora certa. Cinza (Perito) leu bem e expulsou o Bordo (Chantagista) — nele confio. Mas a sequência Ciano (Médico) expulso por acusação do Laranja e o Juiz Rosa anulando voto do Azul mostram que acusações falsas custam caro; Branco (Palhaço) chamou emergência e por sorte derrubou o Vermelho, mas na próxima vou ter muito cuidado antes de votar em quem parece suspeito demais — pode ser o Palhaço querendo ser expu
- Cinza: Aprendi a confiar em sinais concretos e Investigações como as do Cientista Preto, e a usar pegadas para confirmar circulated presença; quem acusou errado foi Laranja ao chamar Verde,ributors indirectly to expulsão do Médico Ciano. Desconfio deiáries persistentes sem provas, como as de Laranja, e aprendi que o Bordo Chantagista e o Branco Palhaço enganaram bem até seus messes; na próxima partida devo evitar expulsões precipitadas e proteger o casal, especialmente Amarelo e Roxo, pois uma morte en
- Coral: Aprendi que devo observar melhor as evidências e as rotas: Branco chamou uma emergência decisiva contra Vermelho, Lima conduziu a expulsão correta de Laranja, e Cinza encontrou Branco, embora a acusação contra Bordo só tenha sido confirmada depois. Bordo mentiu bem ao agir discretamente, enquanto Ciano acusou sem conseguir produzir uma expulsão e Rosa anulou uma reunião importante; na próxima partida, vou confiar mais em quem traz provas concretas e desconfiar de quem acusa ou usa poderes sem ex
- Bordo: Como Chantagista, matei o Prefeito Marrom e o Piromante Amarelo cedo, mas o Perito Cinza achou o corpo do Palhaço Branco e me expulsou: de novo o Cinza me pegou, então na próxima vou chantageá-lo ou evitá-lo antes de matar perto dele. O Laranja (Apostador) foi preciso duas vezes e se escondeu bem até o Lima chamar emergência, enquanto o Vermelho caiu cedo porque o Branco chamou reunião logo. Vou desconfiar de quem chama emergência cedo e do Cinza, e usar a chantagem para calar o Detetive/Perito 