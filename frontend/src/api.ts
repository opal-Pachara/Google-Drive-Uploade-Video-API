import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export interface UploadResponse {
  success: boolean;
  uploaded: number;
  folder: string;
}

export interface QuotaResponse {
  limit: number;
  usage: number;
  usage_percent: number;
}

export const uploadVideoFile = async (
  file: File,
  onUploadProgress: (progressEvent: any) => void
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('files', file);

  try {
    const response = await axios.post<UploadResponse>(`${API_URL}/api/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.detail) {
      throw new Error(error.response.data.detail);
    } else if (!navigator.onLine) {
      throw new Error("กำลังเชื่อมต่อใหม่ (กรุณาตรวจสอบอินเทอร์เน็ต)");
    } else {
      throw new Error("เกิดข้อผิดพลาดในการบันทึกไฟล์");
    }
  }
};

export const checkDuplicate = async (filename: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/api/check-duplicate`, {
      params: { filename }
    });
    return response.data.exists;
  } catch (error) {
    console.error("Error checking duplicate:", error);
    return false; // Assume not duplicate if API fails
  }
};

export const getStorageQuota = async (): Promise<QuotaResponse | null> => {
  try {
    const response = await axios.get<QuotaResponse>(`${API_URL}/api/quota`);
    return response.data;
  } catch (error) {
    console.error("Error fetching quota:", error);
    return null;
  }
};
