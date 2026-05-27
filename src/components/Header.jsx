import { useNavigate } from 'react-router-dom';

export default function Header({ title, showBack, rightAction }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-pitch-950/90 backdrop-blur-xl border-b border-pitch-800/50">
      <div className="max-w-lg mx-auto flex items-center justify-between h-12 px-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={() => navigate(-1)} className="text-pitch-400 -ml-1 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-base font-bold tracking-tight">{title}</h1>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  );
}
