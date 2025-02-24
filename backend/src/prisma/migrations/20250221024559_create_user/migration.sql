/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `username` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Chat` (
    `pkId` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionId` VARCHAR(128) NOT NULL,
    `archived` BOOLEAN NULL,
    `contactPrimaryIdentityKey` LONGBLOB NULL,
    `conversationTimestamp` BIGINT NULL,
    `createdAt` BIGINT NULL,
    `createdBy` VARCHAR(128) NULL,
    `description` VARCHAR(255) NULL,
    `disappearingMode` JSON NULL,
    `displayName` VARCHAR(128) NULL,
    `endOfHistoryTransfer` BOOLEAN NULL,
    `endOfHistoryTransferType` INTEGER NULL,
    `ephemeralExpiration` INTEGER NULL,
    `ephemeralSettingTimestamp` BIGINT NULL,
    `id` VARCHAR(128) NOT NULL,
    `isDefaultSubgroup` BOOLEAN NULL,
    `isParentGroup` BOOLEAN NULL,
    `lastMsgTimestamp` BIGINT NULL,
    `lidJid` VARCHAR(128) NULL,
    `markedAsUnread` BOOLEAN NULL,
    `mediaVisibility` INTEGER NULL,
    `messages` JSON NULL,
    `muteEndTime` BIGINT NULL,
    `name` VARCHAR(128) NULL,
    `newJid` VARCHAR(128) NULL,
    `notSpam` BOOLEAN NULL,
    `oldJid` VARCHAR(128) NULL,
    `pHash` VARCHAR(128) NULL,
    `parentGroupId` VARCHAR(128) NULL,
    `participant` JSON NULL,
    `pinned` BIGINT NULL,
    `pnJid` VARCHAR(128) NULL,
    `pnhDuplicateLidThread` BOOLEAN NULL,
    `readOnly` BOOLEAN NULL,
    `shareOwnPn` BOOLEAN NULL,
    `support` BOOLEAN NULL,
    `suspended` BOOLEAN NULL,
    `tcToken` LONGBLOB NULL,
    `tcTokenSenderTimestamp` BIGINT NULL,
    `tcTokenTimestamp` BIGINT NULL,
    `terminated` BOOLEAN NULL,
    `unreadCount` INTEGER NULL,
    `unreadMentionCount` INTEGER NULL,
    `wallpaper` JSON NULL,
    `lastMessageRecvTimestamp` INTEGER NULL,
    `commentsCount` INTEGER NULL,

    INDEX `Chat_sessionId_idx`(`sessionId`),
    UNIQUE INDEX `unique_id_per_session_id_1`(`sessionId`, `id`),
    PRIMARY KEY (`pkId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contact` (
    `pkId` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionId` VARCHAR(128) NOT NULL,
    `id` VARCHAR(128) NOT NULL,
    `name` VARCHAR(128) NULL,
    `notify` VARCHAR(128) NULL,
    `verifiedName` VARCHAR(128) NULL,
    `imgUrl` VARCHAR(255) NULL,
    `status` VARCHAR(128) NULL,

    INDEX `Contact_sessionId_idx`(`sessionId`),
    UNIQUE INDEX `unique_id_per_session_id_2`(`sessionId`, `id`),
    PRIMARY KEY (`pkId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupMetadata` (
    `pkId` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionId` VARCHAR(128) NOT NULL,
    `id` VARCHAR(128) NOT NULL,
    `owner` VARCHAR(128) NULL,
    `subject` VARCHAR(128) NOT NULL,
    `subjectOwner` VARCHAR(128) NULL,
    `subjectTime` INTEGER NULL,
    `creation` INTEGER NULL,
    `desc` VARCHAR(255) NULL,
    `descOwner` VARCHAR(128) NULL,
    `descId` VARCHAR(128) NULL,
    `restrict` BOOLEAN NULL,
    `announce` BOOLEAN NULL,
    `isCommunity` BOOLEAN NULL,
    `isCommunityAnnounce` BOOLEAN NULL,
    `joinApprovalMode` BOOLEAN NULL,
    `memberAddMode` BOOLEAN NULL,
    `author` VARCHAR(128) NULL,
    `size` INTEGER NULL,
    `participants` JSON NOT NULL,
    `ephemeralDuration` INTEGER NULL,
    `inviteCode` VARCHAR(255) NULL,

    INDEX `GroupMetadata_sessionId_idx`(`sessionId`),
    UNIQUE INDEX `unique_id_per_session_id_3`(`sessionId`, `id`),
    PRIMARY KEY (`pkId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `pkId` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionId` VARCHAR(128) NOT NULL,
    `remoteJid` VARCHAR(128) NOT NULL,
    `id` VARCHAR(128) NOT NULL,
    `agentId` VARCHAR(128) NULL,
    `bizPrivacyStatus` INTEGER NULL,
    `broadcast` BOOLEAN NULL,
    `clearMedia` BOOLEAN NULL,
    `duration` INTEGER NULL,
    `ephemeralDuration` INTEGER NULL,
    `ephemeralOffToOn` BOOLEAN NULL,
    `ephemeralOutOfSync` BOOLEAN NULL,
    `ephemeralStartTimestamp` BIGINT NULL,
    `finalLiveLocation` JSON NULL,
    `futureproofData` LONGBLOB NULL,
    `ignore` BOOLEAN NULL,
    `keepInChat` JSON NULL,
    `key` JSON NOT NULL,
    `labels` JSON NULL,
    `mediaCiphertextSha256` LONGBLOB NULL,
    `mediaData` JSON NULL,
    `message` JSON NULL,
    `messageC2STimestamp` BIGINT NULL,
    `messageSecret` LONGBLOB NULL,
    `messageStubParameters` JSON NULL,
    `messageStubType` INTEGER NULL,
    `messageTimestamp` BIGINT NULL,
    `multicast` BOOLEAN NULL,
    `originalSelfAuthorUserJidString` VARCHAR(128) NULL,
    `participant` VARCHAR(128) NULL,
    `paymentInfo` JSON NULL,
    `photoChange` JSON NULL,
    `pollAdditionalMetadata` JSON NULL,
    `pollUpdates` JSON NULL,
    `pushName` VARCHAR(128) NULL,
    `quotedPaymentInfo` JSON NULL,
    `quotedStickerData` JSON NULL,
    `reactions` JSON NULL,
    `revokeMessageTimestamp` BIGINT NULL,
    `starred` BOOLEAN NULL,
    `status` INTEGER NULL,
    `statusAlreadyViewed` BOOLEAN NULL,
    `statusPsa` JSON NULL,
    `urlNumber` BOOLEAN NULL,
    `urlText` BOOLEAN NULL,
    `userReceipt` JSON NULL,
    `verifiedBizName` VARCHAR(128) NULL,
    `eventResponses` JSON NULL,
    `pinInChat` JSON NULL,
    `reportingTokenInfo` JSON NULL,

    INDEX `Message_sessionId_idx`(`sessionId`),
    UNIQUE INDEX `unique_message_key_per_session_id`(`sessionId`, `remoteJid`, `id`),
    PRIMARY KEY (`pkId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `pkId` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionId` VARCHAR(128) NOT NULL,
    `id` VARCHAR(255) NOT NULL,
    `data` TEXT NOT NULL,

    INDEX `Session_sessionId_idx`(`sessionId`),
    UNIQUE INDEX `unique_id_per_session_id_4`(`sessionId`, `id`),
    PRIMARY KEY (`pkId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);
