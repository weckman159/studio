// src/app/voting/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, Plus, Trash } from 'lucide-react';

export default function CreateVotingPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ИСПРАВЛЕНИЕ: Логика для кнопки "Назад"
  const [canGoBack, setCanGoBack] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCanGoBack(window.history.length > 1);
    }
  }, []);

  const handleOptionChange = (idx: number, val: string) => {
    setOptions(arr => arr.map((opt, i) => i === idx ? val : opt));
  };
  
  const handleAddOption = () => {
    if (options.length < 10) setOptions(arr => [...arr, '']);
  };

  const handleRemoveOption = (idx: number) => {
    if (options.length > 2) setOptions(arr => arr.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;
    
    const filledOptions = options.map(o => o.trim()).filter(Boolean);
    if (!question.trim() || filledOptions.length < 2) {
        setError('Введите вопрос и минимум 2 варианта');
        return;
    }

    setSaving(true);
    try {
      const votes = Array(filledOptions.length).fill(0);
      const docRef = await addDoc(collection(firestore, 'votings'), {
        question: question.trim(),
        options: filledOptions,
        votes,
        votedUserIds: [],
        totalVotes: 0,
        isActive: true,
        createdAt: serverTimestamp(),
        authorId: user.uid
      });
      router.push(`/voting/${docRef.id}`);
    } catch (err) {
      setError('Ошибка создания');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="p-8 text-center">Войдите, чтобы создать опрос</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {canGoBack && (
          <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Назад
          </Button>
      )}
      <h1 className="text-3xl font-bold mb-6">Новый опрос</h1>
      {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label>Вопрос</Label>
              <Input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Какое масло лучше?" required />
            </div>
            <div className="space-y-3">
              <Label>Варианты ответа</Label>
              {options.map((opt, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input value={opt} onChange={e => handleOptionChange(idx, e.target.value)} placeholder={`Вариант ${idx + 1}`} required />
                  {options.length > 2 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveOption(idx)}>
                        <Trash className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ))}
              {options.length < 10 && (
                <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="mt-2">
                    <Plus className="mr-2 h-4 w-4" /> Добавить вариант
                </Button>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="animate-spin mr-2" /> : null} Создать
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
