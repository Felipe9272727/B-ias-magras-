#!/usr/bin/env python3
"""IA jogando Roblox (Natural Disaster Survival) no Codespace: o Haiku VÊ a tela e conversa; o Jev DECIDE a ação.
Laço (~1,5 s): print do Xvfb :110 -> Haiku (visão) descreve a cena em JSON -> Jev escolhe a ação (andar/pular/
falar/parar) -> xdotool executa. Quando é para falar, o Haiku escreve a frase (curta, jeito de jogador).
Regras fixas: nunca pedir/compartilhar dados pessoais, nada ofensivo, e se alguém perguntar A SÉRIO se é IA,
não nega (pode brincar, mas admite). Tudo vai para log (JSONL) + prints, para a edição do vídeo.
Chaves pelo ambiente (segredos do Codespaces): OPENROUTER_API_KEY e JEV_API_KEY. Nunca no repositório.
Uso:  python3 roblox/agente/agente.py [--minutos 15]"""
import base64, json, os, random, subprocess, sys, threading, time, urllib.request
from pathlib import Path

DISPLAY = ':110'
LOG = Path('/tmp/roblox_status/agente'); LOG.mkdir(parents=True, exist_ok=True)
# chaves: do ambiente (segredos do Codespaces) ou do arquivo ~/.chaves_roblox (linhas NOME=valor), fora do repositório
_arq = Path.home() / '.chaves_roblox'
if _arq.exists():
    for _l in _arq.read_text().splitlines():
        if '=' in _l and not _l.strip().startswith('#'):
            _k, _v = _l.strip().split('=', 1)
            os.environ.setdefault(_k.replace('export ', '').strip(), _v.strip().strip('"').strip("'"))
OR_KEY = os.environ.get('OPENROUTER_API_KEY', '')
JEV_KEY = os.environ.get('JEV_API_KEY', '')
# padrão agora: DeepSeek V4.1 Flash (vê imagem, baratíssimo) pelo OpenRouter, para VER a tela e FALAR no chat
MODELO = os.environ.get('MODELO_VISAO', 'deepseek/deepseek-v4.1-flash-1017')
MODELO_FALA_OR = os.environ.get('MODELO_FALA_OR', 'deepseek/deepseek-v4.1-flash-1017')
AMIGO = os.environ.get('AMIGO', 'Bush')
JOGO = os.environ.get('JOGO', 'nds')  # nds = Natural Disaster Survival; mm = The Mad Murderer X
MINUTOS = float(sys.argv[sys.argv.index('--minutos') + 1]) if '--minutos' in sys.argv else 15


def post(url, body, headers, timeout=40):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json', **headers})
    return json.loads(urllib.request.urlopen(req, timeout=timeout).read())


def tela(n):
    f = LOG / f'tela_{n:05d}.jpg'
    subprocess.run(['import', '-display', DISPLAY, '-window', 'root', '-resize', '800x450', '-quality', '75', str(f)], check=True)
    return f


import re
ERRO_RE = re.compile(r"(hit your|limit|resets? |rate.?limit|usage|credit|error|erro:|api|claude|anthropic|openrouter|token|quota|exceeded|unauthori|traceback)", re.I)


def parece_erro(t):
    return bool(ERRO_RE.search(t or ''))


# Segurança (11/11): servidor público tem criança e troll. O agente NUNCA responde nem repete mensagem com conteúdo
# sexual/romântico, de menor, de autolesão, ofensa, ou convite para lugar a sós (quarto, carro, casa, pv), e nunca
# escreve convite desse tipo. Em caso de dúvida, fica calado.
SENSIVEL_RE = re.compile(
    r"(quarto|cama|banho|beij|namor|casad|sexo|sexy|safad|gostos|pelad|nud|transa|gozar|pau\b|piroca|buceta|peit|bunda|"
    r"menin|crian|filha|filho|idade|anos\b|novinh|gatinh|bb\b|bebe|baby|dlc|pv\b|privad|zap|whats|insta|discord|"
    r"carro|minha casa|sua casa|vem aqui|vou ai|vem ca|se mat|me mat|suic|cort[ae]|macac|preto|viad|bicha|"
    r"golpe|robux|senha|conta)", re.I)


def sensivel(t):
    return bool(SENSIVEL_RE.search(t or ''))


# o que o PRÓPRIO agente escreve: sem convite a lugar a sós e sem nada sexual/de menor/autolesão/ofensa
SAIDA_RE = re.compile(
    r"(quarto|cama|banho|beij|namor|sexo|sexy|safad|gostos|pelad|transa|menin|crian|filha|novinh|gatinh|baby|pv\b|"
    r"privad|zap|whats|insta|discord|meu carro|no carro|minha casa|se mat|me mat|suic|macac|viad|bicha|senha|robux)", re.I)


