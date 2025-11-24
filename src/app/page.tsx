import { CarOfTheDay } from "@/components/CarOfTheDay";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { posts, users, cars } from "@/lib/data";
import { Search, Wrench, Map, Car } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-6">
          <CarOfTheDay />
          <div>
            <h2 className="text-xl font-bold mb-4">Поиск и фильтры</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Марка, модель, теги..." className="pl-10" />
            </div>
            <div className="flex flex-col space-y-2">
              <Button variant="outline" className="justify-start">
                <Wrench className="mr-2 h-4 w-4" />
                Тюнинг
              </Button>
              <Button variant="outline" className="justify-start">
                <Car className="mr-2 h-4 w-4" />
                Ремонт
              </Button>
              <Button variant="outline" className="justify-start">
                <Map className="mr-2 h-4 w-4" />
                Путешествия
              </Button>
            </div>
          </div>
        </aside>
        <div className="lg:col-span-3">
          <h1 className="text-3xl font-bold mb-6">Лента постов</h1>
          <div className="space-y-6">
            {posts.map((post) => {
              const user = users.find((u) => u.id === post.userId);
              const car = cars.find((c) => c.id === post.carId);
              if (!user || !car) return null;
              return <PostCard key={post.id} post={post} user={user} car={car} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
