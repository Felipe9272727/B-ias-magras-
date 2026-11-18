// Gera uma imagem pelo OpenRouter (chave guardada no mod) e salva em PNG.
// Uso: node gerar_imagem_or.mjs <saida.png> <modelo> <proporcao 16:9|2:3|1:1> "<prompt>" [referencia.png ...]
import fs from 'fs';
import {chaveDoMod} from '../../amongus/ia.mjs';

const [saida, modelo, prop, prompt, ...refs] = process.argv.slice(2);
const k = chaveDoMod('openrouter') || process.env.OPENROUTER_API_KEY;
if (!k) { console.error('sem chave do OpenRouter'); process.exit(1); }
const content = refs.length ? [{type: 'text', text: prompt}, ...refs.map((f) => ({type: 'image_url', image_url: {url: `data:image/png;base64,${fs.readFileSync(f).toString('base64')}`}}))] : prompt;
const corpo = {model: modelo, messages: [{role: 'user', content}], modalities: ['image', 'text'], image_config: {aspect_ratio: prop}, usage: {include: true}};
for (let t = 1; t <= 3; t++) {
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {method: 'POST', headers: {Authorization: `Bearer ${k}`, 'Content-Type': 'application/json'}, body: JSON.stringify(corpo)});
  const j = await r.json().catch(() => ({}));
  const img = j?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (img) {
    fs.writeFileSync(saida, Buffer.from(img.split(',')[1], 'base64'));
    console.log(saida, 'custo US$', j?.usage?.cost ?? '?');
    process.exit(0);
  }
  console.error('tentativa', t, r.status, JSON.stringify(j).slice(0, 300));
}
process.exit(1);
