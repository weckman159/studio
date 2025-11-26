// src/app/partners/page.tsx
// SSG: Партнеры, собирается при билде или по расписанию через ISR
import Image from 'next/image';

export const revalidate = 86400; // ISR: 1 раз в сутки подгружает новые

interface Partner {
  id: string;
  name: string;
  logo: string; // url path от public (например, "/partners/bmw.png")
  url: string;
  description: string;
  region: string;
}

const partners: Partner[] = [
  {
    id: 'bmw',
    name: 'BMW Russia',
    logo: 'https://picsum.photos/seed/bmwlogo/64/64',
    url: 'https://bmw.ru/',
    description: 'Официальный сервис и клуб BMW Россия',
    region: 'Москва, регионы',
  },
  {
    id: 'avtotop',
    name: 'AvtoTop',
    logo: 'https://picsum.photos/seed/avtotoplogo/64/64',
    url: 'https://avtotop.ru/',
    description: 'Сеть сервисных станций для всех марок',
    region: 'Вся Россия',
  },
  {
    id: 'garagesale',
    name: 'Garage Sale',
    logo: 'https://picsum.photos/seed/garagesalelogo/64/64',
    url: '#',
    description: 'Крупнейший маркетплейс тюнинг-запчастей',
    region: 'Онлайн',
  },
  {
    id: 'driveclub',
    name: 'Drive Club',
    logo: 'https://picsum.photos/seed/driveclublogo/64/64',
    url: '#',
    description: 'Организация гоночных уикендов и трек-дней',
    region: 'Москва, Санкт-Петербург, Сочи',
  },
];

export default function PartnersPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Наши партнеры и сервисы</h1>
      <p className="mb-8 text-muted-foreground">
        Здесь представлены лучшие мастерские, сайты и клубы — мы сотрудничаем только с проверенными компаниями!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partners.map(partner => (
          <a
            key={partner.id}
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-card rounded-lg shadow-sm hover:shadow-lg p-4 transition border"
          >
            <div className="flex items-center gap-4 mb-2">
              <Image src={partner.logo} alt={partner.name} width={64} height={64} className="object-contain rounded bg-white" />
              <div>
                <div className="text-lg font-bold">{partner.name}</div>
                <div className="text-xs text-muted-foreground">{partner.region}</div>
              </div>
            </div>
            <div className="mt-2 text-sm text-card-foreground/80">{partner.description}</div>
          </a>
        ))}
      </div>
      <div className="text-sm text-center text-muted-foreground mt-10">
        Хотите стать партнером? Пишите на <a href="mailto:partners@autosphere.com" className="underline">partners@autosphere.com</a>
      </div>
    </div>
  );
}
