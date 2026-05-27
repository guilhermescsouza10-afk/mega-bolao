import { TEAMS } from '../data/teams';
import { VENUES } from '../data/matches';
import { formatShortDate, formatTime, getMatchStatus, getTimeUntilDeadline } from '../utils/dateUtils';
import TeamFlag from './TeamFlag';

function StatusBadge({ status }) {
  const styles = {
    ABERTO: 'badge-open',
    FECHADO: 'badge-closed',
    ENCERRADO: 'badge-finished',
  };
  const labels = { ABERTO: 'Aberto', FECHADO: 'Fechado', ENCERRADO: 'Encerrado' };
  return <span className={styles[status]}>{labels[status]}</span>;
}

export default function MatchCard({ match, prediction, onPredict, result, scoreType, isAdmin }) {
  const status = getMatchStatus(match.date);
  const timeLeft = getTimeUntilDeadline(match.date);
  const home = match.home ? TEAMS[match.home] : null;
  const away = match.away ? TEAMS[match.away] : null;

  const phaseLabels = {
    GROUP: `Grupo ${match.group}`,
    ROUND_32: 'Oitavas (32)',
    ROUND_16: 'Oitavas (16)',
    QUARTER: 'Quartas',
    SEMI: 'Semifinal',
    THIRD: '3º Lugar',
    FINAL: 'Final',
  };

  return (
    <div className="card-match">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-pitch-800">
        <span className="text-[11px] text-pitch-500 font-medium tracking-wide uppercase">
          {phaseLabels[match.phase]}
        </span>
        <div className="flex items-center gap-2">
          {status === 'ABERTO' && timeLeft && (
            <span className="text-[11px] text-pitch-400 font-mono">{timeLeft}</span>
          )}
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center">
          <div className="flex-1 flex items-center gap-3">
            <TeamFlag team={home} size="md" />
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">
                {home?.name || match.label?.split(' vs ')[0] || 'A definir'}
              </div>
              <div className="text-[10px] text-pitch-500 font-medium">
                {home?.id || ''}
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 mx-2 min-w-[72px] text-center">
            {result ? (
              <div className="animate-score-pop">
                <div className="text-2xl font-extrabold tracking-tight">
                  {result.golsMandante}
                  <span className="text-pitch-600 mx-1">:</span>
                  {result.golsVisitante}
                </div>
                {scoreType && (
                  <div className={`text-[10px] font-bold mt-0.5 ${scoreType.color}`}>
                    +{scoreType.points} pts
                  </div>
                )}
              </div>
            ) : prediction ? (
              <div>
                <div className="text-lg font-bold text-pitch-300">
                  {prediction.golsMandante}
                  <span className="text-pitch-600 mx-1">:</span>
                  {prediction.golsVisitante}
                </div>
                <div className="text-[10px] text-accent font-medium">Seu palpite</div>
              </div>
            ) : (
              <div className="text-pitch-600 text-xs font-medium">VS</div>
            )}
          </div>

          <div className="flex-1 flex items-center gap-3 justify-end text-right">
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">
                {away?.name || match.label?.split(' vs ')[1] || 'A definir'}
              </div>
              <div className="text-[10px] text-pitch-500 font-medium">
                {away?.id || ''}
              </div>
            </div>
            <TeamFlag team={away} size="md" />
          </div>
        </div>

        <div className="text-center mt-3 flex items-center justify-center gap-1.5 text-[11px] text-pitch-500">
          <span>{formatShortDate(match.date)}</span>
          <span className="text-pitch-700">&middot;</span>
          <span>{formatTime(match.date)}</span>
          {match.venue && (
            <>
              <span className="text-pitch-700">&middot;</span>
              <span className="truncate max-w-[120px]">{VENUES[match.venue]}</span>
            </>
          )}
        </div>
      </div>

      {home && away && (
        <div className="px-4 pb-3">
          {status === 'ABERTO' && onPredict && (
            <button onClick={() => onPredict(match)} className="btn-primary w-full text-sm">
              {prediction ? 'Alterar Palpite' : 'Fazer Palpite'}
            </button>
          )}
          {status === 'ENCERRADO' && isAdmin && !result && (
            <button onClick={() => onPredict(match)} className="btn-gold w-full text-sm">
              Inserir Resultado
            </button>
          )}
        </div>
      )}
    </div>
  );
}
