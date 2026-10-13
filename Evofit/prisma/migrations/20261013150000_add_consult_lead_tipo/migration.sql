-- AlterTable
ALTER TABLE "consult_leads" ADD COLUMN "tipo" TEXT NOT NULL DEFAULT 'comum';
ALTER TABLE "consult_leads" ADD COLUMN "respostas" JSONB;
