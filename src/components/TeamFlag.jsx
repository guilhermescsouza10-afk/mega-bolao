import { useState } from 'react';

const SIZES = {
  xs: 'w-5 h-4',
  sm: 'w-7 h-5',
  md: 'w-10 h-7',
  lg: 'w-14 h-10',
  xl: 'w-16 h-12',
};

export default function TeamFlag({ team, size = 'md', className = '' }) {
  const [failed, setFailed] = useState(false);

  if (!team) {
    return (
      <div className={`${SIZES[size]} rounded bg-pitch-700 flex items-center justify-center ${className}`}>
        <span className="text-pitch-500 text-[10px]">?</span>
      </div>
    );
  }

  if (failed || !team.iso2) {
    return <span className={`${size === 'xs' ? 'text-sm' : size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : size === 'xl' ? 'text-4xl' : 'text-2xl'} ${className}`}>{team.flag}</span>;
  }

  return (
    <img
      src={`https://flagcdn.com/w80/${team.iso2}.png`}
      srcSet={`https://flagcdn.com/w160/${team.iso2}.png 2x`}
      alt={team.name}
      className={`${SIZES[size]} object-cover rounded-sm shadow-sm ${className}`}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
