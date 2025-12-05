// src/app/voting/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Check } from 'lucide-react';
import { Voting } from '@/lib/types';

function VotingDetailClient({ votingId }: { votingId: string }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const [voting, setVoting] = useState<Voting | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if(!firestore || !votingId) return;
        getDoc(doc(firestore, 'votings', votingId)).then(snap => {
            if(snap.exists()) setVoting({id: snap.id, ...snap.data()} as Voting);
            setLoading(false);
        });
    }, [firestore, votingId]);

    const handleVote = async (index: number) => {
        if(!user || !voting) return;
        setSubmitting(true);
        try {
            // Ensure votes is an array for voting options
            const currentVotes = Array.isArray(voting.votes) ? voting.votes : [];
            const newVotes = [...currentVotes];
            newVotes[index] = (newVotes[index] || 0) + 1;
            
            await updateDoc(doc(firestore, 'votings', votingId), {
                votes: newVotes,
                totalVotes: increment(1),
                votedUserIds: arrayUnion(user.uid)
            });
            setVoting({...voting, votes: newVotes, totalVotes: voting.totalVotes + 1, votedUserIds: [...(voting.votedUserIds || []), user.uid]});
        } catch(e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    if(loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin"/></div>;
    if(!voting) return <div className="text-center p-10">Опрос не найден</div>;

    const hasVoted = user && voting.votedUserIds?.includes(user.uid);

    return (
        <div className="container max-w-2xl py-10 px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{voting.question}</CardTitle>
                    <p className="text-sm text-muted-foreground">Проголосовало: {voting.totalVotes}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {voting.options.map((opt: string, idx: number) => {
                        const percent = voting.totalVotes ? Math.round(((voting.votes?.[idx] || 0) / voting.totalVotes) * 100) : 0;
                        return (
                            <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>{opt}</span>
                                    {hasVoted && <span>{percent}%</span>}
                                </div>
                                {hasVoted ? (
                                    <Progress value={percent} className="h-2" />
                                ) : (
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start h-auto py-3 whitespace-normal text-left"
                                        onClick={() => handleVote(idx)}
                                        disabled={submitting || !user}
                                    >
                                        {opt}
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                    {!user && <p className="text-center text-sm text-muted-foreground mt-4">Войдите, чтобы проголосовать</p>}
                    {hasVoted && <div className="flex items-center justify-center text-green-600 mt-4"><Check className="mr-2 h-4 w-4"/> Вы уже проголосовали</div>}
                </CardContent>
            </Card>
        </div>
    );
}

export default function VotingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [votingId, setVotingId] = useState<string>('');

    useEffect(() => {
        params.then(({ id }) => setVotingId(id));
    }, [params]);

    return <VotingDetailClient votingId={votingId} />
}
