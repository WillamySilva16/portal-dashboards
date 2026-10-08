-- CreateTable
CREATE TABLE "VagaPosicao" (
    "id" SERIAL NOT NULL,
    "solicitacao" INTEGER NOT NULL,
    "vaga" INTEGER NOT NULL,
    "posicao" INTEGER NOT NULL,
    "status" TEXT,
    "data" DATE NOT NULL,
    "fechamento" TIMESTAMP(3),
    "sla" TEXT,
    "solicitante" TEXT,
    "cargo" TEXT,
    "categoria" TEXT,
    "cliente" TEXT,
    "local" TEXT,
    "segmento" TEXT,
    "supervisao" TEXT,
    "base" TEXT,
    "qtdSolicitada" INTEGER,
    "qtdAprovada" INTEGER,
    "fase" TEXT,
    "situacaoFase" TEXT,
    "importadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VagaPosicao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VagaPosicao_data_idx" ON "VagaPosicao"("data");

-- CreateIndex
CREATE INDEX "VagaPosicao_vaga_idx" ON "VagaPosicao"("vaga");
