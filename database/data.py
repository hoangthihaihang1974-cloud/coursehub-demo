students = [
    {"id": "22000001", "name": "Nguyen Minh Anh", "major": "KHDL"},
    {"id": "22000002", "name": "Tran Duc Long", "major": "KHDL"},
]
courses = [
    {
        "code": "INT2204",
        "name": "Co so du lieu Web va he thong thong tin",
        "capacity": 3,
        "enrolled": 2,
    },
    {
        "code": "INT2205",
        "name": "Khai pha du lieu",
        "capacity": 2,
        "enrolled": 2,
},
]
enrollments = [
{"student_id": "22000001", "course_code": "INT2204"}
]

#Duyệt dữ liệu và tính giá trị
for course in courses:
    remaining = course["capacity"] - course["enrolled"]
    print(course["code"], "- con", remaining, "cho")

#Tìm học phần theo mã
def find_course(course_code):
    for course in courses:
        if course["code"] == course_code:
            return course
    return None
        
print(find_course("INT2204"))

#Mô phỏng quy tắc đăng kí:
def can_enroll(student_id, course_code):
    course = find_course(course_code)

    if not course:
        return False, "Học phần không tồn tại"
    
    if course["enrolled"] >= course["capacity"]:
        return False, "Lớp đã đủ số lượng"
    
    duplicated = any(
        item["student_id"] == student_id and item["course_code"] == course_code
        for item in enrollments
    )
    if duplicated:
        return False, "Sinh viên đã đăng kí học phần này"

    return True, "Có thể đăng kí"

print(can_enroll("22000002", "INT2204"))

#Xử lý dữ liệu nhập sai:
try:
    limit = int(input("Nhập số lượng học phần muốn hiển thị: "))
    print(courses[:limit])
except ValueError:
    print("Số lượng phải là số nguyên")

#Tìm kiếm học phần:
def search_courses(keyword):
    normalized = keyword.strip().lower()
    results = []

    for course in courses:
        code = course["code"].lower()
        name = course["name"].lower()
        if normalized in code or normalized in name:
            results.append(course)
    
    return results 

print(search_courses("web"))