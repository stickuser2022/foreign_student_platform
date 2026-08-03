import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/modules/auth/require-admin";
import { updateScholarship } from "@/modules/admin/actions";
import { getScholarship, listUniversitiesForSelect } from "@/modules/admin/service";
import { ScholarshipForm } from "@/modules/admin/scholarship-form";

export default async function EditScholarshipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [scholarship, universities] = await Promise.all([
    getScholarship(id),
    listUniversitiesForSelect(),
  ]);
  if (!scholarship) notFound();

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <p>
        <Link href="/admin/scholarships">← 返回奖学金管理</Link>
      </p>
      <h1>编辑奖学金:{scholarship.name}</h1>
      <p style={{ color: "#666" }}>
        状态:{scholarship.dataStatus === "PUBLISHED" ? "已发布" : "待审核"}
        (编辑不会改变状态,保存后立即生效)
      </p>

      <ScholarshipForm
        universities={universities}
        action={updateScholarship.bind(null, scholarship.id)}
        scholarship={scholarship}
        submitLabel="保存修改"
      />
    </main>
  );
}
