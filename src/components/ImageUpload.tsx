
'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useFileUpload } from '@/hooks/use-file-upload';
import type { StoragePath, UploadResult } from '@/lib/storage';

interface ImageUploadProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  storagePath: StoragePath;
  entityId: string;
  multiple?: boolean;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  storagePath,
  entityId,
  multiple = false,
  maxFiles = 1,
  disabled = false,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [previews, setPreviews] = useState<string[]>([]);

  const {
    uploading,
    progress,
    uploadSingle,
    uploadMultiple,
    remove,
    error,
    reset,
  } = useFileUpload({
    onSuccess: (results) => {
        const newUrls = results.map(r => r.url);
        if (multiple) {
            onChange([...previews, ...newUrls]);
        } else {
            onChange(newUrls[0] || '');
        }
    },
    onError: (err) => {
        console.error("Upload error:", err);
        // Optionally show a toast message here
    }
  });

  useEffect(() => {
    const urls = Array.isArray(value) ? value : value ? [value] : [];
    setPreviews(urls);
  }, [value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (multiple && previews.length + files.length > maxFiles) {
      alert(`Можно загрузить максимум ${maxFiles} изображений`);
      return;
    }

    if (multiple) {
        await uploadMultiple(files, storagePath, entityId);
    } else if (files[0]) {
        if(previews.length > 0) {
           await remove(previews[0]);
        }
        await uploadSingle(files[0], storagePath, entityId);
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemove = async (urlToRemove: string) => {
    await remove(urlToRemove);
    const newUrls = previews.filter(url => url !== urlToRemove);
    onChange(multiple ? newUrls : '');
  };

  const handleClick = () => {
    inputRef.current?.click();
  };
  
  const currentFilesCount = previews.length;

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={disabled || uploading || (multiple && currentFilesCount >= maxFiles)}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? `Загрузка: ${progress}%` : 'Выбрать изображения'}
        </Button>

        {multiple && (
          <p className="text-xs text-muted-foreground mt-2">
            Загружено: {currentFilesCount} / {maxFiles}
          </p>
        )}
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      
      {uploading && !multiple && <Progress value={progress} className="w-full" />}

      {previews.length > 0 && (
        <div className={cn(
          'grid gap-4',
          multiple ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'
        )}>
          {previews.map((url, index) => (
            <div
              key={url}
              className="relative group aspect-video rounded-lg overflow-hidden border border-border bg-muted"
            >
              <Image
                src={url}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
              />
              
              {!disabled && !uploading && (
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {previews.length === 0 && !uploading && (
        <div
          onClick={handleClick}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        >
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Нажмите, чтобы выбрать изображение
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG, WEBP (макс. 5MB)
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Компонент для загрузки одного изображения (аватар, обложка)
 */
export const SingleImageUpload: React.FC<Omit<ImageUploadProps, 'multiple' | 'maxFiles'>> = (props) => {
  return <ImageUpload {...props} multiple={false} maxFiles={1} />;
};

/**
 * Компонент для загрузки нескольких изображений (галерея)
 */
export const MultipleImageUpload: React.FC<Omit<ImageUploadProps, 'multiple'>> = (props) => {
  return <ImageUpload {...props} multiple={true} />;
};
