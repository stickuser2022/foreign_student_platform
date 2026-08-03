import Link from "next/link";
import { requireAdmin } from "@/modules/auth/require-admin";
import { createUniversity } from "@/modules/admin/actions";
import { UniversityForm } from "@/modules/admin/university-form";

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

      <UniversityForm action={createUniversity} submitLabel="保存(进入待审核)" />
    </main>
  );
}
