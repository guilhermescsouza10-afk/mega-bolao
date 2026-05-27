/**
 * Seed script — populates Firestore with teams, players, and all 104 matches.
 *
 * Usage:
 *   1. Set GOOGLE_APPLICATION_CREDENTIALS env var to your Firebase service account key
 *   2. Run: node src/data/seed.mjs
 *
 * Or use firebase-admin with project ID:
 *   FIREBASE_PROJECT_ID=your-project node src/data/seed.mjs
 */

import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const projectId = process.env.FIREBASE_PROJECT_ID;
if (projectId) {
  initializeApp({ projectId });
} else {
  initializeApp({ credential: applicationDefault() });
}

const db = getFirestore();

// ═══════════════════════════════
// Teams data
// ═══════════════════════════════
const TEAMS = {
  MEX: { nome: 'México', bandeira: '🇲🇽', grupo: 'A', confederacao: 'CONCACAF' },
  RSA: { nome: 'África do Sul', bandeira: '🇿🇦', grupo: 'A', confederacao: 'CAF' },
  KOR: { nome: 'Coreia do Sul', bandeira: '🇰🇷', grupo: 'A', confederacao: 'AFC' },
  CZE: { nome: 'Tchéquia', bandeira: '🇨🇿', grupo: 'A', confederacao: 'UEFA' },
  CAN: { nome: 'Canadá', bandeira: '🇨🇦', grupo: 'B', confederacao: 'CONCACAF' },
  BIH: { nome: 'Bósnia e Herzegovina', bandeira: '🇧🇦', grupo: 'B', confederacao: 'UEFA' },
  QAT: { nome: 'Catar', bandeira: '🇶🇦', grupo: 'B', confederacao: 'AFC' },
  SUI: { nome: 'Suíça', bandeira: '🇨🇭', grupo: 'B', confederacao: 'UEFA' },
  BRA: { nome: 'Brasil', bandeira: '🇧🇷', grupo: 'C', confederacao: 'CONMEBOL' },
  MAR: { nome: 'Marrocos', bandeira: '🇲🇦', grupo: 'C', confederacao: 'CAF' },
  HAI: { nome: 'Haiti', bandeira: '🇭🇹', grupo: 'C', confederacao: 'CONCACAF' },
  SCO: { nome: 'Escócia', bandeira: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', grupo: 'C', confederacao: 'UEFA' },
  USA: { nome: 'Estados Unidos', bandeira: '🇺🇸', grupo: 'D', confederacao: 'CONCACAF' },
  PAR: { nome: 'Paraguai', bandeira: '🇵🇾', grupo: 'D', confederacao: 'CONMEBOL' },
  AUS: { nome: 'Austrália', bandeira: '🇦🇺', grupo: 'D', confederacao: 'AFC' },
  TUR: { nome: 'Turquia', bandeira: '🇹🇷', grupo: 'D', confederacao: 'UEFA' },
  GER: { nome: 'Alemanha', bandeira: '🇩🇪', grupo: 'E', confederacao: 'UEFA' },
  CUW: { nome: 'Curaçao', bandeira: '🇨🇼', grupo: 'E', confederacao: 'CONCACAF' },
  CIV: { nome: 'Costa do Marfim', bandeira: '🇨🇮', grupo: 'E', confederacao: 'CAF' },
  ECU: { nome: 'Equador', bandeira: '🇪🇨', grupo: 'E', confederacao: 'CONMEBOL' },
  NED: { nome: 'Holanda', bandeira: '🇳🇱', grupo: 'F', confederacao: 'UEFA' },
  JPN: { nome: 'Japão', bandeira: '🇯🇵', grupo: 'F', confederacao: 'AFC' },
  SWE: { nome: 'Suécia', bandeira: '🇸🇪', grupo: 'F', confederacao: 'UEFA' },
  TUN: { nome: 'Tunísia', bandeira: '🇹🇳', grupo: 'F', confederacao: 'CAF' },
  BEL: { nome: 'Bélgica', bandeira: '🇧🇪', grupo: 'G', confederacao: 'UEFA' },
  EGY: { nome: 'Egito', bandeira: '🇪🇬', grupo: 'G', confederacao: 'CAF' },
  IRN: { nome: 'Irã', bandeira: '🇮🇷', grupo: 'G', confederacao: 'AFC' },
  NZL: { nome: 'Nova Zelândia', bandeira: '🇳🇿', grupo: 'G', confederacao: 'OFC' },
  ESP: { nome: 'Espanha', bandeira: '🇪🇸', grupo: 'H', confederacao: 'UEFA' },
  CPV: { nome: 'Cabo Verde', bandeira: '🇨🇻', grupo: 'H', confederacao: 'CAF' },
  KSA: { nome: 'Arábia Saudita', bandeira: '🇸🇦', grupo: 'H', confederacao: 'AFC' },
  URU: { nome: 'Uruguai', bandeira: '🇺🇾', grupo: 'H', confederacao: 'CONMEBOL' },
  FRA: { nome: 'França', bandeira: '🇫🇷', grupo: 'I', confederacao: 'UEFA' },
  SEN: { nome: 'Senegal', bandeira: '🇸🇳', grupo: 'I', confederacao: 'CAF' },
  NOR: { nome: 'Noruega', bandeira: '🇳🇴', grupo: 'I', confederacao: 'UEFA' },
  IRQ: { nome: 'Iraque', bandeira: '🇮🇶', grupo: 'I', confederacao: 'AFC' },
  ARG: { nome: 'Argentina', bandeira: '🇦🇷', grupo: 'J', confederacao: 'CONMEBOL' },
  ALG: { nome: 'Argélia', bandeira: '🇩🇿', grupo: 'J', confederacao: 'CAF' },
  AUT: { nome: 'Áustria', bandeira: '🇦🇹', grupo: 'J', confederacao: 'UEFA' },
  JOR: { nome: 'Jordânia', bandeira: '🇯🇴', grupo: 'J', confederacao: 'AFC' },
  POR: { nome: 'Portugal', bandeira: '🇵🇹', grupo: 'K', confederacao: 'UEFA' },
  COD: { nome: 'RD Congo', bandeira: '🇨🇩', grupo: 'K', confederacao: 'CAF' },
  UZB: { nome: 'Uzbequistão', bandeira: '🇺🇿', grupo: 'K', confederacao: 'AFC' },
  COL: { nome: 'Colômbia', bandeira: '🇨🇴', grupo: 'K', confederacao: 'CONMEBOL' },
  ENG: { nome: 'Inglaterra', bandeira: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', grupo: 'L', confederacao: 'UEFA' },
  CRO: { nome: 'Croácia', bandeira: '🇭🇷', grupo: 'L', confederacao: 'UEFA' },
  GHA: { nome: 'Gana', bandeira: '🇬🇭', grupo: 'L', confederacao: 'CAF' },
  PAN: { nome: 'Panamá', bandeira: '🇵🇦', grupo: 'L', confederacao: 'CONCACAF' },
};

// ═══════════════════════════════
// Matches (104 total) — same as frontend data
// ═══════════════════════════════
const MATCHES = [
  // Group A
  { id: 'A1', mandante: 'MEX', visitante: 'RSA', dataHora: '2026-06-11T19:00:00Z', fase: 'GROUP', grupo: 'A', status: 'ABERTO' },
  { id: 'A2', mandante: 'KOR', visitante: 'CZE', dataHora: '2026-06-12T02:00:00Z', fase: 'GROUP', grupo: 'A', status: 'ABERTO' },
  { id: 'A3', mandante: 'CZE', visitante: 'RSA', dataHora: '2026-06-18T16:00:00Z', fase: 'GROUP', grupo: 'A', status: 'ABERTO' },
  { id: 'A4', mandante: 'MEX', visitante: 'KOR', dataHora: '2026-06-19T01:00:00Z', fase: 'GROUP', grupo: 'A', status: 'ABERTO' },
  { id: 'A5', mandante: 'CZE', visitante: 'MEX', dataHora: '2026-06-25T01:00:00Z', fase: 'GROUP', grupo: 'A', status: 'ABERTO' },
  { id: 'A6', mandante: 'RSA', visitante: 'KOR', dataHora: '2026-06-25T01:00:00Z', fase: 'GROUP', grupo: 'A', status: 'ABERTO' },
  // Group B
  { id: 'B1', mandante: 'CAN', visitante: 'BIH', dataHora: '2026-06-12T19:00:00Z', fase: 'GROUP', grupo: 'B', status: 'ABERTO' },
  { id: 'B2', mandante: 'QAT', visitante: 'SUI', dataHora: '2026-06-13T19:00:00Z', fase: 'GROUP', grupo: 'B', status: 'ABERTO' },
  { id: 'B3', mandante: 'SUI', visitante: 'BIH', dataHora: '2026-06-18T19:00:00Z', fase: 'GROUP', grupo: 'B', status: 'ABERTO' },
  { id: 'B4', mandante: 'CAN', visitante: 'QAT', dataHora: '2026-06-18T22:00:00Z', fase: 'GROUP', grupo: 'B', status: 'ABERTO' },
  { id: 'B5', mandante: 'SUI', visitante: 'CAN', dataHora: '2026-06-24T19:00:00Z', fase: 'GROUP', grupo: 'B', status: 'ABERTO' },
  { id: 'B6', mandante: 'BIH', visitante: 'QAT', dataHora: '2026-06-24T19:00:00Z', fase: 'GROUP', grupo: 'B', status: 'ABERTO' },
  // Group C
  { id: 'C1', mandante: 'BRA', visitante: 'MAR', dataHora: '2026-06-13T22:00:00Z', fase: 'GROUP', grupo: 'C', status: 'ABERTO' },
  { id: 'C2', mandante: 'HAI', visitante: 'SCO', dataHora: '2026-06-14T01:00:00Z', fase: 'GROUP', grupo: 'C', status: 'ABERTO' },
  { id: 'C3', mandante: 'SCO', visitante: 'MAR', dataHora: '2026-06-19T22:00:00Z', fase: 'GROUP', grupo: 'C', status: 'ABERTO' },
  { id: 'C4', mandante: 'BRA', visitante: 'HAI', dataHora: '2026-06-20T00:30:00Z', fase: 'GROUP', grupo: 'C', status: 'ABERTO' },
  { id: 'C5', mandante: 'SCO', visitante: 'BRA', dataHora: '2026-06-24T22:00:00Z', fase: 'GROUP', grupo: 'C', status: 'ABERTO' },
  { id: 'C6', mandante: 'MAR', visitante: 'HAI', dataHora: '2026-06-24T22:00:00Z', fase: 'GROUP', grupo: 'C', status: 'ABERTO' },
  // Group D
  { id: 'D1', mandante: 'USA', visitante: 'PAR', dataHora: '2026-06-13T01:00:00Z', fase: 'GROUP', grupo: 'D', status: 'ABERTO' },
  { id: 'D2', mandante: 'AUS', visitante: 'TUR', dataHora: '2026-06-13T04:00:00Z', fase: 'GROUP', grupo: 'D', status: 'ABERTO' },
  { id: 'D3', mandante: 'USA', visitante: 'AUS', dataHora: '2026-06-19T19:00:00Z', fase: 'GROUP', grupo: 'D', status: 'ABERTO' },
  { id: 'D4', mandante: 'TUR', visitante: 'PAR', dataHora: '2026-06-20T03:00:00Z', fase: 'GROUP', grupo: 'D', status: 'ABERTO' },
  { id: 'D5', mandante: 'TUR', visitante: 'USA', dataHora: '2026-06-26T02:00:00Z', fase: 'GROUP', grupo: 'D', status: 'ABERTO' },
  { id: 'D6', mandante: 'PAR', visitante: 'AUS', dataHora: '2026-06-26T02:00:00Z', fase: 'GROUP', grupo: 'D', status: 'ABERTO' },
  // Group E
  { id: 'E1', mandante: 'GER', visitante: 'CUW', dataHora: '2026-06-14T17:00:00Z', fase: 'GROUP', grupo: 'E', status: 'ABERTO' },
  { id: 'E2', mandante: 'CIV', visitante: 'ECU', dataHora: '2026-06-14T23:00:00Z', fase: 'GROUP', grupo: 'E', status: 'ABERTO' },
  { id: 'E3', mandante: 'GER', visitante: 'CIV', dataHora: '2026-06-20T20:00:00Z', fase: 'GROUP', grupo: 'E', status: 'ABERTO' },
  { id: 'E4', mandante: 'ECU', visitante: 'CUW', dataHora: '2026-06-21T00:00:00Z', fase: 'GROUP', grupo: 'E', status: 'ABERTO' },
  { id: 'E5', mandante: 'CUW', visitante: 'CIV', dataHora: '2026-06-25T20:00:00Z', fase: 'GROUP', grupo: 'E', status: 'ABERTO' },
  { id: 'E6', mandante: 'ECU', visitante: 'GER', dataHora: '2026-06-25T20:00:00Z', fase: 'GROUP', grupo: 'E', status: 'ABERTO' },
  // Group F
  { id: 'F1', mandante: 'NED', visitante: 'JPN', dataHora: '2026-06-14T20:00:00Z', fase: 'GROUP', grupo: 'F', status: 'ABERTO' },
  { id: 'F2', mandante: 'SWE', visitante: 'TUN', dataHora: '2026-06-15T02:00:00Z', fase: 'GROUP', grupo: 'F', status: 'ABERTO' },
  { id: 'F3', mandante: 'NED', visitante: 'SWE', dataHora: '2026-06-20T17:00:00Z', fase: 'GROUP', grupo: 'F', status: 'ABERTO' },
  { id: 'F4', mandante: 'TUN', visitante: 'JPN', dataHora: '2026-06-21T04:00:00Z', fase: 'GROUP', grupo: 'F', status: 'ABERTO' },
  { id: 'F5', mandante: 'JPN', visitante: 'SWE', dataHora: '2026-06-25T23:00:00Z', fase: 'GROUP', grupo: 'F', status: 'ABERTO' },
  { id: 'F6', mandante: 'TUN', visitante: 'NED', dataHora: '2026-06-25T23:00:00Z', fase: 'GROUP', grupo: 'F', status: 'ABERTO' },
  // Group G
  { id: 'G1', mandante: 'BEL', visitante: 'EGY', dataHora: '2026-06-15T19:00:00Z', fase: 'GROUP', grupo: 'G', status: 'ABERTO' },
  { id: 'G2', mandante: 'IRN', visitante: 'NZL', dataHora: '2026-06-16T01:00:00Z', fase: 'GROUP', grupo: 'G', status: 'ABERTO' },
  { id: 'G3', mandante: 'BEL', visitante: 'IRN', dataHora: '2026-06-21T19:00:00Z', fase: 'GROUP', grupo: 'G', status: 'ABERTO' },
  { id: 'G4', mandante: 'NZL', visitante: 'EGY', dataHora: '2026-06-22T01:00:00Z', fase: 'GROUP', grupo: 'G', status: 'ABERTO' },
  { id: 'G5', mandante: 'EGY', visitante: 'IRN', dataHora: '2026-06-27T03:00:00Z', fase: 'GROUP', grupo: 'G', status: 'ABERTO' },
  { id: 'G6', mandante: 'NZL', visitante: 'BEL', dataHora: '2026-06-27T03:00:00Z', fase: 'GROUP', grupo: 'G', status: 'ABERTO' },
  // Group H
  { id: 'H1', mandante: 'ESP', visitante: 'CPV', dataHora: '2026-06-15T16:00:00Z', fase: 'GROUP', grupo: 'H', status: 'ABERTO' },
  { id: 'H2', mandante: 'KSA', visitante: 'URU', dataHora: '2026-06-15T22:00:00Z', fase: 'GROUP', grupo: 'H', status: 'ABERTO' },
  { id: 'H3', mandante: 'ESP', visitante: 'KSA', dataHora: '2026-06-21T16:00:00Z', fase: 'GROUP', grupo: 'H', status: 'ABERTO' },
  { id: 'H4', mandante: 'URU', visitante: 'CPV', dataHora: '2026-06-21T22:00:00Z', fase: 'GROUP', grupo: 'H', status: 'ABERTO' },
  { id: 'H5', mandante: 'CPV', visitante: 'KSA', dataHora: '2026-06-27T00:00:00Z', fase: 'GROUP', grupo: 'H', status: 'ABERTO' },
  { id: 'H6', mandante: 'URU', visitante: 'ESP', dataHora: '2026-06-27T00:00:00Z', fase: 'GROUP', grupo: 'H', status: 'ABERTO' },
  // Group I
  { id: 'I1', mandante: 'FRA', visitante: 'SEN', dataHora: '2026-06-16T19:00:00Z', fase: 'GROUP', grupo: 'I', status: 'ABERTO' },
  { id: 'I2', mandante: 'IRQ', visitante: 'NOR', dataHora: '2026-06-16T22:00:00Z', fase: 'GROUP', grupo: 'I', status: 'ABERTO' },
  { id: 'I3', mandante: 'FRA', visitante: 'IRQ', dataHora: '2026-06-22T21:00:00Z', fase: 'GROUP', grupo: 'I', status: 'ABERTO' },
  { id: 'I4', mandante: 'NOR', visitante: 'SEN', dataHora: '2026-06-23T00:00:00Z', fase: 'GROUP', grupo: 'I', status: 'ABERTO' },
  { id: 'I5', mandante: 'NOR', visitante: 'FRA', dataHora: '2026-06-26T19:00:00Z', fase: 'GROUP', grupo: 'I', status: 'ABERTO' },
  { id: 'I6', mandante: 'SEN', visitante: 'IRQ', dataHora: '2026-06-26T19:00:00Z', fase: 'GROUP', grupo: 'I', status: 'ABERTO' },
  // Group J
  { id: 'J1', mandante: 'ARG', visitante: 'ALG', dataHora: '2026-06-17T01:00:00Z', fase: 'GROUP', grupo: 'J', status: 'ABERTO' },
  { id: 'J2', mandante: 'AUT', visitante: 'JOR', dataHora: '2026-06-17T04:00:00Z', fase: 'GROUP', grupo: 'J', status: 'ABERTO' },
  { id: 'J3', mandante: 'ARG', visitante: 'AUT', dataHora: '2026-06-22T17:00:00Z', fase: 'GROUP', grupo: 'J', status: 'ABERTO' },
  { id: 'J4', mandante: 'JOR', visitante: 'ALG', dataHora: '2026-06-23T03:00:00Z', fase: 'GROUP', grupo: 'J', status: 'ABERTO' },
  { id: 'J5', mandante: 'JOR', visitante: 'ARG', dataHora: '2026-06-28T02:00:00Z', fase: 'GROUP', grupo: 'J', status: 'ABERTO' },
  { id: 'J6', mandante: 'ALG', visitante: 'AUT', dataHora: '2026-06-28T02:00:00Z', fase: 'GROUP', grupo: 'J', status: 'ABERTO' },
  // Group K
  { id: 'K1', mandante: 'POR', visitante: 'COD', dataHora: '2026-06-17T17:00:00Z', fase: 'GROUP', grupo: 'K', status: 'ABERTO' },
  { id: 'K2', mandante: 'COL', visitante: 'UZB', dataHora: '2026-06-18T02:00:00Z', fase: 'GROUP', grupo: 'K', status: 'ABERTO' },
  { id: 'K3', mandante: 'POR', visitante: 'UZB', dataHora: '2026-06-23T17:00:00Z', fase: 'GROUP', grupo: 'K', status: 'ABERTO' },
  { id: 'K4', mandante: 'COL', visitante: 'COD', dataHora: '2026-06-24T02:00:00Z', fase: 'GROUP', grupo: 'K', status: 'ABERTO' },
  { id: 'K5', mandante: 'COL', visitante: 'POR', dataHora: '2026-06-27T23:30:00Z', fase: 'GROUP', grupo: 'K', status: 'ABERTO' },
  { id: 'K6', mandante: 'COD', visitante: 'UZB', dataHora: '2026-06-27T23:30:00Z', fase: 'GROUP', grupo: 'K', status: 'ABERTO' },
  // Group L
  { id: 'L1', mandante: 'ENG', visitante: 'CRO', dataHora: '2026-06-17T20:00:00Z', fase: 'GROUP', grupo: 'L', status: 'ABERTO' },
  { id: 'L2', mandante: 'GHA', visitante: 'PAN', dataHora: '2026-06-17T23:00:00Z', fase: 'GROUP', grupo: 'L', status: 'ABERTO' },
  { id: 'L3', mandante: 'ENG', visitante: 'GHA', dataHora: '2026-06-23T20:00:00Z', fase: 'GROUP', grupo: 'L', status: 'ABERTO' },
  { id: 'L4', mandante: 'PAN', visitante: 'CRO', dataHora: '2026-06-23T23:00:00Z', fase: 'GROUP', grupo: 'L', status: 'ABERTO' },
  { id: 'L5', mandante: 'PAN', visitante: 'ENG', dataHora: '2026-06-27T21:00:00Z', fase: 'GROUP', grupo: 'L', status: 'ABERTO' },
  { id: 'L6', mandante: 'CRO', visitante: 'GHA', dataHora: '2026-06-27T21:00:00Z', fase: 'GROUP', grupo: 'L', status: 'ABERTO' },
  // Knockout rounds (placeholders)
  ...Array.from({ length: 16 }, (_, i) => ({
    id: `R32_${i + 1}`, mandante: null, visitante: null,
    dataHora: new Date(2026, 5, 28 + Math.floor(i / 4), 16 + (i % 4) * 4).toISOString(),
    fase: 'ROUND_32', grupo: null, status: 'ABERTO',
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `R16_${i + 1}`, mandante: null, visitante: null,
    dataHora: new Date(2026, 6, 3 + Math.floor(i / 3), 17 + (i % 3) * 4).toISOString(),
    fase: 'ROUND_16', grupo: null, status: 'ABERTO',
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `QF${i + 1}`, mandante: null, visitante: null,
    dataHora: new Date(2026, 6, 9 + Math.floor(i / 2), 20 + (i % 2) * 4).toISOString(),
    fase: 'QUARTER', grupo: null, status: 'ABERTO',
  })),
  { id: 'SF1', mandante: null, visitante: null, dataHora: '2026-07-15T00:00:00Z', fase: 'SEMI', grupo: null, status: 'ABERTO' },
  { id: 'SF2', mandante: null, visitante: null, dataHora: '2026-07-16T00:00:00Z', fase: 'SEMI', grupo: null, status: 'ABERTO' },
  { id: 'TP', mandante: null, visitante: null, dataHora: '2026-07-18T20:00:00Z', fase: 'THIRD', grupo: null, status: 'ABERTO' },
  { id: 'FI', mandante: null, visitante: null, dataHora: '2026-07-19T20:00:00Z', fase: 'FINAL', grupo: null, status: 'ABERTO' },
];

// ═══════════════════════════════
// Top players for autocomplete
// ═══════════════════════════════
const PLAYERS = [
  { nome: 'Lionel Messi', selecao: 'ARG', posicao: 'ATA' },
  { nome: 'Lautaro Martínez', selecao: 'ARG', posicao: 'ATA' },
  { nome: 'Julián Álvarez', selecao: 'ARG', posicao: 'ATA' },
  { nome: 'Vinícius Jr.', selecao: 'BRA', posicao: 'ATA' },
  { nome: 'Rodrygo', selecao: 'BRA', posicao: 'ATA' },
  { nome: 'Endrick', selecao: 'BRA', posicao: 'ATA' },
  { nome: 'Raphinha', selecao: 'BRA', posicao: 'ATA' },
  { nome: 'Estêvão', selecao: 'BRA', posicao: 'ATA' },
  { nome: 'Kylian Mbappé', selecao: 'FRA', posicao: 'ATA' },
  { nome: 'Marcus Thuram', selecao: 'FRA', posicao: 'ATA' },
  { nome: 'Harry Kane', selecao: 'ENG', posicao: 'ATA' },
  { nome: 'Jude Bellingham', selecao: 'ENG', posicao: 'MEI' },
  { nome: 'Bukayo Saka', selecao: 'ENG', posicao: 'ATA' },
  { nome: 'Cole Palmer', selecao: 'ENG', posicao: 'ATA' },
  { nome: 'Lamine Yamal', selecao: 'ESP', posicao: 'ATA' },
  { nome: 'Álvaro Morata', selecao: 'ESP', posicao: 'ATA' },
  { nome: 'Florian Wirtz', selecao: 'GER', posicao: 'ATA' },
  { nome: 'Jamal Musiala', selecao: 'GER', posicao: 'MEI' },
  { nome: 'Cristiano Ronaldo', selecao: 'POR', posicao: 'ATA' },
  { nome: 'Rafael Leão', selecao: 'POR', posicao: 'ATA' },
  { nome: 'Erling Haaland', selecao: 'NOR', posicao: 'ATA' },
  { nome: 'Alexander Isak', selecao: 'SWE', posicao: 'ATA' },
  { nome: 'Viktor Gyökeres', selecao: 'SWE', posicao: 'ATA' },
  { nome: 'Mohamed Salah', selecao: 'EGY', posicao: 'ATA' },
  { nome: 'Son Heung-min', selecao: 'KOR', posicao: 'ATA' },
  { nome: 'Darwin Núñez', selecao: 'URU', posicao: 'ATA' },
  { nome: 'Cody Gakpo', selecao: 'NED', posicao: 'ATA' },
  { nome: 'Romelu Lukaku', selecao: 'BEL', posicao: 'ATA' },
  { nome: 'Christian Pulisic', selecao: 'USA', posicao: 'ATA' },
  { nome: 'Jonathan David', selecao: 'CAN', posicao: 'ATA' },
  { nome: 'Santiago Giménez', selecao: 'MEX', posicao: 'ATA' },
  { nome: 'Luis Díaz', selecao: 'COL', posicao: 'ATA' },
  { nome: 'Sadio Mané', selecao: 'SEN', posicao: 'ATA' },
  { nome: 'Chris Wood', selecao: 'NZL', posicao: 'ATA' },
  { nome: 'Arda Güler', selecao: 'TUR', posicao: 'MEI' },
  { nome: 'Mohammed Kudus', selecao: 'GHA', posicao: 'ATA' },
  { nome: 'Patrik Schick', selecao: 'CZE', posicao: 'ATA' },
  { nome: 'Mehdi Taremi', selecao: 'IRN', posicao: 'ATA' },
];

// ═══════════════════════════════
// Seed function
// ═══════════════════════════════
async function seed() {
  console.log('🌱 Starting seed...\n');

  // Seed teams
  console.log('📋 Seeding 48 teams...');
  const teamBatch = db.batch();
  for (const [id, data] of Object.entries(TEAMS)) {
    teamBatch.set(db.doc(`selecoes/${id}`), data);
  }
  await teamBatch.commit();
  console.log('   ✅ Teams done\n');

  // Seed matches (in batches of 500)
  console.log('⚽ Seeding 104 matches...');
  let matchBatch = db.batch();
  let count = 0;
  for (const match of MATCHES) {
    matchBatch.set(db.doc(`jogos/${match.id}`), {
      mandante: match.mandante,
      visitante: match.visitante,
      dataHora: match.dataHora,
      fase: match.fase,
      grupo: match.grupo,
      status: match.status,
      golsMandante: null,
      golsVisitante: null,
    });
    count++;
    if (count % 400 === 0) {
      await matchBatch.commit();
      matchBatch = db.batch();
    }
  }
  await matchBatch.commit();
  console.log(`   ✅ ${count} matches done\n`);

  // Seed players
  console.log('👟 Seeding players...');
  const playerBatch = db.batch();
  for (const player of PLAYERS) {
    const id = player.nome.toLowerCase().replace(/[^a-z0-9]/g, '-');
    playerBatch.set(db.doc(`jogadores/${id}`), player);
  }
  await playerBatch.commit();
  console.log(`   ✅ ${PLAYERS.length} players done\n`);

  console.log('🎉 Seed completed successfully!');
}

seed().catch(console.error);
