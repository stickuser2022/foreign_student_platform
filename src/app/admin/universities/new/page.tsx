import Link from "next/link";
import { requireAdmin } from "@/modules/auth/require-admin";
import { createUniversity } from "@/modules/admin/actions";

const TYPES: { value: string; label: string }[] = [
  { value: "COMPREHENSIVE", label: "综合类" },
  { value: "SCIENCE_ENGINEERING", label: "理工类" },
  { value: "NORMAL", label: "师范类" },
  { value: "MEDICAL", label: "医药类" },
  { value: "FINANCE_ECONOMICS", label: "财经类" },
  { value: "LANGUAGE", label: "语言类" },
  { value: "AGRICULTURE_FORESTRY", label: "农林类" },
  { value: "ARTS", label: "艺术类" },
  { value: "OTHER", label: "其他" },
];

const input = {
  width: "100%",
  padding: 8,
  border: "1px solid #ccc",
  borderRadius: 6,
  boxSizing: "border-box",
} as const;

function Field({
  label,
  name,
  required = false,
  type = "text",
  placeholder,
  min,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  min?: number;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", marginBottom: 4 }}>
        {label}
        {required && <span style={{ color: "red" }}> *</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        min={min}
        style={input}
      />
    </div>
  );
}

export default async function NewUniversityPage() {
  await requireAdmin();

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <p>
        <Link href="/admin">← 返回看板</Link>
      </p>
      <h1>录入新学校</h1>
      <p style={{ color: "#666" }}>
        提交后进入「待审核」队列,确认无误后在审核页一键发布,才会出现在前台。
      </p>

      <form action={createUniversity}>
        <Field label="slug(网址标识,如 tsinghua)" name="slug" required />
        <Field label="中文名" name="nameZh" required />
        <Field label="俄文名" name="nameRu" />
        <Field label="英文名" name="nameEn" />
        <Field label="省份(中文)" name="province" required />
        <Field label="城市(中文)" name="city" required />
        <Field label="官网" name="website" placeholder="https://" />

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4 }}>学校类型</label>
          <select name="universityType" style={input} defaultValue="OTHER">
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
          <label>
            <input type="checkbox" name="is985" /> 985
          </label>
          <label>
            <input type="checkbox" name="is211" /> 211
          </label>
          <label>
            <input type="checkbox" name="isDoubleFirstClass" /> 双一流
          </label>
        </div>

        <Field
          label="每月生活费预估(元/月,城市级经验值)"
          name="livingCostPerMonth"
          type="number"
          min={0}
        />
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4 }}>
            优势学科(逗号或换行分隔,可空)
          </label>
          <textarea name="strongDisciplines" rows={3} style={input} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4 }}>简介(中文)</label>
          <textarea name="descriptionZh" rows={4} style={input} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4 }}>简介(俄文,LLM 草稿后人工复核)</label>
          <textarea name="descriptionRu" rows={4} style={input} />
        </div>
        <Field
          label="信息来源 URL(官网国际招生页,必填字段之外但强烈建议)"
          name="sourceUrl"
          placeholder="https://"
        />

        <button
          type="submit"
          style={{
            padding: "10px 24px",
            border: "none",
            borderRadius: 6,
            background: "#2563eb",
            color: "#fff",
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          保存(进入待审核)
        </button>
      </form>
    </main>
  );
}
