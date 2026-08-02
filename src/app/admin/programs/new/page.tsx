import Link from "next/link";
import { requireAdmin } from "@/modules/auth/require-admin";
import { createProgram } from "@/modules/admin/actions";
import { listUniversitiesForSelect } from "@/modules/admin/service";
import { ProgramForm } from "@/modules/admin/program-form";

export default async function NewProgramPage() {
  await requireAdmin();
  const universities = await listUniversitiesForSelect();

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <p>
        <Link href="/admin">← 返回看板</Link>
      </p>
      <h1>录入新项目</h1>
      <p style={{ color: "#666" }}>
        项目必须挂在某所学校下。提交后进入「待审核」队列,确认无误后在审核页一键发布。
      </p>

      <ProgramForm
        universities={universities}
        action={createProgram}
        submitLabel="保存(进入待审核)"
      />
    </main>
  );
}
