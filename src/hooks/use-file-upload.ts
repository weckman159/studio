
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

interface UseFileUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadFiles: (files: File[], pathType: StoragePath, entityId: string) => Promise<UploadResult[]>;
  removeFile: (fileUrl: string) => Promise<void>;
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
   * Загрузка нескольких файлов
   */
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

      const uploadPromises: Promise<UploadResult>[] = [];
      const totalFiles = files.length;
      
      files.forEach((file, index) => {
        uploadPromises.push(
          uploadFile(file, pathType, entityId, {
            maxSizeInMB,
            onProgress: (fileProgress) => {
              // This progress logic is simplified. A more robust solution would
              // track progress for each file individually.
              const overallProgress = (index / totalFiles) * 100 + fileProgress / totalFiles;
              setProgress(Math.round(overallProgress));
            },
          })
        );
      });

      const results = await Promise.all(uploadPromises);
      
      onSuccess?.(results);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки файлов';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      return [];
    } finally {
      setUploading(false);
      setProgress(100); // Set to 100 on completion
    }
  }, [maxFiles, maxSizeInMB, onSuccess, onError]);

  /**
   * Удаление файла по URL
   */
  const removeFile = useCallback(async (fileUrl: string): Promise<void> => {
    try {
      await deleteFile(fileUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления файла';
      // Don't set state error here as it might be confusing for the user
      // if they are just clearing a preview
      console.error(errorMessage);
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
