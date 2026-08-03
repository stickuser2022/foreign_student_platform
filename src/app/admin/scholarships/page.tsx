import Link from "next/link";
import { requireAdmin } from "@/modules/auth/require-admin";
import { listAllScholarships } from "@/modules/admin/service";
import { SCHOLARSHIP_TYPES } from "@/modules/admin/scholarship-form";

const TYPE_LABELS = Object.fromEntries(
  SCHOLARSHIP_TYPES.map((t) => [t.value, t.label])
);

export default async function AdminScholarshipsPage() {
  await requireAdmin();
  const scholarships = await listAllScholarships();

  return (
    <main style={{ maxWidth: 960, margin: "40px auto", padding: "0 16px" }}>
      <p>
        <Link href="/admin">← 返回看板</Link>
      </p>
      <h1>奖学金管理</h1>
      <p>
        <Link href="/admin/scholarships/new">＋ 录入新奖学金</Link>
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: 8 }}>奖学金</th>
            <th style={{ padding: 8 }}>类型</th>
            <th style={{ padding: 8 }}>绑定学校</th>
            <th style={{ padding: 8 }}>状态</th>
            <th style={{ padding: 8 }}>最近核实</th>
            <th style={{ padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {scholarships.map((s) => (
            <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>{s.name}</td>
              <td style={{ padding: 8 }}>{TYPE_LABELS[s.type] ?? s.type}</td>
              <td style={{ padding: 8 }}>
                {s.university ? s.university.nameZh : "平台级"}
              </td>
              <td style={{ padding: 8 }}>
                {s.dataStatus === "PUBLISHED" ? "已发布" : "待审核"}
              </td>
              <td style={{ padding: 8 }}>
                {s.lastVerifiedAt
                  ? s.lastVerifiedAt.toLocaleDateString("zh-CN")
                  : "—"}
              </td>
              <td style={{ padding: 8 }}>
                <Link href={`/admin/scholarships/${s.id}/edit`}>编辑</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
