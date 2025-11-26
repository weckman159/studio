import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <div className="flex justify-center gap-4 mb-2">
            <Link href="/about" className="text-sm hover:underline">О проекте</Link>
            <Link href="/feedback" className="text-sm hover:underline">Обратная связь</Link>
        </div>
        <p className="text-sm">&copy; {new Date().getFullYear()} AutoSphere. Все права защищены.</p>
      </div>
    </footer>
  );
}
