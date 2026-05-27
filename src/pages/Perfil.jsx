import { useState, useEffect } from 'react';
import { collection, onSnapshot } from '../localDb';
import { db } from '../localDb';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

export default function Perfil() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalPontos: 0,
    melhorPosicao: null,
  });

  useEffect(() => {
    if (!user) return;
    let memberUnsubs = [];

    const unsub = onSnapshot(collection(db, 'grupos'), (snap) => {
      // Clean up previous member listeners before creating new ones
      memberUnsubs.forEach(u => u());
      memberUnsubs = [];

      let total = 0;
      let best = null;
      let groupsProcessed = 0;
      const groupCount = snap.docs.length;

      if (groupCount === 0) {
        setStats({ totalPontos: 0, melhorPosicao: null });
        return;
      }

      snap.docs.forEach(g => {
        const groupId = g.id;
        const memUnsub = onSnapshot(collection(db, 'grupos', groupId, 'membros'), (memSnap) => {
          const me = memSnap.docs.find(d => d.id === user.uid);
          if (me) {
            const data = me.data();
            total += data.totalPontos || 0;
            const sorted = memSnap.docs
              .map(d => d.data())
              .sort((a, b) => (b.totalPontos || 0) - (a.totalPontos || 0));
            const myIdx = sorted.findIndex(m => m.nome === user.nome);
            if (myIdx !== -1) {
              const pos = myIdx + 1;
              if (best === null || pos < best) best = pos;
            }
          }
          groupsProcessed++;
          if (groupsProcessed >= groupCount) {
            setStats({ totalPontos: total, melhorPosicao: best });
          }
        });
        memberUnsubs.push(memUnsub);
      });
    });

    return () => {
      unsub();
      memberUnsubs.forEach(u => u());
    };
  }, [user]);

  if (!user) return null;

  return (
    <div>
      <Header title="Perfil" />

      <div className="px-4 py-6 pb-28 space-y-4">
        <div className="bg-pitch-900 rounded-2xl border border-pitch-800 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-pitch-800 border-2 border-accent/30 flex items-center justify-center text-xl font-bold text-accent">
            {user.nome[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-lg">{user.nome}</h2>
            <p className="text-xs text-pitch-500">Conectado</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-pitch-900 rounded-xl border border-pitch-800 p-4 text-center">
            <div className="text-2xl font-extrabold text-gold tabular-nums">{stats.totalPontos}</div>
            <div className="text-[10px] text-pitch-500 mt-1 uppercase tracking-wider">Pontos</div>
          </div>
          <div className="bg-pitch-900 rounded-xl border border-pitch-800 p-4 text-center">
            <div className="text-2xl font-extrabold text-accent tabular-nums">
              {stats.melhorPosicao ? `${stats.melhorPosicao}º` : '—'}
            </div>
            <div className="text-[10px] text-pitch-500 mt-1 uppercase tracking-wider">Posição</div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full py-3 text-red-400 text-sm font-medium rounded-xl border border-pitch-800
                     active:scale-[0.98] transition-transform"
        >
          Sair da Conta
        </button>
      </div>
    </div>
  );
}
