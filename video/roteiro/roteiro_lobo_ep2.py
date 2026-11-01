"""Episódio completo: apenas partidas reais5/6/7, vozes originais e abertura recuperada."""
from roteiro_lobo_ep2_common import *
import roteiro_lobo_ep2_p5 as p5
import roteiro_lobo_ep2_p6 as p6
import roteiro_lobo_ep2_p7 as p7

ORDEM=[5,6,7]
CHAPTERS={'abertura':'Vocês pediram a Parte2',**p5.CHAPTERS,**p6.CHAPTERS,**p7.CHAPTERS}
KEEP_P5={0,3,4,7,9,10,14,16,17,21,22,25,26,27,28,29,30,32,33,34}
SCENES=[N('ep2abertura','abertura',comp('EP2AberturaRecuperada'),'',min=27,lead=0,pad=0)]
SCENES += [s for s in p5.SCENES if int(s['id'][-2:]) in KEEP_P5]
SCENES += p6.SCENES+p7.SCENES
QUOTE_SOURCES=verificar_fontes(SCENES,ORDEM)
CUES=[
 ('ep2abertura','monkeys-spinning-monkeys',0,.65),
 ('ep2p500','quirky-dog',0,.7),
 ('ep2p503','sneaky-snitch',0,.7),
 ('ep2p509','thinking-music',0,.65),
 ('ep2p514','heroic-age',0,.65),
 ('ep2p516','sneaky-snitch',20,.7),
 ('ep2p525','fluffing-a-duck',0,.7),
 ('ep2p529','decisions',0,.7),
 ('ep2p533','heroic-age',18,.7),
 ('ep2p600','quirky-dog',20,.7),
 ('ep2p601','sneaky-snitch',0,.7),
 ('ep2p605','thinking-music',0,.7),
 ('ep2p608','fluffing-a-duck',0,.7),
 ('ep2p611','thinking-music',25,.7),
 ('ep2p614','decisions',0,.7),
 ('ep2p616','fluffing-a-duck',30,.7),
 ('ep2p619','relent',0,.7),
 ('ep2p624','sneaky-snitch',20,.7),
 ('ep2p626','monkeys-spinning-monkeys',15,.7),
 ('ep2p700','quirky-dog',0,.7),
 ('ep2p701','sneaky-snitch',0,.7),
 ('ep2p706','thinking-music',0,.7),
 ('ep2p708','fluffing-a-duck',0,.7),
 ('ep2p711','decisions',0,.7),
 ('ep2p714','thinking-music',25,.7),
 ('ep2p716','heroic-age',0,.7),
 ('ep2p719','sneaky-snitch',20,.7),
 ('ep2p721','fluffing-a-duck',0,.7),
 ('ep2p723','monkeys-spinning-monkeys',0,.7),
]
