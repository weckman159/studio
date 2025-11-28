
'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useFileUpload } from '@/hooks/use-file-upload';
import { deleteFile } from '@/lib/storage';

interface ImageUploadProps {
  value?: string | string[];
  onChange: (urls: string | string[]) => void;
  onFilesSelected?: (files: File[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  disabled?: boolean;
  uploading?: boolean;
  progress?: number;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onFilesSelected,
  multiple = false,
  maxFiles = 1,
  disabled = false,
  uploading = false,
  progress = 0,
  className
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [localFiles, setLocalFiles] = useState<File[]>([]);

  useEffect(() => {
    const urls = Array.isArray(value) ? value : (value ? [value] : []);
    setPreviews(urls);
  }, [value]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (multiple && previews.length + files.length > maxFiles) {
      alert(`Можно загрузить максимум ${maxFiles} изображений`);
      return;
    }

    const newLocalFiles = multiple ? [...localFiles, ...files] : files;
    setLocalFiles(newLocalFiles);
    
    const newPreviews = newLocalFiles.map(file => URL.createObjectURL(file));
    const remoteUrls = (Array.isArray(value) ? value : (value ? [value] : [])).filter(url => !url.startsWith('blob:'));
    setPreviews([...remoteUrls, ...newPreviews]);
    
    onFilesSelected?.(newLocalFiles);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemove = async (urlToRemove: string) => {
    const newPreviews = previews.filter(url => url !== urlToRemove);
    setPreviews(newPreviews);

    if (urlToRemove.startsWith('blob:')) {
      const blobIndex = previews.findIndex(p => p === urlToRemove);
      const remoteUrlCount = (Array.isArray(value) ? value : (value ? [value] : [])).length;
      const fileIndexToRemove = blobIndex - remoteUrlCount;
      
      const newLocalFiles = localFiles.filter((_, i) => i !== fileIndexToRemove);
      setLocalFiles(newLocalFiles);
      onFilesSelected?.(newLocalFiles);
    } else {
        // This is a remote URL, we should not delete it from storage here.
        // The parent component is responsible for deleting from storage if needed.
    }
    
    const finalUrls = newPreviews.filter(url => !url.startsWith('blob:'));
    onChange(multiple ? finalUrls : (finalUrls[0] || ''));
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

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
          disabled={disabled || uploading || (multiple && previews.length >= maxFiles)}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? `Загрузка: ${progress}%` : 'Выбрать изображения'}
        </Button>

        {multiple && (
          <p className="text-xs text-muted-foreground mt-2">
            Загружено: {previews.length} / {maxFiles}
          </p>
        )}
      </div>
      
      {uploading && <Progress value={progress} className="w-full" />}

      {previews.length > 0 && (
        <div className={cn(
          'grid gap-4',
          multiple ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'
        )}>
          {previews.map((url) => (
            <div
              key={url}
              className="relative group aspect-video rounded-lg overflow-hidden border border-border bg-muted"
            >
              <Image
                src={url}
                alt="Предпросмотр"
                fill
                className="object-cover"
                onLoad={() => { if(url.startsWith('blob:')) URL.revokeObjectURL(url) }}
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
