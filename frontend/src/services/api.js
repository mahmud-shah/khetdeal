const BASE = '/api';

function token() {
  return localStorage.getItem('kd-token');
}

async function request(path, opts = {}) {
  const t = token();
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(t && { Authorization: `Bearer ${t}` }),
      ...opts.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  auth: {
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request('/auth/me'),
  },
  profiles: {
    get: (id) => request(`/profiles/${id}`),
    updateMe: (body) => request('/profiles/me', { method: 'PUT', body: JSON.stringify(body) }),
  },
  listings: {
    all: (params = {}) => {
      const q = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      return request(`/listings${q ? '?' + q : ''}`);
    },
    mine: () => request('/listings/mine'),
    one: (id) => request(`/listings/${id}`),
    create: (body) => request('/listings', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/listings/${id}`, { method: 'DELETE' }),
    status: (id, status) => request(`/listings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  offers: {
    send: (body) => request('/offers', { method: 'POST', body: JSON.stringify(body) }),
    received: () => request('/offers/received'),
    sent: () => request('/offers/sent'),
    respond: (id, status) => request(`/offers/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  notifs: {
    all: () => request('/notifications'),
    unread: () => request('/notifications/unread-count'),
    read: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    readAll: () => request('/notifications/read-all', { method: 'PATCH' }),
  },
  orders: {
    all: () => request('/orders'),
    one: (id) => request(`/orders/${id}`),
  },
  geo: {
    crops: () => request('/geo/crops'),
    aggregate: (params) => {
      const q = Object.entries(params)
        .filter(([, v]) => v)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      return request(`/geo/aggregate?${q}`);
    },
  },
  stats: () => request('/stats/dashboard'),
};
