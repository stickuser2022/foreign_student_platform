"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/db";
import { saveUpload } from "@/shared/upload";
import { requireAdmin } from "@/modules/auth/require-admin";
import { runVerifyDrafts } from "@/modules/admin/verify";
import type { UniversityType, DegreeLevel, ScholarshipType } from "@/generated/prisma/enums";

const SCHOLARSHIP_TYPES: ScholarshipType[] = [
  "CSC",
  "PROVINCIAL",
  "UNIVERSITY",
  "OTHER",
];

const DEGREE_LEVELS: DegreeLevel[] = [
  "LANGUAGE",
  "PREP",
  "BACHELOR",
  "MASTER",
  "PHD",
  "NON_DEGREE",
];

// 表单里的 redirectTo 只允许跳回 /admin 内部,防开放重定向
function safeAdminRedirect(formData: FormData, fallback: string): string {
  const to = formData.get("redirectTo");
  return typeof to === "string" && to.startsWith("/admin") ? to : fallback;
}

const UNIVERSITY_TYPES: UniversityType[] = [  "COMPREHENSIVE",
  "SCIENCE_ENGINEERING",
  "NORMAL",
  "MEDICAL",
  "FINANCE_ECONOMICS",
  "LANGUAGE",
  "AGRICULTURE_FORESTRY",
  "ARTS",
  "OTHER",
];

