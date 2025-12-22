
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { serializeFirestoreData } from '@/lib/utils';
import { Post } from '@/lib/types';
import { PageShell } from '@/components/shared/PageShell';
import { PostCard } from '@/components/shared/PostCard';
import { TrendingUp, Sparkles } from 'lucide-react';

async function getFeedData() {
    const db = getAdminDb();
    
    // Популярные посты: сортировка по лайкам
    const popularQuery = query(
        collection(db, 'posts'),
        orderBy('likesCount', 'desc'),
        limit(3)
    );

    // Новые посты: сортировка по дате создания
    const newQuery = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(10)
    );

    try {
        const [popularSnap, newSnap] = await Promise.all([
            getDocs(popularQuery),
            getDocs(newQuery)
        ]);

        const popularPosts = popularSnap.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as Post);
        const newPosts = newSnap.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as Post);
        
        return { popularPosts, newPosts };
    } catch (error) {
        console.error("Error fetching feed data:", error);
        // В случае ошибки возвращаем пустые массивы, чтобы страница не падала
        return { popularPosts: [], newPosts: [] };
    }
}

export default async function FeedPage() {
    const { popularPosts, newPosts } = await getFeedData();

    return (
        <PageShell>
            {/* Секция "Популярное" */}
            <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="h-7 w-7 text-primary" />
                    <h2 className="text-3xl font-bold text-foreground">Популярное</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {popularPosts.map((post) => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            className="h-[300px]"
                        />
                    ))}
                </div>
            </section>

            {/* Секция "Новая лента" */}
            <section>
                 <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="h-7 w-7 text-secondary" />
                    <h2 className="text-3xl font-bold text-foreground">Новая лента</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {newPosts.map((post) => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            className="h-[450px]"
                        />
                    ))}
                </div>
            </section>
        </PageShell>
    );
}
