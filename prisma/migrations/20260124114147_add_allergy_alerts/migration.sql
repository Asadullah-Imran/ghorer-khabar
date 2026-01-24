-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "allergyAlerts" TEXT[] DEFAULT ARRAY[]::TEXT[];
