import Link from "next/link";
import { readFileSync } from "fs";
import path from "path";
import { requireAdmin } from "@/modules/auth/require-admin";
import { listDrafts, listUniversitiesForSelect } from "@/modules/admin/service";
import {
  publishUniversity,
  publishProgram,
  publishScholarship,
  publishUniversityGroup,
  runVerify,
  updateUniversity,
  updateProgram,
  updateScholarship,
} from "@/modules/admin/actions";
import { UniversityForm } from "@/modules/admin/university-form";
import { ProgramForm } from "@/modules/admin/program-form";
import { ScholarshipForm } from "@/modules/admin/scholarship-form";

// 对齐校验报告(脚本审核生成;不存在则页面不显示徽章)
type Checks = Record<string, { ok: boolean; note?: string }>;
type VerifyReport = {
  generatedAt: string;
  programs: { id: string; checks: Checks }[];
  universities: { id: string; checks: Checks }[];
};

function loadVerifyReport(): VerifyReport | null {
  try {
    return JSON.parse(
      readFileSync(
        path.join(process.cwd(), "prisma", "data", "verify-report.json"),
        "utf-8"
      )
    );
  } catch {
    return null;
  }
}

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

function AlignBadge({ checks }: { checks: Checks }) {
  const entries = Object.entries(checks);
  const passed = entries.filter(([, c]) => c.ok).length;
  if (passed === entries.length) {
    return (
      <span style={{ color: "#16a34a", fontSize: 13, marginLeft: 12 }}>
        对齐 ✓ {passed}/{entries.length}
      </span>
    );
  }
  const failed = entries
    .filter(([, c]) => !c.ok)
    .map(([f, c]) => `${f}${c.note ? `(${c.note})` : ""}`)
    .join("; ");
  return (
    <span style={{ color: "#dc2626", fontSize: 13, marginLeft: 12 }}>
      对齐 {passed}/{entries.length} ❌ {failed}
    </span>
  );
}

