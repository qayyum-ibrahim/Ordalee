import { AxiosError } from 'axios';

interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<ApiErrorBody>;
    if (axiosError.response) {
      return axiosError.response.data?.error?.message || fallback;
    }
    if (axiosError.request) {
      return "Couldn't connect. Check your internet connection and try again.";
    }
  }
  return fallback;
}

export function getApiErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    return (error as AxiosError<ApiErrorBody>).response?.data?.error?.code;
  }
  return undefined;
}