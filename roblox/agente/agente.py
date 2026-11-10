#!/usr/bin/env python3
"""IA jogando Roblox (Natural Disaster Survival) no Codespace: o Haiku VÊ a tela e conversa; o Jev DECIDE a ação.
Laço (~1,5 s): print do Xvfb :110 -> Haiku (visão) descreve a cena em JSON -> Jev escolhe a ação (andar/pular/
falar/parar) -> xdotool executa. Quando é para falar, o Haiku escreve a frase (curta, jeito de jogador).
Regras fixas: nunca pedir/compartilhar dados pessoais, nada ofensivo, e se alguém perguntar A SÉRIO se é IA,
não nega (pode brincar, mas admite). Tudo vai para log (JSONL) + prints, para a edição do vídeo.
Chaves pelo ambiente (segredos do Codespaces): OPENROUTER_API_KEY e JEV_API_KEY. Nunca no repositório.
Uso:  python3 roblox/agente/agente.py [--minutos 15]"""
import base64, json, os, subprocess, sys, time, urllib.request
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
    subprocess.run(['import', '-display', DISPLAY, '-window', 'root', '-resize', '960x540', '-quality', '70', str(f)], check=True)
    return f


def haiku(msgs, max_tokens=300):
    r = post('https://openrouter.ai/api/v1/chat/completions', {'model': MODELO, 'max_tokens': max_tokens + 400, 'messages': msgs,
             'reasoning': {'enabled': False}}, {'Authorization': f'Bearer {OR_KEY}'})
    return r['choices'][0]['message'].get('content') or ''


VER = (f'Você está vendo a tela do Roblox, jogo Natural Disaster Survival, do ponto de vista do jogador Carlosalberto1234736 '
       f'(personagem de cabelo castanho e jaqueta preta, no centro). Responda SÓ um JSON: '
       '{"cena":"lobby|rodada|morto|menu","desastre":"texto do aviso de desastre ou vazio","perigo":"o que ameaça agora (ou vazio)",'
       '"lugar_seguro":"esquerda|direita|frente|tras|aqui","obstaculo_frente":true/false,'
       '"chat_novo":[{"autor":"","texto":""}],"amigo_visivel":true/false,"amigo_dir":"esquerda|direita|frente|tras|nao_visto","falaram_comigo":true/false,"resumo":"1 frase"}. falaram_comigo = alguém no chat citou Carlos/Carlosalberto ou o amigo falou algo que pede resposta. '
       f'O amigo do jogador se chama {AMIGO}. Em chat_novo ponha só as últimas 3 linhas do chat no canto superior esquerdo.')


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
        'Conversa recente: {historico}. Suas últimas falas (não repita): {minhas}. Mensagem que você vai responder agora: {chat}. '
        'Escreva UMA mensagem de chat curta (até 70 caracteres, sem acentos), jeito de jogador brasileiro (minúscula, gíria leve, sem emoji). '
        'Desastre atual (fale SÓ dele, nunca invente outro como lava/fogo se não estiver aqui): {desastre}. '
        'Pode ser zoeiro do seu jeito, mas só fale de fatos que estão na situação e no chat (não invente o que não aconteceu); se não entender, pergunte. '
        'Preste muita atenção no que o {amigo} e os outros disseram por último e responda a isso (pergunta -> resposta direta; brincadeira -> brinque de volta); não repita frases. '
        'Regras: nada ofensivo; nunca peça nem diga dados pessoais (idade, cidade, redes, nome real); se alguém perguntar a sério se você é '
        'uma IA ou um bot, não negue (pode brincar, mas admita). Situação do jogo: {resumo}. Só a mensagem, sem aspas.')


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
        tecla(m[acao], 1.2)
    elif acao == 'pular_frente':
        e = {**os.environ, 'DISPLAY': DISPLAY}
        subprocess.run(['xdotool', 'keydown', 'w'], env=e); time.sleep(0.3)
        subprocess.run(['xdotool', 'key', 'space'], env=e); time.sleep(0.6)
        subprocess.run(['xdotool', 'keyup', 'w'], env=e)


def main():
    if not OR_KEY or not JEV_KEY:
        sys.exit('faltam os segredos OPENROUTER_API_KEY e JEV_API_KEY no Codespace')
    log = open(LOG / 'log.jsonl', 'a')
    ultima_fala, fim, n = 0, time.time() + MINUTOS * 60, 0
    vistas = set()  # linhas de chat já vistas (não responde duas vezes à mesma coisa)
    historico, minhas = [], []  # memória da conversa, para entender o clima
    while time.time() < fim:
        n += 1
        t0 = time.time()
        reg = {'n': n, 't': round(t0, 2)}
        try:
            img = tela(n)
            v = ver(img); reg['viu'] = v
            estado = (f"Cena: {v.get('cena')}. Desastre: {v.get('desastre') or 'nenhum'}. Perigo: {v.get('perigo') or 'nenhum'}. "
                      f"Lugar mais seguro: {v.get('lugar_seguro')}. Obstáculo à frente: {v.get('obstaculo_frente')}. "
                      f"Amigo {AMIGO} visível: {v.get('amigo_visivel')} (direção: {v.get('amigo_dir')}). Falaram comigo: {v.get('falaram_comigo')}. Chat: {json.dumps(v.get('chat_novo', []), ensure_ascii=False)}. "
                      f"Segundos desde a última fala: {int(t0 - ultima_fala)}.")
            a = jev(estado); reg['jev'] = a
            acao = a['acao']['choice']
            novas = [c for c in v.get('chat_novo', []) if (c.get('autor', ''), c.get('texto', '')) not in vistas
                     and 'carlosalberto' not in c.get('autor', '').lower()]
            for c in v.get('chat_novo', []):
                k = (c.get('autor', ''), c.get('texto', ''))
                if k not in vistas:
                    historico.append(f'{k[0]}: {k[1]}')
                vistas.add(k)
            historico = historico[-12:]
            pra_mim = [c for c in novas if AMIGO.lower() in c.get('autor', '').lower() or 'carlos' in c.get('texto', '').lower()]
            # só fala quando há mensagem NOVA para ele (do amigo ou citando o nome) e com pausa de 12 s; senão nunca fala sozinho
            if pra_mim and t0 - ultima_fala > 12:
                acao = 'falar'
            elif acao == 'falar':
                acao = 'seguir_amigo' if v.get('amigo_visivel') else 'parar'
            reg['pra_mim'] = pra_mim
            if acao == 'falar':
                if t0 - ultima_fala > 6:
                    frase = haiku([{'role': 'user', 'content': FALA.format(amigo=AMIGO, desastre=v.get('desastre') or 'nenhum (lobby ou rodada sem aviso)', resumo=v.get('resumo', ''), chat=json.dumps(pra_mim, ensure_ascii=False), historico=' | '.join(historico), minhas=' | '.join(minhas[-4:]))}], 80).strip().strip('"')
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
