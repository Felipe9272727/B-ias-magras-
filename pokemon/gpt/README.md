# Ariadne

Agente autônomo para a interface `ambiente_firered.FireRed` especificada na
competição. O código de produção é `agente.py`; a única dependência adicional
é NumPy. Não acompanha ROM, emulador, save inicial, checkpoint pré-treinado,
coordenadas de missões ou rotas de solução.

## Executar

Coloque `agente.py`, `requirements.txt` e o ambiente fornecido na mesma pasta
(ou deixe `ambiente_firered` importável pelo Python).

```sh
python -m pip install -r requirements.txt
TEMPO_LIMITE_S=10800 python agente.py treinar
python agente.py jogar
```

Em blocos de uma hora, execute três vezes o comando abaixo, preservando a pasta
`checkpoint` entre execuções. O limite é **por invocação**, e não um limite
cumulativo que esqueceria de descontar os blocos anteriores.

```sh
TEMPO_LIMITE_S=3600 python agente.py treinar
```

O treino usa quatro processos independentes, um emulador em cada processo.
BLAS fica restrito a uma thread por processo. O limite é de tempo de parede,
com reserva para salvar o estado e encerrar os trabalhadores. Uma interrupção
por SIGINT/SIGTERM também pede encerramento com checkpoint. Um corte de energia
pode perder trabalho desde o último checkpoint, normalmente até 45 segundos.

O programa cria o ambiente fornecido dentro de cada trabalhador: não exige que
um emulador possa ser serializado ou transferido entre processos. Também não
exige Gym, Gymnasium, Torch, OCR, acesso à internet nem GPU.

## Aprendizado e decisões

- **Double Q tabular com replay empírico**, combinado com um modelo de
  navegação em grafo e busca em largura por fronteiras. Cada atualização faz
  quatro backups adicionais de experiências observadas; marcos raros recebem
  backups extras. Não há rede neural.
- A observação inclui posição/mapa, equipe, saúde, insígnias, contagens da
  Pokédex e hashes de blocos da tela. Dois estados visuais e as informações
  disponíveis de batalha ajudam a separar navegação, textos e menus. IDs de
  itens-chave, quando disponíveis, também distinguem estágios de progresso;
  nenhum ID recebe um significado de missão.
- Opcionalmente, lê estruturas de memória de FireRed USA para flags, dados do
  mapa e dos combatentes. Os endereços são validados antes de usar o conteúdo;
  se a leitura não estiver disponível ou não passar na validação, o agente
  continua usando a tela e `info()`. Todos os acessos passam por `env.ram`.
- O grafo só usa transições que o agente já percorreu. Dados do mapa dão
  indícios sobre portas, objetos e colisão; nenhuma conexão é considerada
  atravessável apenas por constar nesses dados. Falhas suspendem uma passagem
  que estava aberta em um estágio mais avançado do treinamento.
- As recompensas principais são insígnias, mapas novos, aumento do maior total
  de níveis e capturas. Há recompensas menores e finitas por tiles e flags
  novos, dano ao adversário e descoberta de recuperação de HP. Há custo por
  ação, movimento bloqueado, dano próprio e desmaio. Fugir não rende bônus de
  vitória. O placar usado para comparar os trabalhadores é lexicográfico na
  ordem especificada pela competição.
- Exploração por UCB, epsilon decrescente por estado, contagens e fronteiras.
  A tem um viés inicial em diálogos e batalhas; as outras ações continuam
  disponíveis e seus valores são aprendidos. Não existe uma sequência de
  botões para pegar inicial, entregar encomenda, escolher ataques ou vencer
  um ginásio.
- Um arquivo de até 12 estados alcançados pelo próprio trabalhador permite
  treino a partir de diferentes estágios. Não é um roteiro reproduzido na
  partida final. Os quatro trabalhadores conservam suas trajetórias e
  geradores aleatórios entre blocos; na partida, seus valores Q são combinados
  por contagens de visitas e as arestas descobertas são compartilhadas.

## Checkpoints e partida final

Cada trabalhador grava dois slots alternados de checkpoint com gzip/CRC e
substituição atômica. O outro slot permanece disponível se uma gravação for
interrompida. Os arquivos `worker_N.*` guardam aprendiz, RNG, experiência,
currículo e estado atual do emulador. Os arquivos `policy_N.*` guardam apenas
o aprendizado, sem estados de emulador. Não remova arquivos `.pkl.gz` enquanto
o treino estiver em execução. Arquivos `.tmp` abandonados são ignorados.

Na partida final, o programa lê somente os arquivos de política, faz um único
`reset()` inicial e continua até consumir 10.368.000 quadros ou receber um sinal
de parada. Não restaura estados, não reinicia episódios e não interrompe a
partida ao sofrer um blackout. Continua atualizando os valores com a própria
experiência dessa trajetória. Sem checkpoint válido, usa a mesma exploração
com tabelas vazias e informa isso em stderr.

Cada chamada `env.step`, incluindo liberações de botão por `nada`, entra na
contagem de quadros. Liberar o botão permite que menus que usam `JOY_NEW`
reconheçam novas confirmações. Não há escrita de memória nem modificação de
estado do emulador fora das restaurações permitidas durante o treino.

`log.jsonl` é criado na pasta atual, com uma linha JSON por evento. Campos
obrigatórios: `quadro`, `evento`, `mapa`, `x`, `y`, `intencao`. Registra mapas,
início/fim de batalha, captura, insígnia, level-up e desmaio da equipe, além
de início, andamento e fim. A frase de intenção vem da decisão tomada antes
do evento. Quando a interface só mostra a equipe já curada, o logger também
detecta um provável blackout por fim de batalha, troca de mapa, pouca saúde
anterior e perda de dinheiro; nesse caso marca `inferido: true`.

O arquivo de log descreve a partida final, não o conjunto de mapas alcançados
em diferentes episódios do treino. Uma partida nova sobrescreve o log anterior.

## Validação e expectativa

```sh
python -m unittest discover -s tests -v
```

Os testes usam um **simulador de contrato**, isolado em `tests/mock_env`.
Verificam aprendizado de uma escolha recompensada, exploração de dois mapas,
memória opcional, início sem equipe, espécies numéricas ou por nome, eventos,
liberação de botões, recuperação de checkpoint truncado, quatro trabalhadores,
retomada em outro processo e uma partida limitada que proíbe tanto carregar
estados quanto reiniciar após o primeiro botão. O simulador não participa do
treino ou jogo em produção e não demonstra habilidade em Pokémon.

O emulador e `ambiente_firered.py` reais não estavam disponíveis na preparação.
Portanto, não houve treino real nem medição de avanço em FireRed. A maior
incerteza é resolver cadeias longas de eventos sem compreensão de linguagem:
o agente pode explorar várias cidades e ainda não cumprir um pré-requisito.
Expectativa conservadora: Pallet/Viridian e arredores; uma primeira insígnia
seria um bom resultado. Completar a Elite Four em três horas de treino de CPU
é improvável para esta arquitetura e não é uma promessa desta entrega.
