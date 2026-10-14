// Checagem do Among Us 2: ninguém dentro de parede (por quadro). Uso: npx tsx video/scripts/checar_paredes_au2.ts
import {simular, CORES} from '/home/user/B-ias-magras-/video/remotion/src/amongus2/sim';
import {andavel} from '/home/user/B-ias-magras-/video/remotion/src/amongus/nave/mapa';
import fs from 'fs';
const motivo = (s: any, cor: string, f: number) => {
  const ev = s.eventos.find((e: any) => Math.abs(e.quadro - f) < 3 && (e.cor === cor || e.assassino === cor || e.xerife === cor));
  return ev ? ev.tipo : (s.reunioes.some((r: any) => Math.abs(r.quadro - f) < 2) ? 'reuniao' : '?');
};
for (const n of [1, 2, 3, 4]) {
  const p = JSON.parse(fs.readFileSync(`/home/user/B-ias-magras-/video/remotion/public/amongus2/partida${n}.json`, 'utf8'));
  const s = simular(p);
  const tipos: Record<string, number> = {};
  const ex: string[] = [];
  for (const cor of CORES) {
    for (let f = 1; f < s.total; f++) {
      const a = s.q(cor, f - 1), b = s.q(cor, f);
      if (!a || !b) continue;
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      if (d < 0.5) continue;
      let ruim = !andavel(b);
      if (!ruim && d <= 20) for (let k = 1; k < 4; k++) if (!andavel({x: a.x + (b.x - a.x) * k / 4, y: a.y + (b.y - a.y) * k / 4})) ruim = true;
      if (ruim) { const m = d > 20 ? 'salto:' + motivo(s, cor, f) : 'parede:' + motivo(s, cor, f); tipos[m] = (tipos[m] ?? 0) + 1; if (ex.length < 6 && m.startsWith('parede')) ex.push(`${cor}@${f}(${Math.round(b.x)},${Math.round(b.y)})`); }
    }
  }
  console.log('partida', n, JSON.stringify(tipos), ex.join(' '));
}
