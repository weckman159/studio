// src/app/voting/[id]/page.tsx
// Страница детального опроса/голосования
// Позволяет проголосовать (если не голосовал), увидеть результаты всем и личный статус
// Gemini: голоса и варианты хранятся в Firestore

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, BarChart, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Типы
interface Voting {
  id: string;
  question: string;
  options: string[];              // ["BMW","Toyota"]
  votes?: number[];                // [25,12] - каждое число = число выбранных голосов для опции с тем же индексом
  votedUserIds?: string[];         // [userId, ...]
  isActive: boolean;
  createdAt: any;
  endsAt?: any;
  totalVotes: number;
}

export default function VotingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const votingId = id as string;

  const [voting, setVoting] = useState<Voting | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [votingNow, setVotingNow] = useState(false);
  const [error, setError] = useState('');

  // Загрузка опроса
  useEffect(() => {
    if (votingId && firestore) fetchVoting();
  }, [votingId, firestore]);

  const fetchVoting = async () => {
    if (!firestore) return;
    try {
      setLoading(true);
      const snap = await getDoc(doc(firestore, 'votings', votingId));
      if (!snap.exists()) {
        router.push('/voting');
        return;
      }
      setVoting({ id: snap.id, ...snap.data() } as Voting);
    } catch (err) {
      setError('Ошибка загрузки опроса');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Проголосовать
  const handleVote = async () => {
    if (!user || !voting || selected === null || !firestore) return;
    setVotingNow(true);

    try {
      // Повторное получение свежих данных (для избежания гонки)
      const pollRef = doc(firestore, 'votings', votingId);
      const snap = await getDoc(pollRef);
      if (!snap.exists()) throw new Error('Опрос не найден');
      const data = snap.data() as Voting;
      if (data.votedUserIds?.includes(user.uid)) return; // Двойное голосование невозможно

      // Увеличиваем счетчик голосов в выбранной опции
      const newVotes = data.votes ? [...data.votes] : Array(data.options.length).fill(0);
      newVotes[selected] = (newVotes[selected] || 0) + 1;

      await updateDoc(pollRef, {
        votes: newVotes,
        votedUserIds: arrayUnion(user.uid),
        totalVotes: increment(1)
      });

      // Локальное обновление для реверсивной свежести
      setVoting({
        ...data,
        id: data.id || votingId,
        votes: newVotes,
        votedUserIds: [...(data.votedUserIds || []), user.uid],
        totalVotes: (data.totalVotes || 0) + 1
      });
    } catch (err) {
      setError('Не удалось отправить голос');
      console.error(err);
    } finally {
      setVotingNow(false);
    }
  };

  // Формат процента
  const getPercent = (i: number) => {
    if (!voting?.totalVotes || !voting.votes) return 0;
    return Math.round((voting.votes[i] / voting.totalVotes) * 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[250px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка опроса...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!voting) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Опрос не найден.
            <Link href="/voting" className="ml-2 underline">
              Вернуться к голосованиям
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasVoted = user && voting.votedUserIds?.includes(user.uid);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/voting">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          К голосованиям
        </Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl mb-2">{voting.question}</CardTitle>
          <div className="text-muted-foreground flex gap-2">
            <BarChart className="h-4 w-4" /> 
            Всего голосов: <b>{voting.totalVotes}</b>
            {!voting.isActive && <Badge variant="secondary">Завершён</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Если пользователь еще не голосовал */}
            {user && voting.isActive && !hasVoted && (
              <form onSubmit={e => { e.preventDefault(); handleVote(); }}>
                <div className="space-y-3 mb-6">
                  {voting.options.map((opt, idx) => (
                    <label key={idx} className={`flex items-center gap-2 cursor-pointer p-3 rounded-lg border-2 ${selected === idx ? 'border-primary bg-accent' : 'border-border hover:bg-muted'}`}>
                      <input
                        type="radio"
                        name="option"
                        value={idx}
                        className="h-4 w-4 accent-primary"
                        checked={selected === idx}
                        onChange={() => setSelected(idx)}
                        disabled={votingNow}
                      />
                      <span className="text-base font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
                <Button type="submit" disabled={selected === null || votingNow} size="lg" className="w-full">
                  {votingNow ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Голосовать
                </Button>
              </form>
            )}

            {/* Результаты */}
            {(hasVoted || !voting.isActive) && (
              <div className="space-y-4">
                {voting.options.map((opt, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span>{opt}</span>
                      <span className="flex items-center gap-2">
                        <span>{getPercent(idx)}%</span>
                        <span className="text-sm text-muted-foreground">({voting.votes?.[idx] || 0})</span>
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        style={{
                          width: `${getPercent(idx)}%`,
                        }}
                        className="h-3 rounded-full bg-primary transition-all duration-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Сообщения о статусе */}
            {hasVoted && voting.isActive && (
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Спасибо, ваш голос учтен!
              </p>
            )}

            {!user && voting.isActive && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Чтобы проголосовать, <Link className="underline" href="/auth">войдите в систему</Link>.
                </AlertDescription>
              </Alert>
            )}

            {!voting.isActive && (
              <Badge variant="secondary" className="mt-6">Голосование завершено</Badge>
            )}

            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
