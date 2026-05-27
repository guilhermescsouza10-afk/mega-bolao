import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');

  const handleLogin = () => {
    if (!nome.trim()) return;
    login(nome.trim());
    const pending = sessionStorage.getItem('pendingInvite');
    if (pending) {
      sessionStorage.removeItem('pendingInvite');
      navigate(`/convite/${pending}`);
    } else {
      navigate('/jogos');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-pitch-950">
      <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-xs">
        <Logo size="lg" />

        <p className="text-pitch-400 text-sm text-center leading-relaxed">
          Crie seu grupo, convide os amigos e dispute o Mega BOLÃO da Copa 2026.
        </p>

        <div className="w-full space-y-4">
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Seu nome"
            className="input-field w-full text-center text-lg"
            autoFocus
            maxLength={30}
          />
          <button
            onClick={handleLogin}
            disabled={!nome.trim()}
            className="btn-primary w-full text-base"
          >
            Entrar
          </button>
        </div>

        <p className="text-[10px] text-pitch-600">
          Seus dados ficam seguros no servidor.
        </p>
      </div>
    </div>
  );
}
