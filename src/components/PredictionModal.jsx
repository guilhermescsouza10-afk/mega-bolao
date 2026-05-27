import { useState } from 'react';
import { TEAMS } from '../data/teams';
import TeamFlag from './TeamFlag';

function GoalInput({ value, onChange, label, team }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <TeamFlag team={team} size="lg" />
      <span className="text-xs font-medium text-pitch-300">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-10 rounded-full bg-pitch-800 border border-pitch-700 text-white text-lg font-bold
                     flex items-center justify-center active:scale-90 transition-transform"
        >
          -
        </button>
        <span className="text-3xl font-extrabold w-10 text-center tabular-nums">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="w-10 h-10 rounded-full bg-accent text-white text-lg font-bold
                     flex items-center justify-center active:scale-90 transition-transform"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function PredictionModal({ match, initial, onSave, onClose, isResult }) {
  const [homeGoals, setHomeGoals] = useState(initial?.golsMandante ?? 0);
  const [awayGoals, setAwayGoals] = useState(initial?.golsVisitante ?? 0);
  const [advancer, setAdvancer] = useState(initial?.avanca ?? null);

  const home = TEAMS[match.home];
  const away = TEAMS[match.away];
  const isKnockout = ['ROUND_32', 'ROUND_16', 'QUARTER', 'SEMI', 'THIRD', 'FINAL'].includes(match.phase);
  const isDraw = homeGoals === awayGoals;

  const handleSave = () => {
    const data = {
      golsMandante: homeGoals,
      golsVisitante: awayGoals,
    };
    if (isKnockout && isDraw) {
      data.avanca = advancer;
    }
    onSave(data);
  };

  const canSave = !isKnockout || !isDraw || advancer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
         onClick={onClose}>
      <div className="w-full max-w-sm bg-pitch-900 rounded-2xl border border-pitch-800 animate-fade-in"
           onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-8">
          <h2 className="text-center font-bold text-lg mb-1">
            {isResult ? 'Inserir Resultado' : 'Seu Palpite'}
          </h2>
          <p className="text-center text-xs text-pitch-500 mb-8">
            {match.phase === 'GROUP' ? `Grupo ${match.group}` : match.label}
          </p>

          <div className="flex items-start justify-around">
            <GoalInput
              value={homeGoals}
              onChange={setHomeGoals}
              label={home.name}
              team={home}
            />
            <span className="text-xl font-bold text-pitch-600 mt-14">:</span>
            <GoalInput
              value={awayGoals}
              onChange={setAwayGoals}
              label={away.name}
              team={away}
            />
          </div>

          {isKnockout && isDraw && (
            <div className="mt-6">
              <p className="text-xs text-center text-pitch-400 mb-3">
                {isResult ? 'Quem venceu nos pênaltis?' : 'Em caso de empate, quem avança?'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setAdvancer(match.home)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    advancer === match.home
                      ? 'bg-accent/15 text-accent border border-accent/30'
                      : 'bg-pitch-800 text-pitch-400 border border-pitch-700'
                  }`}
                >
                  <TeamFlag team={home} size="xs" /> {home.id}
                </button>
                <button
                  onClick={() => setAdvancer(match.away)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    advancer === match.away
                      ? 'bg-accent/15 text-accent border border-accent/30'
                      : 'bg-pitch-800 text-pitch-400 border border-pitch-700'
                  }`}
                >
                  <TeamFlag team={away} size="xs" /> {away.id}
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="btn-primary flex-1"
            >
              {isResult ? 'Salvar' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
