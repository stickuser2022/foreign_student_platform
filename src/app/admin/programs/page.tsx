import Link from "next/link";
import { requireAdmin } from "@/modules/auth/require-admin";
import { listAllPrograms, listUniversitiesForSelect } from "@/modules/admin/service";
import { updateProgram } from "@/modules/admin/actions";
import { ProgramForm } from "@/modules/admin/program-form";

const DEGREE_LABELS: Record<string, string> = {
  LANGUAGE: "语言班",
  PREP: "预科",
  BACHELOR: "本科",
  MASTER: "硕士",
  PHD: "博士",
  NON_DEGREE: "短期/交换",
};

const LANG_LABELS: Record<string, string> = {
  chinese: "中文授课",
  english: "英文授课",
  russian: "俄文授课",
};

export default async function AdminProgramsPage() {
  await requireAdmin();
  const [programs, universities] = await Promise.all([
    listAllPrograms(),
    listUniversitiesForSelect(),
  ]);

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: "0 16px" }}>
      <p>
        <Link href="/admin">← 返回看板</Link>
      </p>
      <h1>项目管理({programs.length})</h1>
      <p>
        <Link href="/admin/programs/new">＋ 录入新项目</Link>
      </p>
      <p style={{ color: "#666" }}>
        点开卡片即可就地编辑,保存后留在本页。待审核项目请优先在审核队列处理。
      </p>

      {programs.map((p) => (
        <details
          key={p.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            marginBottom: 8,
            padding: "0 12px",
          }}
        >
          <summary style={{ cursor: "pointer", padding: "10px 0", listStyle: "none" }}>
            <strong>{p.nameZh}</strong>{" "}
            <small style={{ color: "#888" }}>
              {p.university.nameZh} · {DEGREE_LABELS[p.degreeLevel] ?? p.degreeLevel}
              {p.teachingLanguages.length > 0 &&
                ` · ${p.teachingLanguages.map((l) => LANG_LABELS[l] ?? l).join("/")}`}{" "}
              · {p.dataStatus === "PUBLISHED" ? "已发布" : "待审核"}
              {p.lastVerifiedAt &&
                ` · 核实于 ${p.lastVerifiedAt.toLocaleDateString("zh-CN")}`}
            </small>
          </summary>
          <div style={{ borderTop: "1px solid #eee", paddingTop: 12, paddingBottom: 12 }}>
            <ProgramForm
              universities={universities}
              action={updateProgram.bind(null, p.id)}
              program={p}
              submitLabel="保存修改"
              redirectTo="/admin/programs"
            />
          </div>
        </details>
      ))}
    </main>
  );
}
