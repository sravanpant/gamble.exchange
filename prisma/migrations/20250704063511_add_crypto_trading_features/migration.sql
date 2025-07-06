/*
  Warnings:

  - You are about to drop the `MinesGame` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('OPEN', 'TRADING_CLOSED', 'SETTLING', 'SETTLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TradeType" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('COMPLETED', 'PENDING', 'FAILED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('POINTS_DEPOSIT', 'POINTS_WITHDRAWAL', 'MINES_BET', 'MINES_WIN', 'CRYPTO_DEPOSIT', 'CRYPTO_WITHDRAWAL', 'TRADE_BUY', 'TRADE_SELL', 'REWARD', 'FEE');

-- DropForeignKey
ALTER TABLE "MinesGame" DROP CONSTRAINT "MinesGame_userId_fkey";

-- DropTable
DROP TABLE "MinesGame";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "wallet_address" TEXT NOT NULL,
    "wallet_address_lower" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1000,
    "cryptoBalance" DECIMAL(18,6) NOT NULL DEFAULT 0.0,
    "isFirstLogin" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("wallet_address")
);

-- CreateTable
CREATE TABLE "mines_games" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "betAmount" INTEGER NOT NULL,
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

    CONSTRAINT "mines_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "outcomeType" TEXT NOT NULL DEFAULT 'Boolean',
    "eventDateTime" TIMESTAMP(3) NOT NULL,
    "settlementDateTime" TIMESTAMP(3),
    "status" "EventStatus" NOT NULL DEFAULT 'OPEN',
    "creator_user_id" TEXT NOT NULL,
    "totalYesShares" DECIMAL(18,6) NOT NULL DEFAULT 0.0,
    "totalNoShares" DECIMAL(18,6) NOT NULL DEFAULT 0.0,
    "currentYesPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "currentNoPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "winningOutcomeName" TEXT,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outcomes" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isWinning" BOOLEAN NOT NULL DEFAULT false,
    "sharesOwned" DECIMAL(18,6) NOT NULL DEFAULT 0.0,

    CONSTRAINT "outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trades" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "outcomeId" TEXT NOT NULL,
    "tradeType" "TradeType" NOT NULL,
    "shareQuantity" DECIMAL(18,6) NOT NULL,
    "pricePerShare" DOUBLE PRECISION NOT NULL,
    "totalCryptoAmount" DECIMAL(18,6) NOT NULL,
    "tradeDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "TradeStatus" NOT NULL DEFAULT 'COMPLETED',

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holdings" (
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "outcomeId" TEXT NOT NULL,
    "sharesHeld" DECIMAL(18,6) NOT NULL DEFAULT 0.0,
    "averageCost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "holdings_pkey" PRIMARY KEY ("userId","eventId","outcomeId")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(18,6) NOT NULL,
    "currency" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "relatedTradeId" TEXT,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_lower_key" ON "users"("wallet_address_lower");

-- CreateIndex
CREATE INDEX "users_wallet_address_lower_idx" ON "users"("wallet_address_lower");

-- CreateIndex
CREATE UNIQUE INDEX "outcomes_eventId_name_key" ON "outcomes"("eventId", "name");

-- AddForeignKey
ALTER TABLE "mines_games" ADD CONSTRAINT "mines_games_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("wallet_address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_creator_user_id_fkey" FOREIGN KEY ("creator_user_id") REFERENCES "users"("wallet_address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("wallet_address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "outcomes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("wallet_address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "outcomes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("wallet_address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_relatedTradeId_fkey" FOREIGN KEY ("relatedTradeId") REFERENCES "trades"("id") ON DELETE SET NULL ON UPDATE CASCADE;
