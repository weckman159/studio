// src/components/ImageUpload.tsx
'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Blurhash } from 'react-blurhash';
import { processImageBeforeUpload } from '@/lib/storage';
import { motion, AnimatePresence } from 'framer-motion';

type ImageState = {
  key: string;
  url: string; // Может быть blob URL или удаленный URL
  blurhash?: string;
  file?: File; // Только для новых файлов
  isNew: boolean;
};

interface ImageUploadProps {
  value?: { url: string; blurhash?: string }[];
  onChange?: (images: { url: string; blurhash?: string }[]) => void;
  onFilesChange?: (files: File[]) => void;
  onDelete?: (url: string) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export const MultipleImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  onFilesChange,
  onDelete,
  maxFiles = 10,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageState[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Синхронизация с внешним состоянием (например, из формы)
    if(value.length > 0 && images.length === 0){
        const remoteImages = value.map(img => ({ ...img, key: img.url, isNew: false }));
        setImages(remoteImages);
    }
  }, [value, images.length]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || images.length + files.length > maxFiles) return;

    setProcessing(true);
    const newImageStates: ImageState[] = [];

    for (const file of files) {
      try {
        const processed = await processImageBeforeUpload(file);
        newImageStates.push({
          key: `${file.name}-${file.lastModified}`,
          url: URL.createObjectURL(processed.file),
          blurhash: processed.blurhash,
          file: processed.file,
          isNew: true,
        });
      } catch (error) {
        console.error('Ошибка обработки изображения:', error);
      }
    }
    
    const allImages = [...images, ...newImageStates];
    setImages(allImages);
    
    const allNewFiles = allImages.filter(img => img.isNew && img.file).map(img => img.file!);
    onFilesChange?.(allNewFiles);

    setProcessing(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = (keyToRemove: string) => {
    const imageToRemove = images.find(img => img.key === keyToRemove);
    if (!imageToRemove) return;

    const remainingImages = images.filter(img => img.key !== keyToRemove);
    setImages(remainingImages);

    if (!imageToRemove.isNew) {
      onDelete?.(imageToRemove.url);
    }
    
    const remainingNewFiles = remainingImages.filter(img => img.isNew && img.file).map(img => img.file!);
    onFilesChange?.(remainingNewFiles);
  };
  
  const totalDisabled = disabled || processing;

  return (
    <div className="space-y-4">
      <div>
        <input
          ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
          multiple={maxFiles > 1} onChange={handleFileSelect} disabled={totalDisabled} className="hidden"
        />
        <Button
          type="button" variant="outline" onClick={() => inputRef.current?.click()}
          disabled={totalDisabled || images.length >= maxFiles} className="w-full"
        >
          {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
          {processing ? 'Обработка...' : 'Выбрать изображения'}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">Загружено: {images.length} / {maxFiles}</p>
      </div>

      <div className={cn('grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4')}>
        <AnimatePresence>
            {images.map((img) => (
              <motion.div
                key={img.key}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                  <ImagePreview image={img} onRemove={() => handleRemove(img.key)} disabled={disabled} />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
};


// Вспомогательный компонент для превью с поддержкой BlurHash
function ImagePreview({ image, onRemove, disabled }: { image: ImageState, onRemove: () => void, disabled?: boolean }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted">
        {!isLoaded && image.blurhash && (
            <div className="absolute inset-0">
               <Blurhash hash={image.blurhash} width="100%" height="100%" />
            </div>
        )}
        <Image
          src={image.url} alt="Предпросмотр" fill
          className={cn("object-cover transition-opacity duration-500", isLoaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setIsLoaded(true)}
        />
        {!disabled && (
          <Button
            type="button" onClick={onRemove} variant="destructive" size="icon"
            className="absolute top-1.5 right-1.5 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
    </div>
  );
}

export const SingleImageUpload: React.FC<Omit<ImageUploadProps, 'multiple'>> = (props) => {
    return <MultipleImageUpload {...props} maxFiles={1} />;
};
