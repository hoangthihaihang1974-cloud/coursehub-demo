# Hàm ghi dữ liệu cập nhật xuống file data.json
def save_data():
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(db_data, f, ensure_ascii=False, indent=2)
