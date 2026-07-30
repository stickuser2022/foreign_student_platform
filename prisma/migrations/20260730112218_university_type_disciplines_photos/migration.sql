-- CreateEnum
CREATE TYPE "UniversityType" AS ENUM ('COMPREHENSIVE', 'SCIENCE_ENGINEERING', 'NORMAL', 'MEDICAL', 'FINANCE_ECONOMICS', 'LANGUAGE', 'AGRICULTURE_FORESTRY', 'ARTS', 'OTHER');

-- AlterTable
ALTER TABLE "universities" ADD COLUMN     "photos" TEXT[],
ADD COLUMN     "strongDisciplines" TEXT[],
ADD COLUMN     "universityType" "UniversityType" NOT NULL DEFAULT 'OTHER';
