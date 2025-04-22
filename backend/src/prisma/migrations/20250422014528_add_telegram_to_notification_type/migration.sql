-- AlterTable
ALTER TABLE `messages` MODIFY `notification_type` ENUM('WHATSAPP', 'TELEGRAM', 'EMAIL', 'SMS') NOT NULL DEFAULT 'WHATSAPP';
