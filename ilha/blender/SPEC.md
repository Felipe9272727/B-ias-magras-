# Contrato dos assets low-poly — "Jogos Vorazes das IAs" (Blender 4.2, Python)

Todos os assets são **gerados por código** (bpy + bmesh), sem arquivos baixados. Cada módulo fica em
`ilha/blender/assets/<modulo>.py` e expõe funções `criar_<coisa>(nome: str, seed: int = 0, **opcoes) -> bpy.types.Object`.

## Regras gerais
- Estilo **low-poly facetado** (flat shading, poucas faces: árvore 60–400 tris, personagem 300–1500 tris, bicho 150–800).
  Use `bpy.ops.object.shade_flat()` ou `mesh.polygons.foreach_set("use_smooth", ...)` com False.
- Escala: **1 unidade = 1 metro**. Personagem humanoide tem **1,8 m**. Origem do objeto **no chão** (base em z=0), centralizado em x/y.
- Cores por **materiais simples** (Principled BSDF: só Base Color, Roughness 0.8–1.0, sem texturas de imagem).
  Paleta "maquete": cores saturadas mas suaves. Crie materiais com `mat_cor(nome, (r,g,b))` (função utilitária em `assets/util.py`; se não existir, crie-a igual em todos: reutiliza se já existe pelo nome).
- Variação por `seed` (random.Random(seed)): tamanho, inclinação, tom de cor — para não ficar tudo igual.
- Um objeto por chamada (junte partes com `bpy.ops.object.join()`), exceto quando a opção pedir rig/partes separadas.
- **Nunca** apague a cena nem objetos que não criou. Não mexa em câmera/luz/mundo fora do script de prévia.
- Sem addons externos.

## Prévia obrigatória
Cada módulo tem `if __name__ == "__main__":` que limpa a cena, cria **todas** as variações lado a lado, põe câmera
3/4 de cima, um Sun e fundo azul-céu, e renderiza com **BLENDER_WORKBENCH** (rápido) em
`ilha/blender/previas/<modulo>.png` (1600×900). Configuração Workbench: `shading.light='STUDIO'`, `color_type='MATERIAL'`,
`show_shadows=True`, `show_cavity=True`, `show_object_outline=True`.
Rodar: `xvfb-run -a -s "-screen 0 1920x1080x24" blender -b -P ilha/blender/assets/<modulo>.py`
Olhe a prévia (Read no PNG) e itere até ficar bonito e legível de longe.

## Módulos e responsáveis
- `natureza.py`: palmeira, árvore de floresta (pinheiro e copa redonda), arbusto, arbusto com frutinhas, pedras (3 tipos), tronco caído,
  cogumelos, flores, capim, cacto pequeno, coqueiro com cocos, árvore morta. Função extra `criar_moita_grupo` opcional.
- `animais.py`: caranguejo, javali, coelho, gaivota (asas abertas), cobra, peixe, tartaruga, macaco. Cada um com opção `pose`
  ("parado" | "andando" | "morto") quando fizer sentido (pose = rotação de partes antes do join).
- `personagens.py`: tributo humanoide low-poly estilo "boneco de maquete" (cabeça, tronco, braços, pernas, mãos simples), com
  `criar_tributo(nome, empresa, cor, pose, seed)`: empresa ∈ {"anthropic","openai","deepseek"} define o **uniforme do grupo**
  (anthropic: macacão laranja-terracota #D97757 com detalhes creme; openai: preto/cinza-escuro com detalhes brancos e verde-água #10A37F;
  deepseek: azul #4D6BFE com detalhes brancos). `cor` = cor pessoal (faixa na cabeça/lenço). Poses: "parado", "andando_a", "andando_b",
  "correndo", "atacando", "coletando", "sentado", "dormindo", "morto", "acenando". Opção `item` ∈ {None,"faca","lanca","arco","machado","tocha"} na mão.
  Também `criar_tributo_rig(...)` que devolve partes separadas parentadas a um Empty (para animar no Blender).
- `objetos.py`: Cornucópia (chifre dourado grande, aberto, 6 m), caixas/caixotes, mochila, cantil, garrafa d'água, lata de comida,
  frutas, faca, lança, arco + aljava, machado, tocha, kit médico, corda, fogueira (acesa: chamas em cones laranja/amarelo; apagada),
  abrigo de galhos (tenda), barraca de lona, armadilha, paraquedas com caixa de suprimentos, balsa de troncos, bote salva-vidas.
- `navio.py`: navio de cruzeiro/cargueiro low-poly (40–60 m) para a abertura do naufrágio: casco, convés, chaminé, cabine com janelas
  (emissivas amarelas), botes salva-vidas laterais, mastro, bandeira. Opção `partes_separadas=True` devolve casco dianteiro e traseiro
  separados (para partir ao meio) + destroços (caixas, tábuas, boias). Também `criar_boia_salva_vidas`.

O terreno da ilha, água, céu, iluminação, câmeras e animações ficam com o coordenador (não façam).
