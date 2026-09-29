// Thin fetch client for the QUORUM API.
// - base URL from VITE_API_URL (default http://localhost:3000)
// - attaches the Bearer token, parses the JSON envelope and turns every failure into an ApiError

const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "");
const TOKEN_KEY = "quorum.token";

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status; // 0 = the server could not be reached
    this.code = code;
    this.details = details;
  }
}

// Storage can be blocked (private window); the session then lasts until reload.
export const tokenStore = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* ignore */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

let onUnauthorized = null;
// Called when a signed-in request comes back 401 (expired or revoked token).
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

const SESSION_ERRORS = ["UNAUTHORIZED", "INVALID_TOKEN", "TOKEN_EXPIRED"];

function buildUrl(path, query) {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
  }
  return url;
}

// Resolves to the full envelope: { data, meta? }. 204 resolves to null.
// A FormData body (file uploads) is sent as-is, so fetch can set its own multipart Content-Type
// with the correct boundary; anything else is JSON-encoded.
async function request(method, path, { body, query, signal, auth = true } = {}) {
  const token = auth ? tokenStore.get() : null;
  const isForm = body instanceof FormData;

  let res;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      signal,
      headers: {
        ...(body !== undefined && !isForm && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError(0, "NETWORK_ERROR", "Cannot reach the server. Check your connection and try again.");
  }

  if (res.status === 204) return null;

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    /* non-JSON body */
  }

  if (!res.ok) {
    const e = payload?.error;
    const error = new ApiError(res.status, e?.code ?? "HTTP_ERROR", e?.message ?? `Request failed (${res.status})`, e?.details);
    if (token && res.status === 401 && SESSION_ERRORS.includes(error.code)) onUnauthorized?.();
    throw error;
  }
  return payload;
}

export const api = {
  get: (path, opts) => request("GET", path, opts),
  post: (path, opts) => request("POST", path, opts),
  put: (path, opts) => request("PUT", path, opts),
  delete: (path, opts) => request("DELETE", path, opts),
  // Uploads one file as multipart/form-data under `field` (matches the API's expected form field name).
  upload: (path, { file, field = "image", signal } = {}) => {
    const form = new FormData();
    form.append(field, file);
    return request("POST", path, { body: form, signal });
  },
};
