import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export default function GroupSelector({ selectedGroupId, onSelect }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'grupos'));
    return onSnapshot(q, (snap) => {
      const all = [];
      snap.forEach(doc => all.push({ id: doc.id, ...doc.data() }));
      setGroups(all);
    });
  }, [user]);

  const [myGroups, setMyGroups] = useState([]);

  useEffect(() => {
    if (!user || groups.length === 0) return;
    const unsubscribes = groups.map(g => {
      const memberRef = collection(db, 'grupos', g.id, 'membros');
      return onSnapshot(query(memberRef), (snap) => {
        const isMember = snap.docs.some(d => d.id === user.uid);
        if (isMember) {
          setMyGroups(prev => {
            const exists = prev.find(p => p.id === g.id);
            if (exists) return prev;
            return [...prev, g];
          });
        }
      });
    });
    return () => unsubscribes.forEach(u => u());
  }, [user, groups]);

  if (myGroups.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-4">
      {myGroups.map(g => (
        <button
          key={g.id}
          onClick={() => onSelect(g.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedGroupId === g.id
              ? 'bg-pitch-400 text-pitch-900'
              : 'bg-pitch-800 text-pitch-400 border border-pitch-700'
          }`}
        >
          {g.nome}
        </button>
      ))}
    </div>
  );
}
