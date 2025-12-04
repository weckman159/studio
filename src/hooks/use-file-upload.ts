
'use client';

import { useState, useCallback } from 'react';
import { 
  uploadFile, 
  deleteFile,
  StoragePath,
  UploadResult 
} from '@/lib/storage';

interface UseFileUploadOptions {
  maxFiles?: number;
  maxSizeInMB?: number;
  onSuccess?: (results: UploadResult[]) => void;
  onError?: (error: Error) => void;
}

export interface UseFileUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadFiles: (files: File[], pathType: StoragePath, entityId: string) => Promise<UploadResult[]>;
  removeFile: (fileUrl: string) => Promise<void>;
  reset: () => void;
}

export const useFileUpload = (options: UseFileUploadOptions = {}): UseFileUploadReturn => {
  const {
    maxFiles = 10,
    maxSizeInMB = 5,
    onSuccess,
    onError
  } = options;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(async (
    files: File[],
    pathType: StoragePath,
    entityId: string
  ): Promise<UploadResult[]> => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      if (files.length > maxFiles) {
        throw new Error(`Можно загрузить максимум ${maxFiles} файлов`);
      }

      const results: UploadResult[] = [];
      
      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const result = await uploadFile(file, pathType, entityId, {
              maxSizeInMB,
              onProgress: (val) => {
                  const total = ((i * 100) + val) / files.length;
                  setProgress(Math.round(total));
              }
          });
          results.push(result);
      }
      
      onSuccess?.(results);
      return results;
    } catch (err: any) {
      const msg = err.message || 'Ошибка загрузки';
      setError(msg);
      onError?.(err);
      return [];
    } finally {
      setUploading(false);
      setProgress(100);
    }
  }, [maxFiles, maxSizeInMB, onSuccess, onError]);

  const removeFile = useCallback(async (fileUrl: string): Promise<void> => {
      await deleteFile(fileUrl);
  }, []);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadFiles,
    removeFile,
    reset
  };
};

/**
 * Упрощенный хук для загрузки аватара
 */
export const useAvatarUpload = () => {
  return useFileUpload({
    maxFiles: 1,
    maxSizeInMB: 2
  });
};

/**
 * Хук для загрузки фото автомобилей
 */
export const useCarPhotosUpload = () => {
  return useFileUpload({
    maxFiles: 10,
    maxSizeInMB: 5
  });
};

/**
 * Хук для загрузки изображений в посты
 */
export const usePostImagesUpload = () => {
  return useFileUpload({
    maxFiles: 10,
    maxSizeInMB: 5
  });
};
