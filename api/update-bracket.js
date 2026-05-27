import { neon } from '@neondatabase/serverless';

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

function calculateGroupStandings(groupMatches, results) {
  const teams = {};
  const ensure = (id) => {
    if (!teams[id]) teams[id] = { id, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
  };

  for (const m of groupMatches) {
    const r = results[m.id];
    if (!r || r.golsMandante == null || r.golsVisitante == null) continue;
    ensure(m.home); ensure(m.away);
    const h = teams[m.home], a = teams[m.away];
    h.p++; a.p++;
    h.gf += r.golsMandante; h.ga += r.golsVisitante;
    a.gf += r.golsVisitante; a.ga += r.golsMandante;
    if (r.golsMandante > r.golsVisitante) { h.w++; h.pts += 3; a.l++; }
    else if (r.golsMandante < r.golsVisitante) { a.w++; a.pts += 3; h.l++; }
    else { h.d++; a.d++; h.pts++; a.pts++; }
  }
  for (const t of Object.values(teams)) t.gd = t.gf - t.ga;

  return Object.values(teams).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return 0;
  });
}

const R32_BRACKET = {
  'R32_1':  { home: g => g['A'][0], awayThirds: ['C','D','E'] },
  'R32_2':  { home: g => g['A'][1], away: g => g['B'][1] },
  'R32_3':  { home: g => g['B'][0], awayThirds: ['A','F','G'] },
  'R32_4':  { home: g => g['C'][0], awayThirds: ['B','H','I'] },
  'R32_5':  { home: g => g['C'][1], away: g => g['D'][1] },
  'R32_6':  { home: g => g['D'][0], awayThirds: ['G','J','K'] },
  'R32_7':  { home: g => g['E'][0], awayThirds: ['F','I','L'] },
  'R32_8':  { home: g => g['E'][1], away: g => g['F'][1] },
  'R32_9':  { home: g => g['F'][0], awayThirds: ['E','H','K'] },
  'R32_10': { home: g => g['G'][0], awayThirds: ['A','J','L'] },
  'R32_11': { home: g => g['G'][1], away: g => g['H'][1] },
  'R32_12': { home: g => g['H'][0], awayThirds: ['B','D','L'] },
  'R32_13': { home: g => g['I'][0], awayThirds: ['C','G','K'] },
  'R32_14': { home: g => g['I'][1], away: g => g['J'][1] },
  'R32_15': { home: g => g['J'][0], awayThirds: ['D','F','H'] },
  'R32_16': { home: g => g['K'][0], away: g => g['L'][0] },
};

const KNOCKOUT_PROPAGATION = {
  'R16_1': ['R32_1', 'R32_2'],
  'R16_2': ['R32_3', 'R32_4'],
  'R16_3': ['R32_5', 'R32_6'],
  'R16_4': ['R32_7', 'R32_8'],
  'R16_5': ['R32_9', 'R32_10'],
  'R16_6': ['R32_11', 'R32_12'],
  'R16_7': ['R32_13', 'R32_14'],
  'R16_8': ['R32_15', 'R32_16'],
  'QF1': ['R16_1', 'R16_2'],
  'QF2': ['R16_3', 'R16_4'],
  'QF3': ['R16_5', 'R16_6'],
  'QF4': ['R16_7', 'R16_8'],
  'SF1': ['QF1', 'QF2'],
  'SF2': ['QF3', 'QF4'],
  'TP':  ['SF1', 'SF2'],
  'FI':  ['SF1', 'SF2'],
};

function getWinner(result) {
  if (!result || result.golsMandante == null || !result.mandante) return null;
  if (result.avanca) return result.avanca;
  if (result.golsMandante > result.golsVisitante) return result.mandante;
  if (result.golsVisitante > result.golsMandante) return result.visitante;
  // Draw in knockout without avanca specified — can't determine winner
  return null;
}

function getLoser(result) {
  if (!result || result.golsMandante == null || !result.mandante) return null;
  const winner = getWinner(result);
  if (!winner) return null;
  return winner === result.mandante ? result.visitante : result.mandante;
}

