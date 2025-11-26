// src/app/voting/create/page.tsx
// Страница создания нового опроса/голосования
// Пользователь указывает вопрос, варианты ответа, опционально дату завершения
// После создания — переход к странице голосования
// Gemini: опрос создается только авторизованным пользователем

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, AlertCircle, Plus, Trash } from 'lucide-react';
import Link from 'next/link';

export default function CreateVotingPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  // Состояния формы
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [endsAt, setEndsAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Валидация
  const validate = () => {
    if (!question.trim()) return 'Укажите текст вопроса';
    if (question.length < 5) return 'Вопрос слишком короткий';
    const filledOptions = options.filter(opt => opt.trim());
    if (filledOptions.length < 2) return 'Добавьте минимум два варианта';
    if (filledOptions.some(opt => opt.length > 40)) return 'Варианты не длиннее 40 символов';
    return '';
  };

  // Функции работы с вариантами
  const handleOptionChange = (idx: number, val: string) => {
    setOptions(arr => arr.map((opt, i) => i === idx ? val : opt));
    setError('');
  };
  const handleAddOption = () => {
    if (options.length < 6) setOptions(arr => [...arr, '']);
  };
  const handleRemoveOption = (idx: number) => {
    if (options.length > 2) setOptions(arr => arr.filter((_, i) => i !== idx));
  };

  // Сохранение опроса
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!user || !firestore) {
      setError('Для создания опроса войдите в систему');
      router.push('/auth');
      return;
    }
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);

    try {
      const filledOptions = options.map(opt => opt.trim()).filter(Boolean);
      const votes = Array(filledOptions.length).fill(0);

      const voting = {
        question: question.trim(),
        options: filledOptions,
        votes,
        votedUserIds: [],
        totalVotes: 0,
        isActive: true,
        createdAt: serverTimestamp(),
        ...(endsAt ? { endsAt: new Date(endsAt) } : {})
      };

      const pollRef = await addDoc(collection(firestore, 'votings'), voting);
      router.push(`/voting/${pollRef.id}`);
    } catch (err) {
      setError('Не удалось создать опрос. Попробуйте еще раз.');
      console.error('Ошибка создания опроса:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Для создания опроса необходимо войти.
            <Link href="/auth" className="ml-2 underline">
              Войти
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/voting">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            К опросам
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">Создать опрос</h1>
        <p className="text-muted-foreground">
          Придумайте вопрос и варианты для голосования
        </p>
      </div>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Вопрос</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-6">
              <Label htmlFor="question">Текст вопроса *</Label>
              <Input
                id="question"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                maxLength={150}
                disabled={saving}
                required
              />
              <p className="text-xs text-muted-foreground">{question.length}/150</p>
            </div>
            <div className="space-y-2">
              <Label>Варианты ответа *</Label>
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <Input
                    value={opt}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                    maxLength={40}
                    disabled={saving}
                    required
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(idx)}
                      disabled={saving}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {options.length < 6 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  disabled={saving}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить вариант
                </Button>
              )}
            </div>
            <div className="space-y-2 mt-6">
              <Label htmlFor="endsAt">Дата завершения (необязательно)</Label>
              <Input
                id="endsAt"
                type="date"
                value={endsAt}
                min={new Date().toISOString().slice(0,10)}
                onChange={e => setEndsAt(e.target.value)}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                После этой даты голосование будет автоматически завершено
              </p>
            </div>
          </CardContent>
        </Card>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Публикуем...
            </>
          ) : (
            'Создать опрос'
          )}
        </Button>
      </form>
    </div>
  );
}
