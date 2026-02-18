/*
  Safe migration for category type change and tags addition
  
  This migration:
  1. Creates the DishCategory enum
  2. Adds tags column
  3. Adds a temporary new_category column
  4. Migrates existing data to new enum values
  5. Drops old category column
  6. Renames new_category to category
  7. Creates indexes
*/

-- CreateEnum
CREATE TYPE "DishCategory" AS ENUM ('BREAKFAST', 'MAIN_COURSE', 'SIDE_DISH', 'APPETIZER', 'DESSERT', 'BEVERAGE', 'SNACK');

-- Add tags column (safe, has default)
ALTER TABLE "menu_items" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add temporary new_category column (nullable for now)
ALTER TABLE "menu_items" ADD COLUMN "new_category" "DishCategory";

-- Migrate existing data: Map old string categories to new enum values
UPDATE "menu_items" 
SET "new_category" = CASE 
  -- Map protein-based categories to MAIN_COURSE
  WHEN "category" IN ('Rice', 'Beef', 'Chicken', 'Fish', 'Mutton') THEN 'MAIN_COURSE'::"DishCategory"
  
  -- Map vegetarian to SIDE_DISH
  WHEN "category" = 'Vegetarian' THEN 'SIDE_DISH'::"DishCategory"
  
  -- Map breakfast items
  WHEN "category" ILIKE '%breakfast%' OR "category" ILIKE '%paratha%' THEN 'BREAKFAST'::"DishCategory"
  
  -- Map desserts
  WHEN "category" ILIKE '%dessert%' OR "category" ILIKE '%sweet%' OR "category" ILIKE '%pitha%' THEN 'DESSERT'::"DishCategory"
  
  -- Map snacks
  WHEN "category" ILIKE '%snack%' OR "category" ILIKE '%fuchka%' THEN 'SNACK'::"DishCategory"
  
  -- Default to MAIN_COURSE for anything else
  ELSE 'MAIN_COURSE'::"DishCategory"
END;

-- Make new_category NOT NULL (all rows should have values now)
ALTER TABLE "menu_items" ALTER COLUMN "new_category" SET NOT NULL;

-- Drop old category column
ALTER TABLE "menu_items" DROP COLUMN "category";

-- Rename new_category to category
ALTER TABLE "menu_items" RENAME COLUMN "new_category" TO "category";

-- CreateIndex
CREATE INDEX "menu_items_category_idx" ON "menu_items"("category");

-- CreateIndex
CREATE INDEX "menu_items_tags_idx" ON "menu_items"("tags");
