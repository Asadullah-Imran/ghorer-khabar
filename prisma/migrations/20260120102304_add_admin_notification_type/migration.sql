-- CreateEnum
CREATE TYPE "AdminNotificationType" AS ENUM ('SUPPORT_TICKET', 'SELLER_APPROVAL');

-- AlterTable
ALTER TABLE "admin_notifications" ADD COLUMN     "type" "AdminNotificationType" NOT NULL DEFAULT 'SUPPORT_TICKET';

-- CreateIndex
CREATE INDEX "admin_notifications_type_idx" ON "admin_notifications"("type");
