ALTER TABLE club_members 
ADD COLUMN IF NOT EXISTS tenure_start_date DATE,
ADD COLUMN IF NOT EXISTS tenure_end_date DATE;
