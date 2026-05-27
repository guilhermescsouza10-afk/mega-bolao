import { neon } from '@neondatabase/serverless';

// Mapping between local team codes and football-data.org TLA codes.
// Most codes are identical — only map the differences.
// Verified against: https://api.football-data.org/v4/competitions/WC/teams (2026 season)
const LOCAL_TO_TLA = {
  'URU': 'URY',  // Only difference: our URU vs API's URY
};

const TLA_TO_LOCAL = Object.fromEntries(
  Object.entries(LOCAL_TO_TLA).map(([k, v]) => [v, k])
);

export default async function handler(req, res) {
  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      ok: false,
      error: 'FOOTBALL_API_KEY not configured. Add it in Vercel Environment Variables.',
      instructions: 'Get a free key at https://www.football-data.org/client/register'
    });
  }

  try {
    const apiRes = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches?status=FINISHED',
      { headers: { 'X-Auth-Token': apiKey } }
    );

    if (!apiRes.ok) {
      return res.status(502).json({ ok: false, error: `Football API returned ${apiRes.status}` });
    }

    const apiData = await apiRes.json();
    const apiMatches = apiData.matches || [];
    const sql = neon(process.env.DATABASE_URL);

    let synced = 0;

    const existingResults = await sql`
      SELECT path, data FROM documents
      WHERE path LIKE 'jogos/%'
      AND array_length(string_to_array(path, '/'), 1) = 2
    `;
    const existingMap = {};
    for (const r of existingResults) {
      existingMap[r.path.split('/')[1]] = r.data;
    }

    const { MATCHES: localMatches } = await import('../src/data/matches.js');

    for (const apiMatch of apiMatches) {
      const homeTeam = apiMatch.homeTeam?.tla;
      const awayTeam = apiMatch.awayTeam?.tla;
      const homeScore = apiMatch.score?.fullTime?.home;
      const awayScore = apiMatch.score?.fullTime?.away;

      if (homeScore == null || awayScore == null) continue;

      const localHome = TLA_TO_LOCAL[homeTeam] || homeTeam;
      const localAway = TLA_TO_LOCAL[awayTeam] || awayTeam;

      const matched = localMatches.find(m =>
        m.home === localHome && m.away === localAway
      );

      if (!matched) continue;

      const existing = existingMap[matched.id];
      if (existing && existing.golsMandante != null) continue;

      // Build result data
      const resultData = {
        golsMandante: homeScore,
        golsVisitante: awayScore,
        status: 'ENCERRADO',
        sincronizadoEm: new Date().toISOString(),
      };

      // Handle penalty shootouts for knockout matches
      if (homeScore === awayScore && apiMatch.score?.penalties) {
        const penHome = apiMatch.score.penalties.home;
        const penAway = apiMatch.score.penalties.away;
        if (penHome != null && penAway != null) {
          resultData.avanca = penHome > penAway ? localHome : localAway;
          resultData.penaltisMandante = penHome;
          resultData.penaltisVisitante = penAway;
        }
      }

      await sql`
        INSERT INTO documents (path, data) VALUES (
          ${'jogos/' + matched.id},
          ${JSON.stringify(resultData)}::jsonb
        )
        ON CONFLICT (path) DO UPDATE SET
          data = documents.data || ${JSON.stringify(resultData)}::jsonb,
          updated_at = NOW()
      `;

      const scoreRes = await fetch(new URL('/api/calculate-scores', req.headers.origin || `https://${req.headers.host}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: matched.id }),
      });
      if (scoreRes.ok) synced++;
    }

    return res.json({ ok: true, synced, total: apiMatches.length });
  } catch (err) {
    console.error('Sync error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
