
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PostFiltersProps {
  activeType: string;
  onTypeChange: (type: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
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
  onSearchChange 
}: PostFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Фильтры</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Поиск по заголовку или содержимому..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {postTypes.map(type => (
            <Button
              key={type}
              variant={activeType === type ? 'default' : 'outline'}
              onClick={() => onTypeChange(type)}
              size="sm"
            >
              {type}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

    