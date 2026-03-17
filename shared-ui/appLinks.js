const APP_PORTS = {
  user: 3000,
  task: 3001,
  notifications: 3002,
  reporting: 3003,
};

function getToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem('token') || '';
}

function buildQueryString(query = {}) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    params.set(key, String(value));
  });

  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

function getBaseOrigin(port) {
  if (typeof window === 'undefined') {
    return `http://127.0.0.1:${port}`;
  }
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:${port}`;
}

export function buildAppUrl(app, path = '/', options = {}) {
  const port = APP_PORTS[app];

  if (!port) {
    throw new Error(`Unknown app key: ${app}`);
  }

  const {
    includeToken = true,
    query = {},
  } = options;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const queryString = buildQueryString(query);
  const baseUrl = `${getBaseOrigin(port)}${normalizedPath}${queryString}`;

  if (!includeToken) {
    return baseUrl;
  }

  const token = getToken();
  return token ? `${baseUrl}#token=${encodeURIComponent(token)}` : baseUrl;
}

export function redirectToApp(app, path = '/', options = {}) {
  globalThis.location.href = buildAppUrl(app, path, options);
}
