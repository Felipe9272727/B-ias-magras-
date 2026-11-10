#!/usr/bin/env python3
"""IA jogando Roblox (Natural Disaster Survival) no Codespace: o Haiku VÊ a tela e conversa; o Jev DECIDE a ação.
Laço (~1,5 s): print do Xvfb :110 -> Haiku (visão) descreve a cena em JSON -> Jev escolhe a ação (andar/pular/
falar/parar) -> xdotool executa. Quando é para falar, o Haiku escreve a frase (curta, jeito de jogador).
Regras fixas: nunca pedir/compartilhar dados pessoais, nada ofensivo, e se alguém perguntar A SÉRIO se é IA,
não nega (pode brincar, mas admite). Tudo vai para log (JSONL) + prints, para a edição do vídeo.
Chaves pelo ambiente (segredos do Codespaces): OPENROUTER_API_KEY e JEV_API_KEY. Nunca no repositório.
Uso:  python3 roblox/agente/agente.py [--minutos 15]"""
import base64, json, os, subprocess, sys, threading, time, urllib.request
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
MODELO = os.environ.get('MODELO_HAIKU', 'anthropic/claude-haiku-5.5')
AMIGO = os.environ.get('AMIGO', 'Bush')
MINUTOS = float(sys.argv[sys.argv.index('--minutos') + 1]) if '--minutos' in sys.argv else 15


def post(url, body, headers, timeout=40):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json', **headers})
    return json.loads(urllib.request.urlopen(req, timeout=timeout).read())


def tela(n):
    f = LOG / f'tela_{n:05d}.jpg'
    subprocess.run(['import', '-display', DISPLAY, '-window', 'root', '-resize', '800x450', '-quality', '75', str(f)], check=True)
    return f


def haiku(msgs, max_tokens=300):
    r = post('https://openrouter.ai/api/v1/chat/completions', {'model': MODELO, 'max_tokens': max_tokens + 400, 'messages': msgs,
             'reasoning': {'enabled': False}}, {'Authorization': f'Bearer {OR_KEY}'})
    return r['choices'][0]['message'].get('content') or ''


VER = (f'Você está vendo a tela do Roblox, jogo Natural Disaster Survival. O jogador é Carlosalberto1234736: o personagem '
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
       '"falaram_comigo":true/false,"resumo":"2 frases sobre o que está acontecendo agora na partida"}. '
       f'falaram_comigo = alguém no chat citou Carlos ou o amigo {AMIGO} falou algo que pede resposta. '
       f'O amigo se chama {AMIGO} (nome em cima do personagem). Em chat_novo ponha as últimas 5 MENSAGENS do chat: cada mensagem começa com o nome colorido seguido de dois-pontos '
       '("Nome: texto"); se o texto quebra em mais de uma linha, as linhas de baixo (sem nome) são continuação da MESMA mensagem; '
       'copie o nome exatamente como aparece e não junte mensagens de pessoas diferentes.')


def ver(img):
    b64 = base64.b64encode(img.read_bytes()).decode()
    txt = haiku([{'role': 'user', 'content': [{'type': 'image_url', 'image_url': {'url': f'data:image/jpeg;base64,{b64}'}}, {'type': 'text', 'text': VER}]}])
    txt = txt[txt.find('{'): txt.rfind('}') + 1]
    return json.loads(txt)


ACOES = {
    'frente': 'andar para a frente (W)', 'tras': 'andar para trás (S)', 'esquerda': 'andar para a esquerda (A)',
    'direita': 'andar para a direita (D)', 'pular_frente': 'correr e pular para a frente (subir em algo)',
    'parar': 'ficar parado observando', 'falar': 'mandar uma mensagem curta no chat',
    'seguir_amigo': 'andar na direção do amigo para ficar junto dele',
    'girar_camera': 'girar a câmera para olhar em volta (quando não dá para ver o perigo, o abrigo ou o amigo)',
}
ESTRATEGIA = ('Regras do Natural Disaster Survival: no lobby, ficar perto do amigo e conversar. Na rodada, o aviso diz o desastre: '
              'enchente/tsunami/vulcão -> subir no lugar mais alto (pular em prédios/escadas); terremoto -> lugar aberto, longe de prédios; '
              'chuva ácida/nevasca/raio/tempestade de areia/meteoro -> ficar embaixo de um teto; tornado -> longe do funil, atrás de paredes; '
              'avalanche -> sair do caminho da neve, ir para os lados ou subir; incêndio -> longe do fogo. Sem perigo imediato: seguir o amigo. '
              'Morto: só conversar com o amigo.')