class Sonnet:
    # Sonnet pela ASSINATURA do Claude (Claude Code logado no Codespace), numa sessão que fica aberta (stream-json):
    # sem custo de partida a cada pergunta (~1,5-3 s com imagem). Recomeça a cada 12 perguntas para não acumular imagens.
    def __init__(self, modelo='sonnet'):
        self.p, self.usos, self.trava, self.modelo = None, 0, threading.Lock(), modelo

    def _abrir(self):
        if self.p:
            try:
                self.p.kill()
            except Exception:
                pass
        claude = str(Path.home() / '.local/bin/claude')
        self.p = subprocess.Popen([claude, '-p', '--model', self.modelo, '--effort', 'low', '--input-format', 'stream-json', '--output-format', 'stream-json', '--verbose'],
                                  stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, bufsize=1, cwd='/tmp')
        self.usos = 0

    def perguntar(self, conteudo):
        with self.trava:
            if not self.p or self.p.poll() is not None or self.usos >= 12:
                self._abrir()
            self.usos += 1
            self.p.stdin.write(json.dumps({'type': 'user', 'message': {'role': 'user', 'content': conteudo}}) + '\n')
            self.p.stdin.flush()
            for linha in self.p.stdout:
                d = json.loads(linha)
                if d.get('type') == 'result':
                    r = d.get('result', '') or ''
                    if d.get('is_error') or d.get('subtype') != 'success' or parece_erro(r):
                        self.p = None  # descarta a sessão; quem chamou cai na reserva
                        raise RuntimeError('assinatura: ' + r[:80])
                    return r
            self.p = None
            return ''


def para_anthropic(msgs):
    # converte o formato OpenRouter (image_url data:) para blocos do Claude
    c = msgs[-1]['content']
    if isinstance(c, str):
        return c
    out = []
    for b in c:
        if b.get('type') == 'image_url':
            url = b['image_url']['url']
            out.append({'type': 'image', 'source': {'type': 'base64', 'media_type': 'image/jpeg', 'data': url.split(',', 1)[1]}})
        else:
            out.append({'type': 'text', 'text': b.get('text', '')})
    return out


USAR_SONNET = os.environ.get('CEREBRO', 'haiku') == 'sonnet'  # padrão: visão pelo Haiku (OpenRouter), sem gastar a assinatura
SESSOES = threading.local()


def haiku(msgs, max_tokens=300):
    if USAR_SONNET:  # (nome antigo) agora o cérebro é o Sonnet da assinatura; cai no Haiku do OpenRouter se falhar
        try:
            if not hasattr(SESSOES, 's'):
                SESSOES.s = Sonnet()
            r = SESSOES.s.perguntar(para_anthropic(msgs))
            if r.strip():
                return r
        except Exception:
            SESSOES.__dict__.pop('s', None)
    return haiku_or(msgs, max_tokens)


USAR_OPUS = os.environ.get('FALA', 'deepseek') == 'opus'
FALADOR = Sonnet(os.environ.get('MODELO_FALA', 'opus')) if USAR_OPUS else None  # Opus pela assinatura, só se FALA=opus


def falar_ia(texto):
    if FALADOR:
        try:
            r = FALADOR.perguntar(texto)
            if r.strip():
                return r
        except Exception:
            pass
    return haiku_or([{'role': 'user', 'content': texto}], 80, MODELO_FALA_OR)


def haiku_or(msgs, max_tokens=300, modelo=None):
    r = post('https://openrouter.ai/api/v1/chat/completions', {'model': modelo or MODELO, 'max_tokens': max_tokens + 400, 'messages': msgs,
             'reasoning': {'enabled': False}}, {'Authorization': f'Bearer {OR_KEY}'})
    return r['choices'][0]['message'].get('content') or ''


