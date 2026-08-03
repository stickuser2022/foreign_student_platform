// 学校录入/编辑共用表单。university 为空 = 新建;有值 = 编辑(预填现有数据)
export const TYPES: { value: string; label: string }[] = [
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
  defaultValue,
  min,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  defaultValue?: string | number;
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
        defaultValue={defaultValue}
        min={min}
        style={input}
      />
    </div>
  );
}

export type UniversityFormDefaults = {
  slug: string;
  nameZh: string;
  nameRu: string | null;
  nameEn: string | null;
  city: string;
  province: string;
  website: string | null;
  universityType: string;
  is985: boolean;
  is211: boolean;
  isDoubleFirstClass: boolean;
  livingCostPerMonth: number | null;
  strongDisciplines: string[];
  descriptionZh: string | null;
  descriptionRu: string | null;
  sourceUrl: string | null;
};

const strVal = (s: string | null | undefined) => s ?? undefined;

export function UniversityForm({
  action,
  university,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  university?: UniversityFormDefaults;
  submitLabel: string;
}) {
  return (
    <form action={action}>
      <Field label="slug(网址标识,如 tsinghua)" name="slug" required defaultValue={university?.slug} />
      <Field label="中文名" name="nameZh" required defaultValue={university?.nameZh} />
      <Field label="俄文名" name="nameRu" defaultValue={strVal(university?.nameRu)} />
      <Field label="英文名" name="nameEn" defaultValue={strVal(university?.nameEn)} />
      <Field label="省份(中文)" name="province" required defaultValue={university?.province} />
      <Field label="城市(中文)" name="city" required defaultValue={university?.city} />
      <Field label="官网" name="website" placeholder="https://" defaultValue={strVal(university?.website)} />

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>学校类型</label>
        <select
          name="universityType"
          style={input}
          defaultValue={university?.universityType ?? "OTHER"}
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
        <label>
          <input type="checkbox" name="is985" defaultChecked={university?.is985} /> 985
        </label>
        <label>
          <input type="checkbox" name="is211" defaultChecked={university?.is211} /> 211
        </label>
        <label>
          <input type="checkbox" name="isDoubleFirstClass" defaultChecked={university?.isDoubleFirstClass} /> 双一流
        </label>
      </div>

      <Field
        label="每月生活费预估(元/月,城市级经验值)"
        name="livingCostPerMonth"
        type="number"
        min={0}
        defaultValue={university?.livingCostPerMonth ?? undefined}
      />
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>
          优势学科(逗号或换行分隔,可空)
        </label>
        <textarea
          name="strongDisciplines"
          rows={3}
          style={input}
          defaultValue={university?.strongDisciplines.join(",") ?? ""}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>简介(中文)</label>
        <textarea name="descriptionZh" rows={4} style={input} defaultValue={university?.descriptionZh ?? ""} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>简介(俄文,LLM 草稿后人工复核)</label>
        <textarea name="descriptionRu" rows={4} style={input} defaultValue={university?.descriptionRu ?? ""} />
      </div>
      <Field
        label="信息来源 URL(官网国际招生页,必填字段之外但强烈建议)"
        name="sourceUrl"
        placeholder="https://"
        defaultValue={strVal(university?.sourceUrl)}
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
        {submitLabel}
      </button>
    </form>
  );
}
