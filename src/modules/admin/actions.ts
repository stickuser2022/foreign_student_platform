"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/db";
import { requireAdmin } from "@/modules/auth/require-admin";
import type { UniversityType, DegreeLevel } from "@/generated/prisma/enums";

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

  await prisma.university.create({
    data: {
      slug,
      nameZh,
      nameRu: get("nameRu"),
      nameEn: get("nameEn"),
      city,
      province,
      website: get("website"),
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