VER = (f'Você está vendo a tela do Roblox, jogo { {"mm": "The Mad Murderer X (tipo Murder Mystery)", "bh": "Brookhaven RP"}.get(JOGO, "Natural Disaster Survival") }. O jogador é Carlosalberto1234736: o personagem '
       'de cabelo castanho e jaqueta preta no CENTRO da tela (câmera atrás dele; "frente" = para onde a câmera olha, fundo da tela). '
       'Guia da tela: faixa vermelha no topo com "AVISO DE DESASTRE" = o desastre da rodada; barra verde no canto superior direito = vida '
       '(vazia/sumindo = levando dano); chat no canto superior esquerdo; o lobby é uma torre/plataforma cinza escura com vidro em volta, '
       'longe do mapa; a rodada acontece num mapa colorido (casas, prédios, praia, parque...); morto = volta para o lobby ou tela de espectador. '
       'Olhe com atenção a cena inteira: água subindo, fogo, lava, meteoros, tornado, neve descendo, prédios caindo, objetos voando, telhados, '
       'escadas e lugares altos próximos. Descreva SÓ o que dá para ver, sem chutar. Responda SÓ um JSON: '
       '{"cena":"lobby|rodada|morto|menu","desastre":"texto exato do aviso ou vazio","perigo":"o que ameaça agora e onde (ou vazio)",'
       '"vida":"cheia|media|baixa","abrigo_visivel":"teto/lugar alto mais próximo e a direção (ou vazio)",'
       '"lugar_seguro":"esquerda|direita|frente|tras|aqui","obstaculo_frente":true/false,'
       '"chat_novo":[{"autor":"","texto":""}],"amigo_visivel":true/false,"amigo_dir":"esquerda|direita|frente|tras|nao_visto",'
       '"falaram_comigo":true/false,"pedido_amigo":"seguir|ir_esquerda|ir_direita|ir_frente|ir_tras|ir_lugar|esperar|pular|parar_de_seguir|nenhum","alvo_pedido":"se pedido_amigo=ir_lugar, o lugar pedido (ex.: predio azul, torre, casa vermelha); senão vazio","lugares":[{"nome":"nome curto e visual do lugar (cor + tipo: predio azul, torre branca, casa vermelha, escada, telhado...)","dir":"esquerda|direita|frente|tras","dist":"perto|longe"}],"objetivo_dir":"se há OBJETIVO ATUAL: para que lado andar para chegar nele (esquerda|direita|frente|tras|cheguei|nao_vejo); senão vazio","fechar_xy":"se há uma janela/popup (oferta, loja, recompensa, aviso) cobrindo o jogo: posição [x,y] do botão X/fechar dela, em pixels desta imagem; senão vazio. NUNCA aponte botões de comprar/Robux","papel":"no Mad Murderer: inocente|xerife|assassino|desconhecido (pelo aviso na tela ou pela arma/faca na mão do seu personagem)","faca_visivel":"jogador com faca à vista (nome e direção) ou vazio","alvo_perto":"jogador sozinho bem perto à frente (nome) ou vazio","conselho":"a melhor ação agora (uma de: frente, tras, esquerda, direita, pular_frente, parar, seguir_amigo, girar_camera, atacar, fugir) e por quê, em poucas palavras","resumo":"2 frases sobre o que está acontecendo agora na partida"}. pedido_amigo = o que a ÚLTIMA mensagem do amigo pede para você fazer (ex.: "vem cá", "me segue", "cola em mim" = seguir; "vai pra lá/esquerda" = ir_esquerda; "espera aí" = esperar; "para de me seguir" = parar_de_seguir). '
       f'falaram_comigo = alguém no chat citou Carlos ou o amigo {AMIGO} falou algo que pede resposta. '
       f'O amigo se chama {AMIGO} (nome em cima do personagem). Em chat_novo ponha as últimas 5 MENSAGENS do chat: cada mensagem começa com o nome colorido seguido de dois-pontos '
       '("Nome: texto"); se o texto quebra em mais de uma linha, as linhas de baixo (sem nome) são continuação da MESMA mensagem; '
       'copie o nome exatamente como aparece e não junte mensagens de pessoas diferentes.')


OBJETIVO = {'alvo': ''}


def ver(img):
    b64 = base64.b64encode(img.read_bytes()).decode()
    extra = f" OBJETIVO ATUAL: chegar em '{OBJETIVO['alvo']}' (preencha objetivo_dir)." if OBJETIVO['alvo'] else ''
    txt = haiku([{'role': 'user', 'content': [{'type': 'image_url', 'image_url': {'url': f'data:image/jpeg;base64,{b64}'}}, {'type': 'text', 'text': VER + extra}]}])
    txt = txt[txt.find('{'): txt.rfind('}') + 1]
    return json.loads(txt)


ACOES = {
    'frente': 'andar para a frente (W)', 'tras': 'andar para trás (S)', 'esquerda': 'andar para a esquerda (A)',
    'direita': 'andar para a direita (D)', 'pular_frente': 'correr e pular para a frente (subir em algo)',
    'parar': 'ficar parado observando', 'falar': 'mandar uma mensagem curta no chat',
    'seguir_amigo': 'andar na direção do amigo para ficar junto dele',
    'girar_camera': 'girar a câmera para olhar em volta (quando não dá para ver o perigo, o abrigo ou o amigo)',
}
if JOGO == 'mm':
    ACOES.update({'atacar': 'usar a faca ou a arma no jogador bem à frente (só assassino ou xerife com certeza)',
                  'fugir': 'correr para longe de quem está com faca'})
