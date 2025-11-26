'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

export default function FeedbackPage() {
  const firestore = useFirestore();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSent(false);

    if (!firestore) {
      setError('Сервис недоступен. Попробуйте позже.');
      return;
    }

    if (!msg.trim()) {
      setError('Введите ваше сообщение');
      return;
    }
    
    setLoading(true);
    try {
      await addDoc(collection(firestore, 'feedback'), {
        email: email.trim(),
        msg: msg.trim(),
        createdAt: serverTimestamp()
      });
      setSent(true);
      setMsg('');
      setEmail('');
    } catch (err) {
        console.error("Feedback submission error:", err);
        setError('Не удалось отправить сообщение. Попробуйте еще раз.');
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl mb-4 font-bold">Связаться с нами</h1>
      <p className="text-muted-foreground mb-6">
        Есть вопросы, предложения или нашли ошибку? Дайте нам знать!
      </p>

      {sent && (
        <Alert className="mb-5 border-green-500 text-green-700">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Спасибо!</AlertTitle>
            <AlertDescription>Ваше сообщение успешно отправлено.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ошибка</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={send} className="space-y-4">
        <Input
          placeholder="Ваш email (необязательно)"
          value={email}
          onChange={e => setEmail(e.target.value)}
          type="email"
          disabled={loading}
        />
        <Textarea
          placeholder="Ваше сообщение *"
          value={msg}
          onChange={e => setMsg(e.target.value)}
          required
          rows={6}
          disabled={loading}
        />
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Отправить
        </Button>
      </form>
    </div>
  );
}
