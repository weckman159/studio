
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cars, users } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Initialize votes state with random numbers for demonstration
const initialVotes = cars.reduce((acc, car) => {
  acc[car.id] = Math.floor(Math.random() * 150);
  return acc;
}, {} as Record<string, number>);


export default function VotingPage() {
    const { toast } = useToast();
    const [votes, setVotes] = useState<Record<string, number>>(initialVotes);
    const [votedCarId, setVotedCarId] = useState<string | null>(null);

    const handleVote = (carId: string) => {
        if (votedCarId) {
            toast({
                variant: 'destructive',
                title: 'Вы уже проголосовали!',
                description: 'Вы можете отдать только один голос в этом голосовании.',
            });
            return;
        }
        setVotes(prevVotes => ({
            ...prevVotes,
            [carId]: (prevVotes[carId] || 0) + 1,
        }));
        setVotedCarId(carId);
        toast({
            title: 'Ваш голос учтён!',
            description: 'Спасибо за участие в голосовании.',
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold">Голосование за Автомобиль Дня</h1>
                <p className="text-muted-foreground mt-2 text-lg">Выберите автомобиль, который, по вашему мнению, достоин стать следующим "Автомобилем дня"!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cars.map(car => {
                    const carImage = PlaceHolderImages.find(img => img.id === car.imageId);
                    const owner = users.find(u => u.id === car.userId);
                    const ownerAvatar = owner ? PlaceHolderImages.find(img => img.id === owner.avatarId) : null;
                    const carVotes = votes[car.id] || 0;

                    return (
                        <Card key={car.id} className="flex flex-col overflow-hidden transition-all hover:shadow-xl">
                             <CardHeader className="p-0">
                                <Link href={`/car/${car.id}`} className="block aspect-video relative">
                                {carImage && (
                                    <Image
                                    src={carImage.imageUrl}
                                    alt={`${car.brand} ${car.model}`}
                                    fill
                                    className="object-cover"
                                    data-ai-hint={carImage.imageHint}
                                    />
                                )}
                                </Link>
                            </CardHeader>
                            <CardContent className="p-4 flex-1 flex flex-col">
                                 <CardTitle className="text-xl mb-1">
                                    <Link href={`/car/${car.id}`} className="hover:text-primary transition-colors">
                                        {car.brand} {car.model}
                                    </Link>
                                </CardTitle>
                               {owner && (
                                 <div className="flex items-center text-sm text-muted-foreground mb-4">
                                     <Avatar className="h-5 w-5 mr-2">
                                        {ownerAvatar && <AvatarImage src={ownerAvatar.imageUrl} data-ai-hint={ownerAvatar.imageHint}/>}
                                        <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <Link href={`/profile/${owner.id}`} className="hover:underline">{owner.name}</Link>
                                 </div>
                               )}
                               <div className="flex-1" />
                               <div className="flex items-center font-bold text-lg text-primary">
                                 <ThumbsUp className="h-5 w-5 mr-2"/>
                                 <span>{carVotes} голосов</span>
                               </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                <Button 
                                    className="w-full"
                                    onClick={() => handleVote(car.id)}
                                    disabled={!!votedCarId}
                                >
                                    <ThumbsUp className="mr-2 h-4 w-4"/>
                                    {votedCarId === car.id ? 'Ваш голос' : 'Голосовать'}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
