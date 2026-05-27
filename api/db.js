import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const sql = neon(process.env.DATABASE_URL);
  const { action, path, data, options, constraints } = req.body;

  try {
    switch (action) {
      case 'setup': {
        await sql`
          CREATE TABLE IF NOT EXISTS documents (
            path TEXT PRIMARY KEY,
            data JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          )
        `;
        return res.json({ ok: true });
      }

      case 'getDoc': {
        const rows = await sql`SELECT data FROM documents WHERE path = ${path}`;
        if (rows.length === 0) {
          return res.json({ exists: false, data: null, id: path.split('/').pop() });
        }
        return res.json({ exists: true, data: rows[0].data, id: path.split('/').pop() });
      }

      case 'setDoc': {
        const jsonData = JSON.stringify(data);
        if (options?.merge) {
          await sql`
            INSERT INTO documents (path, data) VALUES (${path}, ${jsonData}::jsonb)
            ON CONFLICT (path) DO UPDATE SET
              data = documents.data || ${jsonData}::jsonb,
              updated_at = NOW()
          `;
        } else {
          await sql`
            INSERT INTO documents (path, data) VALUES (${path}, ${jsonData}::jsonb)
            ON CONFLICT (path) DO UPDATE SET
              data = ${jsonData}::jsonb,
              updated_at = NOW()
          `;
        }
        return res.json({ ok: true });
      }

      case 'addDoc': {
        const id = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        const docPath = path + '/' + id;
        await sql`
          INSERT INTO documents (path, data) VALUES (${docPath}, ${JSON.stringify(data)}::jsonb)
        `;
        return res.json({ id, path: docPath });
      }

      case 'deleteDoc': {
        await sql`DELETE FROM documents WHERE path = ${path}`;
        return res.json({ ok: true });
      }

      case 'updateDoc': {
        const updateJson = JSON.stringify(data);
        await sql`
          INSERT INTO documents (path, data) VALUES (${path}, ${updateJson}::jsonb)
          ON CONFLICT (path) DO UPDATE SET
            data = documents.data || ${updateJson}::jsonb,
            updated_at = NOW()
        `;
        return res.json({ ok: true });
      }

      case 'getDocs': {
        const depth = path.split('/').length + 1;
        const prefix = path + '/';
        let rows = await sql`
          SELECT path, data FROM documents
          WHERE path LIKE ${prefix + '%'}
          AND array_length(string_to_array(path, '/'), 1) = ${depth}
          ORDER BY created_at ASC
        `;

        if (constraints?.length) {
          rows = rows.filter(row =>
            constraints.every(c => {
              if (c.type !== 'where') return true;
              const val = row.data[c.field];
              if (c.op === '==') return val === c.value;
              if (c.op === '!=') return val !== c.value;
              if (c.op === '>') return val > c.value;
              if (c.op === '<') return val < c.value;
              return true;
            })
          );
        }

        const docs = rows.map(row => ({
          id: row.path.split('/').pop(),
          data: row.data,
        }));
        return res.json({ docs, empty: docs.length === 0, size: docs.length });
      }

      case 'getUserPredictions': {
        const { groupId, userId } = req.body;
        if (!groupId || !userId) return res.status(400).json({ error: 'groupId and userId required' });
        const pattern = `grupos/${groupId}/palpites/%/votos/${userId}`;
        const rows = await sql`
          SELECT path, data FROM documents
          WHERE path LIKE ${pattern}
          AND array_length(string_to_array(path, '/'), 1) = 6
        `;
        const preds = {};
        for (const row of rows) {
          const parts = row.path.split('/');
          const matchId = parts[3];
          preds[matchId] = row.data;
        }
        return res.json({ predictions: preds });
      }

      case 'getMatchOverrides': {
        const rows = await sql`
          SELECT path, data FROM documents
          WHERE path LIKE 'jogos/%'
          AND array_length(string_to_array(path, '/'), 1) = 2
        `;
        const overrides = {};
        for (const row of rows) {
          overrides[row.path.split('/')[1]] = row.data;
        }
        return res.json({ overrides });
      }

      default:
        return res.status(400).json({ error: 'Unknown action: ' + action });
    }
  } catch (err) {
    console.error('DB Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
