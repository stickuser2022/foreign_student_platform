// 一次性工具:中国省份 GeoJSON + 世界国家 GeoJSON(亚洲视野)→ SVG path 数据
// 输出 src/modules/universities/china-map-data.ts,同一投影/viewBox
// 运行:node scripts/geojson-to-svg.mjs
import { readFileSync, writeFileSync } from "fs";

const china = JSON.parse(
  readFileSync("prisma/data/china-provinces.json", "utf-8")
);
const world = JSON.parse(
  readFileSync("prisma/data/world-countries.json", "utf-8")
);

// 视野范围:亚洲+俄罗斯(经 25°E–150°E,纬 5°N–75°N)
const VIEW = { minLng: 25, maxLng: 150, minLat: 5, maxLat: 75 };

function* eachPoint(geom) {
  if (!geom) return;
  const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
  for (const poly of polys) for (const ring of poly) for (const pt of ring) yield pt;
}

const W = 1000;
const midLat = (VIEW.minLat + VIEW.maxLat) / 2;
const kx = Math.cos((midLat * Math.PI) / 180);
const scaleX = W / ((VIEW.maxLng - VIEW.minLng) * kx);
const H = Math.round((VIEW.maxLat - VIEW.minLat) * scaleX);

const proj = ([lng, lat]) => [
  Math.round((lng - VIEW.minLng) * kx * scaleX),
  Math.round((VIEW.maxLat - lat) * scaleX),
];

function featureToPath(geom) {
  if (!geom) return "";
  const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
  const parts = [];
  for (const poly of polys) {
    for (const ring of poly) {
      const pts = ring.map(proj);
      parts.push(
        `M${pts[0][0]},${pts[0][1]}` +
          pts.slice(1).map((p) => `L${p[0]},${p[1]}`).join("") +
          "Z"
      );
    }
  }
  return parts.join("");
}

// 国家视野过滤:中国周边相关国家白名单(俄+中亚+南亚+东南亚+东亚)
const CONTEXT_WHITELIST = new Set([
  "Russia", "Mongolia", "Kazakhstan", "Kyrgyzstan", "Tajikistan", "Uzbekistan",
  "Pakistan", "India", "Nepal", "Bhutan", "Myanmar", "Laos", "Vietnam",
  "Thailand", "Cambodia", "Japan", "South Korea", "North Korea",
]);

const context = world.features
  .filter((f) => CONTEXT_WHITELIST.has(f.properties.NAME || ""))
  .map((f) => ({ name: f.properties.NAME, d: featureToPath(f.geometry) }))
  .filter((c) => c.d);

const provinces = china.features.map((f) => ({
  name: f.properties.name,
  d: featureToPath(f.geometry),
}));

const ts = `// 由 scripts/geojson-to-svg.mjs 生成,勿手改
// 视野:亚洲(含俄罗斯),viewBox 0 0 ${W} ${H}
export const CHINA_VIEWBOX = "0 0 ${W} ${H}";
export const CONTEXT_COUNTRIES: { name: string; d: string }[] = ${JSON.stringify(context)};
export const CHINA_PROVINCES: { name: string; d: string }[] = ${JSON.stringify(provinces)};
`;

writeFileSync("src/modules/universities/china-map-data.ts", ts);
console.log(
  `生成:中国省份 ${provinces.length},周边国家 ${context.length},viewBox ${W}x${H},文件 ${(ts.length / 1024).toFixed(0)}KB`
);
console.log("周边含:", context.map((c) => c.name).slice(0, 12).join(", "));
