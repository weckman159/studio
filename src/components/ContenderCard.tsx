
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ThumbsUp, Check, Award } from 'lucide-react';
import type { Car, User } from '@/lib/data';

interface ContenderCardProps {
    car: Car;
    owner: User;
    votes: number;
    totalVotes: number;
    onVote: () => void;
    hasVoted: boolean;
    isVotedFor: boolean;
    isWinner: boolean;
}

export function ContenderCard({ car, owner, votes, totalVotes, onVote, hasVoted, isVotedFor, isWinner }: ContenderCardProps) {
    const votePercentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
    const carImage = car.photoUrl || car.photos?.[0];

    return (
        <Card className={`overflow-hidden transition-all duration-300 ${isWinner ? 'border-amber-400 border-2 shadow-amber-400/20 shadow-lg' : ''} ${hasVoted ? 'bg-muted/30' : ''}`}>
            {isWinner && (
                 <div className="p-2 bg-amber-400 text-amber-900 font-bold text-center text-sm flex items-center justify-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>Текущий лидер</span>
                </div>
            )}
            <CardHeader className="p-0">
                <Link href={`/car/${car.id}`} className="block aspect-video relative">
                    {carImage ? (
                        <Image
                            src={carImage}
                            alt={`${car.brand} ${car.model}`}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="bg-muted h-full" />
                    )}
                </Link>
            </CardHeader>
            <CardContent className="p-4">
                <CardTitle className="text-xl">
                    <Link href={`/car/${car.id}`} className="hover:underline">
                        {car.brand} {car.model}
                    </Link>
                </CardTitle>
                <Link href={`/profile/${owner.id}`} className="flex items-center gap-2 mt-2 hover:underline">
                    <Avatar className="h-6 w-6">
                        {owner.photoURL && <AvatarImage src={owner.photoURL} />}
                        <AvatarFallback>{owner.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{owner.name}</span>
                </Link>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex-col items-stretch gap-3">
                {hasVoted ? (
                    <div className="w-full">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-semibold">{votePercentage}%</span>
                            <span className="text-muted-foreground">{votes.toLocaleString('ru-RU')} голосов</span>
                        </div>
                        <Progress value={votePercentage} />
                    </div>
                ) : (
                    <Button onClick={onVote} size="lg" className="w-full">
                        <ThumbsUp className="mr-2 h-4 w-4" /> Голосовать
                    </Button>
                )}
                 {isVotedFor && (
                    <div className="flex items-center justify-center text-sm text-green-600 dark:text-green-400 gap-2">
                        <Check className="h-4 w-4" />
                        <span>Ваш голос</span>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
