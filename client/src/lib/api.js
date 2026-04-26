const DEFAULT_LOCAL_API_URL = 'http://localhost:5000';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_URL || DEFAULT_LOCAL_API_URL,
);

export const apiUrl = (path = '') => {
  if (/^https?:\/\//i.test(path)) {
    if (path.startsWith(DEFAULT_LOCAL_API_URL)) {
      return `${API_BASE_URL}${path.slice(DEFAULT_LOCAL_API_URL.length)}`;
    }
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
