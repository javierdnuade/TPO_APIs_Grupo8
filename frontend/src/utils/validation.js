export function parseNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function validateRange(minValue, maxValue, label) {
  const min = parseNumberOrNull(minValue);
  const max = parseNumberOrNull(maxValue);
  if (min === null || max === null) return null;
  if (min > max) return `${label}: el mínimo no puede ser mayor que el máximo.`;
  return null;
}

export function validateDateRange(from, to) {
  if (!from || !to) return null;
  if (from > to) return 'Fechas: desde no puede ser posterior a hasta.';
  return null;
}
