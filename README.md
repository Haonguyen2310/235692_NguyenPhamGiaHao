# Hệ thống quản lý thiết bị phòng học trên nền tảng đám mây

Bài thi thực hành tổng hợp - Điện toán đám mây (TIN06)
Sinh viên: Nguyễn Phạm Gia Hào - MSSV 235692

## Mô tả đề tài

Ứng dụng web quản lý thiết bị phòng học: xem danh sách, xem chi tiết, thêm, cập nhật,
xóa, tìm kiếm thiết bị và theo dõi tình trạng sử dụng (Đang sử dụng, Hư hỏng,
Đang sửa chữa, Ngừng sử dụng).

## Công nghệ sử dụng

- Frontend: React (Vite)
- Backend: Node.js, Express, Mongoose
- Cơ sở dữ liệu: MongoDB Atlas
- Quản lý mã nguồn: Git/GitHub
- Đóng gói: Docker, Docker Hub
- Triển khai: Render

## Cấu trúc dự án

```
235692_NguyenPhamGiaHao/
├── backend/     # Express API
├── frontend/    # React app
├── README.md
└── .gitignore
```

## Hướng dẫn cài đặt, chạy chương trình

### Cơ sở dữ liệu (MongoDB Atlas)

- Database: `235692_NguyenPhamGiaHao`, collection: `devices`
- Các trường: `deviceId`, `name`, `deviceType`, `room`, `brand`, `model`, `quantity`,
  `status` (Đang sử dụng / Hư hỏng / Đang sửa chữa / Ngừng sử dụng), `purchaseDate`, `description`
- Tạo Database User, mở Network Access (cho Render: `0.0.0.0/0`), lấy chuỗi kết nối.
- Cấu hình backend:

```bash
cd backend
cp .env.example .env   # điền MONGODB_URI thật
npm install
npm run seed           # nạp 5 thiết bị mẫu
```

### Backend API

```bash
cd backend
npm install
npm run dev     # hoặc npm start; mặc định http://localhost:5000
npm test        # cần MONGODB_URI trỏ tới một MongoDB (dùng DB riêng device_test)
```

Biến môi trường (xem `backend/.env.example`): `PORT`, `MONGODB_URI`, `DB_NAME`, `CORS_ORIGIN`.

| Phương thức | Endpoint | Chức năng |
|---|---|---|
| GET | `/health` | Kiểm tra trạng thái backend/DB |
| GET | `/api/devices` | Danh sách thiết bị (`?search=` theo mã, tên, loại, phòng; `?status=`) |
| GET | `/api/devices/:id` | Xem một thiết bị |
| POST | `/api/devices` | Thêm thiết bị |
| PUT | `/api/devices/:id` | Cập nhật thiết bị |
| DELETE | `/api/devices/:id` | Xóa thiết bị |

Mã lỗi: 400 dữ liệu/ID không hợp lệ, 404 không tìm thấy, 409 trùng `deviceId`, 503 lỗi kết nối DB.

> Không commit tệp `.env`, mật khẩu hay chuỗi kết nối MongoDB lên GitHub.
