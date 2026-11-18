const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
export const normalizeTaxId = (value) => value.trim().toUpperCase().replace(/[\s-]/g, '');

export function isSpanishTaxId(value) {
  if (/^\d{8}[A-Z]$/.test(value)) return letters[Number(value.slice(0, 8)) % 23] === value[8];
  if (/^[XYZ]\d{7}[A-Z]$/.test(value))
    return letters[Number('XYZ'.indexOf(value[0]) + value.slice(1, 8)) % 23] === value[8];
  if (/^[KLM]\d{7}[A-Z]$/.test(value)) return letters[Number(value.slice(1, 8)) % 23] === value[8];
  if (!/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(value)) return false;
  const sum = [...value.slice(1, 8)].reduce((total, digit, index) => {
    const n = Number(digit) * (index % 2 === 0 ? 2 : 1);
    return total + Math.floor(n / 10) + (n % 10);
  }, 0);
  const digit = (10 - (sum % 10)) % 10;
  const numeric = String(digit);
  const alpha = 'JABCDEFGHI'[digit];
  if ('ABEH'.includes(value[0])) return value[8] === numeric;
  if ('NPQRSW'.includes(value[0])) return value[8] === alpha;
  return value[8] === numeric || value[8] === alpha;
}
