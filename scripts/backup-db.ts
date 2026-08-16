// 数据库备份:docker exec pg_dump 导出全库到 backups/db-<时间戳>.sql
// 运行:pnpm backup(需 Docker Desktop 和数据库容器已启动)
// docker CLI 不在系统 PATH 时回退到用户级安装的已知路径(见 AGENTS.md 环境坑)
import { execFile } from "child_process";
import { existsSync, mkdirSync, statSync, writeFileSync } from "fs";
import path from "path";

const CONTAINER = "foreign_student_platform-db-1";
const DB = "foreign_student_platform";
const USER = "fsp";
const DOCKER_FALLBACK =
  "C:\\Users\\21128\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe";

function findDocker(): string {
  return existsSync(DOCKER_FALLBACK) ? DOCKER_FALLBACK : "docker";
}

function pgDump(docker: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    execFile(
      docker,
      ["exec", CONTAINER, "pg_dump", "-U", USER, "-d", DB, "--clean", "--if-exists"],
      { maxBuffer: 256 * 1024 * 1024, encoding: "buffer" },
      (err, stdout, stderr) => {
        if (err) reject(new Error(`pg_dump 失败:${stderr.toString().slice(0, 300)}`));
        else resolve(stdout);
      }
    );
  });
}

async function main() {
  const data = await pgDump(findDocker());
  const dir = path.join(process.cwd(), "backups");
  mkdirSync(dir, { recursive: true });

  const stamp = new Date()
    .toISOString()
    .replace(/[:T]/g, "-")
    .slice(0, 16);
  const file = path.join(dir, `db-${stamp}.sql`);
  writeFileSync(file, data);

  const mb = (statSync(file).size / 1024 / 1024).toFixed(2);
  console.log(`备份完成:${file}(${mb} MB)`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
