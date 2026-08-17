-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "requirementsRu" TEXT,
ADD COLUMN     "scholarshipNoteRu" TEXT;

-- AlterTable
ALTER TABLE "scholarships" ADD COLUMN     "coverageRu" TEXT,
ADD COLUMN     "descriptionRu" TEXT,
ADD COLUMN     "nameRu" TEXT;
