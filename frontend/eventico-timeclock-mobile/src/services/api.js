import axios from 'axios';
import { Platform } from 'react-native';
import { API_BASE_URL } from '@env';
import { getAccessToken } from '../storage/authSession';

function normalizeBaseUrl(raw) {
  try {
    if (!raw) return null;
    const u = new URL(raw);
    if (Platform.OS === 'android' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) {
      u.hostname = '10.0.2.2';
      return u.toString().replace(/\/$/, '');
    }
    return raw.replace(/\/$/, '');
  } catch {
    return raw;
  }
}

const baseURL = normalizeBaseUrl(API_BASE_URL) || 'http://localhost:8060/api';

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const url = config.url || '';
  if (url.endsWith('/users/verify') || url.endsWith('/v1/auth/login')) {
    return config;
  }
  const token = await getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));
api.interceptors.response.use((response) => response, (error) => Promise.reject(error));

export default api;
