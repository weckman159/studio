// src/components/PostForm.tsx
'use client';

import { useState, useEffect, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Post } from '@/lib/types';
import { upsertPost, type ActionState } from '@/app/lib/actions/posts';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useToast } from '@/hooks/use-toast';
import { GithubEditor } from '@/components/GithubEditor';
import { SmartButton } from '@/components/shared/SmartButton'; // ЗАМЕНА

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImagePlus, ArrowLeft, Trash, AlertCircle } from 'lucide-react';

const postTypes = ['Блог', 'Фотоотчет', 'Вопрос', 'Мой опыт', 'Обзор', 'Ремонт', 'Тюнинг', 'Путешествия'];

interface PostFormProps {
  postToEdit?: Post;
  communityId?: string;
  communityName?: string;
}

export function PostForm({ postToEdit, communityId, communityName }: PostFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!postToEdit;

  const initialState: ActionState = { message: '', errors: {}, success: false };
  const [state, formAction] = useActionState(upsertPost, initialState);
  
  const [content, setContent] = useState(postToEdit?.content || '');
  const { uploadFiles, uploading, progress } = useFileUpload({ maxFiles: 1, maxSizeInMB: 10 });
  const [coverPreview, setCoverPreview] = useState<string>(postToEdit?.imageUrl || '');
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  // ИСПРАВЛЕНИЕ: Логика для кнопки "Назад"
  const [canGoBack, setCanGoBack] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCanGoBack(window.history.length > 1);
    }
  }, []);

  // Реакция на успешное завершение Server Action
  useEffect(() => {
    if (state.success && state.postId) {
      toast({ title: 'Успешно!', description: state.message });
      const redirectUrl = communityId 
        ? `/communities/${communityId}/posts/${state.postId}`
        : `/posts/${state.postId}`;
      router.push(redirectUrl);
    }
  }, [state, router, toast, communityId]);

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const uploadResult = await uploadFiles([file], 'posts', postToEdit?.id || 'new');
        if (uploadResult.length > 0) {
            setCoverPreview(uploadResult[0].url);
        }
    }
  };

  const handleRemoveCover = () => {
    setCoverPreview('');
    if (coverInputRef.current) coverInputRef.current.value = '';
  };
  
  return (
    <div className="max-w-5xl mx-auto p-4 md:py-8">
        <form action={formAction}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    {/* ИСПРАВЛЕНИЕ: Кнопка "Назад" с проверкой history */}
                    {canGoBack && (
                        <Button variant="ghost" size="icon" type="button" onClick={() => router.back()}>
                            <ArrowLeft />
                        </Button>
                    )}
                    <h1 className="text-2xl font-bold">{isEditMode ? 'Редактировать' : 'Создать публикацию'}</h1>
                </div>
                {/* ЗАМЕНА: Используем SmartButton */}
                <SmartButton type="submit" size="lg" loadingText={isEditMode ? 'Сохранение...' : 'Публикация...'}>
                  {isEditMode ? 'Сохранить' : 'Опубликовать'}
                </SmartButton>
            </div>

            {communityName && (
                <Alert className="mb-6 border-primary/20 bg-primary/5">
                    <AlertDescription>Публикация в сообщество: <strong>{communityName}</strong></AlertDescription>
                </Alert>
            )}

            {state.message && !state.success && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-6">
                {isEditMode && <input type="hidden" name="id" value={postToEdit.id} />}
                {communityId && <input type="hidden" name="communityId" value={communityId} />}
                <input type="hidden" name="imageUrl" value={coverPreview} />
                <input type="hidden" name="content" value={content} />

                <div className="space-y-2">
                    <Input 
                        id="title"
                        name="title"
                        placeholder="Заголовок поста" 
                        defaultValue={postToEdit?.title}
                        className="text-2xl font-bold h-14 border-2 focus-visible:ring-primary"
                        required
                    />
                    {state.errors?.title && <p className="text-sm text-destructive mt-1">{state.errors.title[0]}</p>}
                </div>
                
                <GithubEditor value={content} onChange={setContent} placeholder="Напишите вашу историю здесь..." />

                <Card className="overflow-hidden">
                    <div className="p-4 pb-2 font-semibold text-sm">Обложка (для ленты)</div>
                    <CardContent className="p-4 pt-0">
                        {coverPreview ? (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted group">
                                <Image src={coverPreview} alt="Cover" fill className="object-cover" />
                                <Button 
                                    type="button"
                                    variant="destructive" 
                                    size="icon" 
                                    className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={handleRemoveCover}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div 
                                className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-muted-foreground/20 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => coverInputRef.current?.click()}
                            >
                                <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-xs text-muted-foreground">Загрузить обложку</span>
                            </div>
                        )}
                        <input 
                            ref={coverInputRef}
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleCoverSelect}
                        />
                        {uploading && <Progress value={progress} className="h-1 mt-2" />}
                    </CardContent>
                </Card>

                <Card>
                     <CardContent className="p-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Категория</Label>
                            <Select name="category" defaultValue={postToEdit?.category || 'Блог'}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {postTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {state.errors?.category && <p className="text-sm text-destructive mt-1">{state.errors.category[0]}</p>}
                        </div>
                     </CardContent>
                </Card>
            </div>
        </form>
    </div>
  );
}
