
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Globe, Users } from "lucide-react";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

interface PostFiltersProps {
  activeType: string;
  onTypeChange: (type: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  feedType?: 'global' | 'following';
  onFeedTypeChange?: (type: 'global' | 'following') => void;
  showFeedToggle?: boolean;
}

const postTypes = [
  'Все',
  'Тюнинг',
  'Путешествия',
  'Спорт',
  'Ремонт',
  'Блог',
  'Фотоотчет',
  'Вопрос',
  'Мой опыт',
  'Обзор'
];

export function PostFilters({ 
  activeType, 
  onTypeChange, 
  searchQuery, 
  onSearchChange,
  feedType,
  onFeedTypeChange,
  showFeedToggle = false
}: PostFiltersProps) {
  return (
    <div className="space-y-4">
        {showFeedToggle && onFeedTypeChange && (
            <div className="flex gap-2 rounded-lg bg-muted p-1 w-full md:w-fit">
                <Button 
                    variant={feedType === 'following' ? 'default' : 'ghost'} 
                    onClick={() => onFeedTypeChange('following')}
                    className="flex-1 justify-center gap-2"
                >
                    <Users className="h-4 w-4" />
                    Подписки
                </Button>
                <Button 
                    variant={feedType === 'global' ? 'default' : 'ghost'} 
                    onClick={() => onFeedTypeChange('global')}
                    className="flex-1 justify-center gap-2"
                >
                    <Globe className="h-4 w-4" />
                    Глобальная
                </Button>
            </div>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Поиск по постам..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-3">
              {postTypes.map(type => (
                <Button
                  key={type}
                  variant={activeType === type ? 'default' : 'outline'}
                  onClick={() => onTypeChange(type)}
                  size="sm"
                  className="shrink-0"
                >
                  {type}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    </div>
  );
}