def jev(estado):
    r = post('https://api.typesafe.ai/v1/systemone', {'model': 'jev-latest', 'state': ESTRATEGIA + ' Situação agora: ' + estado, 'questions': {
        'acao': {'type': 'choice', 'instructions': 'Qual a melhor ação agora para sobreviver ao desastre e ser um bom companheiro do amigo?', 'criteria': ACOES},
        'responder': {'type': 'noul', 'instructions': 'Alguém no chat falou diretamente com o jogador ou com o amigo dele e merece resposta?'},
    }}, {'Authorization': f'Bearer {JEV_KEY}'}, timeout=15)
    return r['answers']


FALA = ('Você é um jogador de Roblox chamado Carlosalberto1234736, jogando Natural Disaster Survival com o amigo {amigo}. '
        'Clima: o {amigo} é seu melhor amigo, vocês estão se divertindo juntos; zoeira, "kkkk", "mn", "slk", xingamento de brincadeira e '
        'provocação entre amigos são brincadeira, NÃO briga; responda no mesmo tom leve e engraçado. Leia a conversa inteira abaixo '
        '(em ordem, a última é a mais nova) para entender do que estão falando antes de responder. '
        'AGORA (o presente, o que está na tela neste momento): {resumo} Desastre agora: {desastre}.\n'
        'ANTES (linha do tempo do passado, do mais antigo ao mais novo; o que já passou NÃO está acontecendo agora; [JOGO] = eventos da '
        'partida; as outras linhas são mensagens separadas do chat, cada uma de uma pessoa):\n{historico}\n'
        'Mensagens de outros jogadores entre si não são para você. '
        'Suas últimas falas (não repita): {minhas}. Responda AGORA só a esta(s) mensagem(ns) feita(s) para você: {chat}. '
        'Escreva UMA mensagem de chat curta (até 70 caracteres, sem acentos), jeito de jogador brasileiro (minúscula, gíria leve, sem emoji). '
        'Desastre atual (fale SÓ dele, nunca invente outro como lava/fogo se não estiver aqui): {desastre}. '
        'Pode ser zoeiro do seu jeito, mas só fale de fatos que estão na situação e no chat (não invente o que não aconteceu); se não entender, pergunte. '
        'Preste muita atenção no que o {amigo} e os outros disseram por último e responda a isso (pergunta -> resposta direta; brincadeira -> brinque de volta); não repita frases. '
        'Regras: nada ofensivo; nunca peça nem diga dados pessoais (idade, cidade, redes, nome real); se alguém perguntar a sério se você é '
        'uma IA ou um bot, não negue (pode brincar, mas admita). Situação do jogo: {resumo}. Só a mensagem, sem aspas.')


def chave(autor, texto):
    import re, unicodedata
    n = lambda x: re.sub(r'[^a-z0-9]', '', ''.join(c for c in unicodedata.normalize('NFKD', x.lower()) if not unicodedata.combining(c)))
    return (n(autor)[:12], n(texto)[:40])


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
    texto = limpar(texto)
    e = {**os.environ, 'DISPLAY': DISPLAY}
    subprocess.run(['xdotool', 'key', 'slash'], env=e); time.sleep(0.6)
    subprocess.run(['xdotool', 'type', '--delay', '70', texto], env=e)
    subprocess.run(['xdotool', 'key', 'Return'], env=e)


