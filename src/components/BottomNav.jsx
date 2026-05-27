import { NavLink } from 'react-router-dom';

function Icon({ name, className }) {
  const paths = {
    matches: <><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" strokeWidth="0" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v0M8.5 10l0 0M8.5 14l0 0M12 16v0M15.5 14l0 0M15.5 10l0 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>,
    groups: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>,
    trophy: <><path d="M6 9H4.5a2.5 2.5 0 010-5H6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 22h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 19.24 7 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 19.24 17 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 2H6v7a6 6 0 1012 0V2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>,
    star: <><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>,
    user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/></>,
  };
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      {paths[name]}
    </svg>
  );
}

const tabs = [
  { to: '/jogos', icon: 'matches', label: 'Jogos' },
  { to: '/grupos', icon: 'groups', label: 'Grupos' },
  { to: '/ranking', icon: 'trophy', label: 'Ranking' },
  { to: '/bonus', icon: 'star', label: 'Bônus' },
  { to: '/perfil', icon: 'user', label: 'Perfil' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-pitch-950/95 backdrop-blur-xl border-t border-pitch-800 safe-bottom">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {tabs.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 transition-colors duration-200 ${
                isActive ? 'text-accent' : 'text-pitch-500'
              }`
            }
          >
            <Icon name={icon} className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
