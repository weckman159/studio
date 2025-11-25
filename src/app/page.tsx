import { CarOfTheDay } from "@/components/CarOfTheDay";
import { PostCard } from "@/components/PostCard";
import { posts, users, cars } from "@/lib/data";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <main className="lg:col-span-3">
            <h1 className="text-3xl font-bold mb-6">Лента постов</h1>
            <div className="space-y-6">
              {posts.map((post) => {
                const user = users.find((u) => u.id === post.userId);
                const car = cars.find((c) => c.id === post.carId);
                if (!user || !car) return null;
                return <PostCard key={post.id} post={post} user={user} car={car} />;
              })}
            </div>
         </main>
          <aside className="lg:col-span-1">
             <div className="sticky top-20">
              <CarOfTheDay />
            </div>
          </aside>
       </div>
    </div>
  );
}
