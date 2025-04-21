-- CreateTable
CREATE TABLE `telegram_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chat_id` INTEGER NOT NULL,
    `username` VARCHAR(191) NULL,
    `first_name` VARCHAR(191) NULL,
    `last_name` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `telegram_users_chat_id_key`(`chat_id`),
    UNIQUE INDEX `telegram_users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
