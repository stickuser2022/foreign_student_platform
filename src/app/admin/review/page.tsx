import Link from "next/link";
import { requireAdmin } from "@/modules/auth/require-admin";
import { listDrafts, listUniversitiesForSelect } from "@/modules/admin/service";
import {
  publishUniversity,
  publishProgram,
  publishScholarship,
  updateUniversity,
  updateProgram,
  updateScholarship,
} from "@/modules/admin/actions";
import { UniversityForm } from "@/modules/admin/university-form";
import { ProgramForm } from "@/modules/admin/program-form";
import { ScholarshipForm } from "@/modules/admin/scholarship-form";

const card = {
  border: "1px solid #ddd",
  borderRadius: 8,
  marginBottom: 8,
  padding: "0 12px",
} as const;

const summaryStyle = {
  cursor: "pointer",
  padding: "10px 0",
  listStyle: "none",
} as const;

const publishBtn = {
  padding: "8px 20px",
  border: "none",
  borderRadius: 6,
  background: "#16a34a",
  color: "#fff",
  cursor: "pointer",
  fontSize: 15,
} as const;

function ext(url: string | null, label: string) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      style={{ color: "#2563eb", marginLeft: 12, fontSize: 13 }}
    >
      {label} ↗
    </a>
  );
}

export default async function ReviewPage() {
  await requireAdmin();
  const [drafts, universities] = await Promise.all([
    listDrafts(),
    listUniversitiesForSelect(),
  ]);

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: "0 16px" }}>
      <p>
        <Link href="/admin">← 返回看板</Link>
      </p>
      <h1>审核队列</h1>
      <p style={{ color: "#666" }}>
        点开卡片核对全部字段(官网/来源可跳转对照),有错直接改,「保存修改」留在本页;
        确认无误点「发布」上前台。
      </p>

      <h2>学校({drafts.universities.length})</h2>
      {drafts.universities.length === 0 && <p style={{ color: "#888" }}>暂无</p>}
      {drafts.universities.map((u) => (
        <details key={u.id} style={card}>
          <summary style={summaryStyle}>
            <strong>{u.nameZh}</strong>{" "}
            <small style={{ color: "#888" }}>
              {u.province} · {u.city}
              {[
                u.is985 && "985",
                u.is211 && "211",
                u.isDoubleFirstClass && "双一流",
              ]
                .filter(Boolean)
                .join(" · ")}
            </small>
          </summary>
          <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
            <UniversityForm
              action={updateUniversity.bind(null, u.id)}
              university={u}
              submitLabel="保存修改"
              redirectTo="/admin/review"
            />
            <form
              action={publishUniversity.bind(null, u.id)}
              style={{ marginTop: 12, paddingBottom: 12 }}
            >
              <button type="submit" style={publishBtn}>
                ✓ 确认无误,发布
              </button>
            </form>
          </div>
        </details>
      ))}

      <h2 style={{ marginTop: 24 }}>项目({drafts.programs.length})</h2>
      {drafts.programs.length === 0 && <p style={{ color: "#888" }}>暂无</p>}
      {drafts.programs.map((p) => (
        <details key={p.id} style={card}>
          <summary style={summaryStyle}>
            <strong>{p.nameZh}</strong>{" "}
            <small style={{ color: "#888" }}>({p.university.nameZh})</small>
            {ext(p.sourceUrl, "来源")}
          </summary>
          <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
            <ProgramForm
              universities={universities}
              action={updateProgram.bind(null, p.id)}
              program={p}
              submitLabel="保存修改"
              redirectTo="/admin/review"
            />
            <form
              action={publishProgram.bind(null, p.id)}
              style={{ marginTop: 12, paddingBottom: 12 }}
            >
              <button type="submit" style={publishBtn}>
                ✓ 确认无误,发布
              </button>
            </form>
          </div>
        </details>
      ))}

      <h2 style={{ marginTop: 24 }}>奖学金({drafts.scholarships.length})</h2>
      {drafts.scholarships.length === 0 && <p style={{ color: "#888" }}>暂无</p>}
      {drafts.scholarships.map((s) => (
        <details key={s.id} style={card}>
          <summary style={summaryStyle}>
            <strong>{s.name}</strong>
            {ext(s.sourceUrl, "来源")}
          </summary>
          <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
            <ScholarshipForm
              universities={universities}
              action={updateScholarship.bind(null, s.id)}
              scholarship={s}
              submitLabel="保存修改"
              redirectTo="/admin/review"
            />
            <form
              action={publishScholarship.bind(null, s.id)}
              style={{ marginTop: 12, paddingBottom: 12 }}
            >
              <button type="submit" style={publishBtn}>
                ✓ 确认无误,发布
              </button>
            </form>
          </div>
        </details>
      ))}
    </main>
  );
}
