"""校徽管线 v2:必应中文图片搜索「校名 校徽」→ 下载候选 → 待视觉审核
运行: python -X utf8 scripts/bing-logos.py
"""
import json, os, re, subprocess, time, html
import urllib.parse

CSV = "prisma/data/universities-batch1.csv"
EXTRA = [("hit", "哈尔滨工业大学"), ("sjtu", "上海交通大学"), ("blcu", "北京语言大学"), ("swjtu", "西南交通大学")]
OUT = "logos-v2"
UA_SEARCH = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
UA_DL = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"

def curl(url, dest=None, ua=None, timeout=30):
    args = ["curl", "-sL", "-A", ua or UA_DL, "--max-time", str(timeout)]
    if dest: args += ["-o", dest]
    args.append(url)
    return subprocess.run(args, capture_output=True).stdout

def search(query, limit):
    url = "https://cn.bing.com/images/search?" + urllib.parse.urlencode({"q": query, "form": "HDRSC2"})
    raw = html.unescape(curl(url, ua=UA_SEARCH).decode("utf-8", errors="ignore"))
    urls = re.findall(r'"murl":"(https?://[^"]+)"', raw)
    seen, out = set(), []
    for u in urls:
        if u in seen: continue
        seen.add(u); out.append(u)
        if len(out) >= limit: break
    return out

def main():
    os.makedirs(OUT, exist_ok=True)
    rows = [l.split(",") for l in open(CSV, encoding="utf-8").read().strip().split("\n")[1:]]
    schools = [(r[0], r[1]) for r in rows] + EXTRA
    report = {}
    for slug, nameZh in schools:
        if os.path.exists(f"{OUT}/{slug}-1.jpg") or os.path.exists(f"{OUT}/{slug}-1.png"):
            continue
        urls = search(f"{nameZh} 校徽", 3)
        got = []
        for i, u in enumerate(urls, 1):
            ext = ".png" if ".png" in u.lower() else ".jpg"
            dest = f"{OUT}/{slug}-{i}{ext}"
            curl(u, dest)
            if os.path.exists(dest) and os.path.getsize(dest) > 3000:
                with open(dest, "rb") as f:
                    head = f.read(8)
                if b"\xff\xd8" in head[:3] or head.startswith(b"\x89PNG"):
                    got.append(u)
                    print(f"{slug}-{i} OK", flush=True)
                else:
                    os.remove(dest)
            else:
                if os.path.exists(dest): os.remove(dest)
                print(f"{slug}-{i} FAIL", flush=True)
            time.sleep(3)
        report[slug] = got
        time.sleep(4)
    json.dump(report, open(f"{OUT}/manifest.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("完成")

main()
