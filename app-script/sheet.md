# Hướng dẫn tạo Google Sheet cho ứng dụng Quản lý Công việc

## Tổng quan

Ứng dụng cần một Google Spreadsheet với các sheet (tab) sau đây. Mỗi sheet đóng vai trò là một bảng dữ liệu trong cơ sở dữ liệu.

**Lưu ý quan trọng:** Code.js sử dụng `SpreadsheetApp.getActiveSpreadsheet()`, nghĩa là bạn cần mở Apps Script **từ chính file Google Sheet đó** (Extensions > Apps Script).

---

## 1. Sheet: `Cài Đặt`

Lưu trữ thông tin cài đặt doanh nghiệp và tài khoản admin.

| Cột | Tên cột | Kiểu dữ liệu | Mô tả | Bắt buộc |
|-----|---------|--------------|-------|----------|
| A | `Tên công ty` | Text | Tên công ty | ✅ |
| B | `Mô tả` | Text | Mô tả công ty | ❌ |
| C | `Tên đăng nhập` | Text | Tên đăng nhập admin (Owner) | ✅ |
| D | `Mật khẩu` | Text | Mật khẩu admin | ✅ |
| E | `Họ tên` | Text | Họ tên admin | ✅ |
| F | `Email` | Text | Email admin | ❌ |
| G | `Điện thoại` | Text | SĐT admin | ❌ |
| H | `Ảnh đại diện` | Text | URL ảnh đại diện admin | ❌ |

**Ví dụ dữ liệu ban đầu (nhập vào hàng 2):**
| Tên công ty | Mô tả | Tên đăng nhập | Mật khẩu | Họ tên | Email | Điện thoại | Ảnh đại diện |
|-------------|-------|---------------|----------|--------|-------|------------|--------------|
| Công ty ABC | Chuyên gia công nghệ | admin | 123456 | Nguyễn Admin | admin@abc.com | 0901234567 | |

---

## 2. Sheet: `Phòng Ban`

Lưu trữ danh sách phòng ban/nhóm làm việc.

| Cột | Tên cột | Kiểu dữ liệu | Mô tả | Bắt buộc |
|-----|---------|--------------|-------|----------|
| A | `ID` | Text | ID duy nhất (auto-generate) | ✅ |
| B | `Tên phòng ban` | Text | Tên phòng ban | ✅ |
| C | `Mô tả` | Text | Mô tả chức năng | ❌ |
| D | `Ngày tạo` | DateTime | Thời gian tạo | ✅ |

**Ví dụ dữ liệu:**
| ID | Tên phòng ban | Mô tả | Ngày tạo |
|----|---------------|-------|----------|
| pb_001 | Phòng Kinh doanh | Phụ trách bán hàng và khách hàng | 2024-01-15 |
| pb_002 | Phòng Marketing | Phụ trách truyền thông và quảng cáo | 2024-01-15 |
| pb_003 | Phòng Kỹ thuật | Phụ trách phát triển sản phẩm | 2024-01-15 |

---

## 3. Sheet: `Nhân Viên`

Lưu trữ thông tin nhân viên.

| Cột | Tên cột | Kiểu dữ liệu | Mô tả | Bắt buộc |
|-----|---------|--------------|-------|----------|
| A | `ID` | Text | ID duy nhất (auto-generate) | ✅ |
| B | `Họ tên` | Text | Họ và tên | ✅ |
| C | `Tên đăng nhập` | Text | Tên đăng nhập (chữ thường, số, ≥3 ký tự) | ✅ |
| D | `Mật khẩu` | Text | Mật khẩu | ✅ |
| E | `Email` | Text | Email | ❌ |
| F | `Điện thoại` | Text | Số điện thoại | ❌ |
| G | `Ảnh đại diện` | Text | URL ảnh đại diện | ❌ |
| H | `Vai trò` | Text | Vai trò: `Owner`, `Leader`, `Member` | ✅ |
| I | `ID Phòng ban` | Text | ID phòng ban (tham chiếu `Phòng Ban.ID`) | ✅ |
| J | `Ngày tạo` | DateTime | Thời gian tạo | ✅ |

**Giải thích vai trò:**
- `Owner`: Quản lý toàn bộ - có quyền truy cập mọi tính năng
- `Leader`: Trưởng phòng - quản lý phòng ban được chỉ định
- `Member`: Nhân viên - chỉ xem và cập nhật trạng thái nhiệm vụ được giao

**Ví dụ dữ liệu:**
| ID | Họ tên | Tên đăng nhập | Mật khẩu | Email | Điện thoại | Ảnh đại diện | Vai trò | ID Phòng ban | Ngày tạo |
|----|--------|---------------|----------|-------|------------|--------------|---------|--------------|----------|
| nv_001 | Trần Văn A | tranvana | 123456 | a@abc.com | 0912345678 | | Leader | pb_001 | 2024-01-15 |
| nv_002 | Lê Thị B | lethib | 123456 | b@abc.com | | | Member | pb_001 | 2024-01-15 |

---

## 4. Sheet: `Danh Mục`

