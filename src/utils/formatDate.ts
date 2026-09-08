const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  timeZone: 'Europe/Istanbul',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('tr-TR', {
  timeZone: 'Europe/Istanbul',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function formatFlightDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

export function formatFlightTime(isoDate: string): string {
  return timeFormatter.format(new Date(isoDate));
}

export function formatFlightDateTime(isoDate: string): string {
  return `${formatFlightDate(isoDate)} · ${formatFlightTime(isoDate)}`;
}
