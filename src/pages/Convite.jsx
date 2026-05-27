import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp } from '../localDb';
import { db } from '../localDb';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import toast from 'react-hot-toast';

export default function Convite() {
  const { token } = useParams();
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [nome, setNome] = useState('');

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const findGroup = async () => {
      const q = query(collection(db, 'grupos'), where('linkToken', '==', token));
      const snap = await getDocs(q);
      if (cancelled) return;

      if (snap.empty) {
        setError('Convite inválido ou expirado.');
        return;
      }
      const g = snap.docs[0];
      const groupId = g.id;
      setGroupName(g.data().nome);

      if (user && !joining) {
        setJoining(true);
        try {
          // Check if user is already a member (avoid resetting their scores)
          const memberRef = doc(db, 'grupos', groupId, 'membros', user.uid);
          const memberSnap = await getDoc(memberRef);
          if (cancelled) return;

          if (memberSnap.exists()) {
            // Already a member — just update name/photo, preserve scores
            await setDoc(memberRef, {
              nome: user.nome,
              foto: user.foto,
            }, { merge: true });
            toast.success(`Você já está no grupo "${g.data().nome}"!`);
          } else {
            // New member — create with zero scores
            await setDoc(memberRef, {
              nome: user.nome,
              foto: user.foto,
              totalPontos: 0,
              pontosJogos: 0,
              pontosBonus: 0,
              palpitesCertos: 0,
              joinedAt: serverTimestamp(),
            });
            toast.success(`Você entrou no grupo "${g.data().nome}"!`);
          }

          // Select this group automatically
          localStorage.setItem('selectedGroupId', groupId);
          if (!cancelled) navigate('/jogos');
        } catch (err) {
          if (!cancelled) {
            setError('Erro ao entrar no grupo.');
            console.error(err);
          }
        }
      }
    };

    findGroup();
    return () => { cancelled = true; };
  }, [token, user]);

  const handleLogin = () => {
    if (!nome.trim()) return;
    sessionStorage.setItem('pendingInvite', token);
    login(nome.trim());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pitch-950">
        <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-pitch-950">
        <h2 className="text-lg font-bold mb-2 text-pitch-200">Ops!</h2>
        <p className="text-pitch-400 mb-6">{error}</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Ir para o início
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-8 bg-pitch-950">
        <Logo size="md" />
        <div>
          <h2 className="text-lg font-bold mb-2">Você foi convidado!</h2>
          {groupName && (
            <p className="text-pitch-300 text-sm">
              Grupo: <span className="font-bold text-accent">{groupName}</span>
            </p>
          )}
          <p className="text-xs text-pitch-500 mt-2">Digite seu nome para entrar.</p>
        </div>
        <div className="w-full max-w-xs space-y-3">
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Seu nome"
            className="input-field w-full text-center"
            autoFocus
          />
          <button onClick={handleLogin} disabled={!nome.trim()} className="btn-primary w-full">
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-pitch-950">
      <div className="text-center">
        <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-pitch-400 text-sm">Entrando no grupo...</p>
      </div>
    </div>
  );
}
