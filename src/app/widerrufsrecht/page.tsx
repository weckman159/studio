import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Право на отказ - AutoSphere',
  description: 'Политика возврата и условия отказа от услуг на платформе AutoSphere',
}

export default function WiderrufsrechtPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Право на отказ от услуг</h1>
      
      <Card className="p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Общие положения</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Поскольку основная часть функционала платформы AutoSphere предоставляется бесплатно, понятие "отказа от услуг" в традиционном смысле (как возврат товара) не применяется. Данная страница описывает условия прекращения использования сервиса и удаления вашего аккаунта.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Удаление аккаунта</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Вы имеете право в любой момент прекратить использование платформы AutoSphere и удалить свой аккаунт.
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mt-2">
            <li>Вы можете инициировать удаление своего аккаунта в разделе "Настройки" → "Безопасность".</li>
            <li>После запроса на удаление ваш аккаунт будет деактивирован и станет недоступен.</li>
            <li>Полное удаление ваших персональных данных и контента из наших систем может занять до 30 дней. Часть анонимизированной информации может быть сохранена для аналитических целей.</li>
            <li>Восстановить удаленный аккаунт невозможно.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Платные услуги</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            В случае введения на платформе платных услуг (например, премиум-подписки или платного размещения объявлений), условия возврата средств будут регулироваться отдельным соглашением, которое будет представлено пользователю перед совершением платежа.
            <br/><br/>
            Все вопросы, связанные с платными услугами, будут решаться в соответствии с действующим законодательством о защите прав потребителей.
          </p>
        </section>
        
        <section className="border-t pt-6">
          <p className="text-sm text-muted-foreground">
            По всем вопросам, связанным с использованием сервиса, вы можете обратиться в нашу службу поддержки через <a href="/feedback" className="text-primary hover:underline">форму обратной связи</a>.
          </p>
        </section>
      </Card>
    </div>
  )
}
