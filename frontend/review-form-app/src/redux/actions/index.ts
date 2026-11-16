import { axiosInstance } from '@/lib/axiosInstance';

export const validateToken = async (
    token: string,
    onSuccess: (isValid: boolean) => void,
    onError?: (error: unknown) => void,
    setLoading?: (loading: boolean) => void
) => {
    try {
        setLoading?.(true);
        const response = await axiosInstance.get(`/form/validate/${token}`);
        if (response.data) {
            onSuccess(response.data.isValid);
        }
    } catch (error) {
        console.error('Failed to fetch event details:', error);
        onError?.(error);
    } finally {
        setLoading?.(false);
    }
};
