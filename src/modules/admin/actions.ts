"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/db";
import { saveUpload } from "@/shared/upload";
import { requireAdmin } from "@/modules/auth/require-admin";
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

const UNIVERSITY_TYPES: UniversityType[] = [
  "COMPREHENSIVE",
  "SCIENCE_ENGINEERING",
  "NORMAL",
  "MEDICAL",
  "FINANCE_ECONOMICS",
  "LANGUAGE",
  "AGRICULTURE_FORESTRY",
  "ARTS",
  "OTHER",
];

// ---------- 审核队列:发布 ----------

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
    return v ? new Date(v) : null;
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
    return v ? new Date(v) : null;
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
  redirect("/admin/programs");
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
  redirect("/admin/universities");
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
    deadline: deadlineRaw ? new Date(deadlineRaw) : null,
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
  redirect("/admin/scholarships");
}

