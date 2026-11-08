-- Run this script in two Query Tool sessions.
-- Session A keeps the row lock until COMMIT or ROLLBACK.
BEGIN;

SELECT id, capacity
FROM class_sections
WHERE id = 'RACE-01'
FOR UPDATE;

-- In the other session, the same SELECT ... FOR UPDATE waits here.
-- Finish this session with COMMIT; or ROLLBACK;.
