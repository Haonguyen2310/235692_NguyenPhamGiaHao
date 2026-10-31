const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Device = require('./models/Device');

const app = express();

const origins = (process.env.CORS_ORIGIN || '*').split(',').map((s) => s.trim());
app.use(cors({ origin: origins.includes('*') ? true : origins }));
app.use(express.json());

app.get('/health', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({ status: dbUp ? 'ok' : 'degraded', database: dbUp ? 'connected' : 'disconnected', uptime: process.uptime() });
});

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const FIELDS = ['deviceId', 'name', 'deviceType', 'room', 'brand', 'model', 'quantity', 'status', 'purchaseDate', 'description'];
const pick = (body) => Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));
const validId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id) ? next() : res.status(400).json({ message: 'ID thiết bị không hợp lệ' });

app.get('/api/devices', async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search && search.trim()) {
      const re = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = ['deviceId', 'name', 'deviceType', 'room'].map((f) => ({ [f]: re }));
    }
    res.json(await Device.find(filter).sort({ createdAt: -1 }));
  } catch (e) { next(e); }
});

app.get('/api/devices/:id', validId, async (req, res, next) => {
  try {
    const d = await Device.findById(req.params.id);
    if (!d) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    res.json(d);
  } catch (e) { next(e); }
});

app.post('/api/devices', async (req, res, next) => {
  try {
    res.status(201).json(await Device.create(pick(req.body)));
  } catch (e) { next(e); }
});

app.put('/api/devices/:id', validId, async (req, res, next) => {
  try {
    const d = await Device.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
    if (!d) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    res.json(d);
  } catch (e) { next(e); }
});

app.delete('/api/devices/:id', validId, async (req, res, next) => {
  try {
    const d = await Device.findByIdAndDelete(req.params.id);
    if (!d) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    res.json({ message: 'Đã xóa thiết bị', id: d._id });
  } catch (e) { next(e); }
});

app.use((req, res) => res.status(404).json({ message: 'Endpoint không tồn tại' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: Object.values(err.errors).map((e) => e.message) });
  }
  if (err.code === 11000) return res.status(409).json({ message: 'Mã thiết bị (deviceId) đã tồn tại' });
  if (err.name === 'CastError') return res.status(400).json({ message: `Giá trị không hợp lệ cho trường ${err.path}` });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'JSON không hợp lệ' });
  if (/Mongo|buffering timed out/i.test(err.name + err.message)) return res.status(503).json({ message: 'Lỗi kết nối cơ sở dữ liệu' });
  console.error(err);
  res.status(500).json({ message: 'Lỗi máy chủ' });
});

module.exports = app;