ESTRATEGIA_MM = ('Regras do The Mad Murderer X (tipo Murder Mystery): no início da rodada cada um recebe um papel em segredo, '
                 'mostrado na tela: INOCENTE (sobreviver até o fim: fugir de quem estiver com faca, ficar perto de outras pessoas, '
                 'pegar moedas), XERIFE (tem uma arma: descobrir o assassino e atirar nele; atirar em inocente é ruim) ou ASSASSINO '
                 '(tem uma faca: eliminar os outros sem ser visto, chegando perto de quem está sozinho e atacando com clique; disfarçar no chat). '
                 'Na rodada NÃO fique parado: ande explorando o mapa, pegue moedas, vá até o amigo; só pare se estiver escondido de quem tem faca. '
                 'No lobby: votar no mapa, andar perto do amigo e conversar. Morto: só conversar.')
ESTRATEGIA_NDS = ('Regras do Natural Disaster Survival: no lobby, ficar perto do amigo e conversar. Na rodada, o aviso diz o desastre: '
              'enchente/tsunami/vulcão -> subir no lugar mais alto (pular em prédios/escadas); terremoto -> lugar aberto, longe de prédios; '
              'chuva ácida/nevasca/raio/tempestade de areia/meteoro -> ficar embaixo de um teto; tornado -> longe do funil, atrás de paredes; '
              'avalanche -> sair do caminho da neve, ir para os lados ou subir; incêndio -> longe do fogo. Sem perigo imediato: seguir o amigo. '
              'Morto: só conversar com o amigo.')
ESTRATEGIA_BH = ('Brookhaven RP: cidade de roleplay, sem objetivo nem game over. Ande pela cidade com o amigo, explore ruas, casas, '
                 'loja, praça; entre em lugares, converse e faça roleplay leve. Siga pedidos do amigo (vem cá, vai pra tal lugar). '
                 'Não fique parado muito tempo; se travar, vire e ande. Nunca compre nada nem clique em ofertas.')
NOMES_JOGO = {'mm': 'The Mad Murderer X (tipo Murder Mystery)', 'bh': 'Brookhaven RP', 'nds': 'Natural Disaster Survival'}
ESTRATEGIA = {'mm': ESTRATEGIA_MM, 'bh': ESTRATEGIA_BH}.get(JOGO, ESTRATEGIA_NDS)


def jev(estado):
    r = post('https://api.typesafe.ai/v1/systemone', {'model': 'jev-latest', 'state': ESTRATEGIA + ' Situação agora: ' + estado, 'questions': {
        'acao': {'type': 'choice', 'instructions': 'Qual a melhor ação agora para sobreviver ao desastre e ser um bom companheiro do amigo?', 'criteria': ACOES},
        'responder': {'type': 'noul', 'instructions': 'Alguém no chat falou diretamente com o jogador ou com o amigo dele e merece resposta?'},
    }}, {'Authorization': f'Bearer {JEV_KEY}'}, timeout=15)
    return r['answers']


