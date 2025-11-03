export function kgToLb(kg) {
  const n = Number(kg) || 0;
  return n * 2.2046226218;
}

export function lbToKg(lb) {
  const n = Number(lb) || 0;
  return n / 2.2046226218;
}

export function formatWeight(val, decimals = 1) {
  const n = Number(val) || 0;
  return n.toFixed(decimals);
}
