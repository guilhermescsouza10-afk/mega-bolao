import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import { doc, getDoc } from './localDb';
import { db } from './localDb';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Jogos from './pages/Jogos';
import Ranking from './pages/Ranking';
import Bonus from './pages/Bonus';
import Perfil from './pages/Perfil';
import Grupos from './pages/Grupos';
import Convite from './pages/Convite';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppLayout() {
  const [selectedGroupId, setSelectedGroupId] = useState(() => {
    return localStorage.getItem('selectedGroupId') || '';
  });
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    if (selectedGroupId) {
      localStorage.setItem('selectedGroupId', selectedGroupId);
      // Fetch group name for display
      getDoc(doc(db, 'grupos', selectedGroupId)).then(snap => {
        if (snap.exists()) setGroupName(snap.data().nome || '');
        else setGroupName('');
      }).catch(() => setGroupName(''));
    } else {
      setGroupName('');
    }
  }, [selectedGroupId]);

  const location = useLocation();
  const isGroupsPage = location.pathname === '/grupos';

  return (
    <div className="min-h-screen pb-20 max-w-lg mx-auto">
      {!isGroupsPage && (
        <div className="sticky top-0 z-50 bg-pitch-950/95 backdrop-blur-xl border-b border-pitch-800/50">
          <div className="max-w-lg mx-auto flex items-center justify-between h-10 px-4">
            <span className="text-xs font-medium text-pitch-400 truncate max-w-[200px]">
              {groupName || (selectedGroupId ? '' : 'Nenhum grupo')}
            </span>
            <Link to="/grupos" className="text-xs text-accent font-medium flex-shrink-0">
              {selectedGroupId ? 'Trocar grupo' : 'Criar grupo'}
            </Link>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/jogos" element={<Jogos groupId={selectedGroupId} />} />
        <Route path="/ranking" element={<Ranking groupId={selectedGroupId} />} />
        <Route path="/bonus" element={<Bonus groupId={selectedGroupId} />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/grupos" element={
          <Grupos
            onSelectGroup={setSelectedGroupId}
            selectedGroupId={selectedGroupId}
          />
        } />
        <Route path="*" element={<Navigate to="/jogos" replace />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#27272a',
            color: '#fafafa',
            border: '1px solid #3f3f46',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/convite/:token" element={<Convite />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}