export default async function ReviewPage() {
  await requireAdmin();
  const [drafts, universities] = await Promise.all([
    listDrafts(),
    listUniversitiesForSelect(),
  ]);

  const report = loadVerifyReport();
  const uniChecks = new Map(report?.universities.map((r) => [r.id, r.checks]));
  const progChecks = new Map(report?.programs.map((r) => [r.id, r.checks]));

  // ---------- 按学校分组 ----------
  type Group = {
    universityId: string;
    name: string;
    university: (typeof drafts.universities)[number] | null; // null = 学校已发布
    programs: typeof drafts.programs;
    scholarships: typeof drafts.scholarships;
  };
  const groupMap = new Map<string, Group>();
  const ensureGroup = (universityId: string, name: string): Group => {
    const existing = groupMap.get(universityId);
    if (existing) return existing;
    const g: Group = {
      universityId,
      name,
      university: drafts.universities.find((u) => u.id === universityId) ?? null,
      programs: [],
      scholarships: [],
    };
    groupMap.set(universityId, g);
    return g;
  };
  for (const p of drafts.programs)
    ensureGroup(p.universityId, p.university.nameZh).programs.push(p);
  for (const s of drafts.scholarships) {
    if (s.universityId) {
      const uni = drafts.universities.find((u) => u.id === s.universityId);
      ensureGroup(s.universityId, uni?.nameZh ?? "未知学校").scholarships.push(s);
    }
  }
  for (const u of drafts.universities) ensureGroup(u.id, u.nameZh);
  const groups = [...groupMap.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "zh-CN")
  );
  const platformScholarships = drafts.scholarships.filter((s) => !s.universityId);

  const allGreen = (ids: string[], checks: Map<string, Checks>) =>
    checks.size > 0 &&
    ids.every((id) => {
      const c = checks.get(id);
      return c && Object.values(c).every((x) => x.ok);
    });

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: "0 16px" }}>
      <p>
        <Link href="/admin">← 返回看板</Link>
      </p>
      <h1>审核队列</h1>
      <p style={{ color: "#666" }}>
        按学校分组:学校在上、项目在下。先看对齐徽章,全绿的组一键整组发布;有红只看红。
        学校的简介/俄文名/优势学科是 LLM 生成,无原文可对齐,需人工读一遍。
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
          padding: "8px 12px",
          background: "#f0f9ff",
          borderRadius: 8,
          border: "1px solid #bae6fd",
        }}
      >
        <form action={runVerify}>
          <button
            type="submit"
            style={{
              padding: "6px 16px",
              border: "none",
              borderRadius: 6,
              background: "#2563eb",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            🔄 脚本审核
          </button>
        </form>
        <small style={{ color: "#555" }}>
          {report
            ? `上次校验:${new Date(report.generatedAt).toLocaleString("zh-CN")}(改了草稿后要重新跑)`
            : "还没跑过校验,点左边按钮"}
        </small>
      </div>

      {groups.length === 0 && platformScholarships.length === 0 && (
        <p style={{ color: "#888" }}>队列是空的,没有待审核内容。</p>
      )}

      {groups.map((g) => {
        const progIds = g.programs.map((p) => p.id);
        const green =
          g.programs.length > 0 && allGreen(progIds, progChecks);
        return (
          <section
            key={g.universityId}
            style={{
              border: "2px solid #cbd5e1",
              borderRadius: 10,
              padding: "4px 16px 16px",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <h2 style={{ margin: "8px 0", fontSize: 20 }}>
                🏫 {g.name}{" "}
                <small style={{ fontSize: 13, color: "#888", fontWeight: "normal" }}>
                  {g.university ? "学校待审核" : "学校已发布"}
                  {g.programs.length > 0 && ` · 项目 ${g.programs.length}`}
                  {g.scholarships.length > 0 &&
                    ` · 奖学金 ${g.scholarships.length}`}
                  {g.programs.length > 0 &&
                    (green ? (
                      <span style={{ color: "#16a34a" }}> · 全绿 ✓</span>
                    ) : (
                      <span style={{ color: "#dc2626" }}> · 有红 ❌</span>
                    ))}
                </small>
              </h2>
              <form action={publishUniversityGroup.bind(null, g.universityId)}>
                <button
                  type="submit"
                  style={{
                    ...publishBtn,
                    background: green || g.programs.length === 0 ? "#16a34a" : "#9ca3af",
                    whiteSpace: "nowrap",
                  }}
                >
                  {g.university ? "学校+内容全部发布" : "内容全部发布"}
                </button>
              </form>
            </div>

            {/* 学校卡片(学校本身是草稿才显示) */}
            {g.university && (
              <details style={card}>
                <summary style={summaryStyle}>
                  <strong>学校信息</strong>{" "}
                  <small style={{ color: "#888" }}>
                    {g.university.province} · {g.university.city}
                  </small>
                  {uniChecks.get(g.university.id) && (
                    <AlignBadge checks={uniChecks.get(g.university.id)!} />
                  )}
                </summary>
                <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
                  <UniversityForm
                    action={updateUniversity.bind(null, g.university.id)}
                    university={g.university}
                    submitLabel="保存修改"
                    redirectTo="/admin/review"
                  />
                  <form
                    action={publishUniversity.bind(null, g.university.id)}
                    style={{ marginTop: 12, paddingBottom: 12 }}
                  >
                    <button type="submit" style={publishBtn}>
                      ✓ 发布学校
                    </button>
                  </form>
                </div>
              </details>
            )}

            {/* 项目卡片 */}
            {g.programs.map((p) => (
              <details key={p.id} style={card}>
                <summary style={summaryStyle}>
                  <strong>{p.nameZh}</strong>{" "}
                  <small style={{ color: "#888" }}>
                    {p.teachingLanguages.length > 0 &&
                      `${p.teachingLanguages.map((l) => ({ chinese: "中文", english: "英文", russian: "俄文" })[l] ?? l).join("/")}授课`}
                    {p.tuitionPerYear != null && ` · ¥${p.tuitionPerYear}/年`}
                  </small>
                  {ext(p.sourceUrl, "来源")}
                  {progChecks.get(p.id) && (
                    <AlignBadge checks={progChecks.get(p.id)!} />
                  )}
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
                      ✓ 发布
                    </button>
                  </form>
                </div>
              </details>
            ))}

            {/* 校级奖学金卡片 */}
            {g.scholarships.map((s) => (
              <details key={s.id} style={card}>
                <summary style={summaryStyle}>
                  <strong>🎓 {s.name}</strong>
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
                      ✓ 发布
                    </button>
                  </form>
                </div>
              </details>
            ))}
          </section>
        );
      })}

      {/* 平台级奖学金(不绑定学校) */}
      {platformScholarships.length > 0 && (
        <section>
          <h2>平台级奖学金({platformScholarships.length})</h2>
          {platformScholarships.map((s) => (
            <details key={s.id} style={card}>
              <summary style={summaryStyle}>
                <strong>🎓 {s.name}</strong>
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
                    ✓ 发布
                  </button>
                </form>
              </div>
            </details>
          ))}
        </section>
      )}
    </main>
  );
}
