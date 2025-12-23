// src/lib/storage.ts
'use client';

import { encode } from 'blurhash';

export type StoragePath = 'avatars' | 'cars' | 'posts' | 'communities' | 'listings' | 'workshops' | 'events';

export interface ProcessedImage {
  file: File;
  blurhash: string;
  width: number;
  height: number;
}

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
  blurhash: string;
  width: number;
  height: number;
}

export interface UploadOptions {
  onProgress?: (progress: number) => void;
  maxWidth?: number;
  maxSizeInMB?: number;
  quality?: number;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Загружает и обрабатывает изображение: сжимает, создает BlurHash.
 * @param file Исходный файл.
 * @param options Параметры обработки.
 * @returns Обработанный файл и метаданные.
 */
export async function processImageBeforeUpload(
  file: File,
  options: Pick<UploadOptions, 'maxWidth' | 'quality'> = {}
): Promise<ProcessedImage> {
  const { maxWidth = 1920, quality = 0.8 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать файл.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Не удалось загрузить изображение.'));
      img.onload = () => {
        // --- 1. Сжатие и изменение размера ---
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Не удалось получить контекст Canvas.'));

        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // --- 2. Генерация BlurHash ---
        const imageData = ctx.getImageData(0, 0, width, height);
        const hash = encode(imageData.data, imageData.width, imageData.height, 4, 4);

        // --- 3. Получение сжатого файла ---
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Не удалось создать Blob.'));
            const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
            
            resolve({
              file: compressedFile,
              blurhash: hash,
              width,
              height,
            });
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Загрузка файла в Vercel Blob через наш API.
 */
export const uploadFile = async (
  file: File,
  pathType: StoragePath,
  entityId: string,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  const { onProgress, maxSizeInMB = 10, maxWidth = 1920 } = options;

  try {
    if (file.size > maxSizeInMB * 1024 * 1024) {
      throw new Error(`Размер файла не должен превышать ${maxSizeInMB}MB`);
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Неверный тип файла.');
    }

    if (onProgress) onProgress(10);
    const { file: processedFile, blurhash, width, height } = await processImageBeforeUpload(file, { maxWidth });
    if (onProgress) onProgress(30);

    const uniqueName = `${pathType}/${entityId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;

    const response = await fetch(`/api/upload?filename=${uniqueName}`, {
      method: 'POST',
      body: processedFile,
    });
    if (onProgress) onProgress(90);

    if (!response.ok) throw new Error('Ошибка загрузки на сервер.');

    const newBlob = await response.json();
    if (onProgress) onProgress(100);

    return {
      url: newBlob.url,
      path: newBlob.url,
      fileName: uniqueName,
      blurhash,
      width,
      height
    };
  } catch (error) {
    console.error('Ошибка uploadFile:', error);
    throw error;
  }
};

/**
 * Удаление файла из Vercel Blob через API.
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  if (!fileUrl || !fileUrl.includes('blob.vercel-storage.com')) return;
  try {
    await fetch(`/api/upload?url=${encodeURIComponent(fileUrl)}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Ошибка удаления файла:', error);
    // Не выбрасываем ошибку, чтобы не ломать UI
  }
};
