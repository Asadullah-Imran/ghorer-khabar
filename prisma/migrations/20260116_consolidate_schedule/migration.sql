-- Add weekly_schedule column to subscription_plans
ALTER TABLE "subscription_plans" ADD COLUMN "weekly_schedule" JSONB NOT NULL DEFAULT '{}';

-- Migrate data from plan_schedules to weekly_schedule JSON
UPDATE "subscription_plans" sp
SET "weekly_schedule" = COALESCE(
  (
    SELECT jsonb_object_agg(
      day_of_week,
      jsonb_object_agg(
        LOWER(meal_type),
        jsonb_build_object(
          'time', time,
          'dishIds', COALESCE(
            jsonb_agg(
              DISTINCT dish_id
            ) FILTER (WHERE dish_id IS NOT NULL),
            '[]'::jsonb
          )
        )
      )
    )
    FROM "plan_schedules"
    WHERE "plan_schedules"."plan_id" = sp.id
    GROUP BY "plan_schedules"."plan_id"
  ),
  '{}'::jsonb
);

-- Drop the plan_schedules table
DROP TABLE "plan_schedules";
