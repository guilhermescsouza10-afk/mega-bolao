export default function RankingList({ members, currentUserId }) {
  const sorted = [...members].sort((a, b) => b.totalPontos - a.totalPontos);

  const medalColors = [
    'bg-yellow-500/10 border-yellow-500/20',
    'bg-zinc-400/10 border-zinc-400/20',
    'bg-amber-700/10 border-amber-700/20',
  ];
  const medalIcons = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-2">
      {sorted.map((member, idx) => {
        const isMe = member.userId === currentUserId;
        const isPodium = idx < 3;

        return (
          <div
            key={member.userId}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
              ${isPodium ? medalColors[idx] : 'bg-pitch-900 border-pitch-800'}
              ${isMe ? 'ring-1 ring-accent/40' : ''}`}
          >
            <div className="w-7 text-center flex-shrink-0">
              {isPodium ? (
                <span className="text-lg">{medalIcons[idx]}</span>
              ) : (
                <span className="text-xs font-bold text-pitch-500">{idx + 1}º</span>
              )}
            </div>

            <img
              src={member.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nome)}&background=27272a&color=a1a1aa&bold=true`}
              alt={member.nome}
              className="w-9 h-9 rounded-full object-cover border border-pitch-700"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-semibold truncate ${isMe ? 'text-accent-light' : 'text-pitch-200'}`}>
                  {member.nome}
                </span>
                {isMe && (
                  <span className="text-[9px] bg-accent/15 text-accent px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                    você
                  </span>
                )}
              </div>
              <div className="text-[10px] text-pitch-500 flex gap-2 mt-0.5">
                <span>Jogos: {member.pontosJogos ?? 0}</span>
                <span className="text-pitch-700">|</span>
                <span>Bônus: {member.pontosBonus ?? 0}</span>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className={`text-lg font-extrabold tabular-nums ${isPodium ? 'text-gold' : 'text-white'}`}>
                {member.totalPontos ?? 0}
              </div>
              <div className="text-[9px] text-pitch-500 uppercase tracking-wider">pts</div>
            </div>

            {member.variacaoPosicao != null && member.variacaoPosicao !== 0 && (
              <div className={`text-[10px] font-bold flex-shrink-0 ${
                member.variacaoPosicao > 0 ? 'text-accent-light' : 'text-red-400'
              }`}>
                {member.variacaoPosicao > 0 ? '▲' : '▼'}
                {Math.abs(member.variacaoPosicao)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
