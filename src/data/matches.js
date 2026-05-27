// All 104 FIFA World Cup 2026 matches
// Dates/times in ISO 8601 UTC. The app converts to user's local timezone.
// ET times from official FIFA schedule converted to UTC (+4h for EDT)

export const PHASES = {
  GROUP: 'Fase de Grupos',
  ROUND_32: 'Oitavas de Final',
  ROUND_16: 'Oitavas de Final',
  QUARTER: 'Quartas de Final',
  SEMI: 'Semifinais',
  THIRD: 'Disputa de 3º Lugar',
  FINAL: 'Final',
};

export const VENUES = {
  AZTECA: 'Estádio Azteca, Cidade do México',
  AKRON: 'Estádio Akron, Guadalajara',
  BBVA: 'Estádio BBVA, Monterrey',
  METLIFE: 'MetLife Stadium, Nova Jersey',
  SOFI: 'SoFi Stadium, Los Angeles',
  ATT: 'AT&T Stadium, Dallas',
  LEVIS: "Levi's Stadium, São Francisco",
  HARDROCK: 'Hard Rock Stadium, Miami',
  MERCEDES: 'Mercedes-Benz Stadium, Atlanta',
  LUMEN: 'Lumen Field, Seattle',
  NRG: 'NRG Stadium, Houston',
  GILLETTE: 'Gillette Stadium, Boston',
  LINCOLN: 'Lincoln Financial Field, Filadélfia',
  ARROWHEAD: 'Arrowhead Stadium, Kansas City',
  BMO: 'BMO Field, Toronto',
  BCPLACE: 'BC Place, Vancouver',
};

