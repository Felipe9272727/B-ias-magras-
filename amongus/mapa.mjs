// Mapa inspirado na nave "The Skeld": salas, corredores (arestas) e dutos de ventilação.
// As coordenadas (0–100) servem só para desenhar o mapa no vídeo.

export const SALAS = {
  Refeitorio: { x: 50, y: 14, nome: 'Refeitório' },
  Armas: { x: 74, y: 14, nome: 'Armas' },
  O2: { x: 66, y: 34, nome: 'O2' },
  Navegacao: { x: 92, y: 40, nome: 'Navegação' },
  Escudos: { x: 74, y: 70, nome: 'Escudos' },
  Comunicacoes: { x: 62, y: 86, nome: 'Comunicações' },
  Deposito: { x: 48, y: 72, nome: 'Depósito' },
  Admin: { x: 58, y: 52, nome: 'Admin' },
  Eletrica: { x: 34, y: 64, nome: 'Elétrica' },
  MotorInferior: { x: 14, y: 70, nome: 'Motor Inferior' },
  Seguranca: { x: 24, y: 42, nome: 'Segurança' },
  Reator: { x: 4, y: 42, nome: 'Reator' },
  MotorSuperior: { x: 14, y: 16, nome: 'Motor Superior' },
  Enfermaria: { x: 32, y: 30, nome: 'Enfermaria' },
}

export const CORREDORES = [
  ['Refeitorio', 'Armas'],
  ['Refeitorio', 'MotorSuperior'],
  ['Refeitorio', 'Enfermaria'],
  ['Refeitorio', 'Admin'],
  ['Refeitorio', 'Deposito'],
  ['Armas', 'O2'],
  ['Armas', 'Navegacao'],
  ['O2', 'Navegacao'],
  ['O2', 'Escudos'],
  ['Navegacao', 'Escudos'],
  ['Escudos', 'Comunicacoes'],
  ['Escudos', 'Deposito'],
  ['Comunicacoes', 'Deposito'],
  ['Deposito', 'Admin'],
  ['Deposito', 'Eletrica'],
  ['Deposito', 'MotorInferior'],
  ['MotorInferior', 'Seguranca'],
  ['MotorInferior', 'Reator'],
  ['MotorInferior', 'MotorSuperior'],
  ['Seguranca', 'Reator'],
  ['Seguranca', 'MotorSuperior'],
  ['Reator', 'MotorSuperior'],
  ['MotorSuperior', 'Enfermaria'],
]

// Grupos de dutos ligados entre si (como na Skeld)
export const DUTOS = [
  ['Reator', 'MotorSuperior', 'MotorInferior'],
  ['Enfermaria', 'Seguranca', 'Eletrica'],
  ['Refeitorio', 'Admin'],
  ['Navegacao', 'Armas'],
  ['Navegacao', 'Escudos'],
]

export const BOTAO_EMERGENCIA = 'Refeitorio'

// Tarefas possíveis em cada sala (nome curto, duração em tiques)
export const TAREFAS = {
  Refeitorio: [['Esvaziar o lixo', 2], ['Baixar dados', 2]],
  Armas: [['Destruir asteroides', 3], ['Baixar dados', 2]],
  O2: [['Limpar o filtro de O2', 2], ['Esvaziar o lixo', 2]],
  Navegacao: [['Estabilizar o rumo', 1], ['Traçar a rota', 2]],
  Escudos: [['Ativar os escudos', 2]],
  Comunicacoes: [['Baixar dados', 2]],
  Deposito: [['Abastecer os motores', 2], ['Esvaziar o lixo', 2]],
  Admin: [['Passar o cartão', 2], ['Enviar dados', 2]],
  Eletrica: [['Consertar a fiação', 2], ['Calibrar o distribuidor', 2]],
  MotorInferior: [['Alinhar o motor', 2]],
  Seguranca: [['Consertar a fiação', 2]],
  Reator: [['Iniciar o reator', 3], ['Destravar os coletores', 2]],
  MotorSuperior: [['Alinhar o motor', 2]],
  Enfermaria: [['Escanear no MedBay', 2], ['Inspecionar amostra', 3]],
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

// Caminho mais curto (BFS) — usado pelos jogadores para "ir até" uma sala.
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
