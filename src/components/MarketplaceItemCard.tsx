// src/components/MarketplaceItemCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { MarketplaceItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ShoppingCart } from 'lucide-react';

interface MarketplaceItemCardProps {
    item: MarketplaceItem;
}

export function MarketplaceItemCard({ item }: MarketplaceItemCardProps) {
    const formatPrice = (price: number, currency: string) => `${price.toLocaleString('ru-RU')} ${currency === 'RUB' ? '₽' : currency}`;
    
    return (
        <Link href={`/marketplace/${item.id}`} className="h-full">
            <Card className="holographic-panel h-full hover:border-primary/50 transition-all cursor-pointer flex flex-col">
                <div className="relative aspect-square w-full overflow-hidden">
                    {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.title} fill className="object-cover rounded-t-xl"/>
                    ) : (
                        <div className="bg-surface h-full flex items-center justify-center rounded-t-xl"><ShoppingCart className="h-16 w-16 text-text-muted" /></div>
                    )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <div className="flex-grow mb-3">
                        <CardTitle className="text-base font-bold line-clamp-2 text-white">{item.title}</CardTitle>
                        <div className="mt-2 text-lg font-bold text-primary">{formatPrice(item.price, item.currency)}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary"><MapPin className="h-3 w-3" /><span>{item.location}</span></div>
                </div>
            </Card>
        </Link>
    );
}
