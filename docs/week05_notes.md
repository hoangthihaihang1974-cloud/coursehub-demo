# CourseHub — Buổi 5
Ngày kiểm tra: 09/11/2026.

## Phạm vi
- React/Vite, api.js, Notice, SectionTable, EnrollmentList.
- StudentForm tách riêng; App giữ state (bài mở rộng 1).
- Tìm kiếm, lọc còn chỗ, lọc học phần từ GET /courses (bài 2).
- POST/DELETE, xác nhận hủy; đọc lại API sau thành công hoặc lỗi.
- Trạng thái tải/rỗng/lỗi, AbortController, không tự retry POST.
- GET /enrollment-events và giao diện lịch sử demo có phân trang server (bài 3).
- Giữ transaction/row lock Buổi 4 và CORS local người học đã thêm.
- [Bản phác SVG](week05_wireframe.svg): chưa có file/link Figma trên tài khoản người học.
- database/13_week05_verify.sql chỉ đọc dữ liệu.
- Postman: postman/CourseHub_Buoi_5_History.postman_collection.json.

## Chạy
Terminal 1 tại thư mục gốc:
```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload
```
Terminal 2:
```powershell
cd frontend
npm ci
# Nếu chưa có .env.local:
Copy-Item .env.example .env.local
npm run dev
```
Mở http://127.0.0.1:5173, giữ PostgreSQL/Backend chạy.

## Kết quả thực tế
- Node 26.13.0, npm 11.20.0.
- npm test: 8/8 đạt: GET, POST 201, DELETE 204, 404, 409, 422,
  non-JSON, mất kết nối/abort/không retry ghi.
- npm run build: đạt.
- Playwright: 2/2 bài đạt trên FastAPI/PostgreSQL thật.
- Browser: đọc/tìm kiếm/lọc học phần, mã ngắn, sinh viên không tồn tại,
  POST 201, reload vẫn thấy đăng ký, cửa sổ cũ nhận 409, DELETE 204,
  lịch sử, mất mạng mô phỏng và phục hồi.
- Browser desktop 1280px/mobile 390px: đã xem ảnh; một cột trên mobile,
  bảng cuộn ngang riêng, trang không tràn; không có lỗi JavaScript.
- Mất mạng được mô phỏng bằng chặn request, không dừng server của người học.
- Suất cuối thử trên WEB-01, A=22000004 và B=22000003.
  Hai cửa sổ đọc trước; A nhận 201, B nhận 409; A hủy nhận 204.
  Đây là kiểm thử dữ liệu cũ, không chứng minh concurrency chồng lấn.
- Sau test: WEB-01 capacity=3, enrolled=2, remaining=1.
  RACE-01 giữ capacity=1, enrolled=1, remaining=0; giữ đăng ký của 22000004.
- SQL: CREATED id=2, CANCELLED id=3 mới cho 22000004/WEB-01.
  Nhật ký id=1 có trước vẫn còn. Không xóa nhật ký.
- backend.tests.week05_verify: HTTP history khớp SQL demo, thứ tự ổn định;
  CORS OPTIONS cho localhost:5173 và 127.0.0.1:5173 đạt.
- Database đang có dataset demo; không có performance lúc đối chiếu.
  Không sinh lại hoặc xóa dữ liệu performance.
- API lịch sử: kiểm tra limit>100, skip<0, loại sự kiện sai trả 422;
  sinh viên không tồn tại trả 404; phân trang và lọc đúng.
- Bộ Postman đã tạo để import; kiểm thử tự động dùng Playwright/request,
  không ghi nhận là đã thao tác Postman thủ công.

## Chạy lại kiểm thử
Trong frontend:
```powershell
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```
E2E cần frontend/backend chạy sẵn; WEB-01 còn đúng 1 chỗ, 22000003 và
22000004 chưa đăng ký WEB-01. Test kiểm tra điều kiện trước khi ghi và chỉ
hủy đăng ký nó tạo, giữ lại audit events.
Từ thư mục gốc:
```powershell
.\.venv\Scripts\python.exe -m backend.tests.week05_verify
```
Ảnh kiểm thử ở frontend/test-results/ (Git bỏ qua).

## API lịch sử
GET /enrollment-events?student_id=22000004&event_type=CREATED&skip=0&limit=10
- student_id: bắt buộc, 8 chữ số; không tồn tại: 404.
- event_type: bỏ trống hoặc CREATED/CANCELLED.
- skip >= 0; limit 1..100, mặc định 10.
- Chỉ dataset='demo', ORDER BY occurred_at DESC, id DESC.
- Lọc và LIMIT/OFFSET tại PostgreSQL, dùng bind parameters.
- Không có dữ liệu: []; sai tham số: 422.
Bộ lọc lớp của bài cơ bản vẫn chạy phía client.

## Dependency
React giữ 18.2.0. Vite 7.1.7 trong giáo trình bị npm audit báo high,
đã nâng trong dòng 7 lên 7.3.7; npm install báo 0 vulnerabilities.
Playwright 1.65.0 là công cụ kiểm thử bổ sung; commit package-lock.json.

## DevTools
F12 > Network > Fetch/XHR: xem GET /sections; POST /enrollments có
student_id/class_section_id và status 201/409; DELETE 204 có body trống.
OPTIONS là preflight. Đối chiếu database/13_week05_verify.sql.
Test tự động quan sát network response qua Playwright; chưa có ảnh DevTools thủ công.

## Project nhóm — phần cần nhóm bổ sung (XV.1 và bài 4)
Chưa có đề tài/repository/phân công nhóm nên chưa triển khai nghiệp vụ nhóm
hay tạo minh chứng review thay thành viên.
- Chọn một nghiệp vụ thật: đặt phòng/mượn sách/tạo đơn.
- Phác giao diện khớp API; một luồng ghi và một ca bị từ chối.
- Danh sách nhóm có q, skip>=0, limit 1..100; lọc/phân trang SQL,
  sắp xếp theo thời gian + khóa chính, bind parameters.
- Test trang rỗng, giới hạn và không lặp dòng khi dữ liệu đứng yên.
- Giữ phân quyền, transaction, ràng buộc và test concurrency.
- Issue/PR ghi người làm, người kiểm tra và kết quả chạy lại.
API lịch sử CourseHub là ví dụ phân trang, không được tính thay nghiệp vụ nhóm.

## Bàn giao Git
Nhánh week05-frontend-react xuất phát từ week04-transaction-index.
Không stage .env/.env.local, node_modules, dist, dữ liệu tạm hoặc chỉnh sửa
Postman/VS Code không liên quan. Chưa merge; cần thành viên khác review.
