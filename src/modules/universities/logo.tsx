// 学校 Logo:有 logoUrl 显示图片,没有则显示校名首字母占位色块
// 前台列表页/详情页共用
export function UniversityLogo({
  logoUrl,
  name,
  size = 48,
}: {
  logoUrl: string | null;
  name: string;
  size?: number;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- 外链 logo,Next/Image 需配置域名白名单,MVP 不用
      <img
        src={logoUrl}
        alt={name}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-md border bg-white object-contain p-1"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.45 }}
      className="flex shrink-0 items-center justify-center rounded-md bg-blue-100 font-bold text-blue-700"
      aria-hidden
    >
      {name.trim().charAt(0)}
    </div>
  );
}
