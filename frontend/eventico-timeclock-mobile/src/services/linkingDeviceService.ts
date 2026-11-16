import api from './api';
import { clearAccessToken, saveAccessToken } from '../storage/authSession';

export interface LinkedDeviceDto {
  id: number | null;
  projectId: number | null;
  deviceId: string;
  updatedAt: string | null;
  isExpired: boolean | null;
}

function messageFromError(error: any) {
  return error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Network error';
}

function normaliseError(error: any) {
  return new Error(messageFromError(error));
}

export async function validateSecurityCode(username: string, password: string): Promise<boolean> {
  try {
    const login = await api.post('/v1/auth/login', { username, password });
    const token = login.data?.token;
    if (!token) throw new Error('Admin login did not return a session token');
    await saveAccessToken(token);
    const response = await api.get('/admin-config/validate');
    return Boolean(response.data);
  } catch (error: any) {
    await clearAccessToken();
    throw normaliseError(error);
  }
}

export async function fetchCurrentLink(deviceId: string): Promise<LinkedDeviceDto | null> {
  try {
    const response = await api.get('/admin-config/get', { params: { deviceId } });
    return response.data as LinkedDeviceDto;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw normaliseError(error);
  }
}

export async function linkDeviceToProject(payload: {
  projectId: number;
  deviceId: string;
}): Promise<LinkedDeviceDto> {
  try {
    const response = await api.post('/admin-config/link', payload);
    return response.data as LinkedDeviceDto;
  } catch (error: any) {
    throw normaliseError(error);
  }
}
