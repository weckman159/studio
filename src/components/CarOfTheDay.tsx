'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { doc, getDoc, collection, getDocs, limit, query, orderBy, setDoc, serverTimestamp, where, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Car } from '@/lib/types';
import { Button } from './ui/button';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { Progress } from './ui/progress';

export function CarOfTheDay() {
  const [featuredCar, setFeaturedCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const [vote, setVote] = useState<'like' | 'dislike' | null>(null);

  const firestore = useFirestore();
  const { user } = useUser();
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Countdown timer effect
    const interval = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!firestore) return;

    const getFeaturedCar = async () => {
      setLoading(true);
      try {
        const featuredDocRef = doc(firestore, 'featuredCars', todayStr);
        let featuredDoc = await getDoc(featuredDocRef);
        let carId: string | null = null;

        if (featuredDoc.exists()) {
          carId = featuredDoc.data().carId;
        } else {
          // If no car for today, select a random one
          const q = query(collection(firestore, 'cars'), where('photoUrl', '!=', ''), limit(1));
          const carsSnap = await getDocs(q);
          if (!carsSnap.empty) {
            const randomCar = carsSnap.docs[0];
            carId = randomCar.id;
            await setDoc(featuredDocRef, {
              carId: randomCar.id,
              date: todayStr,
              votes: { likes: 0, dislikes: 0 },
              voters: {}
            });
          }
        }

        if (carId) {
          const carDocRef = doc(firestore, 'cars', carId);
          const carDoc = await getDoc(carDocRef);
          if (carDoc.exists()) {
            setFeaturedCar({ id: carDoc.id, ...carDoc.data() } as Car);
          }
        }
      } catch (error) {
        console.error("Error fetching Car of the Day:", error);
      } finally {
        setLoading(false);
      }
    };

    getFeaturedCar();
  }, [firestore, todayStr]);
  
  const handleVote = async (voteType: 'like' | 'dislike') => {
      if (!user || !featuredCar || vote) return;
      setVote(voteType); // Optimistic update
      
      const featuredDocRef = doc(firestore, 'featuredCars', todayStr);
      try {
          await updateDoc(featuredDocRef, {
              [`votes.${voteType === 'like' ? 'likes' : 'dislikes'}`]: increment(1),
              [`voters.${user.uid}`]: voteType
          });
      } catch (error) {
          console.error("Vote failed:", error);
          setVote(null); // Revert on error
      }
  };

  if (loading) {
    return (
        <div className="relative w-full aspect-video bg-neutral-900 rounded-2xl mb-6 flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
    );
  }

  if (!featuredCar) {
    return null; // Or some placeholder if no car is available
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl mb-6 overflow-hidden p-1 bg-gradient-to-br from-red-500 via-red-600 to-rose-700">
        <div 
          className="relative w-full h-full rounded-xl bg-neutral-900 overflow-hidden p-6 md:p-8 flex flex-col justify-between"
          style={{ backgroundImage: 'url(/carbon-fiber.png)', backgroundSize: 'cover' }}
        >
          {/* Background image */}
          <Image
            src={featuredCar.photoUrl || 'https://picsum.photos/seed/porsche/1200/800'}
            alt="Car of the day"
            fill
            className="object-contain object-right-bottom opacity-90"
            data-ai-hint="side view sportscar"
          />

          {/* Red glowing lines */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-red-500/50 shadow-[0_0_10px_theme(colors.red.500)]" />
          <div className="absolute top-1/4 right-0 w-px h-1/2 bg-red-500/50 shadow-[0_0_10px_theme(colors.red.500)]" />

          {/* Content */}
          <div className="relative z-10 text-white">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">Car of the Day</h2>
            
            <div className='mt-4 space-y-2'>
              <Progress value={75} className="h-1 bg-red-900/50 [&>div]:bg-red-500" />
              <p className="text-xs text-red-300 font-mono">{timeLeft} until new Car of the Day!</p>
            </div>

            <div className='mt-4 flex gap-3'>
              <Button 
                className='bg-red-600 hover:bg-red-700 text-white font-bold'
                onClick={() => handleVote('like')}
                disabled={!!vote}
              >
                <ThumbsUp className='mr-2 h-4 w-4'/> LIKE
              </Button>
               <Button 
                variant="outline" 
                className='bg-blue-600 hover:bg-blue-700 text-white font-bold'
                onClick={() => handleVote('dislike')}
                disabled={!!vote}
               >
                <ThumbsDown className='mr-2 h-4 w-4'/>
              </Button>
            </div>
          </div>
          
          <div className="relative z-10 flex gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg flex-1">
                  <ThumbsUp className='mr-3 h-5 w-5'/> Rate this Ride
              </Button>
               <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg flex-1">
                  Rate this Ride
              </Button>
          </div>
          {/* Pagination dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
        </div>
    </div>
  );
}
