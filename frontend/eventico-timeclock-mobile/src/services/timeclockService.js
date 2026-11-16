import api from './api';
import { saveAccessToken, saveActiveUserId } from '../storage/authSession';

function messageFromError(error) {
  return error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Network error';
}

function asError(error) {
  const result = new Error(messageFromError(error));
  result.status = error?.response?.status;
  return result;
}

export const timeclockService = {
  punch: async (pin, action = null) => {
    try {
      const response = await api.post('/timeclock/punch', {
        pin,
        action,
      });
      return response.data;
    } catch (error) {
      throw asError(error);
    }
  },

  punchWithMeta: async ({ action, ts, userId, deviceLink }) => {
    try {
      const timeClockDto = {
        action,
        timestamp: ts,
        userId,
      };
      const response = await api.post('/timeclock/punch', {
        timeClockDto,
        linkedDeviceDto: deviceLink ?? null,
      });
      if (response.data?.success !== true) {
        throw new Error(response.data?.message || 'Punch was rejected by the server');
      }
      return response.data;
    } catch (error) {
      throw asError(error);
    }
  },

  verifyUser: async (pin, deviceId) => {
    try {
      const response = await api.post('/users/verify', { pin, deviceId });
      if (!response.data?.success || !response.data?.accessToken || !response.data?.user) {
        throw new Error('PIN verification response was incomplete');
      }
      await saveAccessToken(response.data.accessToken);
      await saveActiveUserId(String(response.data.user.id));
      return response.data;
    } catch (error) {
      throw asError(error);
    }
  },

  getEvents: async () => {
    try {
      const response = await api.get('/timeclock/punch');
      return response.data;
    } catch (error) {
      throw asError(error);
    }
  },
};
