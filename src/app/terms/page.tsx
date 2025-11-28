import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Условия использования - AutoSphere',
  description: 'Пользовательское соглашение и правила платформы AutoSphere',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Условия использования</h1>
      
      <Card className="p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Введение</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Добро пожаловать в AutoSphere! Настоящие Условия использования («Условия») регулируют ваш доступ к нашей платформе и ее использование. Регистрируясь или используя наши сервисы, вы соглашаетесь с настоящими Условиями.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Пользовательский контент</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Вы несете полную ответственность за контент, который вы публикуете, включая посты, фотографии и комментарии. Запрещается публиковать материалы, нарушающие законодательство, права третьих лиц, а также контент оскорбительного, порнографического или экстремистского характера.
            <br/><br/>
            Администрация оставляет за собой право удалять любой контент, нарушающий правила, и блокировать аккаунты пользователей без предварительного уведомления.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Правила поведения</h2>
           <p className="text-sm leading-relaxed text-muted-foreground">
            На платформе AutoSphere запрещены:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
            <li>Оскорбления, угрозы и разжигание ненависти в отношении других пользователей.</li>
            <li>Спам, несанкционированная реклама и мошенничество.</li>
            <li>Создание нескольких аккаунтов одним пользователем.</li>
            <li>Попытки взлома или нарушения работы сервиса.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Ограничение ответственности</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Сервис предоставляется «как есть». Администрация не несет ответственности за любой ущерб, возникший в результате использования или невозможности использования платформы. Мы не несем ответственности за содержание пользовательского контента и действия других участников.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Изменение Условий</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Мы можем пересматривать эти Условия время от времени. Актуальная версия всегда будет доступна на этой странице. Продолжая использовать сервис после внесения изменений, вы соглашаетесь с обновленными Условиями.
          </p>
        </section>

        <section className="border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </section>
      </Card>
    </div>
  )
}
