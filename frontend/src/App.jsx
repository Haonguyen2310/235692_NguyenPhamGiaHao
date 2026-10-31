import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

const STATUSES = ['Đang sử dụng', 'Hư hỏng', 'Đang sửa chữa', 'Ngừng sử dụng'];
const STATUS_CLASS = { 'Đang sử dụng': 'ok', 'Hư hỏng': 'bad', 'Đang sửa chữa': 'fix', 'Ngừng sử dụng': 'off' };
const EMPTY = { deviceId: '', name: '', deviceType: '', room: '', brand: '', model: '', quantity: 1, status: STATUSES[0], purchaseDate: '', description: '' };

const Badge = ({ status }) => <span className={`badge ${STATUS_CLASS[status] || ''}`}>{status}</span>;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');

export default function App() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(null); // null | {mode:'create'|'edit', data}
  const [saving, setSaving] = useState(false);

  const notify = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setDevices(await api.list(query));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (id) => {
    try { setDetail(await api.get(id)); } catch (e) { notify(e.message, 'error'); }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { _id, createdAt, updatedAt, __v, ...payload } = form.data;
    payload.quantity = Number(payload.quantity);
    if (!payload.purchaseDate) delete payload.purchaseDate;
    try {
      if (form.mode === 'create') await api.create(payload);
      else await api.update(_id, payload);
      notify(form.mode === 'create' ? 'Đã thêm thiết bị' : 'Đã cập nhật thiết bị');
      setForm(null);
      load();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (d) => {
    if (!window.confirm(`Xóa thiết bị "${d.name}" (${d.deviceId})?`)) return;
    try {
      await api.remove(d._id);
      notify('Đã xóa thiết bị');
      load();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const openEdit = (d) => setForm({ mode: 'edit', data: { ...d, purchaseDate: d.purchaseDate ? d.purchaseDate.slice(0, 10) : '' } });
  const set = (k) => (e) => setForm((f) => ({ ...f, data: { ...f.data, [k]: e.target.value } }));

  return (
    <div className="container">
      <header>
        <h1>Quản lý thiết bị phòng học</h1>
        <button className="primary" onClick={() => setForm({ mode: 'create', data: EMPTY })}>+ Thêm thiết bị</button>
      </header>

      <form className="search" onSubmit={(e) => { e.preventDefault(); setQuery(search); }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo mã, tên, loại thiết bị, phòng học..." />
        <button>Tìm kiếm</button>
        {query && <button type="button" onClick={() => { setSearch(''); setQuery(''); }}>Xóa lọc</button>}
      </form>

      {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}
      {error && <div className="alert">{error} <button onClick={load}>Thử lại</button></div>}
      {loading && <p className="muted">Đang tải dữ liệu...</p>}

      {!loading && !error && (
        <table>
          <thead>
            <tr><th>Mã</th><th>Tên thiết bị</th><th>Loại</th><th>Phòng</th><th>SL</th><th>Tình trạng</th><th></th></tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d._id}>
                <td>{d.deviceId}</td><td>{d.name}</td><td>{d.deviceType}</td><td>{d.room}</td><td>{d.quantity}</td>
                <td><Badge status={d.status} /></td>
                <td className="actions">
                  <button onClick={() => openDetail(d._id)}>Chi tiết</button>
                  <button onClick={() => openEdit(d)}>Sửa</button>
                  <button className="danger" onClick={() => remove(d)}>Xóa</button>
                </td>
              </tr>
            ))}
            {!devices.length && <tr><td colSpan="7" className="muted">Không có thiết bị nào.</td></tr>}
          </tbody>
        </table>
      )}

      {detail && (
        <div className="modal" onClick={() => setDetail(null)}>
          <div className="card" onClick={(e) => e.stopPropagation()}>
            <h2>{detail.name}</h2>
            <dl>
              {[['Mã thiết bị', detail.deviceId], ['Loại', detail.deviceType], ['Phòng học', detail.room], ['Hãng', detail.brand || '—'],
                ['Model', detail.model || '—'], ['Số lượng', detail.quantity], ['Ngày mua/tiếp nhận', fmtDate(detail.purchaseDate)], ['Mô tả', detail.description || '—']]
                .map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
              <div><dt>Tình trạng</dt><dd><Badge status={detail.status} /></dd></div>
            </dl>
            <button onClick={() => setDetail(null)}>Đóng</button>
          </div>
        </div>
      )}

      {form && (
        <div className="modal">
          <form className="card" onSubmit={save}>
            <h2>{form.mode === 'create' ? 'Thêm thiết bị' : 'Cập nhật thiết bị'}</h2>
            <label>Mã thiết bị *<input required value={form.data.deviceId} onChange={set('deviceId')} /></label>
            <label>Tên thiết bị *<input required value={form.data.name} onChange={set('name')} /></label>
            <label>Loại thiết bị *<input required value={form.data.deviceType} onChange={set('deviceType')} /></label>
            <label>Phòng học *<input required value={form.data.room} onChange={set('room')} /></label>
            <label>Hãng sản xuất<input value={form.data.brand} onChange={set('brand')} /></label>
            <label>Model<input value={form.data.model} onChange={set('model')} /></label>
            <label>Số lượng *<input required type="number" min="0" step="1" value={form.data.quantity} onChange={set('quantity')} /></label>
            <label>Tình trạng
              <select value={form.data.status} onChange={set('status')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            </label>
            <label>Ngày mua/tiếp nhận<input type="date" value={form.data.purchaseDate} onChange={set('purchaseDate')} /></label>
            <label>Mô tả<textarea rows="2" value={form.data.description} onChange={set('description')} /></label>
            <div className="row">
              <button type="button" onClick={() => setForm(null)}>Hủy</button>
              <button className="primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