Lưu trữ danh mục phân loại công việc.

| Cột | Tên cột | Kiểu dữ liệu | Mô tả | Bắt buộc |
|-----|---------|--------------|-------|----------|
| A | `ID` | Text | ID duy nhất | ✅ |
| B | `Tên danh mục` | Text | Tên danh mục | ✅ |
| C | `Icon` | Text | Tên icon (Heroicons format) | ✅ |
| D | `Màu sắc` | Text | Mã màu HEX (#XXXXXX) | ✅ |
| E | `Mặc định` | Boolean | Danh mục mặc định (TRUE/FALSE) | ✅ |
| F | `Ngày tạo` | DateTime | Thời gian tạo | ✅ |

**Danh mục mặc định (tạo sẵn):**
| ID | Tên danh mục | Icon | Màu sắc | Mặc định | Ngày tạo |
|----|--------------|------|---------|----------|----------|
| dm_video | Video | video-camera | #EF4444 | TRUE | 2024-01-01 |
| dm_hinhanh | Hình ảnh | photo | #F97316 | TRUE | 2024-01-01 |
| dm_tailieu | Tài liệu | document-text | #22C55E | TRUE | 2024-01-01 |
| dm_kinhdoanh | Kinh doanh | briefcase | #3B82F6 | TRUE | 2024-01-01 |
| dm_thietke | Thiết kế | paint-brush | #8B5CF6 | TRUE | 2024-01-01 |
| dm_phattrien | Phát triển | code-bracket | #06B6D4 | TRUE | 2024-01-01 |
| dm_marketing | Marketing | megaphone | #EC4899 | TRUE | 2024-01-01 |
| dm_hanhchinh | Hành chính | clipboard-document-list | #64748B | TRUE | 2024-01-01 |
| dm_khac | Khác | ellipsis-horizontal-circle | #94A3B8 | TRUE | 2024-01-01 |

---

## 5. Sheet: `Nhiệm Vụ`

Lưu trữ danh sách nhiệm vụ/công việc.

| Cột | Tên cột | Kiểu dữ liệu | Mô tả | Bắt buộc |
|-----|---------|--------------|-------|----------|
| A | `ID` | Text | ID duy nhất | ✅ |
| B | `Tiêu đề` | Text | Tên nhiệm vụ | ✅ |
| C | `Mô tả` | Text | Mô tả chi tiết | ❌ |
| D | `ID Người thực hiện` | Text | ID người thực hiện (tham chiếu `Nhân Viên.ID`) | ✅ |
| E | `ID Phòng ban` | Text | ID phòng ban | ✅ |
| F | `ID Danh mục` | Text | ID danh mục (tham chiếu `Danh Mục.ID`) | ❌ |
| G | `Độ ưu tiên` | Text | Độ ưu tiên: `high`, `medium`, `low` | ✅ |
| H | `Trạng thái` | Text | Trạng thái: `todo`, `in-progress`, `done` | ✅ |
| I | `Hạn hoàn thành` | Date | Hạn hoàn thành (YYYY-MM-DD) | ✅ |
| J | `Ngày hoàn thành` | DateTime | Thời gian hoàn thành | ❌ |
| K | `ID Người tạo` | Text | ID người tạo | ✅ |
| L | `Ngày tạo` | DateTime | Thời gian tạo | ✅ |

**Giải thích trạng thái:**
- `todo`: Cần làm (chưa bắt đầu)
- `in-progress`: Đang thực hiện
- `done`: Đã hoàn thành

**Giải thích độ ưu tiên:**
- `high`: Cao (màu đỏ)
- `medium`: Trung bình (màu cam)
- `low`: Thấp (màu xám)

---

## 6. Sheet: `Bình Luận`

Lưu trữ bình luận trên nhiệm vụ.

| Cột | Tên cột | Kiểu dữ liệu | Mô tả | Bắt buộc |
|-----|---------|--------------|-------|----------|
| A | `ID` | Text | ID duy nhất | ✅ |
| B | `ID Nhiệm vụ` | Text | ID nhiệm vụ (tham chiếu `Nhiệm Vụ.ID`) | ✅ |
| C | `ID Người bình luận` | Text | ID người bình luận (`owner` hoặc `Nhân Viên.ID`) | ✅ |
| D | `Nội dung` | Text | Nội dung bình luận | ✅ |
| E | `Hình ảnh` | Text | URL hình ảnh đính kèm | ❌ |
| F | `Ngày tạo` | DateTime | Thời gian tạo | ✅ |

---

## 7. Sheet: `Thông Báo`

Lưu trữ thông báo cho người dùng.

| Cột | Tên cột | Kiểu dữ liệu | Mô tả | Bắt buộc |
|-----|---------|--------------|-------|----------|
| A | `ID` | Text | ID duy nhất | ✅ |
| B | `ID Người nhận` | Text | ID người nhận (hoặc `all` cho tất cả) | ✅ |
| C | `Tiêu đề` | Text | Tiêu đề thông báo | ✅ |
| D | `Nội dung` | Text | Nội dung chi tiết | ✅ |
| E | `Đường dẫn` | Text | Đường dẫn liên kết (tùy chọn) | ❌ |
| F | `Đã đọc` | Boolean | Đã đọc (TRUE/FALSE) | ✅ |
| G | `Ngày tạo` | DateTime | Thời gian tạo | ✅ |

---

## Hướng dẫn từng bước

### Bước 1: Tạo Google Spreadsheet mới
1. Truy cập https://sheets.google.com
2. Tạo một Spreadsheet mới với tên: **"Quản lý Công việc - [Tên công ty]"**

### Bước 2: Tạo các Sheet (Tab)
Tạo 7 sheet với tên chính xác như sau (bấm dấu + ở dưới cùng để tạo sheet mới):
- `Cài Đặt`
- `Phòng Ban`
- `Nhân Viên`
- `Danh Mục`
- `Nhiệm Vụ`
- `Bình Luận`
- `Thông Báo`

### Bước 3: Thêm header cho mỗi sheet
Ở **hàng 1** của mỗi sheet, nhập tên các cột như đã liệt kê ở trên.

### Bước 4: Nhập dữ liệu ban đầu

#### Sheet `Cài Đặt`:
- Nhập thông tin công ty và tài khoản admin vào hàng 2

#### Sheet `Danh Mục`:
- Copy danh mục mặc định vào từ hàng 2

### Bước 5: Mở Apps Script từ Sheet
1. Trong Google Sheet, vào **Extensions > Apps Script**
2. Xóa code mặc định trong file `Code.gs`
3. Copy toàn bộ nội dung từ file `Code.js` vào
4. Tạo file HTML mới: **File > New > HTML file**, đặt tên `index`
5. Copy toàn bộ nội dung từ file `index.html` vào

### Bước 6: Deploy ứng dụng
1. Trong Apps Script, vào **Deploy > New deployment**
2. Bấm biểu tượng bánh răng bên cạnh "Select type", chọn **Web app**
3. Cài đặt:
   - **Description**: Quản lý Công việc v1.0
   - **Execute as**: Me
   - **Who has access**: Anyone (hoặc **Anyone with Google Account** nếu muốn bảo mật hơn)
4. Bấm **Deploy**
5. Cho phép quyền truy cập (Review Permissions > chọn tài khoản > Advanced > Go to...)
6. Copy URL của Web app để truy cập ứng dụng

---

## Ghi chú quan trọng

### Định dạng dữ liệu
- **Date**: Sử dụng định dạng `YYYY-MM-DD` (ví dụ: `2024-01-15`)
- **DateTime**: Sử dụng định dạng ISO 8601 (ví dụ: `2024-01-15T08:30:00Z`)
- **Boolean**: Nhập `TRUE` hoặc `FALSE` (viết hoa)
- **ID**: Để script tự động generate, không cần nhập tay

### Phân quyền
| Vai trò | Dashboard | Phòng ban | Nhân viên | Danh mục | Nhiệm vụ | Tiến độ | Lịch | Cài đặt |
|---------|-----------|-----------|-----------|----------|----------|---------|------|---------|
| Owner | ✅ | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ | ✅ | ✅ |
| Leader | ✅ | ❌ | ✅ CRUD (cùng phòng) | ❌ | ✅ CRUD | ✅ | ✅ | ⚠️ (chỉ profile) |
| Member | ❌ | ❌ | ❌ | ❌ | ⚠️ (chỉ status) | ✅ | ✅ | ⚠️ (chỉ profile) |

### Backup dữ liệu
- Google Sheets tự động lưu lịch sử phiên bản
- Truy cập **File > Version history** để xem và khôi phục các phiên bản trước

---

## Sơ đồ quan hệ dữ liệu

```
┌──────────────┐       ┌──────────────┐
│   Cài Đặt    │       │   Danh Mục   │
│   (Config)   │       │ (Categories) │
└──────────────┘       └──────┬───────┘
                              │
                              │ ID Danh mục
                              ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  Phòng Ban   │◄──────│  Nhiệm Vụ    │──────►│  Bình Luận   │
│ (Department) │ ID PB │   (Tasks)    │ ID NV │  (Comments)  │
└──────┬───────┘       └──────┬───────┘       └──────────────┘
       │                      │
       │ ID Phòng ban         │ ID Người thực hiện
       ▼                      ▼
┌──────────────┐       ┌──────────────┐
│  Nhân Viên   │       │  Thông Báo   │
│ (Employees)  │       │(Notification)│
└──────────────┘       └──────────────┘
```

---

## Kiểm tra sau khi cài đặt

1. ✅ Đăng nhập được bằng tài khoản admin đã tạo trong `Cài Đặt`
2. ✅ Tạo được phòng ban mới
3. ✅ Tạo được nhân viên thuộc phòng ban
4. ✅ Nhân viên có thể đăng nhập
5. ✅ Tạo được nhiệm vụ và giao cho nhân viên
6. ✅ Cập nhật được trạng thái nhiệm vụ
7. ✅ Xem được tiến độ trên Kanban board
8. ✅ Thống kê Dashboard hiển thị đúng số liệu