// 表单 date 输入的值是 "YYYY-MM-DD",按 UTC 中午 12 点存,
// 全球任何时区(±12h)读出/显示都是同一天(否则负时区会差一天)
function parseDateOnly(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

// ---------- 审核队列:发布 ----------

// 整组发布:学校(若是草稿)+ 该校全部待审核项目/奖学金,一键搞定
export async function publishUniversityGroup(universityId: string) {
  await requireAdmin();
  const now = new Date();
  await prisma.$transaction([
    prisma.university.updateMany({
      where: { id: universityId, dataStatus: "DRAFT" },
      data: { dataStatus: "PUBLISHED", lastVerifiedAt: now },
    }),
    prisma.program.updateMany({
      where: { universityId, dataStatus: "DRAFT" },
      data: { dataStatus: "PUBLISHED", lastVerifiedAt: now },
    }),
    prisma.scholarship.updateMany({
      where: { universityId, dataStatus: "DRAFT" },
      data: { dataStatus: "PUBLISHED", lastVerifiedAt: now },
    }),
  ]);
  revalidatePath("/admin/review");
}

// ---------- 审核队列:脚本审核(重新跑对齐校验,可能要十几秒) ----------

export async function runVerify() {
  await requireAdmin();
  await runVerifyDrafts();
  revalidatePath("/admin/review");
}

export async function publishUniversity(id: string) {
  await requireAdmin();
  await prisma.university.update({
    where: { id },
    data: { dataStatus: "PUBLISHED", lastVerifiedAt: new Date() },
  });
  revalidatePath("/admin/review");
}

export async function publishProgram(id: string) {
  await requireAdmin();
  await prisma.program.update({
    where: { id },
    data: { dataStatus: "PUBLISHED", lastVerifiedAt: new Date() },
  });
  revalidatePath("/admin/review");
}

export async function publishScholarship(id: string) {
  await requireAdmin();
  await prisma.scholarship.update({
    where: { id },
    data: { dataStatus: "PUBLISHED", lastVerifiedAt: new Date() },
  });
  revalidatePath("/admin/review");
}

// ---------- 录入:新学校(建为待审核,走确认队列) ----------

export async function createUniversity(formData: FormData) {
  await requireAdmin();

  const get = (k: string) => (formData.get(k) as string | null)?.trim() || null;
  const slug = get("slug");
  const nameZh = get("nameZh");
  const city = get("city");
  const province = get("province");
  if (!slug || !nameZh || !city || !province) {
    throw new Error("slug / 中文名 / 省份 / 城市 为必填");
  }

  const typeRaw = get("universityType");
  const universityType = UNIVERSITY_TYPES.includes(typeRaw as UniversityType)
    ? (typeRaw as UniversityType)
    : "OTHER";

  // 图片:上传文件优先于外链 URL
  const logoUrl =
    (await saveUpload(formData.get("logoFile"))) ?? get("logoUrl");
  const photoPaths = (
    await Promise.all(
      formData.getAll("photoFiles").map((f) => saveUpload(f))
    )
  ).filter((p): p is string => p != null);
  const photoUrls = (get("photos") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  await prisma.university.create({
    data: {
      slug,
      nameZh,
      nameRu: get("nameRu"),
      nameEn: get("nameEn"),
      city,
      province,
      website: get("website"),
      logoUrl,
      photos: [...photoUrls, ...photoPaths],
      universityType,
      is985: formData.get("is985") === "on",
      is211: formData.get("is211") === "on",
      isDoubleFirstClass: formData.get("isDoubleFirstClass") === "on",
      livingCostPerMonth: get("livingCostPerMonth")
        ? Number(get("livingCostPerMonth"))
        : null,
      strongDisciplines: (get("strongDisciplines") ?? "")
        .split(/[,,\n]/)
        .map((s) => s.trim())
        .filter(Boolean),
      descriptionZh: get("descriptionZh"),
      descriptionRu: get("descriptionRu"),
      sourceUrl: get("sourceUrl"),
      dataStatus: "DRAFT",
    },
  });

  revalidatePath("/admin/review");
  redirect("/admin/review");
}

// ---------- 录入:新项目(建为待审核,走确认队列) ----------

export async function createProgram(formData: FormData) {
  await requireAdmin();

  const get = (k: string) => (formData.get(k) as string | null)?.trim() || null;
  const num = (k: string) => {
    const v = get(k);
    return v ? Number(v) : null;
  };
  const date = (k: string) => {
    const v = get(k);
    return v ? parseDateOnly(v) : null;
  };

  const universityId = get("universityId");
  const nameZh = get("nameZh");
  if (!universityId || !nameZh) {
    throw new Error("所属学校 / 中文名 为必填");
  }

  const degreeRaw = get("degreeLevel");
  const degreeLevel = DEGREE_LEVELS.includes(degreeRaw as DegreeLevel)
    ? (degreeRaw as DegreeLevel)
    : "BACHELOR";

  const teachingLanguages = formData
    .getAll("teachingLanguages")
    .map(String)
    .filter((l) => ["chinese", "english", "russian"].includes(l));

  await prisma.program.create({
    data: {
      universityId,
      nameZh,
      nameRu: get("nameRu"),
      nameEn: get("nameEn"),
      degreeLevel,
      teachingLanguages,
      durationYears: num("durationYears"),
      tuitionPerYear: num("tuitionPerYear"),
      hostelFeePerYear: num("hostelFeePerYear"),
      insuranceFeePerYear: num("insuranceFeePerYear"),
      applicationFee: num("applicationFee"),
      scholarshipNote: get("scholarshipNote"),
      startDate: date("startDate"),
      applicationDeadline: date("applicationDeadline"),
      intake: get("intake"),
      requirements: get("requirements"),
      sourceUrl: get("sourceUrl"),
      dataStatus: "DRAFT",
    },
  });

  revalidatePath("/admin/review");
  redirect("/admin/review");
}

// ---------- 编辑:已有项目(不改审核状态,不动 lastVerifiedAt) ----------

export async function updateProgram(id: string, formData: FormData) {
  await requireAdmin();

  const get = (k: string) => (formData.get(k) as string | null)?.trim() || null;
  const num = (k: string) => {
    const v = get(k);
    return v ? Number(v) : null;
  };
  const date = (k: string) => {
    const v = get(k);
    return v ? parseDateOnly(v) : null;
  };

  const universityId = get("universityId");
  const nameZh = get("nameZh");
  if (!universityId || !nameZh) {
    throw new Error("所属学校 / 中文名 为必填");
  }

  const degreeRaw = get("degreeLevel");
  const degreeLevel = DEGREE_LEVELS.includes(degreeRaw as DegreeLevel)
    ? (degreeRaw as DegreeLevel)
    : "BACHELOR";

  const teachingLanguages = formData
    .getAll("teachingLanguages")
    .map(String)
    .filter((l) => ["chinese", "english", "russian"].includes(l));

  await prisma.program.update({
    where: { id },
    data: {
      universityId,
      nameZh,
      nameRu: get("nameRu"),
      nameEn: get("nameEn"),
      degreeLevel,
      teachingLanguages,
      durationYears: num("durationYears"),
      tuitionPerYear: num("tuitionPerYear"),
      hostelFeePerYear: num("hostelFeePerYear"),
      insuranceFeePerYear: num("insuranceFeePerYear"),
      applicationFee: num("applicationFee"),
      scholarshipNote: get("scholarshipNote"),
      startDate: date("startDate"),
      applicationDeadline: date("applicationDeadline"),
      intake: get("intake"),
      requirements: get("requirements"),
      sourceUrl: get("sourceUrl"),
    },
  });

  revalidatePath("/admin/programs");
  revalidatePath(`/programs/${id}`);
  redirect(safeAdminRedirect(formData, "/admin/programs"));
}

// ---------- 编辑:已有学校(不改审核状态,不动 lastVerifiedAt) ----------

export async function updateUniversity(id: string, formData: FormData) {
  await requireAdmin();

  const get = (k: string) => (formData.get(k) as string | null)?.trim() || null;
  const slug = get("slug");
  const nameZh = get("nameZh");
  const city = get("city");
  const province = get("province");
  if (!slug || !nameZh || !city || !province) {
    throw new Error("slug / 中文名 / 省份 / 城市 为必填");
  }

  const typeRaw = get("universityType");
  const universityType = UNIVERSITY_TYPES.includes(typeRaw as UniversityType)
    ? (typeRaw as UniversityType)
    : "OTHER";

  // 图片:上传文件优先于外链 URL;都没给则保持原值(编辑页 URL 框已预填,
  // 用户清空 URL 框视为不变更 logo,避免误丢图)
  const existing = await prisma.university.findUnique({
    where: { id },
    select: { logoUrl: true },
  });
  const logoUrl =
    (await saveUpload(formData.get("logoFile"))) ??
    get("logoUrl") ??
    existing?.logoUrl ??
    null;
  const photoPaths = (
    await Promise.all(
      formData.getAll("photoFiles").map((f) => saveUpload(f))
    )
  ).filter((p): p is string => p != null);
  const photoUrls = (get("photos") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  await prisma.university.update({
    where: { id },
    data: {
      slug,
      nameZh,
      nameRu: get("nameRu"),
      nameEn: get("nameEn"),
      city,
      province,
      website: get("website"),
      logoUrl,
      photos: [...photoUrls, ...photoPaths],
      universityType,
      is985: formData.get("is985") === "on",
      is211: formData.get("is211") === "on",
      isDoubleFirstClass: formData.get("isDoubleFirstClass") === "on",
      livingCostPerMonth: get("livingCostPerMonth")
        ? Number(get("livingCostPerMonth"))
        : null,
      strongDisciplines: (get("strongDisciplines") ?? "")
        .split(/[,,\n]/)
        .map((s) => s.trim())
        .filter(Boolean),
      descriptionZh: get("descriptionZh"),
      descriptionRu: get("descriptionRu"),
      sourceUrl: get("sourceUrl"),
    },
  });

  revalidatePath("/admin/universities");
  revalidatePath(`/universities/${slug}`);
  redirect(safeAdminRedirect(formData, "/admin/universities"));
}

// ---------- 录入:新奖学金(建为待审核,走确认队列) ----------

function parseScholarshipForm(formData: FormData) {
  const get = (k: string) => (formData.get(k) as string | null)?.trim() || null;

  const name = get("name");
  if (!name) {
    throw new Error("奖学金名称为必填");
  }

  const typeRaw = get("type");
  const type = SCHOLARSHIP_TYPES.includes(typeRaw as ScholarshipType)
    ? (typeRaw as ScholarshipType)
    : "OTHER";

  const deadlineRaw = get("deadline");

  return {
    name,
    type,
    universityId: get("universityId"),
    coverage: get("coverage"),
    deadline: deadlineRaw ? parseDateOnly(deadlineRaw) : null,
    applicationChannel: get("applicationChannel"),
    description: get("description"),
    sourceUrl: get("sourceUrl"),
  };
}

export async function createScholarship(formData: FormData) {
  await requireAdmin();
  const data = parseScholarshipForm(formData);

  await prisma.scholarship.create({
    data: { ...data, dataStatus: "DRAFT" },
  });

  revalidatePath("/admin/review");
  redirect("/admin/review");
}

// ---------- 编辑:已有奖学金(不改审核状态,不动 lastVerifiedAt) ----------

export async function updateScholarship(id: string, formData: FormData) {
  await requireAdmin();
  const data = parseScholarshipForm(formData);

  await prisma.scholarship.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/scholarships");
  revalidatePath("/scholarships");
  redirect(safeAdminRedirect(formData, "/admin/scholarships"));
}

