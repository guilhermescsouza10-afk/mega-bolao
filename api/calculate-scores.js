import { neon } from '@neondatabase/serverless';

function getOutcome(home, away) {
  if (home > away) return 'HOME';
  if (away > home) return 'AWAY';
  return 'DRAW';
}

function calculateScore(predHome, predAway, realHome, realAway) {
  if (predHome == null || predAway == null || realHome == null || realAway == null) {
    return { key: 'NONE', points: 0 };
  }
  if (predHome === realHome && predAway === realAway) {
    return { key: 'EXACT', points: 25 };
  }
  const po = getOutcome(predHome, predAway);
  const ro = getOutcome(realHome, realAway);

  if (po === 'DRAW' && ro === 'DRAW') {
    return { key: 'WINNER_GOAL_DIFF', points: 15 };
  }
  if (po === ro) {
    const wgm = ro === 'HOME' ? predHome === realHome : predAway === realAway;
    const lgm = ro === 'HOME' ? predAway === realAway : predHome === realHome;
    const sd = (predHome - predAway) === (realHome - realAway);
    if (wgm) return { key: 'WINNER_BOTH_GOALS', points: 15 };
    if (sd) return { key: 'WINNER_GOAL_DIFF', points: 15 };
    if (lgm) return { key: 'WINNER_LOSER_GOALS', points: 12 };
    return { key: 'WINNER_ONLY', points: 6 };
  }
  if (predHome === realHome || predAway === realAway) {
    return { key: 'ONE_TEAM_GOALS', points: 3 };
  }
  return { key: 'NONE', points: 0 };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const sql = neon(process.env.DATABASE_URL);
  const { matchId } = req.body;

  if (!matchId) return res.status(400).json({ error: 'matchId required' });

  const resultRows = await sql`SELECT data FROM documents WHERE path = ${'jogos/' + matchId}`;
  if (resultRows.length === 0) return res.json({ ok: false, error: 'No result yet' });

  const result = resultRows[0].data;
  if (result.golsMandante == null || result.golsVisitante == null) {
    return res.json({ ok: false, error: 'Result incomplete' });
  }

  const groups = await sql`
    SELECT path FROM documents
    WHERE path LIKE 'grupos/%'
    AND array_length(string_to_array(path, '/'), 1) = 2
  `;

  let totalScored = 0;

  for (const group of groups) {
    const groupId = group.path.split('/')[1];
    const predPrefix = `grupos/${groupId}/palpites/${matchId}/votos/`;

    const predictions = await sql`
      SELECT path, data FROM documents
      WHERE path LIKE ${predPrefix + '%'}
      AND array_length(string_to_array(path, '/'), 1) = 6
    `;

    for (const pred of predictions) {
      const score = calculateScore(
        pred.data.golsMandante, pred.data.golsVisitante,
        result.golsMandante, result.golsVisitante
      );
      await sql`
        UPDATE documents SET
          data = data || ${JSON.stringify({ pontos: score.points, tipoPontuacao: score.key })}::jsonb,
          updated_at = NOW()
        WHERE path = ${pred.path}
      `;
      totalScored++;
    }

    const members = await sql`
      SELECT path FROM documents
      WHERE path LIKE ${'grupos/' + groupId + '/membros/%'}
      AND array_length(string_to_array(path, '/'), 1) = 4
    `;

    for (const member of members) {
      const userId = member.path.split('/').pop();
      const userPreds = await sql`
        SELECT data FROM documents
        WHERE path LIKE ${'grupos/' + groupId + '/palpites/%/votos/' + userId}
        AND array_length(string_to_array(path, '/'), 1) = 6
        AND data ? 'pontos'
      `;

      let pontosJogos = 0;
      let palpitesCertos = 0;
      for (const p of userPreds) {
        const pts = p.data.pontos || 0;
        pontosJogos += pts;
        if (pts > 0) palpitesCertos++;
      }

      const bonusRows = await sql`
        SELECT data FROM documents WHERE path = ${'grupos/' + groupId + '/bonus/' + userId}
      `;
      const pontosBonus = bonusRows.length > 0
        ? (bonusRows[0].data.pontosCampeao || 0) + (bonusRows[0].data.pontosVice || 0) + (bonusRows[0].data.pontosArtilheiro || 0)
        : 0;

      await sql`
        UPDATE documents SET
          data = data || ${JSON.stringify({
            pontosJogos,
            pontosBonus,
            totalPontos: pontosJogos + pontosBonus,
            palpitesCertos
          })}::jsonb,
          updated_at = NOW()
        WHERE path = ${member.path}
      `;
    }
  }

  return res.json({ ok: true, scored: totalScored });
}
