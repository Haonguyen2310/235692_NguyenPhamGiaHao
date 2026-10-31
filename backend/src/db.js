const mongoose = require('mongoose');

// Kết nối MongoDB Atlas; thông tin lấy từ biến môi trường, không ghi cứng trong mã nguồn.
async function connectDB() {
  const { MONGODB_URI, DB_NAME } = process.env;
  if (!MONGODB_URI) throw new Error('Thiếu biến môi trường MONGODB_URI');
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME || '235692_NguyenPhamGiaHao' });
  console.log('Đã kết nối MongoDB Atlas');
}

module.exports = connectDB;
