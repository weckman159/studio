
'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from './ui/input';

export default function GlobalSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/search');
    }
  }

  return (
    <form onSubmit={submit} className="relative w-full max-w-lg">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        className="pl-10 h-10 w-full"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Поиск по сайту..."
      />
    </form>
  );
}
