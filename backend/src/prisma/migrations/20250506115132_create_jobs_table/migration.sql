-- CreateTable
CREATE TABLE `jobs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('SCHEDULE', 'MANUAL') NOT NULL,
    `cron_schedule` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_run_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `next_run_at` DATETIME(3) NULL,

    UNIQUE INDEX `jobs_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
