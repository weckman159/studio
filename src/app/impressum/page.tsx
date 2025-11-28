import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Выходные данные - AutoSphere',
  description: 'Выходные данные согласно законодательству',
}

export default function ImpressumPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Выходные данные</h1>
      
      <Card className="p-8 space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Информация о компании</h2>
          <div className="space-y-2 text-sm">
            <p><strong>ООО "АвтоСфера"</strong></p>
            <p>ул. Примерная, д. 123</p>
            <p>г. Москва, 123456</p>
            <p>Российская Федерация</p>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Генеральный директор</h3>
          <p className="text-sm">Иванов Иван Иванович</p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Контактные данные</h3>
          <div className="space-y-1 text-sm">
            <p>Телефон: +7 (495) 123-45-67</p>
            <p>E-Mail: <a href="mailto:info@autosphere.ru" className="text-primary hover:underline">info@autosphere.ru</a></p>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Регистрационные данные</h3>
          <div className="space-y-1 text-sm">
            <p>ОГРН: 1234567890123</p>
            <p>ИНН: 1234567890</p>
            <p>Регистрирующий орган: Межрайонная инспекция ФНС №46 по г. Москве</p>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Ответственный за содержание</h3>
          <div className="space-y-1 text-sm">
            <p>Иванов Иван Иванович</p>
            <p>ул. Примерная, д. 123</p>
            <p>г. Москва, 123456</p>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Урегулирование споров</h3>
          <p className="text-sm leading-relaxed">
            Мы не принимаем участия в процедурах урегулирования споров в потребительских арбитражных судах. 
            Однако вы всегда можете связаться с нами напрямую для решения любых вопросов.
          </p>
        </section>
      </Card>
    </div>
  )
}
