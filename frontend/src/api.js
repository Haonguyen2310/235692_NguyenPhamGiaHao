const BASE = (window.APP_CONFIG?.API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  } catch {
    throw new Error('Không kết nối được tới máy chủ. Vui lòng thử lại sau.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error([data.message, ...(data.errors || [])].filter(Boolean).join(': ') || `Lỗi ${res.status}`);
  return data;
}

export const api = {
  list: (search = '') => request(`/api/devices${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  get: (id) => request(`/api/devices/${id}`),
  create: (d) => request('/api/devices', { method: 'POST', body: JSON.stringify(d) }),
  update: (id, d) => request(`/api/devices/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  remove: (id) => request(`/api/devices/${id}`, { method: 'DELETE' }),
};
