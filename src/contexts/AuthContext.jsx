import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const USER_KEY = 'megaBolao_user';
const LEGACY_USER_KEY = 'entreAmigos_user'; // backward compatibility

// Generate a deterministic UID from the name so re-login preserves identity
function generateUid(nome) {
  const normalized = nome.trim().toLowerCase().replace(/\s+/g, '_');
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return 'user_' + Math.abs(hash).toString(36) + normalized.replace(/[^a-z0-9]/g, '').substring(0, 8);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      // Try new key first, then fall back to legacy key for existing users
      const saved = localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate to new key if found on legacy
        localStorage.setItem(USER_KEY, saved);
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const login = (nome) => {
    // Check if there's already a saved user with same name — reuse their UID
    const existing = (() => {
      try {
        // Check current user first
        const saved = localStorage.getItem(USER_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.nome?.trim().toLowerCase() === nome.trim().toLowerCase()) return parsed;
        }
        // Check last logged-out user
        const last = localStorage.getItem('megaBolao_lastUser') || localStorage.getItem('entreAmigos_lastUser');
        if (last) {
          const parsed = JSON.parse(last);
          if (parsed.nome?.trim().toLowerCase() === nome.trim().toLowerCase()) return parsed;
        }
      } catch {}
      return null;
    })();

    const u = {
      uid: existing?.uid || generateUid(nome),
      nome: nome.trim(),
      foto: null,
      email: nome.toLowerCase().replace(/\s/g, '.') + '@local',
    };
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    // Keep the user data in a backup key so re-login can recover the UID
    try {
      const current = localStorage.getItem(USER_KEY);
      if (current) localStorage.setItem('megaBolao_lastUser', current);
    } catch {}
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading: false, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