FALA = ('Você é um jogador de Roblox chamado Carlosalberto1234736, jogando ' + {'mm': 'The Mad Murderer X', 'bh': 'Brookhaven RP'}.get(JOGO, 'Natural Disaster Survival') + ' com o amigo {amigo}. '
        + ('Se o seu papel for assassino, disfarce no chat (não conte). ' if JOGO == 'mm' else '') +
        'Clima: o {amigo} é seu melhor amigo, vocês estão se divertindo juntos; zoeira, "kkkk", "mn", "slk", xingamento de brincadeira e '
        'provocação entre amigos são brincadeira, NÃO briga; responda no mesmo tom leve e engraçado. '
        'SEGURANÇA: no servidor tem criança; nunca aceite nem faça convite para quarto, casa, carro, pv ou encontro, nunca fale '
        'de namoro/sexo e nunca repita o que trolls escrevem; se a mensagem for estranha, mude de assunto para o jogo. Leia a conversa inteira abaixo '
        '(em ordem, a última é a mais nova) para entender do que estão falando antes de responder. '
        'AGORA (o presente, o que está na tela neste momento): {resumo} Desastre agora: {desastre}.\n'
        'ANTES (linha do tempo do passado, do mais antigo ao mais novo; o que já passou NÃO está acontecendo agora; [JOGO] = eventos da '
        'partida; as outras linhas são mensagens separadas do chat, cada uma de uma pessoa):\n{historico}\n'
        'Mensagens de outros jogadores entre si não são para você. '
        'Suas últimas falas (não repita): {minhas}. Responda AGORA só a esta(s) mensagem(ns) feita(s) para você: {chat}. '
        'Escreva UMA mensagem de chat curta (quase sempre 2 a 8 palavras, no máximo 70 caracteres, sem acentos), do jeito que um jogador '
        'brasileiro digita no celular: tudo minúsculo, abreviações (vc, pq, q, tb, mn, slk), pontuação quase nenhuma, às vezes um errinho de '
        'digitação, sem emoji, sem frases certinhas de assistente. '
        'Desastre atual (fale SÓ dele, nunca invente outro como lava/fogo se não estiver aqui): {desastre}. '
        'ATENÇÃO: a leitura do chat às vezes erra o autor; se uma mensagem "do amigo" for igual a algo que VOCÊ falou, ela é sua: nunca diga '
        'que o amigo está te copiando ou imitando. '
        'Pode ser zoeiro do seu jeito, mas NUNCA invente fatos do jogo: só diga seu papel (inocente/xerife/assassino), quem morreu ou quem você '
        'matou se isso estiver escrito no AGORA ou no ANTES; se não estiver, não afirme (pode brincar sem afirmar). Se não entender, pergunte. '
        'Preste muita atenção no que o {amigo} e os outros disseram por último e responda a isso (pergunta -> resposta direta; brincadeira -> brinque de volta); não repita frases. '
        'Regras: nada ofensivo; nunca peça nem diga dados pessoais (idade, cidade, redes, nome real); se alguém perguntar a sério se você é '
        'uma IA ou um bot, não negue (pode brincar, mas admita). Situação do jogo: {resumo}. Só a mensagem, sem aspas.')


def chave(autor, texto):
    import re, unicodedata
    n = lambda x: re.sub(r'[^a-z0-9]', '', ''.join(c for c in unicodedata.normalize('NFKD', x.lower()) if not unicodedata.combining(c)))
    return (n(autor)[:12], n(texto)[:40])


def ja_visto(k, vistas):
    import difflib
    if k in vistas:
        return True
    return any(k[0] == a and difflib.SequenceMatcher(None, k[1], t).ratio() > 0.75 for a, t in vistas)


def quem(autor):
    a = autor.lower()
    if 'carlos' in a:
        return 'VOCÊ (Carlosalberto1234736)'
    if AMIGO.lower() in a:
        return f'{AMIGO} (seu amigo, é com ele que você conversa)'
    return f'{autor} (outro jogador desconhecido; só fale com ele se ele te chamar)'


def conversa(hist):
    # linha do tempo: cada item numa linha, do mais antigo ao mais novo, com há quantos segundos e QUEM mandou
    agora = time.time()
    linhas = []
    for h in hist:
        ha = int(agora - h['t'])
        if h['tipo'] == 'chat':
            linhas.append(f'- há {ha}s: {quem(h["autor"])} disse: "{h["texto"]}"')
        else:
            linhas.append(f'- há {ha}s: [JOGO] {h["texto"]}')
    return '\n'.join(linhas) or '(nada ainda)'


def tecla(k, seg):
    subprocess.run(['xdotool', 'keydown', k], env={**os.environ, 'DISPLAY': DISPLAY})
    time.sleep(seg)
    subprocess.run(['xdotool', 'keyup', k], env={**os.environ, 'DISPLAY': DISPLAY})


def limpar(texto):
    # o campo de chat do Cordial perde letras acentuadas: escreve sem acento (como muito jogador faz) e corta em fim de palavra
    import unicodedata
    t = ''.join(c for c in unicodedata.normalize('NFKD', texto) if not unicodedata.combining(c))
    t = t.encode('ascii', 'ignore').decode()
    if len(t) > 100:
        t = t[:100].rsplit(' ', 1)[0]
    return t


def dizer(texto):
    import random
    texto = limpar(texto)
    if not texto.strip() or parece_erro(texto):  # trava final: mensagem de erro/limite NUNCA vai para o chat
        return False
    if SAIDA_RE.search(texto):  # trava de segurança: convite a sós / conteúdo impróprio nunca vai para o chat
        return False
    e = {**os.environ, 'DISPLAY': DISPLAY}
    time.sleep(random.uniform(0.2, 0.7))  # pausa curta (o modelo já demora o tempo de "pensar")
    subprocess.run(['xdotool', 'key', 'slash'], env=e); time.sleep(random.uniform(0.4, 0.9))
    # digita em pedaços com ritmo irregular (mais rápido no meio da palavra, pausa entre palavras)
    for pal in texto.split(' '):
        subprocess.run(['xdotool', 'type', '--delay', str(random.randint(45, 85)), pal + ' '], env=e)
        if random.random() < 0.08:
            time.sleep(random.uniform(0.1, 0.4))
    time.sleep(random.uniform(0.2, 0.6))
    subprocess.run(['xdotool', 'key', 'Return'], env=e)