def executar(acao):
    m = {'frente': 'w', 'tras': 's', 'esquerda': 'a', 'direita': 'd'}
    if acao in m:
        tecla(m[acao], 0.8)
    elif acao == 'girar_camera':
        tecla('Right', 0.4)
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
    historico, minhas, desastre_atual, cena_ant, desastre_log = [], [], '', None, ''  # memória da conversa, para entender o clima
    threading.Thread(target=olhador, args=(0,), daemon=True).start()
    time.sleep(1.2)
    threading.Thread(target=olhador, args=(1,), daemon=True).start()
    ultima_vista = 0
    while time.time() < fim:
        if VISTA['n'] == ultima_vista:  # espera uma tela nova (não decide duas vezes a mesma)
            time.sleep(0.1)
            continue
        ultima_vista = VISTA['n']
        n += 1
        t0 = time.time()
        v = dict(VISTA['v'])
        reg = {'n': n, 't': round(t0, 2), 'atraso_visao': round(t0 - VISTA['t'], 2), 'tela': VISTA['img']}
        try:
            reg['viu'] = v
            if v.get('cena') == 'lobby':
                desastre_atual = ''
            elif v.get('desastre'):
                desastre_atual = v['desastre']
            v['desastre'] = v.get('desastre') or desastre_atual
            estado = (f"Cena: {v.get('cena')}. Desastre: {v.get('desastre') or 'nenhum'}. Perigo: {v.get('perigo') or 'nenhum'}. "
                      f"Vida: {v.get('vida')}. Abrigo visível: {v.get('abrigo_visivel') or 'nenhum'}. "
                      f"Lugar mais seguro: {v.get('lugar_seguro')}. Obstáculo à frente: {v.get('obstaculo_frente')}. "
                      f"Amigo {AMIGO} visível: {v.get('amigo_visivel')} (direção: {v.get('amigo_dir')}). Falaram comigo: {v.get('falaram_comigo')}. Chat: {json.dumps(v.get('chat_novo', []), ensure_ascii=False)}. "
                      f"Segundos desde a última fala: {int(t0 - ultima_fala)}.")
            a = jev(estado); reg['jev'] = a
            acao = a['acao']['choice']
            novas = [c for c in v.get('chat_novo', []) if chave(c.get('autor', ''), c.get('texto', '')) not in vistas
                     and 'carlosalberto' not in c.get('autor', '').lower()]
            for c in v.get('chat_novo', []):
                k = chave(c.get('autor', ''), c.get('texto', ''))
                if k not in vistas:
                    historico.append({'tipo': 'chat', 't': VISTA['t'], 'autor': c.get('autor', ''), 'texto': c.get('texto', '')})
                vistas.add(k)
            # eventos do jogo (mudança de cena / desastre) na mesma linha do tempo
            ev = None
            if v.get('cena') != cena_ant:
                ev = {'lobby': 'você está no lobby (entre rodadas)', 'rodada': 'começou uma rodada no mapa', 'morto': 'você morreu na rodada'}.get(v.get('cena'), f"cena: {v.get('cena')}")
                cena_ant = v.get('cena')
            if v.get('desastre') and v.get('desastre') != desastre_log:
                desastre_log = v['desastre']
                ev = (ev + '; ' if ev else '') + f'desastre anunciado: {desastre_log}'
            if ev:
                historico.append({'tipo': 'jogo', 't': VISTA['t'], 'texto': ev})
            historico = historico[-16:]
            pra_mim = [c for c in novas if AMIGO.lower() in c.get('autor', '').lower() or 'carlos' in c.get('texto', '').lower()]
            # só fala quando há mensagem NOVA para ele (do amigo ou citando o nome) e com pausa de 12 s; senão nunca fala sozinho
            if pra_mim and t0 - ultima_fala > 12:
                acao = 'falar'
            elif acao == 'falar':
                acao = 'seguir_amigo' if v.get('amigo_visivel') else 'parar'
            reg['pra_mim'] = pra_mim
            if acao == 'falar':
                if t0 - ultima_fala > 6:
                    frase = haiku([{'role': 'user', 'content': FALA.format(amigo=AMIGO, desastre=v.get('desastre') or 'nenhum (lobby ou rodada sem aviso)', resumo=v.get('resumo', ''), chat=' / '.join(f'{quem(c.get("autor",""))} disse: "{c.get("texto","")}"' for c in pra_mim), historico=conversa(historico), minhas=' | '.join(minhas[-4:]))}], 80).strip().strip('"')
                    dizer(frase); reg['falou'] = limpar(frase); minhas.append(reg['falou']); ultima_fala = time.time()
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
