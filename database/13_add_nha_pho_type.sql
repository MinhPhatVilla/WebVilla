-- =============================================
-- Migration 13: Add 'nha-pho' to property type
-- =============================================
-- The properties table has a CHECK constraint that only allows 'villa' and 'homestay'.
-- We need to update it to also allow 'nha-pho'.

-- Step 1: Drop the old CHECK constraint
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_type_check;

-- Step 2: Add updated CHECK constraint with 'nha-pho'
ALTER TABLE public.properties ADD CONSTRAINT properties_type_check 
    CHECK (type IN ('villa', 'homestay', 'nha-pho'));
