
'use client';

import { useState, useEffect } from 'react';
import { cars as mockCars, users as mockUsers } from '@/lib/data';
import type { Car, User } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, CheckCircle, Loader2 } from 'lucide-react';
import { ContenderCard } from '@/components/ContenderCard';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface Contender extends Car {
    owner: User;
    votes: number;
}

export default function CarOfTheDayPage() {
    // Mock data fetching and state management
    const [contenders, setContenders] = useState<Contender[]>([]);
    const [loading, setLoading] = useState(true);
    const [votedFor, setVotedFor] = useState<string | null>(null);
    const [totalVotes, setTotalVotes] = useState(0);

    useEffect(() => {
        // Simulate fetching active contenders
        const fetchContenders = async () => {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

            // For demo, we'll pick the first 3 cars
            const activeCars = mockCars.slice(0, 3);
            const contendersData = activeCars.map((car, index) => {
                const owner = mockUsers.find(u => u.id === car.userId) || mockUsers[0];
                return {
                    ...car,
                    owner,
                    // Simulate some initial votes for demonstration
                    votes: Math.floor(Math.random() * 50) + (index === 0 ? 20 : 5) 
                };
            });

            setContenders(contendersData);
            setTotalVotes(contendersData.reduce((sum, c) => sum + c.votes, 0));
            setLoading(false);
        };

        fetchContenders();
    }, []);

    const handleVote = (carId: string) => {
        if (votedFor) return;

        setVotedFor(carId);
        setContenders(prevContenders =>
            prevContenders.map(c =>
                c.id === carId ? { ...c, votes: c.votes + 1 } : c
            )
        );
        setTotalVotes(prev => prev + 1);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    const winner = contenders.length > 0 ? contenders.reduce((prev, current) => (prev.votes > current.votes) ? prev : current) : null;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <Trophy className="mx-auto h-16 w-16 text-amber-400 mb-4" />
                <h1 className="text-4xl font-bold">Автомобиль дня</h1>
                <p className="text-muted-foreground mt-2">
                    Голосуйте за лучший автомобиль! Победитель будет отображаться на главной странице весь следующий день.
                </p>
            </div>
            
             {votedFor && (
                <Alert className="mb-8 border-green-500 text-green-700 dark:border-green-700 dark:text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Спасибо, ваш голос учтён!</AlertTitle>
                    <AlertDescription>Результаты обновлены.</AlertDescription>
                </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {contenders.map(contender => (
                    <ContenderCard 
                        key={contender.id}
                        car={contender}
                        owner={contender.owner}
                        votes={contender.votes}
                        totalVotes={totalVotes}
                        onVote={() => handleVote(contender.id)}
                        hasVoted={!!votedFor}
                        isVotedFor={votedFor === contender.id}
                        isWinner={winner?.id === contender.id && !!votedFor}
                    />
                ))}
            </div>

            {contenders.length === 0 && !loading && (
                 <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <p>На сегодня нет претендентов на звание "Автомобиль дня". Загляните завтра!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
