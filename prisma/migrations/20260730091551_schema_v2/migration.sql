-- CreateEnum
CREATE TYPE "DataStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "dataStatus" "DataStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "hostelFeePerYear" INTEGER,
ADD COLUMN     "insuranceFeePerYear" INTEGER,
ADD COLUMN     "lastVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "scholarshipNote" TEXT,
ADD COLUMN     "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "scholarships" ADD COLUMN     "dataStatus" "DataStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "lastVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "universities" ADD COLUMN     "dataStatus" "DataStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "lastVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "livingCostPerMonth" INTEGER,
ADD COLUMN     "sourceUrl" TEXT;

-- CreateTable
CREATE TABLE "favorite_universities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_programs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "intendedDegree" "DegreeLevel",
    "intendedMajor" TEXT,
    "budgetPerYear" INTEGER,
    "cityPreference" TEXT,
    "languageBackground" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favorite_universities_userId_universityId_key" ON "favorite_universities"("userId", "universityId");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_programs_userId_programId_key" ON "favorite_programs"("userId", "programId");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_userId_key" ON "student_profiles"("userId");

-- AddForeignKey
ALTER TABLE "favorite_universities" ADD CONSTRAINT "favorite_universities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_universities" ADD CONSTRAINT "favorite_universities_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_programs" ADD CONSTRAINT "favorite_programs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_programs" ADD CONSTRAINT "favorite_programs_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