export const MATCHES = [
  // ══════════════════════════════════════
  // GRUPO A — México, África do Sul, Coreia do Sul, Tchéquia
  // ══════════════════════════════════════
  { id: 'A1', matchNum: 1, home: 'MEX', away: 'RSA', date: '2026-06-11T19:00:00Z', phase: 'GROUP', group: 'A', venue: 'AZTECA' },
  { id: 'A2', matchNum: 2, home: 'KOR', away: 'CZE', date: '2026-06-12T02:00:00Z', phase: 'GROUP', group: 'A', venue: 'AKRON' },
  { id: 'A3', matchNum: 3, home: 'CZE', away: 'RSA', date: '2026-06-18T16:00:00Z', phase: 'GROUP', group: 'A', venue: 'MERCEDES' },
  { id: 'A4', matchNum: 4, home: 'MEX', away: 'KOR', date: '2026-06-19T01:00:00Z', phase: 'GROUP', group: 'A', venue: 'AKRON' },
  { id: 'A5', matchNum: 5, home: 'CZE', away: 'MEX', date: '2026-06-25T01:00:00Z', phase: 'GROUP', group: 'A', venue: 'AZTECA' },
  { id: 'A6', matchNum: 6, home: 'RSA', away: 'KOR', date: '2026-06-25T01:00:00Z', phase: 'GROUP', group: 'A', venue: 'BBVA' },

  // ══════════════════════════════════════
  // GRUPO B — Canadá, Bósnia e Herzegovina, Catar, Suíça
  // ══════════════════════════════════════
  { id: 'B1', matchNum: 7, home: 'CAN', away: 'BIH', date: '2026-06-12T19:00:00Z', phase: 'GROUP', group: 'B', venue: 'BMO' },
  { id: 'B2', matchNum: 8, home: 'QAT', away: 'SUI', date: '2026-06-13T19:00:00Z', phase: 'GROUP', group: 'B', venue: 'LEVIS' },
  { id: 'B3', matchNum: 9, home: 'SUI', away: 'BIH', date: '2026-06-18T19:00:00Z', phase: 'GROUP', group: 'B', venue: 'SOFI' },
  { id: 'B4', matchNum: 10, home: 'CAN', away: 'QAT', date: '2026-06-18T22:00:00Z', phase: 'GROUP', group: 'B', venue: 'BCPLACE' },
  { id: 'B5', matchNum: 11, home: 'SUI', away: 'CAN', date: '2026-06-24T19:00:00Z', phase: 'GROUP', group: 'B', venue: 'BCPLACE' },
  { id: 'B6', matchNum: 12, home: 'BIH', away: 'QAT', date: '2026-06-24T19:00:00Z', phase: 'GROUP', group: 'B', venue: 'LUMEN' },

  // ══════════════════════════════════════
  // GRUPO C — Brasil, Marrocos, Haiti, Escócia
  // ══════════════════════════════════════
  { id: 'C1', matchNum: 13, home: 'BRA', away: 'MAR', date: '2026-06-13T22:00:00Z', phase: 'GROUP', group: 'C', venue: 'METLIFE' },
  { id: 'C2', matchNum: 14, home: 'HAI', away: 'SCO', date: '2026-06-14T01:00:00Z', phase: 'GROUP', group: 'C', venue: 'GILLETTE' },
  { id: 'C3', matchNum: 15, home: 'SCO', away: 'MAR', date: '2026-06-19T22:00:00Z', phase: 'GROUP', group: 'C', venue: 'GILLETTE' },
  { id: 'C4', matchNum: 16, home: 'BRA', away: 'HAI', date: '2026-06-20T00:30:00Z', phase: 'GROUP', group: 'C', venue: 'LINCOLN' },
  { id: 'C5', matchNum: 17, home: 'SCO', away: 'BRA', date: '2026-06-24T22:00:00Z', phase: 'GROUP', group: 'C', venue: 'HARDROCK' },
  { id: 'C6', matchNum: 18, home: 'MAR', away: 'HAI', date: '2026-06-24T22:00:00Z', phase: 'GROUP', group: 'C', venue: 'MERCEDES' },

  // ══════════════════════════════════════
  // GRUPO D — Estados Unidos, Paraguai, Austrália, Turquia
  // ══════════════════════════════════════
  { id: 'D1', matchNum: 19, home: 'USA', away: 'PAR', date: '2026-06-13T01:00:00Z', phase: 'GROUP', group: 'D', venue: 'SOFI' },
  { id: 'D2', matchNum: 20, home: 'AUS', away: 'TUR', date: '2026-06-13T04:00:00Z', phase: 'GROUP', group: 'D', venue: 'BCPLACE' },
  { id: 'D3', matchNum: 21, home: 'USA', away: 'AUS', date: '2026-06-19T19:00:00Z', phase: 'GROUP', group: 'D', venue: 'LUMEN' },
  { id: 'D4', matchNum: 22, home: 'TUR', away: 'PAR', date: '2026-06-20T03:00:00Z', phase: 'GROUP', group: 'D', venue: 'LEVIS' },
  { id: 'D5', matchNum: 23, home: 'TUR', away: 'USA', date: '2026-06-26T02:00:00Z', phase: 'GROUP', group: 'D', venue: 'SOFI' },
  { id: 'D6', matchNum: 24, home: 'PAR', away: 'AUS', date: '2026-06-26T02:00:00Z', phase: 'GROUP', group: 'D', venue: 'LEVIS' },

  // ══════════════════════════════════════
  // GRUPO E — Alemanha, Curaçao, Costa do Marfim, Equador
  // ══════════════════════════════════════
  { id: 'E1', matchNum: 25, home: 'GER', away: 'CUW', date: '2026-06-14T17:00:00Z', phase: 'GROUP', group: 'E', venue: 'NRG' },
  { id: 'E2', matchNum: 26, home: 'CIV', away: 'ECU', date: '2026-06-14T23:00:00Z', phase: 'GROUP', group: 'E', venue: 'LINCOLN' },
  { id: 'E3', matchNum: 27, home: 'GER', away: 'CIV', date: '2026-06-20T20:00:00Z', phase: 'GROUP', group: 'E', venue: 'BMO' },
  { id: 'E4', matchNum: 28, home: 'ECU', away: 'CUW', date: '2026-06-21T00:00:00Z', phase: 'GROUP', group: 'E', venue: 'ARROWHEAD' },
  { id: 'E5', matchNum: 29, home: 'CUW', away: 'CIV', date: '2026-06-25T20:00:00Z', phase: 'GROUP', group: 'E', venue: 'LINCOLN' },
  { id: 'E6', matchNum: 30, home: 'ECU', away: 'GER', date: '2026-06-25T20:00:00Z', phase: 'GROUP', group: 'E', venue: 'METLIFE' },

  // ══════════════════════════════════════
  // GRUPO F — Holanda, Japão, Suécia, Tunísia
  // ══════════════════════════════════════
  { id: 'F1', matchNum: 31, home: 'NED', away: 'JPN', date: '2026-06-14T20:00:00Z', phase: 'GROUP', group: 'F', venue: 'ATT' },
  { id: 'F2', matchNum: 32, home: 'SWE', away: 'TUN', date: '2026-06-15T02:00:00Z', phase: 'GROUP', group: 'F', venue: 'BBVA' },
  { id: 'F3', matchNum: 33, home: 'NED', away: 'SWE', date: '2026-06-20T17:00:00Z', phase: 'GROUP', group: 'F', venue: 'NRG' },
  { id: 'F4', matchNum: 34, home: 'TUN', away: 'JPN', date: '2026-06-21T04:00:00Z', phase: 'GROUP', group: 'F', venue: 'BBVA' },
  { id: 'F5', matchNum: 35, home: 'JPN', away: 'SWE', date: '2026-06-25T23:00:00Z', phase: 'GROUP', group: 'F', venue: 'ATT' },
  { id: 'F6', matchNum: 36, home: 'TUN', away: 'NED', date: '2026-06-25T23:00:00Z', phase: 'GROUP', group: 'F', venue: 'ARROWHEAD' },

  // ══════════════════════════════════════
  // GRUPO G — Bélgica, Egito, Irã, Nova Zelândia
  // ══════════════════════════════════════
  { id: 'G1', matchNum: 37, home: 'BEL', away: 'EGY', date: '2026-06-15T19:00:00Z', phase: 'GROUP', group: 'G', venue: 'LUMEN' },
  { id: 'G2', matchNum: 38, home: 'IRN', away: 'NZL', date: '2026-06-16T01:00:00Z', phase: 'GROUP', group: 'G', venue: 'SOFI' },
  { id: 'G3', matchNum: 39, home: 'BEL', away: 'IRN', date: '2026-06-21T19:00:00Z', phase: 'GROUP', group: 'G', venue: 'SOFI' },
  { id: 'G4', matchNum: 40, home: 'NZL', away: 'EGY', date: '2026-06-22T01:00:00Z', phase: 'GROUP', group: 'G', venue: 'BCPLACE' },
  { id: 'G5', matchNum: 41, home: 'EGY', away: 'IRN', date: '2026-06-27T03:00:00Z', phase: 'GROUP', group: 'G', venue: 'LUMEN' },
  { id: 'G6', matchNum: 42, home: 'NZL', away: 'BEL', date: '2026-06-27T03:00:00Z', phase: 'GROUP', group: 'G', venue: 'BCPLACE' },

  // ══════════════════════════════════════
  // GRUPO H — Espanha, Cabo Verde, Arábia Saudita, Uruguai
  // ══════════════════════════════════════
  { id: 'H1', matchNum: 43, home: 'ESP', away: 'CPV', date: '2026-06-15T16:00:00Z', phase: 'GROUP', group: 'H', venue: 'MERCEDES' },
  { id: 'H2', matchNum: 44, home: 'KSA', away: 'URU', date: '2026-06-15T22:00:00Z', phase: 'GROUP', group: 'H', venue: 'HARDROCK' },
  { id: 'H3', matchNum: 45, home: 'ESP', away: 'KSA', date: '2026-06-21T16:00:00Z', phase: 'GROUP', group: 'H', venue: 'MERCEDES' },
  { id: 'H4', matchNum: 46, home: 'URU', away: 'CPV', date: '2026-06-21T22:00:00Z', phase: 'GROUP', group: 'H', venue: 'HARDROCK' },
  { id: 'H5', matchNum: 47, home: 'CPV', away: 'KSA', date: '2026-06-27T00:00:00Z', phase: 'GROUP', group: 'H', venue: 'NRG' },
  { id: 'H6', matchNum: 48, home: 'URU', away: 'ESP', date: '2026-06-27T00:00:00Z', phase: 'GROUP', group: 'H', venue: 'AKRON' },

  // ══════════════════════════════════════
  // GRUPO I — França, Senegal, Noruega, Iraque
  // ══════════════════════════════════════
  { id: 'I1', matchNum: 49, home: 'FRA', away: 'SEN', date: '2026-06-16T19:00:00Z', phase: 'GROUP', group: 'I', venue: 'METLIFE' },
  { id: 'I2', matchNum: 50, home: 'IRQ', away: 'NOR', date: '2026-06-16T22:00:00Z', phase: 'GROUP', group: 'I', venue: 'GILLETTE' },
  { id: 'I3', matchNum: 51, home: 'FRA', away: 'IRQ', date: '2026-06-22T21:00:00Z', phase: 'GROUP', group: 'I', venue: 'LINCOLN' },
  { id: 'I4', matchNum: 52, home: 'NOR', away: 'SEN', date: '2026-06-23T00:00:00Z', phase: 'GROUP', group: 'I', venue: 'METLIFE' },
  { id: 'I5', matchNum: 53, home: 'NOR', away: 'FRA', date: '2026-06-26T19:00:00Z', phase: 'GROUP', group: 'I', venue: 'GILLETTE' },
  { id: 'I6', matchNum: 54, home: 'SEN', away: 'IRQ', date: '2026-06-26T19:00:00Z', phase: 'GROUP', group: 'I', venue: 'BMO' },

  // ══════════════════════════════════════
  // GRUPO J — Argentina, Argélia, Áustria, Jordânia
  // ══════════════════════════════════════
  { id: 'J1', matchNum: 55, home: 'ARG', away: 'ALG', date: '2026-06-17T01:00:00Z', phase: 'GROUP', group: 'J', venue: 'ARROWHEAD' },
  { id: 'J2', matchNum: 56, home: 'AUT', away: 'JOR', date: '2026-06-17T04:00:00Z', phase: 'GROUP', group: 'J', venue: 'LEVIS' },
  { id: 'J3', matchNum: 57, home: 'ARG', away: 'AUT', date: '2026-06-22T17:00:00Z', phase: 'GROUP', group: 'J', venue: 'ATT' },
  { id: 'J4', matchNum: 58, home: 'JOR', away: 'ALG', date: '2026-06-23T03:00:00Z', phase: 'GROUP', group: 'J', venue: 'LEVIS' },
  { id: 'J5', matchNum: 59, home: 'JOR', away: 'ARG', date: '2026-06-28T02:00:00Z', phase: 'GROUP', group: 'J', venue: 'ATT' },
  { id: 'J6', matchNum: 60, home: 'ALG', away: 'AUT', date: '2026-06-28T02:00:00Z', phase: 'GROUP', group: 'J', venue: 'ARROWHEAD' },

  // ══════════════════════════════════════
  // GRUPO K — Portugal, RD Congo, Uzbequistão, Colômbia
  // ══════════════════════════════════════
  { id: 'K1', matchNum: 61, home: 'POR', away: 'COD', date: '2026-06-17T17:00:00Z', phase: 'GROUP', group: 'K', venue: 'NRG' },
  { id: 'K2', matchNum: 62, home: 'COL', away: 'UZB', date: '2026-06-18T02:00:00Z', phase: 'GROUP', group: 'K', venue: 'AZTECA' },
  { id: 'K3', matchNum: 63, home: 'POR', away: 'UZB', date: '2026-06-23T17:00:00Z', phase: 'GROUP', group: 'K', venue: 'NRG' },
  { id: 'K4', matchNum: 64, home: 'COL', away: 'COD', date: '2026-06-24T02:00:00Z', phase: 'GROUP', group: 'K', venue: 'AKRON' },
  { id: 'K5', matchNum: 65, home: 'COL', away: 'POR', date: '2026-06-27T23:30:00Z', phase: 'GROUP', group: 'K', venue: 'HARDROCK' },
  { id: 'K6', matchNum: 66, home: 'COD', away: 'UZB', date: '2026-06-27T23:30:00Z', phase: 'GROUP', group: 'K', venue: 'MERCEDES' },

  // ══════════════════════════════════════
  // GRUPO L — Inglaterra, Croácia, Gana, Panamá
  // ══════════════════════════════════════
  { id: 'L1', matchNum: 67, home: 'ENG', away: 'CRO', date: '2026-06-17T20:00:00Z', phase: 'GROUP', group: 'L', venue: 'ATT' },
  { id: 'L2', matchNum: 68, home: 'GHA', away: 'PAN', date: '2026-06-17T23:00:00Z', phase: 'GROUP', group: 'L', venue: 'BMO' },
  { id: 'L3', matchNum: 69, home: 'ENG', away: 'GHA', date: '2026-06-23T20:00:00Z', phase: 'GROUP', group: 'L', venue: 'GILLETTE' },
  { id: 'L4', matchNum: 70, home: 'PAN', away: 'CRO', date: '2026-06-23T23:00:00Z', phase: 'GROUP', group: 'L', venue: 'BMO' },
  { id: 'L5', matchNum: 71, home: 'PAN', away: 'ENG', date: '2026-06-27T21:00:00Z', phase: 'GROUP', group: 'L', venue: 'METLIFE' },
  { id: 'L6', matchNum: 72, home: 'CRO', away: 'GHA', date: '2026-06-27T21:00:00Z', phase: 'GROUP', group: 'L', venue: 'LINCOLN' },

  // ══════════════════════════════════════
  // OITAVAS DE FINAL (Round of 32) — 16 jogos
  // Jun 28 – Jul 2
  // Times definidos após fase de grupos
  // ══════════════════════════════════════
  { id: 'R32_1', matchNum: 73, home: null, away: null, date: '2026-06-28T16:00:00Z', phase: 'ROUND_32', group: null, venue: 'METLIFE', label: '1A vs 3C/D/E' },
  { id: 'R32_2', matchNum: 74, home: null, away: null, date: '2026-06-28T20:00:00Z', phase: 'ROUND_32', group: null, venue: 'ATT', label: '2A vs 2B' },
  { id: 'R32_3', matchNum: 75, home: null, away: null, date: '2026-06-29T00:00:00Z', phase: 'ROUND_32', group: null, venue: 'SOFI', label: '1B vs 3A/F/G' },
  { id: 'R32_4', matchNum: 76, home: null, away: null, date: '2026-06-29T16:00:00Z', phase: 'ROUND_32', group: null, venue: 'NRG', label: '1C vs 3B/H/I' },
  { id: 'R32_5', matchNum: 77, home: null, away: null, date: '2026-06-29T20:00:00Z', phase: 'ROUND_32', group: null, venue: 'HARDROCK', label: '2C vs 2D' },
  { id: 'R32_6', matchNum: 78, home: null, away: null, date: '2026-06-30T00:00:00Z', phase: 'ROUND_32', group: null, venue: 'LUMEN', label: '1D vs 3G/J/K' },
  { id: 'R32_7', matchNum: 79, home: null, away: null, date: '2026-06-30T16:00:00Z', phase: 'ROUND_32', group: null, venue: 'MERCEDES', label: '1E vs 3F/I/L' },
  { id: 'R32_8', matchNum: 80, home: null, away: null, date: '2026-06-30T20:00:00Z', phase: 'ROUND_32', group: null, venue: 'LINCOLN', label: '2E vs 2F' },
  { id: 'R32_9', matchNum: 81, home: null, away: null, date: '2026-07-01T00:00:00Z', phase: 'ROUND_32', group: null, venue: 'ATT', label: '1F vs 3E/H/K' },
  { id: 'R32_10', matchNum: 82, home: null, away: null, date: '2026-07-01T16:00:00Z', phase: 'ROUND_32', group: null, venue: 'ARROWHEAD', label: '1G vs 3A/J/L' },
  { id: 'R32_11', matchNum: 83, home: null, away: null, date: '2026-07-01T20:00:00Z', phase: 'ROUND_32', group: null, venue: 'GILLETTE', label: '2G vs 2H' },
  { id: 'R32_12', matchNum: 84, home: null, away: null, date: '2026-07-01T00:00:00Z', phase: 'ROUND_32', group: null, venue: 'SOFI', label: '1H vs 3B/D/L' },
  { id: 'R32_13', matchNum: 85, home: null, away: null, date: '2026-07-02T16:00:00Z', phase: 'ROUND_32', group: null, venue: 'NRG', label: '1I vs 3C/G/K' },
  { id: 'R32_14', matchNum: 86, home: null, away: null, date: '2026-07-02T20:00:00Z', phase: 'ROUND_32', group: null, venue: 'METLIFE', label: '2I vs 2J' },
  { id: 'R32_15', matchNum: 87, home: null, away: null, date: '2026-07-02T00:00:00Z', phase: 'ROUND_32', group: null, venue: 'HARDROCK', label: '1J vs 3D/F/H' },
  { id: 'R32_16', matchNum: 88, home: null, away: null, date: '2026-07-02T16:00:00Z', phase: 'ROUND_32', group: null, venue: 'LUMEN', label: '1K vs 1L' },

  // ══════════════════════════════════════
  // OITAVAS DE FINAL (Round of 16) — 8 jogos
  // Jul 3 – Jul 5
  // ══════════════════════════════════════
  { id: 'R16_1', matchNum: 89, home: null, away: null, date: '2026-07-03T17:00:00Z', phase: 'ROUND_16', group: null, venue: 'SOFI', label: 'V73 vs V74' },
  { id: 'R16_2', matchNum: 90, home: null, away: null, date: '2026-07-03T21:00:00Z', phase: 'ROUND_16', group: null, venue: 'ATT', label: 'V75 vs V76' },
  { id: 'R16_3', matchNum: 91, home: null, away: null, date: '2026-07-04T01:00:00Z', phase: 'ROUND_16', group: null, venue: 'METLIFE', label: 'V77 vs V78' },
  { id: 'R16_4', matchNum: 92, home: null, away: null, date: '2026-07-04T17:00:00Z', phase: 'ROUND_16', group: null, venue: 'HARDROCK', label: 'V79 vs V80' },
  { id: 'R16_5', matchNum: 93, home: null, away: null, date: '2026-07-04T21:00:00Z', phase: 'ROUND_16', group: null, venue: 'NRG', label: 'V81 vs V82' },
  { id: 'R16_6', matchNum: 94, home: null, away: null, date: '2026-07-05T01:00:00Z', phase: 'ROUND_16', group: null, venue: 'LUMEN', label: 'V83 vs V84' },
  { id: 'R16_7', matchNum: 95, home: null, away: null, date: '2026-07-05T17:00:00Z', phase: 'ROUND_16', group: null, venue: 'MERCEDES', label: 'V85 vs V86' },
  { id: 'R16_8', matchNum: 96, home: null, away: null, date: '2026-07-05T21:00:00Z', phase: 'ROUND_16', group: null, venue: 'LINCOLN', label: 'V87 vs V88' },

  // ══════════════════════════════════════
  // QUARTAS DE FINAL — 4 jogos
  // Jul 9 – Jul 10
  // ══════════════════════════════════════
  { id: 'QF1', matchNum: 97, home: null, away: null, date: '2026-07-09T20:00:00Z', phase: 'QUARTER', group: null, venue: 'SOFI', label: 'V89 vs V90' },
  { id: 'QF2', matchNum: 98, home: null, away: null, date: '2026-07-10T00:00:00Z', phase: 'QUARTER', group: null, venue: 'METLIFE', label: 'V91 vs V92' },
  { id: 'QF3', matchNum: 99, home: null, away: null, date: '2026-07-10T20:00:00Z', phase: 'QUARTER', group: null, venue: 'ATT', label: 'V93 vs V94' },
  { id: 'QF4', matchNum: 100, home: null, away: null, date: '2026-07-11T00:00:00Z', phase: 'QUARTER', group: null, venue: 'NRG', label: 'V95 vs V96' },

  // ══════════════════════════════════════
  // SEMIFINAIS — 2 jogos
  // Jul 14 – Jul 15
  // ══════════════════════════════════════
  { id: 'SF1', matchNum: 101, home: null, away: null, date: '2026-07-15T00:00:00Z', phase: 'SEMI', group: null, venue: 'METLIFE', label: 'V97 vs V98' },
  { id: 'SF2', matchNum: 102, home: null, away: null, date: '2026-07-16T00:00:00Z', phase: 'SEMI', group: null, venue: 'ATT', label: 'V99 vs V100' },

  // ══════════════════════════════════════
  // DISPUTA DE 3º LUGAR
  // Jul 18
  // ══════════════════════════════════════
  { id: 'TP', matchNum: 103, home: null, away: null, date: '2026-07-18T20:00:00Z', phase: 'THIRD', group: null, venue: 'HARDROCK', label: 'P101 vs P102' },

  // ══════════════════════════════════════
  // FINAL
  // Jul 19
  // ══════════════════════════════════════
  { id: 'FI', matchNum: 104, home: null, away: null, date: '2026-07-19T20:00:00Z', phase: 'FINAL', group: null, venue: 'METLIFE', label: 'V101 vs V102' },
];

export const getMatchesByPhase = (phase) => MATCHES.filter(m => m.phase === phase);
export const getMatchesByGroup = (group) => MATCHES.filter(m => m.group === group);
export const getMatchById = (id) => MATCHES.find(m => m.id === id);
