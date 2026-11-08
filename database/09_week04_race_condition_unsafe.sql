-- Demo only: this intentionally unsafe flow can overbook a class.
-- Run in two separate Query Tool sessions while using the same RACE-01 row.
BEGIN;

SELECT capacity,
       (SELECT COUNT(*) FROM enrollments WHERE class_section_id = 'RACE-01') AS enrolled
FROM class_sections
WHERE id = 'RACE-01';

-- Both sessions may observe the same remaining seat before either INSERTs.
-- INSERT INTO enrollments (student_id, class_section_id)
-- VALUES ('22000001', 'RACE-01');

ROLLBACK;
