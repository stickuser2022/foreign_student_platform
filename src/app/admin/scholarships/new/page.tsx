import Link from "next/link";
import { requireAdmin } from "@/modules/auth/require-admin";
import { createScholarship } from "@/modules/admin/actions";
import { listUniversitiesForSelect } from "@/modules/admin/service";
import { ScholarshipForm } from "@/modules/admin/scholarship-form";

export default async function NewScholarshipPage() {
  await requireAdmin();
  const universities = await listUniversitiesForSelect();

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <p>
        <Link href="/admin">← 返回看板</Link>
      </p>
      <h1>录入新奖学金</h1>
      <p style={{ color: "#666" }}>
        不绑定学校即为平台级奖学金(如 CSC)。提交后进入「待审核」队列,确认无误后在审核页一键发布。
      </p>

      <ScholarshipForm
        universities={universities}
        action={createScholarship}
        submitLabel="保存(进入待审核)"
      />
    </main>
  );
}