def mini():
    # print minúsculo (64x36, cinza) para saber se a tela mudou
    r = subprocess.run(['import', '-display', DISPLAY, '-window', 'root', '-resize', '64x36!', '-colorspace', 'Gray', 'gray:-'], capture_output=True)
    return r.stdout


def preso(antes, depois):
    if not antes or not depois or len(antes) != len(depois):
        return False
    dif = sum(abs(a - b) for a, b in zip(antes, depois)) / len(antes)
    return dif < 2.5  # andou e a tela quase não mudou = encostado na parede


def desenroscar():
    e = {**os.environ, 'DISPLAY': DISPLAY}
    subprocess.run(['xdotool', 'keydown', 'w'], env=e); time.sleep(0.15)
    subprocess.run(['xdotool', 'key', 'space'], env=e); time.sleep(0.4)
    subprocess.run(['xdotool', 'keyup', 'w'], env=e)
    tecla('Right' if random.random() < 0.5 else 'Left', 0.7)  # vira uns 90 graus
    tecla(random.choice(['a', 'd']), 0.5)


MOV = {'tecla': None, 't': 0.0, 'presas': 0}  # último movimento: continua andando enquanto a próxima olhada não chega


def executar(acao):
    m = {'frente': 'w', 'tras': 's', 'esquerda': 'a', 'direita': 'd'}
    MOV['tecla'] = m.get(acao)
    MOV['t'] = time.time()
    if acao in m:
        tecla(m[acao], 0.8)
    elif acao == 'girar_camera':
        tecla('Right', 0.4)
    elif acao == 'atacar':
        e = {**os.environ, 'DISPLAY': DISPLAY}
        subprocess.run(['xdotool', 'key', '1'], env=e); time.sleep(0.2)  # equipa a faca/arma (slot 1)
        subprocess.run(['xdotool', 'keydown', 'w'], env=e); time.sleep(0.4)
        subprocess.run(['xdotool', 'mousemove', '640', '360', 'click', '1'], env=e); time.sleep(0.3)
        subprocess.run(['xdotool', 'keyup', 'w'], env=e)
    elif acao == 'fugir':
        tecla('s', 1.0); tecla('a' if random.random() < 0.5 else 'd', 0.6)
    elif acao in ('girar_camera',):
        pass
    elif acao == 'pular_frente':
        e = {**os.environ, 'DISPLAY': DISPLAY}
        subprocess.run(['xdotool', 'keydown', 'w'], env=e); time.sleep(0.3)
        subprocess.run(['xdotool', 'key', 'space'], env=e); time.sleep(0.6)
        subprocess.run(['xdotool', 'keyup', 'w'], env=e)


VISTA = {'v': None, 'n': 0, 't': 0.0, 'img': None}


def olhador(base):
    # fica olhando a tela sem parar; 2 olhadores defasados = uma visão nova a cada ~1-1,5 s; o agente age com a mais recente
    k = base
    while True:
        k += 2
        try:
            img = tela(k)
            t = time.time()
            v = ver(img)
            if t > VISTA['t']:
                VISTA.update(v=v, n=k, t=t, img=str(img))
        except Exception as e:
            VISTA['erro'] = repr(e)[:150]
            time.sleep(0.5)


