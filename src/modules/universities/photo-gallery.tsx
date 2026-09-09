"use client";

// 校园照片画廊:页内直接浏览——悬停缩略图切换主图、主图两侧箭头/触屏滑动切换
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PhotoGallery({
  photos,
  alt,
}: {
  photos: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);

  if (photos.length === 0) return null;

  const prev = () => setActive((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setActive((i) => (i + 1) % photos.length);

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (dx > 50) prev();
    if (dx < -50) next();
    setTouchX(null);
  };

  return (
    <div className="mb-10">
      {/* 主图:悬停缩略图或箭头/滑动切换 */}
      <div
        className="group/main relative overflow-hidden"
        onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[active]}
          alt={`${alt} — фото ${active + 1}`}
          className="aspect-[21/9] w-full object-cover transition-opacity duration-300"
          key={photos[active]}
        />
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Назад"
              className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover/main:opacity-100"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Вперёд"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover/main:opacity-100"
            >
              <ChevronRight className="size-6" />
            </button>
            <span className="absolute right-3 bottom-3 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
              {active + 1} / {photos.length}
            </span>
          </>
        )}
      </div>

      {/* 缩略图带:悬停即切换主图 */}
      {photos.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-label={`Фото ${i + 1}`}
              className={`shrink-0 cursor-pointer border transition-all ${
                i === active
                  ? "border-accent opacity-100"
                  : "border-hairline opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-20 w-32 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
