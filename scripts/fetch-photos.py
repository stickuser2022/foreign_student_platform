"""校园照试点:Wikimedia Commons 搜图 → 下载压缩 webp → 灰底拼图待人工过目
用法: python scripts/fetch-photos.py
"""
import json, os, urllib.request, urllib.parse

SCHOOLS = {
    "hit": "Harbin Institute of Technology",
    "sjtu": "Shanghai Jiao Tong University",
    "xjtu": "Xi'an Jiaotong University",
}
PER_SCHOOL = 6
OUT = "photos-review"
os.makedirs(OUT, exist_ok=True)

import subprocess

def api(url):
    # urllib 的 TLS 指纹被 Wikimedia 拦,curl 正常 —— 用 curl
    out = subprocess.run(['curl','-s','-A','fsp-research/1.0','--max-time','30',url], capture_output=True)
    return json.loads(out.stdout.decode('utf-8'))

def search_commons(query, limit):
    q = urllib.parse.urlencode({
        "action": "query", "format": "json",
        "generator": "search", "gsrsearch": query, "gsrnamespace": 6,
        "gsrlimit": limit * 2, "prop": "imageinfo",
        "iiprop": "url|size|mime", "iiurlwidth": 1600,
    })
    data = api(f"https://commons.wikimedia.org/w/api.php?{q}")
    pages = (data.get("query") or {}).get("pages") or {}
    out = []
    for p in pages.values():
        ii = (p.get("imageinfo") or [{}])[0]
        w = ii.get("width", 0)
        if ii.get("mime") not in ("image/jpeg", "image/png"): continue
        if w and w < 1200: continue  # 太小的图不要
        out.append({"title": p.get("title",""), "thumb": ii.get("thumburl") or ii.get("url")})
    return out[:limit]

results = {}
for slug, name in SCHOOLS.items():
    try:
        cands = search_commons(f"{name} campus", PER_SCHOOL)
        if len(cands) < PER_SCHOOL:
            cands += search_commons(name, PER_SCHOOL - len(cands))
        got = []
        for i, c in enumerate(cands[:PER_SCHOOL]):
            try:
                req = urllib.request.Request(c["thumb"], headers={"User-Agent": "fsp-research/1.0"})
                data = subprocess.run(['curl','-s','-A','fsp-research/1.0','--max-time','40',c['thumb']], capture_output=True).stdout
                fn = f"{OUT}/{slug}-{i+1}.jpg"
                open(fn, "wb").write(data)
                got.append({"file": fn, "title": c["title"], "src": c["thumb"]})
                print(f"{slug}-{i+1} OK {c['title'][:60]}")
            except Exception as e:
                print(f"{slug}-{i+1} 下载失败 {e}")
        results[slug] = got
    except Exception as e:
        print(f"{slug} 搜索失败: {e}")

json.dump(results, open(f"{OUT}/manifest.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("完成,拼图下一步")
