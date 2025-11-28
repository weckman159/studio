
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment, arrayUnion, getDoc, Timestamp, limit } from 'firebase/firestore';
import type { Car, User, Voting } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, CheckCircle, Loader2 } from 'lucide-react';
import { ContenderCard } from '@/components/ContenderCard';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface Contender extends Car {
    owner: User;
    votes: number;
}

export default function CarOfTheDayPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [contenders, setContenders] = useState<Contender[]>([]);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState<Voting | null>(null);
    const [votedFor, setVotedFor] = useState<string | null>(null);

    const todayStr = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (!firestore) return;

        const fetchVotingData = async () => {
            setLoading(true);
            try {
                const votingRef = doc(firestore, 'votings', todayStr);
                const votingSnap = await getDoc(votingRef);

                if (votingSnap.exists()) {
                    const votingData = { id: votingSnap.id, ...votingSnap.data() } as Voting;
                    setVoting(votingData);

                    if (user && votingData.votedUserIds?.includes(user.uid)) {
                        // Find which car the user voted for
                        for (const carId in votingData.votes) {
                            // This logic is flawed if we don't store who voted for whom.
                            // For now, we just know they've voted. Let's find their vote if possible.
                            // A better structure would be `votes: { carId: [userId1, userId2] }`
                        }
                        setVotedFor('some_car'); // Placeholder to show they've voted
                    }

                    const contendersData: Contender[] = [];
                    for (const carId of votingData.contenderCarIds || []) {
                        const carDoc = await getDoc(doc(firestore, 'cars', carId));
                        if (carDoc.exists()) {
                            const car = { id: carDoc.id, ...carDoc.data() } as Car;
                            const userDoc = await getDoc(doc(firestore, 'users', car.userId));
                            if (userDoc.exists()) {
                                const owner = { id: userDoc.id, ...userDoc.data() } as User;
                                contendersData.push({
                                    ...car,
                                    owner,
                                    votes: (votingData.votes?.[carId] || 0) as number
                                });
                            }
                        }
                    }
                    setContenders(contendersData.sort((a, b) => b.votes - a.votes));
                } else {
                     console.log("No voting session for today. A new one should be created by a backend function.");
                }
            } catch (error) {
                console.error("Error fetching voting data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVotingData();
    }, [firestore, user, todayStr]);

    const handleVote = async (carId: string) => {
        if (!user || !firestore || !voting || (votedFor && votedFor !== '')) return;

        try {
            const votingRef = doc(firestore, 'votings', voting.id);

            // Using Firestore transactions could be better here
            await updateDoc(votingRef, {
                [`votes.${carId}`]: increment(1),
                votedUserIds: arrayUnion(user.uid),
                totalVotes: increment(1)
            });

            setVotedFor(carId); 
            // Optimistically update UI
            setContenders(prev => prev.map(c => c.id === carId ? { ...c, votes: c.votes + 1 } : c).sort((a,b) => b.votes - a.votes));

        } catch (error) {
            console.error("Error casting vote:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    const winner = contenders.length > 0 ? contenders[0] : null;

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
                        totalVotes={voting?.totalVotes || 0}
                        onVote={() => handleVote(contender.id)}
                        hasVoted={!!votedFor}
                        isVotedFor={votedFor === contender.id}
                        isWinner={!!winner && winner.id === contender.id && !!votedFor}
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
