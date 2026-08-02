import Link from "next/link";
import { requireAdmin } from "@/modules/auth/require-admin";
import { listAllPrograms } from "@/modules/admin/service";

const DEGREE_LABELS: Record<string, string> = {
  LANGUAGE: "语言班",
  PREP: "预科",
  BACHELOR: "本科",
  MASTER: "硕士",
  PHD: "博士",
  NON_DEGREE: "短期/交换",
};

export default async function AdminProgramsPage() {
  await requireAdmin();
  const programs = await listAllPrograms();

  return (
    <main style={{ maxWidth: 960, margin: "40px auto", padding: "0 16px" }}>
      <p>
        <Link href="/admin">← 返回看板</Link>
      </p>
      <h1>项目管理</h1>
      <p>
        <Link href="/admin/programs/new">＋ 录入新项目</Link>
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: 8 }}>项目</th>
            <th style={{ padding: 8 }}>所属学校</th>
            <th style={{ padding: 8 }}>层次</th>
            <th style={{ padding: 8 }}>状态</th>
            <th style={{ padding: 8 }}>最近核实</th>
            <th style={{ padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {programs.map((p) => (
            <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>{p.nameZh}</td>
              <td style={{ padding: 8 }}>{p.university.nameZh}</td>
              <td style={{ padding: 8 }}>{DEGREE_LABELS[p.degreeLevel] ?? p.degreeLevel}</td>
              <td style={{ padding: 8 }}>
                {p.dataStatus === "PUBLISHED" ? "已发布" : "待审核"}
              </td>
              <td style={{ padding: 8 }}>
                {p.lastVerifiedAt
                  ? p.lastVerifiedAt.toLocaleDateString("zh-CN")
                  : "—"}
              </td>
              <td style={{ padding: 8 }}>
                <Link href={`/admin/programs/${p.id}/edit`}>编辑</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
