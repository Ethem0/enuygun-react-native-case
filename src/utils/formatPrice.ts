export function formatPrice(priceMinor: number): string {
  const sign = priceMinor < 0 ? '-' : '';
  const absoluteMinor = Math.abs(Math.trunc(priceMinor));
  const whole = Math.floor(absoluteMinor / 100);
  const fraction = String(absoluteMinor % 100).padStart(2, '0');
  const groupedWhole = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${sign}${groupedWhole},${fraction} TL`;
}
