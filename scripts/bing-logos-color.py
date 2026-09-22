"""校徽管线 v3:只抓彩色版——必应中文搜「校名 校徽」,自动丢弃白色/透明底无效的候选
背景:v2 抓到的 46 所校徽是白色版(官网深色页眉用),在米白站点背景上隐形
过滤:候选图合成到白底后,"有颜色(饱和)或深(暗)的像素"占比 < 2.5% 判为白色版,丢弃
运行: python -X utf8 scripts/bing-logos-color.py
产物: logos-color/<slug>-<n>.png (每校最多 3 个通过过滤的候选) + manifest.json
"""
import json, os, re, subprocess, time, html, io
import urllib.parse
from PIL import Image

OUT = "logos-color"
UA_SEARCH = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
UA_DL = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"

# 46 所白色版校徽(38 PNG + 8 SVG)
TARGETS = {
    "bfsu": "北京外国语大学", "bisu": "北京第二外国语学院", "bit": "北京理工大学",
    "bnu": "北京师范大学", "buaa": "北京航空航天大学", "dlmu": "大连海事大学",
    "gdufs": "广东外语外贸大学", "hlju": "黑龙江大学", "hnu": "湖南大学",
    "hrbeu": "哈尔滨工程大学", "hust": "华中科技大学", "jnu": "暨南大学",
    "lzu": "兰州大学", "nankai": "南开大学", "neau": "东北农业大学",
    "nenu": "东北师范大学", "neu": "东北大学", "nju": "南京大学",
    "nwafu": "西北农林科技大学", "pku": "北京大学", "scu": "四川大学",
    "scut": "华南理工大学", "seu": "东南大学", "shisu": "上海外国语大学",
    "sisu": "四川外国语大学", "suda": "苏州大学", "swjtu": "西南交通大学",
    "sysu": "中山大学", "tju": "天津大学", "tongji": "同济大学",
    "tsinghua": "清华大学", "uibe": "对外经济贸易大学", "ustc": "中国科学技术大学",
    "whu": "武汉大学", "xisu": "西安外国语大学", "xjtu": "西安交通大学",
    "xju": "新疆大学", "xmu": "厦门大学",
    "dlut": "大连理工大学", "ecnu": "华东师范大学", "ouc": "中国海洋大学",
    "sdu": "山东大学", "shu": "上海大学", "shzu": "石河子大学",
    "tjfsu": "天津外国语大学", "zju": "浙江大学",
}

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

def visible_on_white_ratio(im):
    """合成到白底后,彩色或深色像素占比。白色版校徽 ≈ 0。"""
    im = im.convert("RGBA")
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
    flat = Image.alpha_composite(bg, im).convert("RGB")
    flat.thumbnail((200, 200))  # 加速
    px = list(flat.getdata())
    hit = sum(1 for r, g, b in px if (max(r, g, b) - min(r, g, b) > 30) or (r + g + b) / 3 < 200)
    return hit / len(px) if px else 0

def acceptable(raw_bytes):
    """返回 (ok, reason)。ok=True 时可作为彩色校徽候选。"""
    try:
        im = Image.open(io.BytesIO(raw_bytes))
        im.load()
    except Exception:
        return False, "not-image"
    w, h = im.size
    if min(w, h) < 120: return False, f"small-{w}x{h}"
    if max(w, h) / min(w, h) > 5: return False, "banner"
    ratio = visible_on_white_ratio(im)
    if ratio < 0.025: return False, f"white-{ratio:.3f}"
    return True, f"ink-{ratio:.3f}"

def main():
    os.makedirs(OUT, exist_ok=True)
    report = {}
    for slug, nameZh in TARGETS.items():
        if os.path.exists(f"{OUT}/{slug}-1.png"):
            print(f"{slug} 已有,跳过", flush=True)
            continue
        urls = search(f"{nameZh} 校徽", 10)
        kept, tried = [], 0
        for u in urls:
            if len(kept) >= 3 or tried >= 6: break
            tried += 1
            raw = curl(u, timeout=25)
            ok, why = acceptable(raw)
            if ok:
                im = Image.open(io.BytesIO(raw)).convert("RGBA")
                dest = f"{OUT}/{slug}-{len(kept)+1}.png"
                im.save(dest)
                kept.append(u)
                print(f"{slug}-{len(kept)} OK {why}", flush=True)
            else:
                print(f"{slug} 弃 {why}", flush=True)
            time.sleep(2.5)
        report[slug] = kept
        json.dump(report, open(f"{OUT}/manifest.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        time.sleep(3.5)
    print(f"完成: {sum(1 for v in report.values() if v)}/{len(TARGETS)} 所有候选")

main()
