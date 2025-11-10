-- Debug query to check why only 13 candidates are shown instead of 29
-- Replace 'f88b2727-d33b-5165-a919-579f249755eb' with your university_id

-- 1. Total candidates for this university
SELECT COUNT(*) as total_count
FROM candidates 
WHERE university_id = 'f88b2727-d33b-5165-a919-579f249755eb';

-- 2. Candidates filtered by graduation year (2020-2024) - This is the default filter
SELECT COUNT(*) as filtered_by_year
FROM candidates 
WHERE university_id = 'f88b2727-d33b-5165-a919-579f249755eb'
  AND graduation_year >= 2020 
  AND graduation_year <= 2024;

-- 3. Candidates with valid university join (not null)
SELECT COUNT(*) as with_valid_university
FROM candidates c
INNER JOIN universities u ON c.university_id = u.id
WHERE c.university_id = 'f88b2727-d33b-5165-a919-579f249755eb';

-- 4. Candidates with valid university AND graduation year filter
SELECT COUNT(*) as final_count
FROM candidates c
INNER JOIN universities u ON c.university_id = u.id
WHERE c.university_id = 'f88b2727-d33b-5165-a919-579f249755eb'
  AND c.graduation_year >= 2020 
  AND c.graduation_year <= 2024;

-- 5. Breakdown by graduation year to see which years are excluded
SELECT 
  graduation_year,
  COUNT(*) as count
FROM candidates 
WHERE university_id = 'f88b2727-d33b-5165-a919-579f249755eb'
GROUP BY graduation_year
ORDER BY graduation_year;

-- 6. Check for candidates with null university_id (shouldn't happen, but let's check)
SELECT COUNT(*) as null_university_id
FROM candidates 
WHERE university_id = 'f88b2727-d33b-5165-a919-579f249755eb'
  AND university_id IS NULL;

-- 7. Check for candidates where university join fails
SELECT COUNT(*) as missing_university_join
FROM candidates c
LEFT JOIN universities u ON c.university_id = u.id
WHERE c.university_id = 'f88b2727-d33b-5165-a919-579f249755eb'
  AND u.id IS NULL;

