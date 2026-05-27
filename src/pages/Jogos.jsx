import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, doc, getDoc, setDoc, onSnapshot, serverTimestamp } from '../localDb';
import { db } from '../localDb';
import { useAuth } from '../contexts/AuthContext';
import { MATCHES } from '../data/matches';
import { GROUPS } from '../data/teams';
import Header from '../components/Header';
import MatchCard from '../components/MatchCard';
import PredictionModal from '../components/PredictionModal';
import toast from 'react-hot-toast';
import { isBeforeDeadline } from '../utils/dateUtils';
import { SCORE_TYPES } from '../utils/scoring';
import GroupStandings from '../components/GroupStandings';

const PHASE_FILTERS = [
  { key: 'GROUP', label: 'Grupos' },
  { key: 'ROUND_32', label: 'Oitavas (32)' },
  { key: 'ROUND_16', label: 'Oitavas (16)' },
  { key: 'QUARTER', label: 'Quartas' },
  { key: 'SEMI', label: 'Semis' },
  { key: 'FINAL_PHASE', label: 'Final' },
];

export default function Jogos({ groupId }) {
  const { user } = useAuth();
  const [phase, setPhase] = useState('GROUP');
  const [group, setGroup] = useState('A');
  const [predictions, setPredictions] = useState({});
  const [results, setResults] = useState({});
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadPredictions = useCallback(async () => {
    if (!user || !groupId) return;
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getUserPredictions', groupId, userId: user.uid }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.predictions) setPredictions(data.predictions);
      }
    } catch {
      const allPreds = {};
      for (const m of MATCHES) {
        const ref = doc(db, 'grupos', groupId, 'palpites', m.id, 'votos', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) allPreds[m.id] = snap.data();
      }
      setPredictions(allPreds);
    }
  }, [user, groupId]);

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  useEffect(() => {
    let snapshotUnsub = null;
    let usePolling = true;

    const loadResults = async () => {
      try {
        const res = await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getMatchOverrides' }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.overrides) setResults(data.overrides);
        }
      } catch {
        // API unavailable — fall back to onSnapshot (only once)
        if (!snapshotUnsub) {
          usePolling = false;
          snapshotUnsub = onSnapshot(collection(db, 'jogos'), (snap) => {
            const r = {};
            snap.forEach(d => {
              const data = d.data();
              if (data.golsMandante != null) r[d.id] = data;
            });
            setResults(r);
          });
        }
      }
    };
    loadResults();

    const iv = setInterval(() => {
      if (usePolling) loadResults();
    }, 15000);

    return () => {
      clearInterval(iv);
      if (snapshotUnsub) snapshotUnsub();
    };
  }, []);

  useEffect(() => {
    if (!user || !groupId) return;
    getDoc(doc(db, 'grupos', groupId)).then(snap => {
      if (snap.exists()) setIsAdmin(snap.data().adminUid === user.uid);
    });
  }, [user, groupId]);

  const filteredMatches = useMemo(() => {
    if (phase === 'GROUP') {
      return MATCHES.filter(m => m.phase === 'GROUP' && m.group === group);
    }
    if (phase === 'FINAL_PHASE') {
      return MATCHES.filter(m => ['THIRD', 'FINAL'].includes(m.phase));
    }
    return MATCHES.filter(m => m.phase === phase);
  }, [phase, group]);

  const handleSavePrediction = async (data) => {
    if (!selectedMatch || !user || !groupId) return;
    if (!isBeforeDeadline(selectedMatch.date)) {
      toast.error('Prazo encerrado para este jogo!');
      setSelectedMatch(null);
      return;
    }
    try {
      const ref = doc(db, 'grupos', groupId, 'palpites', selectedMatch.id, 'votos', user.uid);
      await setDoc(ref, { ...data, timestamp: serverTimestamp() });
      setPredictions(prev => ({ ...prev, [selectedMatch.id]: data }));
      toast.success('Palpite salvo!');
      setSelectedMatch(null);
    } catch (err) {
      toast.error('Erro ao salvar palpite');
      console.error(err);
    }
  };

  const handleSaveResult = async (data) => {
    if (!selectedMatch || !isAdmin) return;
    try {
      const ref = doc(db, 'jogos', selectedMatch.id);
      await setDoc(ref, { ...data, status: 'ENCERRADO' }, { merge: true });
      setResults(prev => ({ ...prev, [selectedMatch.id]: { ...prev[selectedMatch.id], ...data, status: 'ENCERRADO' } }));
      toast.success('Resultado salvo!');
      setSelectedMatch(null);

      const scoreRes = await fetch('/api/calculate-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: selectedMatch.id }),
      });
      if (scoreRes.ok) {
        toast.success('Pontuações atualizadas!');
        loadPredictions();
      }

      await fetch('/api/update-bracket', { method: 'POST' });
    } catch (err) {
      toast.error('Erro ao salvar resultado');
      console.error(err);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync-results', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        toast.success(`${data.synced} resultado(s) sincronizado(s)!`);
        const resData = await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getMatchOverrides' }),
        });
        if (resData.ok) {
          const d = await resData.json();
          if (d.overrides) setResults(d.overrides);
        }
        loadPredictions();
      } else {
        toast.error(data.error || 'Erro na sincronização');
      }
    } catch (err) {
      toast.error('Erro ao sincronizar');
    }
    setSyncing(false);
  };

  const getMatchWithOverrides = (match) => {
    const override = results[match.id];
    if (!override) return match;
    return {
      ...match,
      home: override.mandante || match.home,
      away: override.visitante || match.away,
    };
  };

  if (!groupId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <h2 className="text-lg font-bold mb-2 text-pitch-200">Selecione um grupo</h2>
        <p className="text-sm text-pitch-500">Escolha ou crie um grupo para ver os jogos.</p>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Jogos"
        rightAction={isAdmin && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="text-[11px] bg-pitch-800 text-pitch-300 px-3 py-1.5 rounded-lg border border-pitch-700 disabled:opacity-50 font-medium"
          >
            {syncing ? '...' : 'Sync'}
          </button>
        )}
      />

      <div className="overflow-x-auto scrollbar-hide px-4 py-3">
        <div className="flex gap-1.5">
          {PHASE_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setPhase(f.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                phase === f.key
                  ? 'bg-accent text-white'
                  : 'bg-pitch-900 text-pitch-400 border border-pitch-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {phase === 'GROUP' && (
        <div className="overflow-x-auto scrollbar-hide px-4 pb-3">
          <div className="flex gap-1">
            {GROUPS.map(g => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  group === g
                    ? 'bg-accent text-white'
                    : 'bg-pitch-900 text-pitch-500 border border-pitch-800'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'GROUP' && (
        <div className="px-4 pb-3">
          <GroupStandings group={group} />
        </div>
      )}

      <div className="px-4 pb-28 space-y-3">
        {filteredMatches.map(match => {
          const m = getMatchWithOverrides(match);
          const result = results[match.id];
          const prediction = predictions[match.id];
          const scoreType = prediction?.tipoPontuacao
            ? SCORE_TYPES[prediction.tipoPontuacao]
            : null;

          return (
            <MatchCard
              key={match.id}
              match={m}
              prediction={prediction}
              result={result}
              scoreType={scoreType}
              isAdmin={isAdmin}
              onPredict={(clickedMatch) => setSelectedMatch(clickedMatch)}
            />
          );
        })}
      </div>

      {selectedMatch && (
        <PredictionModal
          match={getMatchWithOverrides(selectedMatch)}
          initial={isAdmin && !isBeforeDeadline(selectedMatch.date) ? results[selectedMatch.id] : predictions[selectedMatch.id]}
          isResult={isAdmin && !isBeforeDeadline(selectedMatch.date)}
          onSave={isAdmin && !isBeforeDeadline(selectedMatch.date) ? handleSaveResult : handleSavePrediction}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
}
