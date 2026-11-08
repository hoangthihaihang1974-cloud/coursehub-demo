# CourseHub - Buoi 4
- Migration 001: enrollment_events.
- Demo class: RACE-01, capacity = 1.
- POST /enrollments: lock class_sections bang FOR UPDATE.
- Concurrency test: 1 request 201, 1 request 409.
- Performance data: 100000 rows, dataset=performance.
- Index: idx_enrollment_events_dataset_student_time.
- Ghi lai scan type va Execution Time truoc/sau o day.
        - Truoc index: 
   
"Planning Time: 0.149 ms"
"Execution Time: 0.056 ms"

    - Sau index: 
    
"Planning Time: 0.212 ms"
"Execution Time: 0.049 ms"

    - Nhan xet: tốc độ sau khi đánh index nhanh hơn 1 chút.

Khong commit backend/.env.

