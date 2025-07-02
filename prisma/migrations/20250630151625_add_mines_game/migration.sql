-- CreateTable
CREATE TABLE "MinesGame" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "betAmount" INTEGER,
    "currentMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "cashOutMultiplier" DOUBLE PRECISION,
    "autoCashOut" DOUBLE PRECISION,
    "gridSize" INTEGER NOT NULL DEFAULT 25,
    "minesCount" INTEGER NOT NULL DEFAULT 5,
    "minePositions" JSONB NOT NULL,
    "revealedCells" JSONB NOT NULL DEFAULT '[]',
    "gameStatus" TEXT NOT NULL DEFAULT 'active',
    "winAmount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MinesGame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MinesGame_userId_idx" ON "MinesGame"("userId");

-- AddForeignKey
ALTER TABLE "MinesGame" ADD CONSTRAINT "MinesGame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
