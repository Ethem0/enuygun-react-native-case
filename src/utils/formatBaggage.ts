export function formatBaggage(baggageKg: number | null): string {
  if (baggageKg === null) {
    return 'Bagaj bilgisi yok';
  }

  if (baggageKg === 0) {
    return 'Bagaj dahil değil';
  }

  return `${baggageKg} kg bagaj`;
}
