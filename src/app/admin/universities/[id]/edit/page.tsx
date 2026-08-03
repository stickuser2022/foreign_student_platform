import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/modules/auth/require-admin";
import { updateUniversity } from "@/modules/admin/actions";
import { getUniversity } from "@/modules/admin/service";
import { UniversityForm } from "@/modules/admin/university-form";

export default async function EditUniversityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const university = await getUniversity(id);
  if (!university) notFound();

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <p>
        <Link href="/admin/universities">← 返回学校管理</Link>
      </p>
      <h1>编辑学校:{university.nameZh}</h1>
      <p style={{ color: "#666" }}>
        状态:{university.dataStatus === "PUBLISHED" ? "已发布" : "待审核"}
        (编辑不会改变状态,保存后立即生效)
      </p>

      <UniversityForm
        action={updateUniversity.bind(null, university.id)}
        university={university}
        submitLabel="保存修改"
      />
    </main>
  );
}
