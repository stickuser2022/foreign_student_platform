// 奖学金录入/编辑共用表单。scholarship 为空 = 新建;有值 = 编辑(预填现有数据)
import type { UniversityOption } from "./program-form";

export const SCHOLARSHIP_TYPES: { value: string; label: string }[] = [
  { value: "CSC", label: "中国政府奖学金(CSC)" },
  { value: "PROVINCIAL", label: "省级政府奖学金" },
  { value: "UNIVERSITY", label: "校内奖学金" },
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
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
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
        defaultValue={defaultValue}
        style={input}
      />
    </div>
  );
}

export type ScholarshipFormDefaults = {
  universityId: string | null;
  name: string;
  nameRu: string | null;
  type: string;
  coverage: string | null;
  coverageRu: string | null;
  deadline: Date | null;
  applicationChannel: string | null;
  description: string | null;
  descriptionRu: string | null;
  sourceUrl: string | null;
};

const strVal = (s: string | null | undefined) => s ?? undefined;
const dateVal = (d: Date | null | undefined) =>
  d ? d.toISOString().slice(0, 10) : undefined;

export function ScholarshipForm({
  universities,
  action,
  scholarship,
  submitLabel,
  redirectTo,
}: {
  universities: UniversityOption[];
  action: (formData: FormData) => void | Promise<void>;
  scholarship?: ScholarshipFormDefaults;
  submitLabel: string;
  redirectTo?: string;
}) {
  return (
    <form action={action}>
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
      <Field label="奖学金名称" name="name" required defaultValue={scholarship?.name} />
      <Field label="奖学金俄文名(翻译脚本生成后复核)" name="nameRu" defaultValue={strVal(scholarship?.nameRu)} />

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>类型</label>
        <select name="type" style={input} defaultValue={scholarship?.type ?? "UNIVERSITY"}>
          {SCHOLARSHIP_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>
          绑定学校(不选 = 平台级奖学金,如 CSC 不限定某所学校)
        </label>
        <select
          name="universityId"
          style={input}
          defaultValue={scholarship?.universityId ?? ""}
        >
          <option value="">— 平台级(不限学校)—</option>
          {universities.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nameZh}({u.city})
              {u.dataStatus === "DRAFT" ? "[待审核]" : ""}
            </option>
          ))}
        </select>
      </div>

      <Field
        label="覆盖范围(如:学费全免 + 住宿 + 每月生活费 3000 元)"
        name="coverage"
        defaultValue={strVal(scholarship?.coverage)}
      />
      <Field
        label="覆盖范围(俄文)"
        name="coverageRu"
        defaultValue={strVal(scholarship?.coverageRu)}
      />
      <Field label="申请截止日期" name="deadline" type="date" defaultValue={dateVal(scholarship?.deadline)} />

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>
          申请通道(如 CSC 系统 + Agency Number 说明)
        </label>
        <textarea name="applicationChannel" rows={2} style={input} defaultValue={scholarship?.applicationChannel ?? ""} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>说明</label>
        <textarea name="description" rows={4} style={input} defaultValue={scholarship?.description ?? ""} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>说明(俄文)</label>
        <textarea name="descriptionRu" rows={4} style={input} defaultValue={scholarship?.descriptionRu ?? ""} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>
          信息来源 URL(官方奖学金页,强烈建议填)
          {scholarship?.sourceUrl && (
            <a
              href={scholarship.sourceUrl}
              target="_blank"
              rel="noreferrer"
              style={{ marginLeft: 12, color: "#2563eb", fontWeight: "normal" }}
            >
              访问 ↗
            </a>
          )}
        </label>
        <input
          name="sourceUrl"
          type="text"
          placeholder="https://"
          defaultValue={strVal(scholarship?.sourceUrl)}
          style={input}
        />
      </div>

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
        {submitLabel}
      </button>
    </form>
  );
}
