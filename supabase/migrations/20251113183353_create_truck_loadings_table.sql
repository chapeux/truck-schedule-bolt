/*
  # CargaAgenda - Truck Loading Management System

  ## Overview
  Creates the core table for managing truck loading schedules with support for
  tracking loading windows, completion status, and cargo details.

  ## New Tables
  
  ### `truck_loadings`
  Main table for storing truck loading information:
  - `id` (uuid, primary key) - Unique identifier for each loading
  - `truck_id` (text) - Truck identification (license plate or ID)
  - `product` (text) - Product or cargo being loaded
  - `quantity` (text) - Amount to be loaded (flexible format)
  - `start_date` (date) - Beginning of loading window
  - `end_date` (date) - End of loading window
  - `is_completed` (boolean) - Whether loading has been completed
  - `status` (text) - Current status: 'pending', 'completed', or 'cancelled'
  - `notes` (text, optional) - Additional notes or comments
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  
  - Enable Row Level Security (RLS) on `truck_loadings` table
  - For this demo, allow public access for all operations
  - In production, these policies should be restricted to authenticated users
  
  ## Notes
  
  1. The `start_date` and `end_date` define the loading window
  2. Status is automatically set based on `is_completed` but can be manually overridden
  3. Uses timestamptz for proper timezone handling
  4. All text fields allow flexible data entry for various use cases
*/

CREATE TABLE IF NOT EXISTS truck_loadings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id text NOT NULL,
  cotacao text NOT NULL,
  quantity text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_completed boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE truck_loadings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to truck loadings"
  ON truck_loadings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access to truck loadings"
  ON truck_loadings
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access to truck loadings"
  ON truck_loadings
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to truck loadings"
  ON truck_loadings
  FOR DELETE
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_truck_loadings_dates ON truck_loadings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_truck_loadings_status ON truck_loadings(status);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_truck_loadings_updated_at BEFORE UPDATE
  ON truck_loadings FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();