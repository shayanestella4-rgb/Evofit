-- CreateTable
CREATE TABLE "consult_leads" (
    "id" TEXT NOT NULL,
    "nome" TEXT,
    "whatsapp" TEXT,
    "idade" TEXT,
    "sexo" TEXT,
    "objetivo" TEXT,
    "nivel" TEXT,
    "diasTreino" TEXT,
    "lesoes" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consult_leads_pkey" PRIMARY KEY ("id")
);
