"""照片管线 v2:必应中文图片搜索(替代 Wikimedia)
流程:每所学校搜「校名 校园」「校名 大门」→ 提取 murl 原图 → 下载
慢速纪律:下载间隔 3s,搜索间隔 5s;断点续跑(已有目录的学校跳过)
运行: python -X utf8 scripts/bing-photos.py [--only slug1,slug2]
"""
import json, os, re, subprocess, sys, time, html
import urllib.parse

CSV = "prisma/data/universities-batch1.csv"
EXTRA = [("hit", "哈尔滨工业大学"), ("sjtu", "上海交通大学"), ("blcu", "北京语言大学"), ("swjtu", "西南交通大学")]
OUT = "photos-v2"
UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
UA_DL = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
PER_SCHOOL = 8

def curl(url, dest=None, referer=None, timeout=40, ua=None):
    args = ["curl", "-sL", "-A", ua or UA_DL, "--max-time", str(timeout)]
    if referer: args += ["-e", referer]
    if dest: args += ["-o", dest]
    args.append(url)
    r = subprocess.run(args, capture_output=True)
    return r.stdout

def search_bing_images(query, limit):
    url = "https://cn.bing.com/images/search?" + urllib.parse.urlencode({"q": query, "form": "HDRSC2"})
    raw = curl(url, ua=UA, timeout=30).decode("utf-8", errors="ignore")
    raw = html.unescape(raw)
    urls = re.findall(r'"murl":"(https?://[^"]+)"', raw)
    # 去重、排除明显小图/图标
    seen, out = set(), []
    for u in urls:
        host = re.sub(r"^https?://(www\.)?", "", u).split("/")[0]
        if u in seen or any(b in host for b in ["bing.com", "baidu.com/it"]):
            continue
        seen.add(u)
        out.append(u)
        if len(out) >= limit: break
    return out

def main():
    only = None
    if len(sys.argv) > 2 and sys.argv[1] == "--only":
        only = set(sys.argv[2].split(","))
    os.makedirs(OUT, exist_ok=True)
    rows = [l.split(",") for l in open(CSV, encoding="utf-8").read().strip().split("\n")[1:]]
    schools = [(r[0], r[1]) for r in rows] + EXTRA
    report = {}
    for slug, nameZh in schools:
        if only and slug not in only: continue
        if os.path.exists(f"{OUT}/{slug}-1.jpg"):
            continue
        urls = []
        for q in [f"{nameZh} 大门 校园", f"{nameZh} 校园风景"]:
            urls += search_bing_images(q, PER_SCHOOL)
            time.sleep(5)
        # 去重保序
        dedup = list(dict.fromkeys(urls))[:PER_SCHOOL]
        got = []
        for i, u in enumerate(dedup, 1):
            dest = f"{OUT}/{slug}-{i}.jpg"
            ok = False
            for _ in range(2):
                curl(u, dest, referer="https://cn.bing.com/")
                if os.path.exists(dest) and os.path.getsize(dest) > 20000:
                    with open(dest, "rb") as f:
                        head = f.read(3)
                    if b"\xff\xd8" in head or b"PNG" in head:
                        ok = True
                        break
                time.sleep(3)
            if ok:
                got.append(u)
                print(f"{slug}-{i} OK", flush=True)
            else:
                if os.path.exists(dest): os.remove(dest)
                print(f"{slug}-{i} FAIL", flush=True)
            time.sleep(3)
        report[slug] = got
    json.dump(report, open(f"{OUT}/manifest.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("完成,共", sum(len(v) for v in report.values()), "张")

main()
