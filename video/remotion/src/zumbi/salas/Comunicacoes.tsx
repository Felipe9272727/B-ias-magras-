// Sala Comunicacoes (provisória: só o piso) — será substituída pela arte final.
import React from 'react';
import {Piso, type SalaProps} from './comum';
export const SalaComunicacoes: React.FC<SalaProps> = ({r}) => <Piso id="piso_Comunicacoes" r={r} a={r.piso} b={r.piso2} />;
