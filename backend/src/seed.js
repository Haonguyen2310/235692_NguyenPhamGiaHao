require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db');
const Device = require('./models/Device');

const samples = [
  { deviceId: 'MC-001', name: 'Máy chiếu Epson EB-X06', deviceType: 'Máy chiếu', room: 'A101', brand: 'Epson', model: 'EB-X06', quantity: 1, status: 'Đang sử dụng', purchaseDate: '2023-08-15', description: 'Máy chiếu 3600 lumens, độ phân giải XGA' },
  { deviceId: 'PC-001', name: 'Máy tính để bàn Dell OptiPlex', deviceType: 'Máy tính', room: 'B203', brand: 'Dell', model: 'OptiPlex 3080', quantity: 30, status: 'Đang sử dụng', purchaseDate: '2022-09-01', description: 'Phòng thực hành, i5/8GB/256GB SSD' },
  { deviceId: 'AM-001', name: 'Loa kéo di động JBL', deviceType: 'Thiết bị âm thanh', room: 'A102', brand: 'JBL', model: 'PartyBox 310', quantity: 2, status: 'Đang sửa chữa', purchaseDate: '2024-01-10', description: 'Đang bảo hành, lỗi micro' },
  { deviceId: 'MC-002', name: 'Máy chiếu ViewSonic', deviceType: 'Máy chiếu', room: 'C305', brand: 'ViewSonic', model: 'PA503S', quantity: 1, status: 'Hư hỏng', purchaseDate: '2021-05-20', description: 'Bóng đèn cháy, chờ thay thế' },
  { deviceId: 'PC-002', name: 'Máy tính xách tay Lenovo', deviceType: 'Máy tính', room: 'Kho', brand: 'Lenovo', model: 'ThinkPad E14', quantity: 5, status: 'Ngừng sử dụng', purchaseDate: '2019-03-12', description: 'Thiết bị cũ, chờ thanh lý' },
];

(async () => {
  await connectDB();
  for (const s of samples) {
    await Device.updateOne({ deviceId: s.deviceId }, { $set: s }, { upsert: true });
  }
  console.log(`Đã nạp ${samples.length} thiết bị mẫu vào collection devices`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
