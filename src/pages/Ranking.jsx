import { useState, useEffect } from 'react';
import { collection, onSnapshot } from '../localDb';
import { db } from '../localDb';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import RankingList from '../components/RankingList';

export default function Ranking({ groupId }) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!groupId) return;
    return onSnapshot(
      collection(db, 'grupos', groupId, 'membros'),
      (snap) => {
        const list = snap.docs.map(d => ({ userId: d.id, ...d.data() }));
        setMembers(list);
      }
    );
  }, [groupId]);

  if (!groupId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <h2 className="text-lg font-bold mb-2 text-pitch-200">Selecione um grupo</h2>
        <p className="text-sm text-pitch-500">Escolha um grupo para ver o ranking.</p>
      </div>
    );
  }

  return (
    <div>
      <Header title="Ranking" />
      <div className="px-4 py-4 pb-28">
        {members.length === 0 ? (
          <div className="text-center text-pitch-500 py-10 text-sm">
            Nenhum membro no grupo ainda.
          </div>
        ) : (
          <RankingList members={members} currentUserId={user?.uid} />
        )}
      </div>
    </div>
  );
}