export default async function handler(req, res) {
  try {
    const { MATCHES: localMatches } = await import('../src/data/matches.js');
    const sql = neon(process.env.DATABASE_URL);

    const rows = await sql`
      SELECT path, data FROM documents
      WHERE path LIKE 'jogos/%'
      AND array_length(string_to_array(path, '/'), 1) = 2
    `;
    const results = {};
    for (const r of rows) {
      const id = r.path.split('/')[1];
      results[id] = r.data;
    }

    const groupMatches = localMatches.filter(m => m.phase === 'GROUP');
    const groupStandings = {};
    let allGroupsDone = true;

    for (const g of GROUPS) {
      const gMatches = groupMatches.filter(m => m.group === g);
      const standings = calculateGroupStandings(gMatches, results);
      groupStandings[g] = standings.map(s => s.id);

      const finishedCount = gMatches.filter(m => results[m.id]?.golsMandante != null).length;
      if (finishedCount < gMatches.length) allGroupsDone = false;
    }

    let updated = 0;

    if (allGroupsDone) {
      const allThirds = GROUPS.map(g => {
        const gMatches = groupMatches.filter(m => m.group === g);
        const standings = calculateGroupStandings(gMatches, results);
        return standings.length >= 3 ? { ...standings[2], group: g } : null;
      }).filter(Boolean);

      allThirds.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return 0;
      });

      const qualifiedThirds = allThirds.slice(0, 8);
      const qualifiedThirdGroups = new Set(qualifiedThirds.map(t => t.group));
      const thirdTeamByGroup = {};
      for (const t of qualifiedThirds) thirdTeamByGroup[t.group] = t.id;

      for (const [matchId, bracket] of Object.entries(R32_BRACKET)) {
        const existing = results[matchId];
        if (existing?.mandante && existing?.visitante) continue;

        const homeTeam = bracket.home(groupStandings);
        let awayTeam = null;

        if (bracket.away) {
          awayTeam = bracket.away(groupStandings);
        } else if (bracket.awayThirds) {
          const eligible = bracket.awayThirds.filter(g => qualifiedThirdGroups.has(g));
          if (eligible.length > 0) awayTeam = thirdTeamByGroup[eligible[0]];
        }

        if (homeTeam && awayTeam) {
          const data = { mandante: homeTeam, visitante: awayTeam };
          await sql`
            INSERT INTO documents (path, data) VALUES (${'jogos/' + matchId}, ${JSON.stringify(data)}::jsonb)
            ON CONFLICT (path) DO UPDATE SET
              data = documents.data || ${JSON.stringify(data)}::jsonb,
              updated_at = NOW()
          `;
          updated++;
        }
      }
    }

    for (const [matchId, sourceIds] of Object.entries(KNOCKOUT_PROPAGATION)) {
      const existing = results[matchId];
      if (existing?.mandante && existing?.visitante) continue;

      const [src1, src2] = sourceIds;
      const r1 = results[src1];
      const r2 = results[src2];

      let homeTeam, awayTeam;
      if (matchId === 'TP') {
        homeTeam = getLoser(r1);
        awayTeam = getLoser(r2);
      } else if (matchId === 'FI') {
        homeTeam = getWinner(r1);
        awayTeam = getWinner(r2);
      } else {
        homeTeam = getWinner(r1);
        awayTeam = getWinner(r2);
      }

      if (homeTeam && awayTeam) {
        const data = { mandante: homeTeam, visitante: awayTeam };
        await sql`
          INSERT INTO documents (path, data) VALUES (${'jogos/' + matchId}, ${JSON.stringify(data)}::jsonb)
          ON CONFLICT (path) DO UPDATE SET
            data = documents.data || ${JSON.stringify(data)}::jsonb,
            updated_at = NOW()
        `;
        updated++;
      }
    }

    return res.json({ ok: true, updated, allGroupsDone });
  } catch (err) {
    console.error('Bracket error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
