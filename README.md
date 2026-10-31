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

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
npm run build   # xuất ra frontend/dist
```

Địa chỉ backend lấy từ `frontend/public/config.js` (`window.APP_CONFIG.API_URL`, đổi được khi
triển khai mà không cần build lại), nếu không có thì dùng biến build `VITE_API_URL`.
Chức năng: danh sách, chi tiết, thêm, sửa, xóa, tìm kiếm, hiển thị tình trạng bằng nhãn màu,
trạng thái đang tải, thông báo lỗi/kết quả thao tác.

### Chạy backend bằng Docker

```bash
docker build -t haonguyen235692/backend ./backend
docker run -d --name backend -p 5000:5000 \
  -e MONGODB_URI="<chuỗi kết nối Atlas>" \
  -e DB_NAME=235692_NguyenPhamGiaHao \
  -e CORS_ORIGIN=http://localhost:8080 \
  haonguyen235692/backend
curl http://localhost:5000/health
```

Image trên Docker Hub: `docker pull haonguyen235692/backend`
(https://hub.docker.com/r/haonguyen235692/backend). Image không chứa thông tin bí mật;
chuỗi kết nối được truyền qua biến môi trường lúc chạy.

### Chạy frontend bằng Docker

```bash
docker build -t haonguyen235692/frontend ./frontend
docker run -d --name frontend -p 8080:80 \
  -e API_URL=http://localhost:5000 \
  haonguyen235692/frontend
# mở http://localhost:8080
```

`API_URL` là địa chỉ backend; container sinh lại `config.js` từ biến này mỗi lần khởi động
nên không cần build lại image khi đổi backend. Trên Render, image lắng nghe theo biến `PORT`.
Image: `docker pull haonguyen235692/frontend` (https://hub.docker.com/r/haonguyen235692/frontend).

> Không commit tệp `.env`, mật khẩu hay chuỗi kết nối MongoDB lên GitHub.
