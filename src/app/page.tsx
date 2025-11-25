import { CarOfTheDay } from "@/components/CarOfTheDay";
import { PostCard } from "@/components/PostCard";
import { posts, users, cars } from "@/lib/data";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Лента постов</h1>
      <div className="mb-8">
        <CarOfTheDay />
      </div>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Последние посты</h2>
        {posts.map((post) => {
          const user = users.find((u) => u.id === post.userId);
          const car = cars.find((c) => c.id === post.carId);
          if (!user || !car) return null;
          return <PostCard key={post.id} post={post} user={user} car={car} />;
        })}
      </div>
    </div>
  );
}
