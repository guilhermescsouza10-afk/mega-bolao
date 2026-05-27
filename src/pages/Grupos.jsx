import { useState, useEffect } from 'react';
import { collection, addDoc, doc, setDoc, onSnapshot, serverTimestamp, deleteDoc } from '../localDb';
import { db } from '../localDb';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import ShareButton from '../components/ShareButton';
import toast from 'react-hot-toast';

function generateToken() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export default function Grupos({ onSelectGroup, selectedGroupId }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [memberCounts, setMemberCounts] = useState({});

  useEffect(() => {
    if (!user) return;
    let memberUnsubs = [];

    const unsub = onSnapshot(collection(db, 'grupos'), (snap) => {
      const allGroups = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setGroups(allGroups);

      memberUnsubs.forEach(u => u());
      memberUnsubs = [];

      allGroups.forEach(g => {
        const u = onSnapshot(collection(db, 'grupos', g.id, 'membros'), (memSnap) => {
          const isMember = memSnap.docs.some(d => d.id === user.uid);
          if (isMember) {
            setMemberCounts(prev => ({ ...prev, [g.id]: memSnap.docs.length }));
          }
        });
        memberUnsubs.push(u);
      });
    });
    return () => {
      unsub();
      memberUnsubs.forEach(u => u());
    };
  }, [user]);

  const myGroups = groups.filter(g => memberCounts[g.id] != null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const token = generateToken();
      const groupRef = await addDoc(collection(db, 'grupos'), {
        nome: newName.trim(),
        adminUid: user.uid,
        linkToken: token,
        criadoEm: serverTimestamp(),
        campeonato: 'Copa do Mundo FIFA 2026',
      });

      await setDoc(doc(db, 'grupos', groupRef.id, 'membros', user.uid), {
        nome: user.nome,
        foto: user.foto,
        totalPontos: 0,
        pontosJogos: 0,
        pontosBonus: 0,
        palpitesCertos: 0,
        joinedAt: serverTimestamp(),
      });

      setNewName('');
      setShowCreate(false);
      onSelectGroup(groupRef.id);
      toast.success('Grupo criado!');
    } catch (err) {
      toast.error('Erro ao criar grupo');
      console.error(err);
    }
  };

  return (
    <div>
      <Header
        title="Meus Grupos"
        rightAction={
          <button onClick={() => setShowCreate(true)} className="text-accent font-bold text-xl leading-none">
            +
          </button>
        }
      />

      <div className="px-4 py-4 pb-28 space-y-3">
        {myGroups.length === 0 && (
          <div className="text-center py-16">
            <h3 className="font-bold text-lg mb-2 text-pitch-200">Nenhum grupo ainda</h3>
            <p className="text-sm text-pitch-500 mb-6">Crie um grupo e convide seus amigos!</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              Criar Primeiro Grupo
            </button>
          </div>
        )}

        {myGroups.map(g => (
          <div
            key={g.id}
            className={`bg-pitch-900 rounded-xl border p-4 cursor-pointer transition-all ${
              selectedGroupId === g.id ? 'border-accent/40 ring-1 ring-accent/20' : 'border-pitch-800'
            }`}
          >
            <div onClick={() => onSelectGroup(g.id)} className="mb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-pitch-100">{g.nome}</h3>
                <span className="text-[11px] text-pitch-500">
                  {memberCounts[g.id] || 0} participantes
                </span>
              </div>
              {g.adminUid === user.uid && (
                <span className="text-[9px] bg-accent/10 text-accent px-2 py-0.5 rounded font-semibold uppercase tracking-wider mt-1 inline-block">
                  Admin
                </span>
              )}
            </div>
            <ShareButton groupName={g.nome} inviteToken={g.linkToken} />
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
             onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-sm bg-pitch-900 rounded-2xl border border-pitch-800 p-6"
               onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Criar Grupo</h2>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nome do grupo"
              className="input-field w-full mb-4"
              autoFocus
              maxLength={40}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button onClick={handleCreate} className="btn-primary flex-1" disabled={!newName.trim()}>
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
