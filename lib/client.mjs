// Minimal HTTP client for the Manager Library API. Uses only the public contract (api-contract.md).

export class ApiError extends Error {
  constructor(status, body) {
    super(`${status} ${body?.code ?? 'ERROR'}: ${body?.message ?? ''}`);
    this.status = status;
    this.code = body?.code;
    this.body = body;
  }
}

export function demoInstant(date) {
  // X-Demo-Now must be a UTC instant without milliseconds, e.g. 2026-09-20T10:00:00Z
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export class Api {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.token = null;
  }

  async request(method, path, { body, query, now } = {}) {
    const url = new URL(this.baseUrl + path);
    for (const [k, v] of Object.entries(query ?? {})) url.searchParams.set(k, String(v));
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    if (now) headers['X-Demo-Now'] = demoInstant(now);
    const res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new ApiError(res.status, data);
    return data;
  }

  async login(username, password) {
    const r = await this.request('POST', '/auth/login', { body: { username, password } });
    this.token = r.access_token;
    return r;
  }

  /** Reads every page of a paginated listing. */
  async all(path, query = {}) {
    const items = [];
    for (let page = 1; ; page++) {
      const r = await this.request('GET', path, { query: { ...query, page, size: 50 } });
      items.push(...r.items);
      if (items.length >= r.total || r.items.length === 0) return items;
    }
  }
}
