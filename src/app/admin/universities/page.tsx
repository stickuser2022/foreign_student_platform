import Link from "next/link";
import { requireAdmin } from "@/modules/auth/require-admin";
import { listAllUniversities } from "@/modules/admin/service";
import { TYPES } from "@/modules/admin/university-form";

const TYPE_LABELS = Object.fromEntries(TYPES.map((t) => [t.value, t.label]));

export default async function AdminUniversitiesPage() {
  await requireAdmin();
  const universities = await listAllUniversities();

  return (
    <main style={{ maxWidth: 960, margin: "40px auto", padding: "0 16px" }}>
      <p>
        <Link href="/admin">← 返回看板</Link>
      </p>
      <h1>学校管理</h1>
      <p>
        <Link href="/admin/universities/new">＋ 录入新学校</Link>
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: 8 }}>学校</th>
            <th style={{ padding: 8 }}>城市</th>
            <th style={{ padding: 8 }}>类型</th>
            <th style={{ padding: 8 }}>状态</th>
            <th style={{ padding: 8 }}>最近核实</th>
            <th style={{ padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {universities.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>{u.nameZh}</td>
              <td style={{ padding: 8 }}>{u.city}</td>
              <td style={{ padding: 8 }}>
                {TYPE_LABELS[u.universityType] ?? u.universityType}
              </td>
              <td style={{ padding: 8 }}>
                {u.dataStatus === "PUBLISHED" ? "已发布" : "待审核"}
              </td>
              <td style={{ padding: 8 }}>
                {u.lastVerifiedAt
                  ? u.lastVerifiedAt.toLocaleDateString("zh-CN")
                  : "—"}
              </td>
              <td style={{ padding: 8 }}>
                <Link href={`/admin/universities/${u.id}/edit`}>编辑</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
