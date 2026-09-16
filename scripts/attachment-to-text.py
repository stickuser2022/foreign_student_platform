# 附件转文本:把 prisma/data/attachments/ 里的 pdf/xls/docx 转成同名 .txt(供对齐校验比对)
# 只处理还没有 .txt 的文件(幂等);.doc 老格式跳过
# 运行: python -X utf8 scripts/attachment-to-text.py
import os, re, sys

DIR = "prisma/data/attachments"

def html_to_text(path):
    raw = open(path, encoding="utf-8", errors="ignore").read()
    raw = re.sub(r"<script[\s\S]*?</script>", " ", raw)
    raw = re.sub(r"<style[\s\S]*?</style>", " ", raw)
    return re.sub(r"<[^>]+>", " ", raw)

def pdf_to_text(path):
    from pypdf import PdfReader
    r = PdfReader(path)
    return "\n".join((p.extract_text() or "") for p in r.pages)

def excel_to_text(path):
    import pandas as pd
    sheets = pd.read_excel(path, sheet_name=None, header=None)
    return "\n".join(df.to_string() for df in sheets.values())

def docx_to_text(path):
    import docx
    d = docx.Document(path)
    return "\n".join(p.text for p in d.paragraphs)

CONVERTERS = {".pdf": pdf_to_text, ".xls": excel_to_text, ".xlsx": excel_to_text, ".docx": docx_to_text, ".html": html_to_text, ".htm": html_to_text}

for f in os.listdir(DIR):
    name, ext = os.path.splitext(f)
    ext = ext.lower()
    if ext not in CONVERTERS:
        continue
    src = os.path.join(DIR, f)
    dst = os.path.join(DIR, name + ".txt")
    if os.path.exists(dst):
        continue
    try:
        text = CONVERTERS[ext](src)
        open(dst, "w", encoding="utf-8").write(text)
        print(f"转换 {f} -> {len(text)} 字符")
    except Exception as e:
        print(f"跳过 {f}: {type(e).__name__} {str(e)[:80]}", file=sys.stderr)
