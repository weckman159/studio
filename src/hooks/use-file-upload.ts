
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
  onSuccess?: (results: UploadResult) => void;
  onError?: (error: Error) => void;
}

interface UseFileUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadedFile: UploadResult | null;
  upload: (file: File, pathType: StoragePath, entityId: string) => Promise<UploadResult | null>;
  remove: (filePath: string) => Promise<void>;
  reset: () => void;
  setUploadedFile: (file: UploadResult | null) => void;
}

/**
 * Хук для управления загрузкой ОДНОГО файла в Firebase Storage
 */
export const useFileUpload = (options: UseFileUploadOptions = {}): UseFileUploadReturn => {
  const {
    maxSizeInMB = 5,
    onSuccess,
    onError
  } = options;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadResult | null>(null);

  /**
   * Загрузка файла
   */
  const upload = useCallback(async (
    file: File,
    pathType: StoragePath,
    entityId: string
  ): Promise<UploadResult | null> => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const result = await uploadFile(file, pathType, entityId, {
        maxSizeInMB,
        onProgress: (p) => setProgress(p)
      });

      setUploadedFile(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки файла';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      return null;
    } finally {
      setUploading(false);
      // Не сбрасываем прогресс, чтобы он был виден до закрытия
    }
  }, [maxSizeInMB, onSuccess, onError]);


  /**
   * Удаление файла
   */
  const remove = useCallback(async (filePath: string): Promise<void> => {
    try {
      await deleteFile(filePath);
      setUploadedFile(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления файла';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [onError]);

  /**
   * Сброс состояния
   */
  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setUploadedFile(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadedFile,
    upload,
    remove,
    reset,
    setUploadedFile,
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
export const useCarPhotoUpload = () => {
  return useFileUpload({
    maxFiles: 1,
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
