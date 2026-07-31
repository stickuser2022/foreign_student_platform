import Link from "next/link";
import { requireAdmin } from "@/modules/auth/require-admin";
import { listDrafts } from "@/modules/admin/service";
import {
  publishUniversity,
  publishProgram,
  publishScholarship,
} from "@/modules/admin/actions";

export default async function ReviewPage() {
  await requireAdmin();
  const drafts = await listDrafts();

  const itemStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: 8,
    marginBottom: 8,
  } as const;

  const btnStyle = {
    padding: "6px 14px",
    border: "none",
    borderRadius: 6,
    background: "#16a34a",
    color: "#fff",
    cursor: "pointer",
  } as const;

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <p>
        <Link href="/admin">← 返回看板</Link>
      </p>
      <h1>审核队列(待审核 → 一键发布)</h1>

      <h2>学校({drafts.universities.length})</h2>
      {drafts.universities.length === 0 && <p style={{ color: "#888" }}>暂无</p>}
      {drafts.universities.map((u) => (
        <div key={u.id} style={itemStyle}>
          <span>
            {u.nameZh} <small style={{ color: "#888" }}>({u.slug})</small>
          </span>
          <form action={publishUniversity.bind(null, u.id)}>
            <button type="submit" style={btnStyle}>
              发布
            </button>
          </form>
        </div>
      ))}

      <h2 style={{ marginTop: 24 }}>项目({drafts.programs.length})</h2>
      {drafts.programs.length === 0 && <p style={{ color: "#888" }}>暂无</p>}
      {drafts.programs.map((p) => (
        <div key={p.id} style={itemStyle}>
          <span>
            {p.nameZh} <small style={{ color: "#888" }}>({p.university.nameZh})</small>
          </span>
          <form action={publishProgram.bind(null, p.id)}>
            <button type="submit" style={btnStyle}>
              发布
            </button>
          </form>
        </div>
      ))}

      <h2 style={{ marginTop: 24 }}>奖学金({drafts.scholarships.length})</h2>
      {drafts.scholarships.length === 0 && <p style={{ color: "#888" }}>暂无</p>}
      {drafts.scholarships.map((s) => (
        <div key={s.id} style={itemStyle}>
          <span>{s.name}</span>
          <form action={publishScholarship.bind(null, s.id)}>
            <button type="submit" style={btnStyle}>
              发布
            </button>
          </form>
        </div>
      ))}
    </main>
  );
}
