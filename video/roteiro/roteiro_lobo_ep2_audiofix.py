"""Revisão de áudio e encerramento; decisões e falas reais permanecem iguais."""
import copy
import json
import re
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).parent))
import roteiro_lobo_ep2 as original
from roteiro_lobo_ep2_common import verificar_fontes

ORDEM=original.ORDEM;CHAPTERS=original.CHAPTERS;CUES=original.CUES
DUCK_RELEASE_MS=750
FINAL_FADE_SECONDS=3.0
SCENES=copy.deepcopy(original.SCENES)
request=json.loads((Path(__file__).parents[1]/'remotion/public/voice_lobo_ep2/audio_revision/outro_request.json').read_text())
outro=re.sub(r'\[[^\]]+\]\s*','',request['prompt']).strip()
for scene in SCENES:
    if scene['id']=='ep2p723':
        scene.update(text=outro,visual={'type':'component','name':'LOBEp2Encerramento','props':{'ordem':[5,6,7]}},pad=3.5)
QUOTE_SOURCES=verificar_fontes(SCENES,ORDEM)
