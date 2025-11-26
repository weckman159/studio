import { Card, CardContent } from "@/components/ui/card";
import { HardHat } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{title}</h1>
      <Card className="flex items-center justify-center h-96 border-2 border-dashed">
        <CardContent className="text-center p-6">
          <HardHat className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold">Раздел в разработке</h2>
          <p className="text-muted-foreground mt-2">
            Эта функциональность скоро появится. Мы усердно работаем над этим!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
