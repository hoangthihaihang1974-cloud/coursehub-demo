import json
import os
import sys
from datetime import datetime

# Cấu hình UTF-8 cho stdout trên Windows
sys.stdout.reconfigure(encoding='utf-8')

# Xác định đường dẫn tới file data.json và report.txt trong cùng thư mục với query.py
current_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(current_dir, "data.json")
report_path = os.path.join(current_dir, "report.txt")

# Đọc dữ liệu từ file data.json
with open(json_path, "r", encoding="utf-8") as f:
    db_data = json.load(f)

courses = db_data.get("courses", [])
students = db_data.get("students", [])
enrollments = db_data.get("enrollments", [])

# Hàm ghi dữ liệu cập nhật xuống file data.json
def save_data():
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(db_data, f, ensure_ascii=False, indent=2)

# Hàm ghi log kết quả truy vấn ra file report.txt
def log_report(title, input_data, result):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = (
        f"========================================\n"
        f"Thời gian: {timestamp}\n"
        f"Tình huống: {title}\n"
        f"Đầu vào: {input_data}\n"
        f"Kết quả: {result}\n"
        f"========================================\n\n"
    )
    # Mode "a" (append) để ghi tiếp vào cuối file mà không xoá lịch sử cũ
    with open(report_path, "a", encoding="utf-8") as f:
        f.write(log_entry)

# Tìm học phần theo mã
def find_course(course_code):
    for course in courses:
        if course["code"] == course_code:
            return course
    return None

# Tìm sinh viên theo mã sinh viên
def find_student(student_id):
    for student in students:
        if student["id"] == student_id:
            return student
    return None

# Mô phỏng quy tắc đăng kí:
def enroll_student(student_id, course_code):
    course = find_course(course_code)
    student = find_student(student_id)

    if not course:
        res = (False, "Học phần không tồn tại")
        log_report("Đăng ký học phần", f"SV: {student_id}, HP: {course_code}", res)
        return res
    
    if not student:
        res = (False, "Sinh viên không tồn tại")
        log_report("Đăng ký học phần", f"SV: {student_id}, HP: {course_code}", res)
        return res

    if course["enrolled"] >= course["capacity"]:
        res = (False, "Lớp đã đủ số lượng")
        log_report("Đăng ký học phần", f"SV: {student_id}, HP: {course_code}", res)
        return res
    
    duplicated = any(
        item["student_id"] == student_id and item["course_code"] == course_code
        for item in enrollments
    )
    if duplicated:
        res = (False, "Sinh viên đã đăng kí học phần này")
        log_report("Đăng ký học phần", f"SV: {student_id}, HP: {course_code}", res)
        return res
    
    # Đăng ký thành công
    enrollments.append({"student_id": student_id, "course_code": course_code})
    course["enrolled"] += 1
    save_data() # Cập nhật file JSON
    
    res = (True, "Đăng kí thành công")
    log_report("Đăng ký học phần", f"SV: {student_id}, HP: {course_code}", res)
    return res

# ----------------------------------------------------
# CHẠY THỬ VÀ GHI BÁO CÁO RA FILE TXT
# ----------------------------------------------------

# Reset file report.txt mới mỗi lần chạy (nếu muốn)
with open(report_path, "w", encoding="utf-8") as f:
    f.write("BÁO CÁO KẾT QUẢ KIỂM THỬ ĐĂNG KÝ HỌC PHẦN\n\n")

print(enroll_student("22000001", "INT2205")) # Lớp đã đầy
print(enroll_student("22000001", "INT2204")) # Đăng ký thành công
print(enroll_student("22000001", "INT2204")) # Đăng ký trùng
print(enroll_student("99999999", "INT2204")) # Sinh viên không tồn tại
print(enroll_student("22000002", "INT9999")) # Học phần không tồn tại
