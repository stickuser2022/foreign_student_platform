"use client";

// 互动中国地图(纯 SVG,无第三方地图依赖;GeoJSON 已预生成 path)
// 有已发布学校的省份着色可点:hover 跟随胶囊 → 点击填红 + 底部抽屉出学校
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, X } from "lucide-react";
import {
  CHINA_VIEWBOX,
  CHINA_PROVINCES,
  CONTEXT_COUNTRIES,
} from "./china-map-data";

export type MapUniversity = {
  slug: string;
  name: string;
  logoUrl: string | null;
  programs: number;
  cityRu: string;
  descriptionRu: string | null;
  photos: string[];
};

export type MapProvince = {
  /** 短省名(黑龙江/上海…) */
  short: string;
  /** 俄语省名 */
  nameRu: string;
  universities: MapUniversity[];
};

// GeoJSON 全名 → 短名(北京市→北京,内蒙古自治区→内蒙古)
function shortName(full: string): string {
  return full
    .replace(/(壮族|回族|维吾尔)?自治区$/, "")
    .replace(/特别行政区$/, "")
    .replace(/[省市]$/, "");
}

const COLORS = {
  context: "#EFEBE4", // 周边国家(更浅,做世界视野衬底)
  base: "#ECE8E2",
  active: "#C9BFB4",
  hover: "#B4A999",
  selected: "#D91F1F",
  border: "#F7F6F5",
};

export function ChinaMap({ provinces }: { provinces: MapProvince[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<MapProvince | null>(null);
  const [preview, setPreview] = useState<MapUniversity | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState(0);
  const [pill, setPill] = useState<{ x: number; y: number; text: string } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const byShort = new Map(provinces.map((p) => [p.short, p]));

  const fillFor = (short: string): string => {
    if (selected?.short === short) return COLORS.selected;
    if (hovered === short) return byShort.has(short) ? COLORS.hover : COLORS.base;
    return byShort.has(short) ? COLORS.active : COLORS.base;
  };

  // 选中某省时其他省变淡聚焦(不放大——放大没有新信息可展示)
  const opacityFor = (short: string): number => {
    if (!selected) return 1;
    return selected.short === short ? 1 : 0.35;
  };

  const onMove = (e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (hovered && byShort.has(hovered)) {
      const p = byShort.get(hovered)!;
      setPill({ x, y, text: `${p.nameRu} · ${p.universities.length}` });
    } else {
      setPill(null);
    }
  };

  return (
    <div ref={wrapRef} className="relative overflow-hidden border border-hairline">
      <svg
        viewBox={CHINA_VIEWBOX}
        className="mx-auto block h-auto w-full"
        role="img"
        aria-label="Карта Китая"
        onMouseMove={onMove}
        onMouseLeave={() => {
          setHovered(null);
          setPill(null);
        }}
      >
        {/* 周边国家衬底(世界视野);选中省份时同样变淡 */}
        {CONTEXT_COUNTRIES.map((c) => (
          <path
            key={c.name}
            d={c.d}
            fill={COLORS.context}
            fillOpacity={selected ? 0.3 : 1}
            stroke={COLORS.border}
            strokeWidth={1}
            className="transition-opacity duration-300"
          />
        ))}
        {CHINA_PROVINCES.map((f) => {
          const short = shortName(f.name);
          const clickable = byShort.has(short);
          return (
            <path
              key={f.name}
              d={f.d}
              data-short={short}
              fill={fillFor(short)}
              fillOpacity={opacityFor(short)}
              stroke={COLORS.border}
              strokeWidth={1.2}
              className="transition-all duration-300"
              style={{ cursor: clickable ? "pointer" : "default" }}
              onMouseEnter={() => setHovered(short)}
              onClick={() => {
                if (!clickable) return;
                setPreview(null);
                setPreviewPhoto(0);
                const p = byShort.get(short)!;
                setSelected((cur) => (cur?.short === short ? null : p));
              }}
            />
          );
        })}
      </svg>

      {/* 光标跟随胶囊 */}
      {pill && (
        <div
          className="pointer-events-none absolute z-10 rounded-full bg-ink px-3 py-1 text-xs text-cream"
          style={{ left: pill.x + 12, top: pill.y - 8 }}
        >
          {pill.text}
        </div>
      )}

      {/* 底部抽屉:选中省份的学校(横滑小卡,点卡片出右侧速览;速览打开时保留,便于切换学校) */}
      {selected && (
        <div className="absolute inset-x-0 bottom-0 z-10 border-t border-hairline bg-cream/95 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="font-medium">
              {selected.nameRu}{" "}
              <span className="text-muted">
                · {selected.universities.length} унив.
              </span>
            </p>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Закрыть"
              className="text-muted transition-colors hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
            {selected.universities.map((u) => (
              <button
                key={u.slug}
                type="button"
                onClick={() => {
                  setPreview(u);
                  setPreviewPhoto(0);
                }}
                className="group flex shrink-0 cursor-pointer items-center gap-2 border border-hairline bg-white px-3 py-2 text-left transition-colors hover:border-accent"
              >
                {u.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.logoUrl} alt="" className="h-6 w-6 object-contain" />
                )}
                <span className="text-sm whitespace-nowrap transition-colors group-hover:text-accent">
                  {u.name}
                </span>
              </button>
            ))}
            <Link
              href={`/universities?province=${encodeURIComponent(selected.short)}`}
              className="group flex shrink-0 items-center gap-1.5 px-3 py-2 text-sm text-muted transition-colors hover:text-accent"
            >
              Все
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      )}

      {/* 右侧速览面板:点学校卡片飞出 */}
      {preview && (
        <aside className="absolute top-0 right-0 z-20 flex h-full w-[340px] flex-col border-l border-hairline bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
            <p className="text-xs tracking-wide text-muted uppercase">
              Университет
            </p>
            <button
              type="button"
              onClick={() => setPreview(null)}
              aria-label="Назад к списку"
              className="text-muted transition-colors hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {/* 校园照片:主图 + 悬停缩略图切换 */}
            {preview.photos.length > 0 && (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.photos[previewPhoto]}
                  alt={preview.name}
                  className="aspect-[16/10] w-full border border-hairline object-cover"
                />
                {preview.photos.length > 1 && (
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {preview.photos.map((src, i) => (
                      <button
                        key={src}
                        type="button"
                        onMouseEnter={() => setPreviewPhoto(i)}
                        onClick={() => setPreviewPhoto(i)}
                        aria-label={`Фото ${i + 1}`}
                        className={`shrink-0 cursor-pointer border transition-all ${
                          i === previewPhoto
                            ? "border-accent opacity-100"
                            : "border-hairline opacity-60 hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="h-10 w-16 object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 flex h-14 items-center">
              {preview.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.logoUrl}
                  alt=""
                  className="max-h-12 max-w-20 object-contain"
                />
              )}
            </div>
            <h3 className="mt-2 font-serif text-2xl leading-tight font-light">
              {preview.name}
            </h3>
            <p className="mt-2 text-sm text-muted">
              {preview.cityRu} · Программ: {preview.programs}
            </p>
            {preview.descriptionRu && (
              <p className="mt-4 text-sm leading-relaxed text-ink/80">
                {preview.descriptionRu}
              </p>
            )}
          </div>
          <div className="border-t border-hairline p-4">
            <Link
              href={`/universities/${preview.slug}`}
              className="group flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm text-cream transition-colors hover:bg-accent"
            >
              Открыть страницу
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </aside>
      )}
    </div>
  );
}
