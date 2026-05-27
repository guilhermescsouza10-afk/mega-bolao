export function formatDate(isoString, options = {}) {
  const date = new Date(isoString);
  const defaultOpts = {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
    ...options,
  };
  return date.toLocaleString('pt-BR', defaultOpts);
}

export function formatShortDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function getMatchStatus(matchDate) {
  const now = new Date();
  const kickoff = new Date(matchDate);
  const deadline = new Date(kickoff.getTime() - 60 * 60 * 1000);

  if (now < deadline) return 'ABERTO';
  if (now < kickoff) return 'FECHADO';
  return 'ENCERRADO';
}

export function getTimeUntilDeadline(matchDate) {
  const now = new Date();
  const kickoff = new Date(matchDate);
  const deadline = new Date(kickoff.getTime() - 60 * 60 * 1000);
  const diff = deadline - now;

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}

export function isBeforeDeadline(matchDate) {
  return getMatchStatus(matchDate) === 'ABERTO';
}
