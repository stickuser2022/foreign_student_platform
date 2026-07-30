// 人民币→卢布展示汇率(仅展示用,定期人工更新;卢布永不入库 — 全局原则 6)
export const CNY_TO_RUB = 11;

export function formatCny(amount: number): string {
  return `¥${amount.toLocaleString("ru-RU")}`;
}

export function formatRubFromCny(amountCny: number): string {
  return `≈ ${Math.round(amountCny * CNY_TO_RUB).toLocaleString("ru-RU")} ₽`;
}

// 双币种一行展示:"¥26 000 (≈ 286 000 ₽)"
export function formatDual(amountCny: number): string {
  return `${formatCny(amountCny)} (${formatRubFromCny(amountCny)})`;
}
