# CourseHub Frontend — Buổi 5

Thư mục này dành cho giao diện người dùng của Project.

Frontend gọi Backend FastAPI qua biến `VITE_API_BASE_URL` trong `.env.local`.
Các màn hình cần dùng dữ liệu thật từ API, đồng thời có trạng thái đang tải,
rỗng và lỗi theo yêu cầu Project cuối kỳ.

## Cấu trúc dự kiến

- `src/api/`: các hàm gọi API.
- `src/components/`: các thành phần giao diện dùng lại.
- `src/pages/`: các màn hình nghiệp vụ.
- `public/`: tài nguyên tĩnh.

Đã triển khai React 18.2.0 và Vite 7.3.7; cần Node >=22.12.0.
Trong frontend chạy npm ci rồi npm run dev, mở http://127.0.0.1:5173.
Backend và PostgreSQL phải chạy riêng. Cấu hình local dùng .env.local,
tham khảo .env.example, không đặt mật khẩu database trong biến VITE_*.

Mã thực tế: src/api.js gọi API; App.jsx giữ state; components/ gồm
StudentForm, Notice, SectionTable, EnrollmentList và EventHistory.
Các thư mục rỗng api/pages/services là khung có từ trước.

npm test chạy 8 ca đơn vị; npm run build tạo dist.
npx playwright install chromium rồi npm run test:e2e để kiểm thử trình duyệt.
Điều kiện dữ liệu, kết quả SQL, bản phác và phạm vi Project nhóm:
[ghi chú Buổi 5](../docs/week05_notes.md).
