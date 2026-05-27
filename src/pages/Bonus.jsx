import { useState, useEffect, useMemo } from 'react';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot, collection } from '../localDb';
import { db } from '../localDb';
import { useAuth } from '../contexts/AuthContext';
import { TEAMS_LIST } from '../data/teams';
import { PLAYERS } from '../data/players';
import { MATCHES } from '../data/matches';
import Header from '../components/Header';
import TeamFlag from '../components/TeamFlag';
import toast from 'react-hot-toast';

export default function Bonus({ groupId }) {
  const { user } = useAuth();
  const [campeao, setCampeao] = useState('');
  const [viceCampeao, setViceCampeao] = useState('');
  const [artilheiro, setArtilheiro] = useState('');
  const [playerQuery, setPlayerQuery] = useState('');
  const [saved, setSaved] = useState(false);
  const [allBonus, setAllBonus] = useState([]);
  const [members, setMembers] = useState({});

  const openingMatch = MATCHES[0];
  const deadline = new Date(new Date(openingMatch.date).getTime() - 60 * 60 * 1000);
  const isLocked = new Date() >= deadline;

  useEffect(() => {
    if (!user || !groupId) return;
    const ref = doc(db, 'grupos', groupId, 'bonus', user.uid);
    getDoc(ref).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setCampeao(data.campeao || '');
        setViceCampeao(data.viceCampeao || '');
        setArtilheiro(data.artilheiro || '');
        setPlayerQuery(data.artilheiro || '');
        setSaved(true);
      }
    });
  }, [user, groupId]);

  useEffect(() => {
    if (!groupId || !isLocked) return;
    return onSnapshot(collection(db, 'grupos', groupId, 'bonus'), (snap) => {
      setAllBonus(snap.docs.map(d => ({ userId: d.id, ...d.data() })));
    });
  }, [groupId, isLocked]);

  useEffect(() => {
    if (!groupId) return;
    return onSnapshot(collection(db, 'grupos', groupId, 'membros'), (snap) => {
      const m = {};
      snap.docs.forEach(d => { m[d.id] = d.data(); });
      setMembers(m);
    });
  }, [groupId]);

  const filteredPlayers = useMemo(() => {
    if (!playerQuery || playerQuery.length < 2) return [];
    const q = playerQuery.toLowerCase();
    return PLAYERS.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8);
  }, [playerQuery]);

  const handleSave = async () => {
    if (!campeao || !viceCampeao || !artilheiro) {
      toast.error('Preencha todas as perguntas!');
      return;
    }
    if (campeao === viceCampeao) {
      toast.error('Campeão e vice não podem ser iguais!');
      return;
    }

    try {
      const ref = doc(db, 'grupos', groupId, 'bonus', user.uid);
      await setDoc(ref, {
        campeao,
        viceCampeao,
        artilheiro,
        pontosCampeao: 0,
        pontosVice: 0,
        pontosArtilheiro: 0,
        timestamp: serverTimestamp(),
      });
      setSaved(true);
      toast.success('Respostas salvas!');
    } catch {
      toast.error('Erro ao salvar');
    }
  };

  const getTeam = (id) => TEAMS_LIST.find(t => t.id === id);

  if (!groupId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <h2 className="text-lg font-bold mb-2 text-pitch-200">Selecione um grupo</h2>
        <p className="text-sm text-pitch-500">Escolha um grupo para responder as perguntas bônus.</p>
      </div>
    );
  }

  return (
    <div>
      <Header title="Perguntas Bônus" />

      <div className="px-4 py-4 pb-28 space-y-4">
        <div className="bg-pitch-900 rounded-xl border border-pitch-800 px-4 py-3 text-center">
          <p className="text-xs text-pitch-400">
            {isLocked
              ? 'Respostas bloqueadas — prazo encerrado'
              : 'Prazo: até 1h antes do jogo de abertura'}
          </p>
        </div>

        <div className="bg-pitch-900 rounded-xl border border-pitch-800 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-sm">🏆</div>
            <div>
              <h3 className="font-semibold text-sm">Campeão</h3>
              <p className="text-[10px] text-pitch-500">+50 pontos</p>
            </div>
          </div>
          <select
            value={campeao}
            onChange={e => setCampeao(e.target.value)}
            disabled={isLocked}
            className="input-field w-full"
          >
            <option value="">Selecione a seleção</option>
            {TEAMS_LIST.map(t => (
              <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
            ))}
          </select>
        </div>

        <div className="bg-pitch-900 rounded-xl border border-pitch-800 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-400/10 flex items-center justify-center text-sm">🥈</div>
            <div>
              <h3 className="font-semibold text-sm">Vice-Campeão</h3>
              <p className="text-[10px] text-pitch-500">+30 pontos</p>
            </div>
          </div>
          <select
            value={viceCampeao}
            onChange={e => setViceCampeao(e.target.value)}
            disabled={isLocked}
            className="input-field w-full"
          >
            <option value="">Selecione o vice</option>
            {TEAMS_LIST.filter(t => t.id !== campeao).map(t => (
              <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
            ))}
          </select>
        </div>

        <div className="bg-pitch-900 rounded-xl border border-pitch-800 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-sm">⚽</div>
            <div>
              <h3 className="font-semibold text-sm">Artilheiro</h3>
              <p className="text-[10px] text-pitch-500">+20 pontos</p>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              value={playerQuery}
              onChange={e => { setPlayerQuery(e.target.value); setArtilheiro(''); }}
              placeholder="Digite o nome do jogador"
              disabled={isLocked}
              className="input-field w-full"
            />
            {filteredPlayers.length > 0 && !artilheiro && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-pitch-800 rounded-xl
                              border border-pitch-700 overflow-hidden shadow-xl max-h-48 overflow-y-auto">
                {filteredPlayers.map(p => {
                  const team = getTeam(p.team);
                  return (
                    <button
                      key={`${p.name}-${p.team}`}
                      onClick={() => { setArtilheiro(p.name); setPlayerQuery(p.name); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-pitch-700 transition-colors flex items-center gap-2"
                    >
                      <TeamFlag team={team} size="xs" />
                      <span className="text-sm">{p.name}</span>
                      <span className="text-[10px] text-pitch-500 ml-auto">{team?.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {!isLocked && (
          <button onClick={handleSave} className="btn-primary w-full">
            {saved ? 'Atualizar Respostas' : 'Salvar Respostas'}
          </button>
        )}

        {isLocked && allBonus.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="font-semibold text-sm text-pitch-300">Respostas do Grupo</h3>
            {allBonus.map(b => {
              const member = members[b.userId];
              const champ = getTeam(b.campeao);
              const vice = getTeam(b.viceCampeao);
              return (
                <div key={b.userId} className="bg-pitch-900 rounded-xl border border-pitch-800 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-pitch-700 flex items-center justify-center text-xs font-bold">
                      {(member?.nome || '?')[0]}
                    </div>
                    <span className="text-sm font-semibold">{member?.nome || 'Anônimo'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-pitch-500 block mb-1.5">Campeão</span>
                      <div className="flex items-center justify-center gap-1">
                        <TeamFlag team={champ} size="xs" />
                        <span className="text-pitch-200">{champ?.id}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-pitch-500 block mb-1.5">Vice</span>
                      <div className="flex items-center justify-center gap-1">
                        <TeamFlag team={vice} size="xs" />
                        <span className="text-pitch-200">{vice?.id}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-pitch-500 block mb-1.5">Artilheiro</span>
                      <span className="text-pitch-200">{b.artilheiro}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
