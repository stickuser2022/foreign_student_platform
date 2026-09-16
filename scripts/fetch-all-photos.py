"""校园照铺满:读 universities-batch1.csv 全部学校 → Commons 搜图 → 下载 → webp 压缩
慢速纪律(429 限流踩过坑):每张图间隔 8s,失败重试 3 次(间隔 45s)
断点续跑:已存在于 public/uploads/photo-<slug>-1.webp 的学校跳过
运行: python -X utf8 scripts/fetch-all-photos.py
"""
import json, os, subprocess, time
import urllib.parse

CSV = "prisma/data/universities-batch1.csv"
OUT_DIR = "public/uploads"
REVIEW_DIR = "photos-review/all"
PER_SCHOOL = 6

def curl(url, dest=None, timeout=45):
    args = ["curl", "-s", "-A", "fsp-research/1.0 (study-abroad-platform)", "--max-time", str(timeout)]
    if dest:
        args += ["-o", dest]
    args.append(url)
    r = subprocess.run(args, capture_output=True)
    return r.stdout

def search_commons(query, limit):
    q = urllib.parse.urlencode({
        "action": "query", "format": "json",
        "generator": "search", "gsrsearch": query, "gsrnamespace": 6,
        "gsrlimit": limit * 2, "prop": "imageinfo",
        "iiprop": "url|size|mime", "iiurlwidth": 1600,
    })
    data = json.loads(curl(f"https://commons.wikimedia.org/w/api.php?{q}").decode("utf-8"))
    pages = (data.get("query") or {}).get("pages") or {}
    out = []
    for p in pages.values():
        ii = (p.get("imageinfo") or [{}])[0]
        if ii.get("mime") not in ("image/jpeg", "image/png"):
            continue
        if ii.get("width", 0) and ii["width"] < 1200:
            continue
        out.append({"title": p.get("title", ""), "thumb": ii.get("thumburl") or ii.get("url")})
    return out[:limit]

def main():
    os.makedirs(REVIEW_DIR, exist_ok=True)
    rows = [l.split(",") for l in open(CSV, encoding="utf-8").read().strip().split("\n")[1:]]
    done, failed = [], []
    for row in rows:
        slug, nameEn = row[0], row[2]
        if os.path.exists(f"{OUT_DIR}/photo-{slug}-1.webp"):
            continue  # 已有照片,断点跳过
        try:
            cands = search_commons(f"{nameEn} campus", PER_SCHOOL)
            if len(cands) < 3:
                cands += search_commons(nameEn, PER_SCHOOL - len(cands))
            got = []
            for i, c in enumerate(cands[:PER_SCHOOL], 1):
                dest = f"{REVIEW_DIR}/{slug}-{i}.jpg"
                ok = False
                for attempt in range(3):
                    curl(c["thumb"].split("?")[0], dest)
                    with open(dest, "rb") as f:
                        head = f.read(3)
                    if b"\xff\xd8" in head:
                        ok = True
                        break
                    time.sleep(45 if attempt < 2 else 0)
                if ok:
                    got.append({"file": dest, "title": c["title"], "src": c["thumb"]})
                    print(f"{slug}-{i} OK", flush=True)
                else:
                    print(f"{slug}-{i} FAIL", flush=True)
                time.sleep(8)  # 限速
            if got:
                done.append(slug)
            else:
                failed.append(slug)
        except Exception as e:
            print(f"{slug} 错误: {e}", flush=True)
            failed.append(slug)
    print(f"\n完成: {len(done)} 所抓到, {len(failed)} 所颗粒无收: {failed}")
    json.dump({"done": done, "failed": failed}, open(f"{REVIEW_DIR}/result.json", "w"))

main()
