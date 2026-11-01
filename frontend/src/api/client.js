let token = null;
let onUnauthorized = () => {};

export function setToken(newToken) {
  token = newToken;
}

export function setOnUnauthorized(fn) {   // AuthContext registra qui il suo logout
  onUnauthorized = fn;
}

async function request(method, path, body, extraHeaders = {}) {
  const headers = { ...extraHeaders };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch("/api" + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    const err = new Error(data?.error ?? `Errore ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body = {}) => request("POST", path, body),
  patch: (path, body = {}, headers) => request("PATCH", path, body, headers),
  put: (path, body = {}) => request("PUT", path, body),
  del: (path) => request("DELETE", path),
};
