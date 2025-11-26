
'use client';

import { useState, useCallback } from 'react';
import { 
  uploadFile, 
  uploadMultipleFiles, 
  deleteFile,
  extractPathFromURL,
  StoragePath,
  UploadResult 
} from '@/lib/storage';

interface UseFileUploadOptions {
  maxFiles?: number;
  maxSizeInMB?: number;
  onSuccess?: (results: UploadResult[]) => void;
  onError?: (error: Error) => void;
}

interface UseFileUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadSingle: (file: File, pathType: StoragePath, entityId: string) => Promise<UploadResult | null>;
  uploadMultiple: (files: File[], pathType: StoragePath, entityId: string) => Promise<UploadResult[]>;
  remove: (fileUrl: string) => Promise<void>;
  reset: () => void;
}

/**
 * Хук для управления загрузкой файлов в Firebase Storage
 */
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

  /**
   * Загрузка одного файла
   */
  const uploadSingle = useCallback(async (
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
      
      onSuccess?.([result]);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки файла';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [maxSizeInMB, onSuccess, onError]);

  /**
   * Загрузка нескольких файлов
   */
  const uploadMultiple = useCallback(async (
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

      const results = await uploadMultipleFiles(
        files,
        pathType,
        entityId,
        {
          maxSizeInMB,
          onProgress: setProgress,
        }
      );
      
      onSuccess?.(results);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки файлов';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      return [];
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [maxFiles, maxSizeInMB, onSuccess, onError]);

  /**
   * Удаление файла по URL
   */
  const remove = useCallback(async (fileUrl: string): Promise<void> => {
    const filePath = extractPathFromURL(fileUrl);
    if (!filePath) {
      const msg = "Неверный URL файла для удаления";
      setError(msg);
      onError?.(new Error(msg));
      return;
    }

    try {
      await deleteFile(filePath);
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
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadSingle,
    uploadMultiple,
    remove,
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
