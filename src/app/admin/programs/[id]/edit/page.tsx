import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/modules/auth/require-admin";
import { updateProgram } from "@/modules/admin/actions";
import { getProgram, listUniversitiesForSelect } from "@/modules/admin/service";
import { ProgramForm } from "@/modules/admin/program-form";

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [program, universities] = await Promise.all([
    getProgram(id),
    listUniversitiesForSelect(),
  ]);
  if (!program) notFound();

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <p>
        <Link href="/admin/programs">← 返回项目管理</Link>
      </p>
      <h1>编辑项目:{program.nameZh}</h1>
      <p style={{ color: "#666" }}>
        状态:{program.dataStatus === "PUBLISHED" ? "已发布" : "待审核"}
        (编辑不会改变状态,保存后立即生效)
      </p>

      <ProgramForm
        universities={universities}
        action={updateProgram.bind(null, program.id)}
        program={program}
        submitLabel="保存修改"
      />
    </main>
  );
}
