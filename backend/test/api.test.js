// Chạy: MONGODB_URI=mongodb://localhost:27017 npm test  (dùng DB riêng "device_test", sẽ bị xóa sau khi chạy)
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
let base, server;

before(async () => {
  if (!uri) return;
  await mongoose.connect(uri, { dbName: 'device_test' });
  await mongoose.connection.dropDatabase();
  const app = require('../src/app');
  require('../src/models/Device');
  await mongoose.model('Device').init();
  server = app.listen(0);
  base = `http://localhost:${server.address().port}`;
});
after(async () => {
  if (!uri) return;
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  server.close();
});

const call = (path, method = 'GET', body) =>
  fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) }).then(async (r) => ({ status: r.status, data: await r.json() }));

test('CRUD, search, validation, duplicate', { skip: !uri && 'cần MONGODB_URI' }, async () => {
  const dev = { deviceId: 'T-1', name: 'Projector Epson', deviceType: 'Máy chiếu', room: 'A1', quantity: 2 };
  assert.equal((await call('/health')).status, 200);
  const created = await call('/api/devices', 'POST', dev);
  assert.equal(created.status, 201);
  assert.equal(created.data.status, 'Đang sử dụng');
  assert.equal((await call('/api/devices', 'POST', dev)).status, 409);
  assert.equal((await call('/api/devices', 'POST', { name: 'x' })).status, 400);
  assert.equal((await call('/api/devices', 'POST', { ...dev, deviceId: 'T-2', status: 'bad' })).status, 400);
  assert.equal((await call('/api/devices?search=projector')).data.length, 1);
  assert.equal((await call('/api/devices?search=zzz')).data.length, 0);
  const id = created.data._id;
  assert.equal((await call(`/api/devices/${id}`)).status, 200);
  assert.equal((await call(`/api/devices/${id}`, 'PUT', { status: 'Hư hỏng' })).data.status, 'Hư hỏng');
  assert.equal((await call('/api/devices/abc')).status, 400);
  assert.equal((await call('/api/devices/000000000000000000000000')).status, 404);
  assert.equal((await call(`/api/devices/${id}`, 'DELETE')).status, 200);
  assert.equal((await call(`/api/devices/${id}`)).status, 404);
});
