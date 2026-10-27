// Mapa Polus (Among Us 5) para o motor: gerado por video/scripts/gerar_polus.py. Mesmas funções do mapa.mjs (Skeld).
export const SALAS = {
 "Dropship": {
  "x": 40,
  "y": 19,
  "nome": "Nave de Pouso"
 },
 "Eletrica": {
  "x": 21,
  "y": 43,
  "nome": "Elétrica"
 },
 "Seguranca": {
  "x": 8,
  "y": 46,
  "nome": "Segurança"
 },
 "O2": {
  "x": 6,
  "y": 68,
  "nome": "O2"
 },
 "Caldeira": {
  "x": 6,
  "y": 91,
  "nome": "Sala da Caldeira"
 },
 "Comunicacoes": {
  "x": 28,
  "y": 67,
  "nome": "Comunicações"
 },
 "Armas": {
  "x": 29,
  "y": 88,
  "nome": "Armas"
 },
 "Deposito": {
  "x": 48,
  "y": 46,
  "nome": "Depósito"
 },
 "Escritorio": {
  "x": 53,
  "y": 66,
  "nome": "Escritório"
 },
 "Admin": {
  "x": 54,
  "y": 88,
  "nome": "Admin"
 },
 "Descontaminacao": {
  "x": 64,
  "y": 32,
  "nome": "Descontaminação"
 },
 "Laboratorio": {
  "x": 84,
  "y": 33,
  "nome": "Laboratório"
 },
 "DescontaminacaoInf": {
  "x": 95,
  "y": 48,
  "nome": "Descontaminação 2"
 },
 "Especime": {
  "x": 87,
  "y": 79,
  "nome": "Sala de Espécimes"
 }
}

export const CORREDORES = [["Dropship", "Deposito"], ["Dropship", "Eletrica"], ["Dropship", "Descontaminacao"], ["Dropship", "Escritorio"], ["Eletrica", "Seguranca"], ["Eletrica", "O2"], ["Eletrica", "Comunicacoes"], ["Seguranca", "O2"], ["O2", "Caldeira"], ["O2", "Comunicacoes"], ["Caldeira", "Armas"], ["Comunicacoes", "Armas"], ["Comunicacoes", "Escritorio"], ["Armas", "Admin"], ["Deposito", "Escritorio"], ["Escritorio", "Admin"], ["Escritorio", "Especime"], ["Admin", "Especime"], ["Descontaminacao", "Laboratorio"], ["Laboratorio", "DescontaminacaoInf"], ["DescontaminacaoInf", "Especime"]]

export const DUTOS = [["Seguranca", "Eletrica", "O2"], ["Comunicacoes", "Armas", "Escritorio"], ["Admin", "Laboratorio"], ["Especime", "Laboratorio"], ["Caldeira", "Deposito"]]

export const BOTAO_EMERGENCIA = 'Escritorio'

export const TAREFAS = {
 "Dropship": [
  [
   "Inserir as chaves",
   1
  ],
  [
   "Traçar a rota",
   2
  ]
 ],
 "Eletrica": [
  [
   "Consertar a fiação",
   2
  ],
  [
   "Religar os nós do clima",
   2
  ]
 ],
 "Seguranca": [
  [
   "Consertar a fiação",
   2
  ]
 ],
 "O2": [
  [
   "Encher os galões",
   2
  ],
  [
   "Monitorar a árvore",
   2
  ],
  [
   "Esvaziar o lixo",
   2
  ]
 ],
 "Caldeira": [
  [
   "Abrir as comportas",
   2
  ],
  [
   "Trocar o galão de água",
   3
  ]
 ],
 "Comunicacoes": [
  [
   "Reiniciar o wi-fi",
   3
  ],
  [
   "Baixar dados",
   2
  ]
 ],
 "Armas": [
  [
   "Destruir asteroides",
   3
  ],
  [
   "Baixar dados",
   2
  ]
 ],
 "Deposito": [
  [
   "Abastecer os motores",
   2
  ]
 ],
 "Escritorio": [
  [
   "Passar o cartão",
   2
  ],
  [
   "Regar as plantas",
   2
  ],
  [
   "Escanear o passe",
   1
  ]
 ],
 "Admin": [
  [
   "Enviar dados",
   2
  ],
  [
   "Consertar a fiação",
   2
  ]
 ],
 "Descontaminacao": [],
 "Laboratorio": [
  [
   "Consertar a broca",
   2
  ],
  [
   "Alinhar o telescópio",
   2
  ],
  [
   "Inspecionar amostra",
   3
  ],
  [
   "Registrar a temperatura",
   1
  ]
 ],
 "DescontaminacaoInf": [],
 "Especime": [
  [
   "Guardar os artefatos",
   2
  ],
  [
   "Abrir a porta dos espécimes",
   1
  ]
 ]
}

export function vizinhos(sala) {
  const v = []
  for (const [a, b] of CORREDORES) {
    if (a === sala) v.push(b)
    if (b === sala) v.push(a)
  }
  return v
}

export function dutosDe(sala) {
  const s = new Set()
  for (const g of DUTOS) if (g.includes(sala)) for (const x of g) if (x !== sala) s.add(x)
  return [...s]
}

export function caminho(de, para) {
  if (de === para) return [de]
  const prev = { [de]: null }
  const fila = [de]
  while (fila.length) {
    const a = fila.shift()
    for (const b of vizinhos(a)) {
      if (b in prev) continue
      prev[b] = a
      if (b === para) {
        const c = [b]
        let x = a
        while (x) { c.unshift(x); x = prev[x] }
        return c
      }
      fila.push(b)
    }
  }
  return null
}
