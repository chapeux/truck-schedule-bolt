/*
  # Add completed_date and carrier fields

  1. New Columns
    - `completed_date` (date, nullable) - Date when the loading was actually completed
    - `carrier` (text) - Name of the transport company/carrier

  2. Modified Tables
    - `truck_loadings` - Added new columns to track completion date and carrier information

  3. Notes
    - completed_date is optional and only set when loading is marked as completed
    - carrier is required for all records
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'truck_loadings' AND column_name = 'completed_date'
  ) THEN
    ALTER TABLE truck_loadings ADD COLUMN completed_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'truck_loadings' AND column_name = 'carrier'
  ) THEN
    ALTER TABLE truck_loadings ADD COLUMN carrier text DEFAULT '';
  END IF;
END $$;