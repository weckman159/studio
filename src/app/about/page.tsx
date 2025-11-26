'use client';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">О проекте AutoSphere</h1>
      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
        <p>
          Добро пожаловать на <strong>AutoSphere</strong> — автосоциальную платформу нового поколения, созданную для объединения всех, кто разделяет страсть к автомобилям!
        </p>
        <p>
            Наша миссия — предоставить удобное, современное и дружелюбное пространство, где каждый автолюбитель сможет найти что-то для себя. У нас вы можете:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Вести бортжурналы:</strong> Делитесь историями своих автомобилей,记录 ремонтов, тюнинга и просто ярких моментов.</li>
          <li><strong>Находить сообщества:</strong> Присоединяйтесь к клубам по интересам, будь то JDM, немецкая классика или внедорожные приключения.</li>
          <li><strong>Пользоваться маркетплейсом:</strong> Покупайте и продавайте запчасти, аксессуары и даже целые автомобили в доверенной среде.</li>
          <li><strong>Находить мастерские:</strong> Изучайте каталог автосервисов с реальными отзывами и оценками.</li>
          <li><strong>Участвовать в событиях:</strong> Узнавайте о предстоящих встречах, выставках и автопробегах в вашем городе.</li>
          <li><strong>Голосовать и обсуждать:</strong> Участвуйте в опросах, выбирайте "Автомобиль дня" и делитесь своим мнением.</li>
        </ul>
        <p>
            Мы стремимся создать прозрачное и открытое сообщество, где каждый чувствует себя комфортно. Присоединяйтесь к нам и станьте частью AutoSphere!
        </p>
        
        <div className="pt-8">
            <h2 className="text-2xl font-semibold mb-3">Наши партнеры</h2>
            <ul className="list-disc pl-6 space-y-2">
            <li>ООО «СуперМотор» — надежный поставщик автозапчастей</li>
            <li>РФО «Драйв» — региональный фонд поддержки водителей</li>
            <li>CarValley — федеральная сеть сервисов</li>
            </ul>
        </div>

        <div className="pt-8">
            <h2 className="text-2xl font-semibold mb-3">Контакты</h2>
            <p>
            По вопросам сотрудничества и обратной связи пишите нам на почту: <Link href="mailto:support@autosphere.com" className="text-primary hover:underline">support@autosphere.com</Link>.
            </p>
        </div>
      </div>
    </div>
  );
}
