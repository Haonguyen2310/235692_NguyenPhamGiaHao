require('dotenv').config();
const app = require('./app');
const connectDB = require('./db');

const PORT = process.env.PORT || 5000;

// Mở cổng trước để /health luôn trả lời; kết nối DB chạy song song.
app.listen(PORT, () => console.log(`Backend chạy tại cổng ${PORT}`));
connectDB().catch((e) => { console.error('Không kết nối được MongoDB:', e.message); process.exit(1); });
