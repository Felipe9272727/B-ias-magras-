// Mapa Mira HQ (Among IA 7, modo clássico): mesmo desenho do modo zumbi (AU6), no formato do motor clássico.
export const SALAS = {
 "Lancamento": {
  "x": 8,
  "y": 78,
  "nome": "Lançamento"
 },
 "Enfermaria": {
  "x": 22,
  "y": 92,
  "nome": "Enfermaria"
 },
 "Comunicacoes": {
  "x": 30,
  "y": 72,
  "nome": "Comunicações"
 },
 "Vestiario": {
  "x": 20,
  "y": 58,
  "nome": "Vestiário"
 },
 "Descontaminacao": {
  "x": 36,
  "y": 50,
  "nome": "Descontaminação"
 },
 "Corredor": {
  "x": 55,
  "y": 48,
  "nome": "Corredor"
 },
 "Reator": {
  "x": 50,
  "y": 12,
  "nome": "Reator"
 },
 "Laboratorio": {
  "x": 70,
  "y": 14,
  "nome": "Laboratório"
 },
 "Escritorio": {
  "x": 66,
  "y": 34,
  "nome": "Escritório"
 },
 "Admin": {
  "x": 80,
  "y": 30,
  "nome": "Admin"
 },
 "Estufa": {
  "x": 82,
  "y": 46,
  "nome": "Estufa"
 },
 "Refeitorio": {
  "x": 76,
  "y": 68,
  "nome": "Refeitório"
 },
 "Varanda": {
  "x": 92,
  "y": 70,
  "nome": "Varanda"
 },
 "Deposito": {
  "x": 74,
  "y": 88,
  "nome": "Depósito"
 }
}

export const CORREDORES = [["Lancamento", "Vestiario"], ["Lancamento", "Enfermaria"], ["Lancamento", "Comunicacoes"], ["Enfermaria", "Comunicacoes"], ["Comunicacoes", "Vestiario"], ["Vestiario", "Descontaminacao"], ["Descontaminacao", "Corredor"], ["Corredor", "Reator"], ["Corredor", "Laboratorio"], ["Corredor", "Escritorio"], ["Corredor", "Estufa"], ["Corredor", "Refeitorio"], ["Reator", "Laboratorio"], ["Escritorio", "Admin"], ["Admin", "Estufa"], ["Refeitorio", "Varanda"], ["Refeitorio", "Deposito"]]

// grupos de dutos ligados entre si
export const DUTOS = [["Lancamento", "Reator", "Descontaminacao"], ["Enfermaria", "Vestiario", "Laboratorio"], ["Escritorio", "Admin", "Estufa"], ["Refeitorio", "Varanda", "Deposito"]]

export const BOTAO_EMERGENCIA = 'Refeitorio'

export const TAREFAS = {
 "Lancamento": [
  [
   "Abastecer o motor",
   2
  ],
  [
   "Checar a nave de fuga",
   1
  ]
 ],
 "Enfermaria": [
  [
   "Escanear o corpo",
   2
  ],
  [
   "Organizar remédios",
   1
  ]
 ],
 "Comunicacoes": [
  [
   "Consertar a antena",
   2
  ]
 ],
 "Vestiario": [
  [
   "Trocar de traje",
   1
  ]
 ],
 "Descontaminacao": [
  [
   "Ligar a ventilação",
   1
  ]
 ],
 "Reator": [
  [
   "Ligar o reator",
   2
  ],
  [
   "Medir a radiação",
   1
  ]
 ],
 "Laboratorio": [
  [
   "Analisar amostra",
   2
  ],
  [
   "Calibrar o microscópio",
   1
  ]
 ],
 "Escritorio": [
  [
   "Baixar os dados",
   2
  ]
 ],
 "Admin": [
  [
   "Passar o cartão",
   1
  ],
  [
   "Conferir o mapa",
   1
  ]
 ],
 "Estufa": [
  [
   "Regar as plantas",
   1
  ],
  [
   "Limpar o filtro de O2",
   2
  ]
 ],
 "Refeitorio": [
  [
   "Esvaziar o lixo",
   1
  ],
  [
   "Comprar bebida",
   1
  ]
 ],
 "Varanda": [
  [
   "Medir o clima",
   1
  ],
  [
   "Consertar o sinal",
   2
  ]
 ],
 "Deposito": [
  [
   "Abastecer o gerador",
   2
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
