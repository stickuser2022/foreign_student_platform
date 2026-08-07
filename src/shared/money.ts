// 人民币→卢布展示汇率(仅展示用,卢布永不入库 — 全局原则 6)
// 双源自动切换,均无 key、每日官方数据:
//   1. 俄罗斯中央银行(CBR)— 面向俄语访客最权威;海外服务器直连
//   2. 中国银行外汇牌价(中行折算价)— 国内直连可达;CNY/RUB 同一市场,差异 <1%
// 两个源都不可达时返回 null:页面只显示人民币,不展示来路不明的换算。
// 服务器端缓存 6 小时,接口超时 8 秒快速失败。

export type FxRate = {
  rate: number;
  // 俄语来源标注,直接展示在页面上
  source: string;
};

async function fetchCbrRate(): Promise<FxRate | null> {
  const res = await fetch("https://www.cbr-xml-daily.ru/daily_json.js", {
    next: { revalidate: 6 * 3600 },
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    Valute?: { CNY?: { Value?: number } };
  };
  const rate = data.Valute?.CNY?.Value;
  return typeof rate === "number" && rate > 0
    ? { rate, source: "ЦБ РФ" }
    : null;
}

async function fetchBocRate(): Promise<FxRate | null> {
  // 中行外汇牌价页:卢布行的「中行折算价」= 100 卢布兑人民币元
  const res = await fetch("https://www.boc.cn/sourcedb/whpj/", {
    next: { revalidate: 6 * 3600 },
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) return null;
  const buf = await res.arrayBuffer();
  // 页面历史上是 GBK,现为 UTF-8;两种都试
  let html = new TextDecoder("utf-8").decode(buf);
  if (!html.includes("卢布")) html = new TextDecoder("gbk").decode(buf);

  const row = html.split("<tr").find((r) => r.includes("卢布"));
  if (!row) return null;
  // 列序:货币名称/现汇买入/现钞买入/现汇卖出/现钞卖出/中行折算价/日期/时间
  const cells = [...row.matchAll(/<td[^>]*>([^<]*)<\/td>/g)].map((m) =>
    m[1].trim()
  );
  const zhParity = Number(cells[5]);
  return zhParity > 0
    ? { rate: 100 / zhParity, source: "Банк Китая" }
    : null;
}

export async function getCnyToRubRate(): Promise<FxRate | null> {
  try {
    const fx = await fetchCbrRate();
    if (fx) return fx;
  } catch {
    // 源 1 不可达,换源 2
  }
  try {
    const fx = await fetchBocRate();
    if (fx) return fx;
  } catch {
    // 源 2 也不可达
  }
  return null;
}

export function formatCny(amount: number): string {
  return `¥${amount.toLocaleString("ru-RU")}`;
}

export function formatRubFromCny(amountCny: number, rate: number): string {
  return `≈ ${Math.round(amountCny * rate).toLocaleString("ru-RU")} ₽`;
}

// 双币种一行展示:"¥26 000 (≈ 286 000 ₽)";无汇率时只显示人民币
export function formatDual(amountCny: number, rate: number | null): string {
  if (rate == null) return formatCny(amountCny);
  return `${formatCny(amountCny)} (${formatRubFromCny(amountCny, rate)})`;
}
