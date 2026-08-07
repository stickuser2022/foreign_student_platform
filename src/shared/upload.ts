// 后台图片上传:存到 public/uploads/(本地开发 + 自托管云主机可用;
// 将来若上无服务器平台需迁对象存储,见 docs/PROGRESS.md 决策)
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// 保存一个表单上传的图片,返回可访问路径(如 /uploads/xxx.png);无效返回 null
export async function saveUpload(file: FormDataEntryValue | null): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type.startsWith("image/")) throw new Error("只能上传图片文件");
  if (file.size > MAX_SIZE) throw new Error("图片不能超过 5MB");

  const ext = path.extname(file.name).toLowerCase() || ".png";
  const filename = `${randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${filename}`;
}
