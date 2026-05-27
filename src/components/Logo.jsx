export default function Logo({ size = 'md' }) {
  const textSize = { sm: 'text-xl', md: 'text-2xl', lg: 'text-4xl' };
  const subSize = { sm: 'text-[9px]', md: 'text-[10px]', lg: 'text-xs' };

  return (
    <div className="flex flex-col items-center gap-2">
      <h1 className={`${textSize[size]} font-extrabold tracking-tight`}>
        <span className="text-white">Entre</span>
        <span className="text-accent"> Amigos</span>
      </h1>
      <p className={`${subSize[size]} text-pitch-500 font-medium tracking-[0.2em] uppercase`}>
        Copa do Mundo 2026
      </p>
    </div>
  );
}
