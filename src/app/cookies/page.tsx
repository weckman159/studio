import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Политика использования Cookie - AutoSphere',
  description: 'Информация о том, как мы используем файлы cookie на платформе AutoSphere',
}

export default function CookiesPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Политика использования Cookie</h1>
      
      <Card className="p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Что такое Cookie?</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Файлы cookie — это небольшие текстовые файлы, которые веб-сайты размещают на устройствах пользователей (компьютерах, смартфонах) для хранения информации. Они помогают сайтам «запоминать» вас и ваши предпочтения, что делает взаимодействие с сайтом более удобным и персонализированным.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Как мы используем Cookie?</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Мы используем файлы cookie для следующих целей:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mt-2">
            <li>
              <strong>Необходимые cookie:</strong> Эти файлы cookie необходимы для базовой работы сайта, например, для аутентификации пользователя и обеспечения безопасности. Без них сайт не сможет функционировать должным образом.
            </li>
            <li>
              <strong>Функциональные cookie:</strong> Они позволяют сайту запоминать ваш выбор (например, язык или тему оформления), чтобы сделать ваш следующий визит более персонализированным.
            </li>
            <li>
              <strong>Аналитические cookie:</strong> Мы используем их для сбора анонимной статистики о том, как посетители используют наш сайт. Это помогает нам улучшать навигацию, контент и общую производительность платформы (например, через Google Analytics).
            </li>
            <li>
              <strong>Маркетинговые cookie:</strong> Эти файлы cookie могут использоваться для показа вам релевантной рекламы на других сайтах. Мы не используем их для показа рекламы на самой платформе AutoSphere.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Управление файлами Cookie</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            При первом посещении нашего сайта мы запрашиваем ваше согласие на использование необязательных файлов cookie. Вы можете в любое время изменить свои предпочтения через баннер управления cookie.
            <br/><br/>
            Кроме того, вы можете настроить свой браузер так, чтобы он блокировал или предупреждал вас о файлах cookie, но в этом случае некоторые части сайта могут перестать работать.
          </p>
        </section>

        <section className="border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Если у вас есть вопросы о нашей политике использования cookie, пожалуйста, свяжитесь с нами через <a href="/feedback" className="text-primary hover:underline">форму обратной связи</a>.
          </p>
        </section>
      </Card>
    </div>
  )
}
