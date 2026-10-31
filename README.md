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

> Không commit tệp `.env`, mật khẩu hay chuỗi kết nối MongoDB lên GitHub.
