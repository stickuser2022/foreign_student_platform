// 项目录入/编辑共用表单。program 为空 = 新建;有值 = 编辑(预填现有数据)
const DEGREES: { value: string; label: string }[] = [
  { value: "LANGUAGE", label: "语言班" },
  { value: "PREP", label: "预科" },
  { value: "BACHELOR", label: "本科" },
  { value: "MASTER", label: "硕士" },
  { value: "PHD", label: "博士" },
  { value: "NON_DEGREE", label: "短期/交换" },
];

const LANGS: { value: string; label: string }[] = [
  { value: "chinese", label: "中文授课" },
  { value: "english", label: "英文授课" },
  { value: "russian", label: "俄文授课" },
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
  step,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  defaultValue?: string | number;
  min?: number;
  step?: string;
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
        step={step}
        style={input}
      />
    </div>
  );
}

export type UniversityOption = {
  id: string;
  nameZh: string;
  city: string;
  dataStatus: string;
};

export type ProgramFormDefaults = {
  universityId: string;
  nameZh: string;
  nameRu: string | null;
  nameEn: string | null;
  degreeLevel: string;
  teachingLanguages: string[];
  durationYears: number | null;
  tuitionPerYear: number | null;
  hostelFeePerYear: number | null;
  insuranceFeePerYear: number | null;
  applicationFee: number | null;
  scholarshipNote: string | null;
  startDate: Date | null;
  applicationDeadline: Date | null;
  intake: string | null;
  requirements: string | null;
  sourceUrl: string | null;
};

// 日期字段 -> <input type="date"> 的 yyyy-mm-dd
const dateVal = (d: Date | null | undefined) =>
  d ? d.toISOString().slice(0, 10) : undefined;
const numVal = (n: number | null | undefined) => n ?? undefined;
const strVal = (s: string | null | undefined) => s ?? undefined;

export function ProgramForm({
  universities,
  action,
  program,
  submitLabel,
}: {
  universities: UniversityOption[];
  action: (formData: FormData) => void | Promise<void>;
  program?: ProgramFormDefaults;
  submitLabel: string;
}) {
  return (
    <form action={action}>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>
          所属学校<span style={{ color: "red" }}> *</span>
        </label>
        <select
          name="universityId"
          required
          style={input}
          defaultValue={program?.universityId ?? ""}
        >
          <option value="" disabled>
            — 请选择学校 —
          </option>
          {universities.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nameZh}({u.city})
              {u.dataStatus === "DRAFT" ? "[待审核]" : ""}
            </option>
          ))}
        </select>
      </div>

      <Field label="项目中文名" name="nameZh" required defaultValue={program?.nameZh} />
      <Field label="项目俄文名" name="nameRu" defaultValue={strVal(program?.nameRu)} />
      <Field label="项目英文名" name="nameEn" defaultValue={strVal(program?.nameEn)} />

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>层次</label>
        <select
          name="degreeLevel"
          style={input}
          defaultValue={program?.degreeLevel ?? "BACHELOR"}
        >
          {DEGREES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
        {LANGS.map((l) => (
          <label key={l.value}>
            <input
              type="checkbox"
              name="teachingLanguages"
              value={l.value}
              defaultChecked={program?.teachingLanguages.includes(l.value)}
            />{" "}
            {l.label}
          </label>
        ))}
      </div>

      <Field
        label="学制(年,可为小数,如 0.5 / 4)"
        name="durationYears"
        type="number"
        min={0}
        step="any"
        defaultValue={numVal(program?.durationYears)}
      />

      <fieldset style={{ border: "1px solid #ddd", borderRadius: 6, marginBottom: 12 }}>
        <legend style={{ padding: "0 6px", color: "#666" }}>
          费用(人民币/年,留空表示未知)
        </legend>
        <Field label="学费" name="tuitionPerYear" type="number" min={0} defaultValue={numVal(program?.tuitionPerYear)} />
        <Field label="住宿费" name="hostelFeePerYear" type="number" min={0} defaultValue={numVal(program?.hostelFeePerYear)} />
        <Field label="保险费" name="insuranceFeePerYear" type="number" min={0} defaultValue={numVal(program?.insuranceFeePerYear)} />
        <Field label="申请费(一次性)" name="applicationFee" type="number" min={0} defaultValue={numVal(program?.applicationFee)} />
      </fieldset>

      <Field label="入学批次(如 2026 秋季)" name="intake" defaultValue={strVal(program?.intake)} />
      <Field label="开学日期" name="startDate" type="date" defaultValue={dateVal(program?.startDate)} />
      <Field label="申请截止日期" name="applicationDeadline" type="date" defaultValue={dateVal(program?.applicationDeadline)} />

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>
          奖学金说明(如「可申请 CSC + 校长奖学金」)
        </label>
        <textarea name="scholarshipNote" rows={2} style={input} defaultValue={program?.scholarshipNote ?? ""} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>
          申请要求(语言/学历/HSK 等)
        </label>
        <textarea name="requirements" rows={4} style={input} defaultValue={program?.requirements ?? ""} />
      </div>
      <Field
        label="信息来源 URL(官网项目页,强烈建议填)"
        name="sourceUrl"
        placeholder="https://"
        defaultValue={strVal(program?.sourceUrl)}
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
