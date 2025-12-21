
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { PostForm } from '@/components/PostForm';
import { Community } from '@/lib/types';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CreateCommunityPostPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    
    // useParams can return string | string[] | undefined
    const communityId = Array.isArray(params.id) ? params.id[0] : params.id;
    
    const [community, setCommunity] = useState<Community | null>(null);
    const [isMember, setIsMember] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore || !communityId || isUserLoading) {
            if (!isUserLoading) setLoading(false);
            return;
        };

        const checkMembership = async () => {
            setLoading(true);
            const communityRef = doc(firestore, 'communities', communityId);
            const communitySnap = await getDoc(communityRef);

            if (!communitySnap.exists()) {
                router.push('/not-found');
                return;
            }

            const communityData = { id: communitySnap.id, ...communitySnap.data() } as Community;
            setCommunity(communityData);

            if (user) {
                const member = communityData.memberIds?.includes(user.uid);
                setIsMember(!!member);
            } else {
                setIsMember(false);
            }
            setLoading(false);
        };

        checkMembership();

    }, [firestore, communityId, user, isUserLoading, router]);

    if (loading || isUserLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Проверка доступа...</p>
            </div>
        );
    }
    
    if (!user || !isMember) {
        return (
            <div className="container max-w-2xl text-center py-16">
                <Card>
                    <CardHeader>
                        <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                            <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
                        </div>
                        <CardTitle className="pt-4">Доступ запрещен</CardTitle>
                        <CardDescription>
                            Чтобы создавать посты, вы должны быть участником сообщества «{community?.name}».
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg">
                            <Link href={`/communities/${communityId}`}>К странице сообщества</Link>
                        </Button>
                        <Button variant="outline" size="lg" onClick={() => router.back()}>Назад</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Is a member, show the form
    return <PostForm communityId={communityId} communityName={community?.name} />;
}
