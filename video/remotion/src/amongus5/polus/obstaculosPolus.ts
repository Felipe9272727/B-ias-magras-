// Os móveis do Polus (os mesmos de ArtePolus.tsx > Detalhes, com as mesmas contas) como retângulos de chão em px de
// mundo: o caminhoPolus.ts bloqueia essas células, pra ninguém atravessar mesa, cano, canhão ou caixote.
import {POLUS, type SalaPolus} from './mapaPolus';

const TILE = 48;
export type Ret = {x: number; y: number; w: number; h: number};

function sala(s: SalaPolus) {
  const {c, r, w, h} = POLUS.salas[s].rect;
  return {x: c * TILE, y: r * TILE, w: w * TILE, h: h * TILE};
}

export function obstaculosPolus(): Ret[] {
  const lab = sala('Laboratorio'), esp = sala('Especime'), o2 = sala('O2'), cal = sala('Caldeira'), arm = sala('Armas'), adm = sala('Admin');
  const esc = sala('Escritorio'), dep = sala('Deposito'), com = sala('Comunicacoes'), ele = sala('Eletrica'), seg = sala('Seguranca');
  const top = 90;
  const o: Ret[] = [];
  const caixa = (x: number, y: number, w: number, h: number) => o.push({x, y, w, h});
  const circulo = (cx: number, cy: number, r: number) => o.push({x: cx - r, y: cy - r, w: 2 * r, h: 2 * r});
  // laboratório: bancada (com os frascos em cima), telescópio, broca, armários na parede de cima
  caixa(lab.x + lab.w * 0.42, lab.y + lab.h * 0.45 - 40, Math.max(lab.w * 0.22, 3 * 70 + 34), 150)
  caixa(lab.x + lab.w - 260 - 60, lab.y + top + 40 - 70, 120, 190)
  caixa(lab.x + 220 - 60, lab.y + lab.h - 260 - 40, 120, 210)
  caixa(lab.x + lab.w * 0.12, lab.y + top + 10, 4 * 64 + 56, 90)
  // espécimes: 4 tubos
  for (let i = 0; i < 4; i++) { const cx = esp.x + esp.w * (0.2 + i * 0.2), cy = esp.y + esp.h * 0.6; caixa(cx - 70, cy - 110, 140, 206) }
  // O2: plantas e galões
  for (let i = 0; i < 3; i++) circulo(o2.x + 110 + (i % 2) * (o2.w - 220), o2.y + top + 80 + i * (o2.h * 0.3) + 10, 52)
  caixa(o2.x + o2.w / 2 - 70, o2.y + o2.h * 0.55, 140, 110)
  // caldeira: 3 canos grossos
  for (let i = 0; i < 3; i++) caixa(cal.x + 120 + i * ((cal.w - 240) / 3), cal.y + top, 96, cal.h - top - 40)
  // armas: canhão, coluna e painel
  circulo(arm.x + arm.w / 2, arm.y + arm.h * 0.58, 160)
  caixa(arm.x + arm.w / 2 - 36, arm.y + top, 72, arm.h * 0.58 - top - 60)
  caixa(arm.x + 60, arm.y + top + 20, 110, 77)
  // admin: mesa do mapa, estante, planta
  caixa(adm.x + adm.w / 2 - 300, adm.y + adm.h / 2 - 140, 600, 300)
  caixa(adm.x + 60, adm.y + adm.h - 320, 130, 260)
  circulo(adm.x + adm.w - 110, adm.y + top + 80, 52)
  // escritório: 2 mesas, 2 estantes, botão de emergência
  for (let i = 0; i < 2; i++) caixa(esc.x + 200 + i * (esc.w - 820), esc.y + esc.h - 170, 420, 100)
  caixa(esc.x + esc.w * 0.36, esc.y + top + 4, 150, 140)
  caixa(esc.x + esc.w * 0.6, esc.y + top + 4, 150, 140)
  circulo(esc.x + esc.w / 2, esc.y + esc.h * 0.62, 92)
  // depósito: 3 caixotes e 2 galões
  for (let i = 0; i < 3; i++) caixa(dep.x + 120 + i * ((dep.w - 240) / 3), dep.y + top + 30 + (i % 2) * 60, 170, 140)
  caixa(dep.x + dep.w - 200, dep.y + dep.h - 150, 126, 90)
  // comunicações: mesa dos monitores e o rádio
  caixa(com.x + 50, com.y + top - 20, com.w - 100, 140)
  o.push({x: com.x + com.w / 2 - 110, y: com.y + com.h * 0.62 - 70, w: 220, h: 140})
  // elétrica: 4 transformadores (com as bobinas em cima)
  for (let i = 0; i < 4; i++) { const tx = ele.x + 120 + (i % 2) * (ele.w / 2), ty = ele.y + top + 60 + Math.floor(i / 2) * (ele.h * 0.38); caixa(tx, ty - 50, 200, 200) }
  // segurança: mesa das câmeras
  caixa(seg.x + 40, seg.y + top - 30, seg.w - 80, 110)
  return o
}
