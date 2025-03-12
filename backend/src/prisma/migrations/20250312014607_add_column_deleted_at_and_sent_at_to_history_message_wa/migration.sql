-- AlterTable
ALTER TABLE `historymessagewa` ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `sent_at` DATETIME(3) NULL;
