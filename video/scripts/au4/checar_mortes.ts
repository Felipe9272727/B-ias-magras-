// AU4: confere no simulador as mortes de cada partida: quem está vivo no vídeo bate com o retrato do motor no fim de
// cada tique, e cada morte animada (bomba, fogo, casal, Glutão, Canibal) aparece com o quadro e o modo certos.
// Uso: npx esbuild au4/checar_mortes.ts --bundle --platform=node --outfile=$S/cm.js && node $S/cm.js ../../amongus/logs4/partida1.json
import {readFileSync} from 'node:fs';
import {CORES, simular, type Partida2} from '../../remotion/src/amongus3/sim';

for (const arq of process.argv.slice(2)) {
  const p = JSON.parse(readFileSync(arq, 'utf8')) as Partida2;
  const s = simular(p);
  let erros = 0;
  for (let t = 1; t < s.inicioTique.length - 1; t++) {
    const fimT = (s.inicioTique[t + 1] ?? s.total) - 1;
    const est = p.tiques[t]?.estado;
    if (!est || p.reunioes.some((r) => r.tique === t)) continue; // tique de reunião: o retrato já é de depois dela
    for (const j of est.jogadores) {
      const vivoSim = !!s.q(j.cor, fimT);
      if (vivoSim !== j.vivo) { erros++; if (erros < 12) console.log(`  t${t} ${j.cor}: motor ${j.vivo ? 'vivo' : 'morto'}, vídeo ${vivoSim ? 'vivo' : 'morto'}`) }
    }
  }
  const ev = s.eventos.filter((e) => ['morte', 'xerife', 'bomba', 'incendio', 'casal_morre', 'canibal_come', 'limpeza', 'morte_veneno'].includes(e.tipo));
  console.log(`${arq}: ${erros} divergências vivo/morto`);
  for (const e of ev) console.log(`  q${e.quadro} t${e.tique} ${e.tipo} ${e.vitima ?? e.alvo ?? e.corpo ?? ''} ${e.mortos ? JSON.stringify(e.mortos) : ''} ${e.devorado ? 'DEVORADO' : ''}`);
  void CORES;
}
