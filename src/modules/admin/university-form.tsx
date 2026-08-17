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
  logoUrl: string | null;
  photos: string[];
  universityType: string;
  is985: boolean;
  is211: boolean;
  isDoubleFirstClass: boolean;
  livingCostPerMonth: number | null;
  strongDisciplines: string[];
  strongDisciplinesRu: string[];
  descriptionZh: string | null;
  descriptionRu: string | null;
  sourceUrl: string | null;
};

const strVal = (s: string | null | undefined) => s ?? undefined;

export function UniversityForm({
  action,
  university,
  submitLabel,
  redirectTo,
}: {
  action: (formData: FormData) => void | Promise<void>;
  university?: UniversityFormDefaults;
  submitLabel: string;
  // 保存后跳转目标(默认由各 action 决定;审核页嵌入时传 /admin/review)
  redirectTo?: string;
}) {
  return (
    <form action={action}>
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
      <Field label="slug(网址标识,如 tsinghua)" name="slug" required defaultValue={university?.slug} />
      <Field label="中文名" name="nameZh" required defaultValue={university?.nameZh} />
      <Field label="俄文名" name="nameRu" defaultValue={strVal(university?.nameRu)} />
      <Field label="英文名" name="nameEn" defaultValue={strVal(university?.nameEn)} />
      <Field label="省份(中文)" name="province" required defaultValue={university?.province} />
      <Field label="城市(中文)" name="city" required defaultValue={university?.city} />
      <Field label="官网" name="website" placeholder="https://" defaultValue={strVal(university?.website)} />

      <fieldset style={{ border: "1px solid #ddd", borderRadius: 6, marginBottom: 12 }}>
        <legend style={{ padding: "0 6px", color: "#666" }}>
          校徽 Logo(上传文件 或 粘贴外链,二选一;上传优先)
        </legend>
        {university?.logoUrl && (
          <p style={{ margin: "0 0 8px" }}>
            当前:
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={university.logoUrl}
              alt="logo"
              style={{ height: 40, verticalAlign: "middle", marginLeft: 8 }}
            />
          </p>
        )}
        {university && !university.logoUrl && (
          <p style={{ margin: "0 0 8px", color: "#b45309", fontSize: 13 }}>
            ⚠ 未抓取到校徽,请自行搜索后上传:
            <a
              href={`https://cn.bing.com/images/search?q=${encodeURIComponent(university.nameZh + " 校徽")}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#2563eb", marginLeft: 6 }}
            >
              搜「{university.nameZh} 校徽」↗
            </a>
          </p>
        )}
        <div style={{ marginBottom: 8 }}>
          <input type="file" name="logoFile" accept="image/*" />
        </div>
        <Field
          label="或图片外链 URL(清空并保存 = 不换图时保持原值)"
          name="logoUrl"
          placeholder="https:// 或 /uploads/..."
          defaultValue={strVal(university?.logoUrl)}
        />
      </fieldset>

      <fieldset style={{ border: "1px solid #ddd", borderRadius: 6, marginBottom: 12 }}>
        <legend style={{ padding: "0 6px", color: "#666" }}>
          校园/宿舍实拍图(可多选上传,和/或每行一个外链)
        </legend>
        <div style={{ marginBottom: 8 }}>
          <input type="file" name="photoFiles" accept="image/*" multiple />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4 }}>
            图片 URL 列表(每行一个;新上传的文件会追加到列表末尾)
          </label>
          <textarea
            name="photos"
            rows={3}
            style={input}
            defaultValue={university?.photos.join("\n") ?? ""}
          />
        </div>
      </fieldset>

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
        <label style={{ display: "block", marginBottom: 4 }}>
          优势学科(俄文,翻译脚本生成;前台只显示俄文)
        </label>
        <textarea
          name="strongDisciplinesRu"
          rows={3}
          style={input}
          defaultValue={university?.strongDisciplinesRu.join(",") ?? ""}
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
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>
          信息来源 URL
          {university?.sourceUrl && (
            <a
              href={university.sourceUrl}
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
          defaultValue={strVal(university?.sourceUrl)}
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
