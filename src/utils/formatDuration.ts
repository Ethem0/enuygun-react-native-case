export function formatDuration(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours === 0) {
    return `${minutes} dk`;
  }

  if (minutes === 0) {
    return `${hours} sa`;
  }

  return `${hours} sa ${minutes} dk`;
}
