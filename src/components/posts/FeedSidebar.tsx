import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const social = [
  { name: 'YouTube', url: '#' },
  { name: 'Instagram', url: '#' },
  { name: 'Telegram', url: '#' },
];

export function FeedSidebar() {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/50 backdrop-blur-sm">
        <h4 className="font-semibold text-lg mb-2">О Ленте</h4>
        <p className="text-sm text-muted-foreground">
          Это общая лента публикаций от всех пользователей AutoSphere. Делитесь своими историями, 
          задавайте вопросы и находите единомышленников.
        </p>
      </Card>
      
      <Card className="p-6">
        <h4 className="font-semibold text-lg mb-4">Категории</h4>
        <div className="flex flex-wrap gap-2">
            {['Тюнинг', 'Ремонт', 'Проекты', 'Путешествия', 'Фото', 'Блог', 'Вопрос'].map(tag => (
                <Button key={tag} variant="secondary" size="sm" asChild>
                    <Link href={`/posts?category=${tag}`}>{tag}</Link>
                </Button>
            ))}
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="font-semibold text-lg mb-3">Наши соцсети</h4>
        <ul className="space-y-1">
          {social.map((network) => (
            <li key={network.name}>
              <Link href={network.url} className="text-primary hover:underline text-sm">
                {network.name}
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
