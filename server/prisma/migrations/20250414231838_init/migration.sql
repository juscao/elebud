-- CreateEnum
CREATE TYPE "Type" AS ENUM ('SANKEY', 'PIE');

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "folderId" TEXT,
    "type" "Type" NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "description" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(20) NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chart" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "fontColor" TEXT NOT NULL DEFAULT '#000000',
    "fontSize" INTEGER NOT NULL DEFAULT 16,
    "displayMode" TEXT NOT NULL DEFAULT 'No labels',
    "sankeyLinkColor" TEXT NOT NULL DEFAULT '#E1E5EA',

    CONSTRAINT "Chart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sankeyNode" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "originColor" TEXT NOT NULL,
    "destinationColor" TEXT NOT NULL,
    "origin" VARCHAR(20) NOT NULL,
    "destination" VARCHAR(20) NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "sankeyNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chart" ADD CONSTRAINT "Chart_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sankeyNode" ADD CONSTRAINT "sankeyNode_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "Chart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
