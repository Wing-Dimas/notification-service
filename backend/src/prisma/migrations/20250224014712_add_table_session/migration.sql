/*
  Warnings:

  - The primary key for the `session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `data` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `pkId` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `session` table. All the data in the column will be lost.
  - You are about to drop the `chat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `groupmetadata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `session_name` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session_number` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Session_sessionId_idx` ON `session`;

-- DropIndex
DROP INDEX `unique_id_per_session_id_4` ON `session`;

-- AlterTable
ALTER TABLE `session` DROP PRIMARY KEY,
    DROP COLUMN `data`,
    DROP COLUMN `id`,
    DROP COLUMN `pkId`,
    DROP COLUMN `sessionId`,
    ADD COLUMN `session_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `session_number` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`session_name`);

-- DropTable
DROP TABLE `chat`;

-- DropTable
DROP TABLE `contact`;

-- DropTable
DROP TABLE `groupmetadata`;

-- DropTable
DROP TABLE `message`;

-- CreateTable
CREATE TABLE `HistoryMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `session_name` VARCHAR(191) NULL,
    `target` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HistoryMessage` ADD CONSTRAINT `HistoryMessage_session_name_fkey` FOREIGN KEY (`session_name`) REFERENCES `Session`(`session_name`) ON DELETE CASCADE ON UPDATE CASCADE;
