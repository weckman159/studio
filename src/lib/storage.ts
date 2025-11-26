// src/lib/storage.ts
'use client';

import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable,
  UploadTaskSnapshot 
} from 'firebase/storage';
import { getStorage } from 'firebase/storage';
import { initializeFirebase } from '@/firebase/index';

const { storage } = initializeFirebase();

/**
 * Типы путей для Storage
 */
export type StoragePath = 
  | 'avatars'
  | 'cars'
  | 'posts'
  | 'communities'
  | 'listings'
  | 'workshops'
  | 'events'
  | 'news';

/**
 * Опции для загрузки файла
 */
export interface UploadOptions {
  onProgress?: (progress: number) => void;
  maxSizeInMB?: number;
}

/**
 * Результат загрузки файла
 */
export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
}

/**
 * Генерирует уникальное имя файла
 */
const generateFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${randomStr}.${extension}`;
};

/**
 * Валидация изображения
 */
const validateImage = (file: File, maxSizeInMB: number = 5): void => {
  // Проверка типа файла
  if (!file.type.startsWith('image/')) {
    throw new Error('Файл должен быть изображением');
  }

  // Проверка размера
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    throw new Error(`Размер файла не должен превышать ${maxSizeInMB}MB`);
  }

  // Поддерживаемые форматы
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Поддерживаются только форматы: JPG, PNG, WEBP');
  }
};

/**
 * Сжатие изображения
 */
export const compressImage = async (
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Пропорциональное изменение размера
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Ошибка сжатия изображения'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Ошибка загрузки изображения'));
    };
    
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
  });
};

/**
 * Загрузка одного файла в Storage
 */
export const uploadFile = async (
  file: File,
  pathType: StoragePath,
  entityId: string,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  const { onProgress, maxSizeInMB = 5 } = options;

  try {
    // Валидация
    validateImage(file, maxSizeInMB);

    // Сжатие изображения
    const compressedFile = await compressImage(file);

    // Генерация имени файла
    const fileName = generateFileName(file.name);
    const storagePath = `${pathType}/${entityId}/${fileName}`;
    
    // Создание ссылки на файл
    const storageRef = ref(storage, storagePath);

    // Загрузка с прогрессом
    if (onProgress) {
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          },
          (error) => {
            console.error('Ошибка загрузки:', error);
            reject(new Error('Ошибка загрузки файла'));
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ url, path: storagePath, fileName });
          }
        );
      });
    } else {
      // Простая загрузка без прогресса
      await uploadBytes(storageRef, compressedFile);
      const url = await getDownloadURL(storageRef);
      return { url, path: storagePath, fileName };
    }
  } catch (error) {
    console.error('Ошибка uploadFile:', error);
    throw error;
  }
};


/**
 * Удаление файла из Storage по URL
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
    if (!fileUrl.includes('firebasestorage.googleapis.com')) {
        // Not a firebase storage URL, probably a blob URL for preview. Ignore.
        return;
    }
  try {
    const storageRef = ref(storage, fileUrl);
    await deleteObject(storageRef);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
        console.warn(`File not found, could not delete: ${fileUrl}`);
        return; // Ignore not found errors
    }
    console.error('Ошибка удаления файла:', error);
    throw new Error('Не удалось удалить файл');
  }
};

/**
 * Конвертация data URI в File
 * Используется для миграции старых изображений
 */
export const dataURItoFile = (dataURI: string, fileName: string): File => {
  const arr = dataURI.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], fileName, { type: mime });
};

/**
 * Миграция data URI изображения в Storage
 * Полезно для перехода со старой системы
 */
export const migrateDataURItoStorage = async (
  dataURI: string,
  pathType: StoragePath,
  entityId: string,
  fileName: string = 'image.jpg'
): Promise<UploadResult> => {
  const file = dataURItoFile(dataURI, fileName);
  return uploadFile(file, pathType, entityId);
};

/**
 * Проверка, является ли строка data URI
 */
export const isDataURI = (str: string): boolean => {
  return str.startsWith('data:image/');
};