def main():
    if not OR_KEY or not JEV_KEY:
        sys.exit('faltam os segredos OPENROUTER_API_KEY e JEV_API_KEY no Codespace')
    log = open(LOG / 'log.jsonl', 'a')
    ultima_fala, fim, n = 0, time.time() + MINUTOS * 60, 0
    vistas = set()  # linhas de chat já vistas (não responde duas vezes à mesma coisa)
    historico, minhas, desastre_atual, cena_ant, desastre_log, modo, papel_log = [], [], '', None, '', 'livre', ''
    arq_minhas = LOG / 'minhas_falas.json'
    try:
        minhas = json.loads(arq_minhas.read_text())[-30:]
    except Exception:
        minhas = []
    primeira = True  # memória da conversa, para entender o clima
    threading.Thread(target=olhador, args=(0,), daemon=True).start()  # um olhador só (economia)
    ultima_vista = 0
    while time.time() < fim:
        if VISTA['n'] == ultima_vista:  # espera uma tela nova (não decide duas vezes a mesma)
            if MOV['tecla'] and time.time() - MOV['t'] < 3.5:
                a = mini()
                tecla(MOV['tecla'], 0.35)  # segue andando na mesma direção até a próxima decisão
                if preso(a, mini()):
                    MOV['presas'] += 1
                    if MOV['presas'] >= 2:  # duas vezes seguidas sem sair do lugar
                        desenroscar(); MOV['presas'] = 0
                else:
                    MOV['presas'] = 0
            else:
                time.sleep(0.1)
            continue
        ultima_vista = VISTA['n']
        n += 1
        t0 = time.time()
        v = dict(VISTA['v'])
        reg = {'n': n, 't': round(t0, 2), 'atraso_visao': round(t0 - VISTA['t'], 2), 'tela': VISTA['img']}
        try:
            reg['viu'] = v
            fx = v.get('fechar_xy')
            if isinstance(fx, list) and len(fx) == 2 and all(isinstance(z, (int, float)) for z in fx):
                # imagem 800x450 -> tela 1280x720; só clica no X de popup (nunca em compra)
                X, Y = int(fx[0] * 1.6), int(fx[1] * 1.6)
                subprocess.run(['xdotool', 'mousemove', str(X), str(Y), 'click', '1'], env={**os.environ, 'DISPLAY': DISPLAY})
                reg['fechou_popup'] = [X, Y]
            p = v.get('pedido_amigo') or 'nenhum'
            if p == 'seguir':
                modo = 'seguir'; OBJETIVO['alvo'] = ''
            elif p in ('parar_de_seguir', 'esperar'):
                modo = p; OBJETIVO['alvo'] = ''
            elif p == 'ir_lugar' and v.get('alvo_pedido'):
                OBJETIVO['alvo'] = v['alvo_pedido']; modo = 'objetivo'
            elif p.startswith('ir_'):
                modo = p
            if v.get('cena') == 'lobby':
                desastre_atual = ''; papel_log = ''
            elif v.get('desastre'):
                desastre_atual = v['desastre']
            v['desastre'] = v.get('desastre') or desastre_atual
            estado = (f"Cena: {v.get('cena')}. Desastre: {v.get('desastre') or 'nenhum'}. Perigo: {v.get('perigo') or 'nenhum'}. "
                      f"Vida: {v.get('vida')}. Abrigo visível: {v.get('abrigo_visivel') or 'nenhum'}. "
                      f"PEDIDO DO AMIGO EM VIGOR: {modo} (cumpra, a não ser que um desastre ameace a vida). "
                      f"Papel: {v.get('papel')}. Faca à vista: {v.get('faca_visivel') or 'nenhuma'}. Alvo perto: {v.get('alvo_perto') or 'ninguém'}. "
                      f"CONSELHO DO SONNET (que vê a tela): {v.get('conselho') or 'nenhum'}. "
                      f"Lugares à vista: {json.dumps(v.get('lugares', []), ensure_ascii=False)}. "
                      f"Lugar mais seguro: {v.get('lugar_seguro')}. Obstáculo à frente: {v.get('obstaculo_frente')}. "
                      f"Amigo {AMIGO} visível: {v.get('amigo_visivel')} (direção: {v.get('amigo_dir')}). Falaram comigo: {v.get('falaram_comigo')}. Chat: {json.dumps(v.get('chat_novo', []), ensure_ascii=False)}. "
                      f"Segundos desde a última fala: {int(t0 - ultima_fala)}.")
            a = jev(estado); reg['jev'] = a
            acao = a['acao']['choice']
            novas = [c for c in v.get('chat_novo', []) if not ja_visto(chave(c.get('autor', ''), c.get('texto', '')), vistas)
                     and 'carlosalberto' not in c.get('autor', '').lower()]
            for c in v.get('chat_novo', []):
                k = chave(c.get('autor', ''), c.get('texto', ''))
                if not ja_visto(k, vistas):
                    historico.append({'tipo': 'chat', 't': VISTA['t'], 'autor': c.get('autor', ''), 'texto': c.get('texto', '')})
                vistas.add(k)
            # eventos do jogo (mudança de cena / desastre) na mesma linha do tempo
            ev = None
            if v.get('cena') != cena_ant:
                ev = {'lobby': 'você está no lobby (entre rodadas)', 'rodada': 'começou uma rodada no mapa', 'morto': 'você morreu na rodada'}.get(v.get('cena'), f"cena: {v.get('cena')}")
                cena_ant = v.get('cena')
            if v.get('papel') and v.get('papel') not in ('desconhecido', '') and v.get('papel') != papel_log:
                papel_log = v['papel']
                ev = (ev + '; ' if ev else '') + f'seu papel nesta rodada: {papel_log}'
            if v.get('desastre') and v.get('desastre') != desastre_log:
                desastre_log = v['desastre']
                ev = (ev + '; ' if ev else '') + f'desastre anunciado: {desastre_log}'
            if ev:
                historico.append({'tipo': 'jogo', 't': VISTA['t'], 'texto': ev})
            historico = historico[-16:]
            import difflib
            def minha(c):  # o OCR às vezes troca o autor: se o texto é igual a algo que EU falei, é meu
                t = chave('', c.get('texto', ''))[1]
                return any(difflib.SequenceMatcher(None, t, chave('', m)[1]).ratio() > 0.7 for m in minhas[-8:])
            novas = [c for c in novas if not minha(c)]
            if primeira:  # o que já estava no chat quando o agente ligou é passado: não responde
                novas, primeira = [], False
            pra_mim = [c for c in novas if AMIGO.lower() in c.get('autor', '').lower() or 'carlos' in c.get('texto', '').lower()]
            # estranho com conteúdo sensível: ignora (nem responde nem repete); do amigo só passa o que não for sensível
            def barra(c):  # amigo: só o filtro estreito (pode dizer "vem ca"); estranho: filtro largo
                amigo = AMIGO.lower() in c.get('autor', '').lower()
                return bool(SAIDA_RE.search(c.get('texto', ''))) if amigo else sensivel(c.get('texto', ''))
            reg['ignorou_sensivel'] = [c for c in pra_mim if barra(c)] or None
            pra_mim = [c for c in pra_mim if not barra(c)]
            # só fala quando há mensagem NOVA para ele (do amigo ou citando o nome) e com pausa de 12 s; senão nunca fala sozinho
            import random
            if pra_mim and t0 - ultima_fala > 6:
                acao = 'falar'
            elif acao == 'falar':
                acao = 'seguir_amigo' if v.get('amigo_visivel') else 'parar'
            reg['pra_mim'] = pra_mim
            if modo == 'seguir' and acao not in ('falar',) and not v.get('perigo'):
                acao = 'seguir_amigo'  # pedido "vem cá / me segue" em vigor
            reg['modo'] = modo
            if acao == 'falar':
                if t0 - ultima_fala > 6:
                    frase = falar_ia(FALA.format(amigo=AMIGO, desastre=v.get('desastre') or 'nenhum (lobby ou rodada sem aviso)', resumo=v.get('resumo', ''), chat=' / '.join(f'{quem(c.get("autor",""))} disse: "{c.get("texto","")}"' for c in pra_mim), historico=conversa(historico), minhas=' | '.join(minhas[-4:]))).strip().strip('"')
                    if dizer(frase) is not False:
                        reg['falou'] = limpar(frase); minhas.append(reg['falou'])
                        arq_minhas.write_text(json.dumps(minhas[-30:], ensure_ascii=False))
                    else:
                        reg['bloqueado'] = frase[:120]; ultima_fala = time.time()
            elif modo == 'objetivo' and OBJETIVO['alvo'] and not v.get('perigo'):
                d = v.get('objetivo_dir') or 'nao_vejo'
                if d == 'cheguei':
                    reg['chegou'] = OBJETIVO['alvo']; OBJETIVO['alvo'] = ''; modo = 'livre'; acao = 'parar'
                elif d == 'nao_vejo':
                    executar('girar_camera'); acao = 'procurar:' + OBJETIVO['alvo']
                else:
                    executar('pular_frente' if d == 'frente' and v.get('obstaculo_frente') else d); acao = f"indo:{OBJETIVO['alvo']}:{d}"
            elif modo.startswith('ir_') and not v.get('perigo'):
                executar(modo[3:]); acao = modo; modo = 'livre'
            elif modo == 'esperar' and not v.get('perigo'):
                acao = 'parar'
            elif acao == 'parar' and random.random() < 0.35:
                executar(random.choice(['girar_camera', 'esquerda', 'direita', 'pular_frente'])); acao = 'parar(mexendo)'
            elif acao == 'seguir_amigo':
                executar({'esquerda': 'esquerda', 'direita': 'direita', 'tras': 'tras'}.get(v.get('amigo_dir'), 'frente'))
            else:
                executar(acao)
            reg['acao'] = acao
        except Exception as e:  # nunca para por um erro de rede
            reg['erro'] = repr(e)[:200]
        reg['dur'] = round(time.time() - t0, 2)
        log.write(json.dumps(reg, ensure_ascii=False) + '\n'); log.flush()
        print(reg.get('acao'), reg.get('falou', ''), reg.get('erro', ''), flush=True)


if __name__ == '__main__':
    main()
