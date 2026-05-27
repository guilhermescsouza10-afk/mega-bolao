import { useState, useEffect } from 'react';
import { collection, onSnapshot } from '../localDb';
import { db } from '../localDb';
import { TEAMS } from '../data/teams';
import { MATCHES } from '../data/matches';
import TeamFlag from './TeamFlag';

function calculateStandings(group, results) {
  const groupMatches = MATCHES.filter(m => m.phase === 'GROUP' && m.group === group);
  const teams = {};

  const ensure = (id) => {
    if (!teams[id]) {
      teams[id] = { id, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
    }
  };

  for (const match of groupMatches) {
    const r = results[match.id];
    if (!r || r.golsMandante == null || r.golsVisitante == null) continue;

    ensure(match.home);
    ensure(match.away);

    const h = teams[match.home];
    const a = teams[match.away];
    h.p++; a.p++;
    h.gf += r.golsMandante; h.ga += r.golsVisitante;
    a.gf += r.golsVisitante; a.ga += r.golsMandante;

    if (r.golsMandante > r.golsVisitante) { h.w++; h.pts += 3; a.l++; }
    else if (r.golsMandante < r.golsVisitante) { a.w++; a.pts += 3; h.l++; }
    else { h.d++; a.d++; h.pts++; a.pts++; }
  }

  for (const t of Object.values(teams)) t.gd = t.gf - t.ga;

  const groupTeamIds = groupMatches.reduce((acc, m) => {
    if (m.home) acc.add(m.home);
    if (m.away) acc.add(m.away);
    return acc;
  }, new Set());

  for (const id of groupTeamIds) ensure(id);

  return Object.values(teams).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.id.localeCompare(b.id);
  });
}

export default function GroupStandings({ group }) {
  const [results, setResults] = useState({});

  useEffect(() => {
    return onSnapshot(collection(db, 'jogos'), (snap) => {
      const res = {};
      snap.forEach(d => {
        const data = d.data();
        if (data.golsMandante != null) res[d.id] = data;
      });
      setResults(res);
    });
  }, []);

  const standings = calculateStandings(group, results);

  if (standings.length === 0) return null;

  return (
    <div className="bg-pitch-900 rounded-2xl border border-pitch-800 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-pitch-800">
        <h3 className="text-xs font-semibold text-pitch-400 tracking-wide uppercase">
          Classificação — Grupo {group}
        </h3>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-pitch-500 border-b border-pitch-800/50">
            <th className="py-2 pl-4 text-left w-6">#</th>
            <th className="py-2 text-left">Seleção</th>
            <th className="py-2 text-center w-7">J</th>
            <th className="py-2 text-center w-7">V</th>
            <th className="py-2 text-center w-7">E</th>
            <th className="py-2 text-center w-7">D</th>
            <th className="py-2 text-center w-8">SG</th>
            <th className="py-2 pr-4 text-center w-8 font-bold">P</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((t, i) => {
            const team = TEAMS[t.id];
            const qualifies = i < 2;
            const thirdChance = i === 2;

            return (
              <tr
                key={t.id}
                className={`border-b border-pitch-800/30 last:border-0 ${
                  qualifies ? 'bg-accent/5' : thirdChance ? 'bg-yellow-500/5' : ''
                }`}
              >
                <td className="py-2.5 pl-4">
                  <span className={`text-[11px] font-bold ${
                    qualifies ? 'text-accent' : thirdChance ? 'text-yellow-400' : 'text-pitch-500'
                  }`}>
                    {i + 1}
                  </span>
                </td>
                <td className="py-2.5">
                  <span className="flex items-center gap-2">
                    <TeamFlag team={team} size="xs" />
                    <span className="font-medium text-pitch-200">{team?.name || t.id}</span>
                  </span>
                </td>
                <td className="py-2.5 text-center text-pitch-400">{t.p}</td>
                <td className="py-2.5 text-center text-pitch-400">{t.w}</td>
                <td className="py-2.5 text-center text-pitch-400">{t.d}</td>
                <td className="py-2.5 text-center text-pitch-400">{t.l}</td>
                <td className="py-2.5 text-center">
                  <span className={t.gd > 0 ? 'text-accent-light' : t.gd < 0 ? 'text-red-400' : 'text-pitch-500'}>
                    {t.gd > 0 ? '+' : ''}{t.gd}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-center font-extrabold text-white">{t.pts}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-4 py-2 border-t border-pitch-800/30 flex gap-4 text-[9px] text-pitch-600">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent/60" /> Classificado
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" /> Possível 3º
        </span>
      </div>
    </div>
  );
}
