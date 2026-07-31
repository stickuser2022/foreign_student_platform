import Link from "next/link";
import { requireAdmin } from "@/modules/auth/require-admin";
import { adminCounts } from "@/modules/admin/service";

export default async function AdminHomePage() {
  const user = await requireAdmin();
  const counts = await adminCounts();

  const rows: { label: string; c: { draft: number; published: number } }[] = [
    { label: "学校", c: counts.universities },
    { label: "项目", c: counts.programs },
    { label: "奖学金", c: counts.scholarships },
  ];

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h1>数据看板</h1>
      <p style={{ color: "#666" }}>
        当前管理员:{user.email}
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: 8 }}>内容</th>
            <th style={{ padding: 8 }}>待审核</th>
            <th style={{ padding: 8 }}>已发布</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>{r.label}</td>
              <td style={{ padding: 8 }}>{r.c.draft}</td>
              <td style={{ padding: 8 }}>{r.c.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link href="/admin/review">审核队列 →</Link>
        <Link href="/admin/universities/new">录入新学校 →</Link>
      </div>
    </main>
  );
}
