-- Migration for advanced swapping feature
-- Run this in pgAdmin or your PostgreSQL client

ALTER TABLE swap_requests
  ADD COLUMN offered_item_ids UUID[] DEFAULT '{}',
  ADD COLUMN counter_offer_item_ids UUID[] DEFAULT '{}',
  ADD COLUMN last_action_by UUID,
  DROP COLUMN offered_item_id;

-- Optionally, update status enum if needed
-- ALTER TABLE swap_requests
--   ALTER COLUMN status TYPE VARCHAR(20) USING status::VARCHAR(20),
--   ALTER COLUMN status SET DEFAULT 'pending';

-- You may want to migrate any old data from offered_item_id to offered_item_ids before dropping the column:
-- UPDATE swap_requests SET offered_item_ids = ARRAY[offered_item_id] WHERE offered_item_id IS NOT NULL; 