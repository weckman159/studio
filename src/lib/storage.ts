// src/lib/storage.ts
'use client';

export type StoragePath = 
  | 'avatars'
  | 'cars'
  | 'posts'
  | 'communities'
  | 'listings'
  | 'workshops'
  | 'events'
  | 'news';

export interface UploadOptions {
  onProgress?: (progress: number) => void;
  maxSizeInMB?: number;
}

export interface UploadResult {
  url: string;
  path: string; // Для Vercel Blob это будет просто URL
  fileName: string;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Валидация изображения
 */
const validateImage = (file: File, maxSizeInMB: number = 5): void => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Неверный тип файла. Разрешены только: JPG, PNG, WEBP, GIF');
  }
  if (file.size > maxSizeInMB * 1024 * 1024) {
    throw new Error(`Размер файла не должен превышать ${maxSizeInMB}MB`);
  }
};

/**
 * Загрузка файла через Vercel Blob (через наш API)
 */
export const uploadFile = async (
  file: File,
  pathType: StoragePath,
  entityId: string, // В Vercel Blob папки виртуальные, но мы можем добавить префикс в имя
  options: UploadOptions = {}
): Promise<UploadResult> => {
  const { onProgress, maxSizeInMB = 5 } = options;

  try {
    validateImage(file, maxSizeInMB);

    // Эмуляция прогресса (Vercel Blob пока не дает стрим прогресса на клиенте через fetch)
    if (onProgress) onProgress(10);

    // Формируем уникальное имя: folder/id-filename
    const uniqueName = `${pathType}/${entityId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;

    if (onProgress) onProgress(30);

    const response = await fetch(`/api/upload?filename=${uniqueName}`, {
      method: 'POST',
      body: file,
    });

    if (onProgress) onProgress(80);

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const newBlob = await response.json();

    if (onProgress) onProgress(100);

    return {
      url: newBlob.url,
      path: newBlob.url, // В Vercel Blob URL является путем
      fileName: uniqueName
    };

  } catch (error) {
    console.error('Ошибка uploadFile:', error);
    throw error;
  }
};

/**
 * Удаление файла через API
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  if (!fileUrl || !fileUrl.includes('blob.vercel-storage.com')) return;
  
  try {
    await fetch(`/api/upload?url=${encodeURIComponent(fileUrl)}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Ошибка удаления файла:', error);
    // Не выбрасываем ошибку, чтобы не ломать UI, если файл уже удален
  }
};
