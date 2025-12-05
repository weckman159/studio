// src/app/news/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Newspaper, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { serializeFirestoreData } from '@/lib/utils';

interface NewsItem {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    source: string;
    sourceUrl: string; // Corrected from url
    publishedAt: any; // Corrected from date
    category: string;
}

export default function NewsPage() {
    const firestore = useFirestore();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!firestore) return;
        const fetchNews = async () => {
            try {
                const q = query(collection(firestore, 'autoNews'), orderBy('publishedAt', 'desc'), limit(20));
                const snap = await getDocs(q);
                setNews(snap.docs.map((d: any) => serializeFirestoreData({id: d.id, ...d.data()} as NewsItem)));
            } catch(e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [firestore]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
                <Newspaper className="h-8 w-8" /> Автоновости
            </h1>

            {loading ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
                 </div>
            ) : news.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-xl">
                    <p className="text-muted-foreground text-lg">Новостей пока нет. Загляните позже!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {news.map(item => (
                        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                            {item.imageUrl && (
                                <div className="relative h-48 w-full">
                                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                                </div>
                            )}
                            <CardHeader className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="secondary">{item.category}</Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''}
                                    </span>
                                </div>
                                <CardTitle className="line-clamp-2 text-lg">
                                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{item.title}</a>
                                </CardTitle>
                                <CardDescription className="line-clamp-3">{item.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0 mt-auto">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground font-semibold">{item.source}</span>
                                    <Button variant="ghost" size="sm" asChild>
                                        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">Читать <ExternalLink className="ml-2 h-3 w-3"/></a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
