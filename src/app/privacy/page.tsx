import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Политика конфиденциальности - AutoSphere',
  description: 'Информация о защите и обработке персональных данных',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Политика конфиденциальности</h1>
      
      <Card className="p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Общие положения</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Настоящая политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006. №152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных, предпринимаемые ООО "АвтоСфера" (далее – Оператор).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Основные понятия</h2>
           <p className="text-sm leading-relaxed text-muted-foreground">
            <strong>Персональные данные</strong> – любая информация, относящаяся прямо или косвенно к определенному или определяемому физическому лицу (субъекту персональных данных).
            <br/><br/>
            <strong>Обработка персональных данных</strong> – любое действие (операция) или совокупность действий (операций), совершаемых с использованием средств автоматизации или без использования таких средств с персональными данными.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Какие данные мы собираем</h2>
           <p className="text-sm leading-relaxed text-muted-foreground">
            Мы собираем следующие категории данных:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
            <li>Данные, которые вы предоставляете при регистрации: имя, адрес электронной почты, пароль.</li>
            <li>Данные, которые вы добавляете в свой профиль: фото, биография, местоположение.</li>
            <li>Технические данные, собираемые автоматически: IP-адрес, тип браузера, файлы cookie.</li>
            <li>Данные о вашем контенте: посты, комментарии, фотографии автомобилей.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Цели обработки персональных данных</h2>
           <p className="text-sm leading-relaxed text-muted-foreground">
            Оператор обрабатывает персональные данные Пользователя только в случае их заполнения и/или отправки Пользователем самостоятельно через специальные формы, расположенные на сайте.
            <br/><br/>
            Цель обработки: предоставление доступа Пользователю к сервисам, информации и/или материалам, содержащимся на веб-сайте; улучшение качества работы сервиса; отправка информационных уведомлений.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Ваши права</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Вы имеете право на доступ к своим данным, их исправление, удаление, а также на ограничение их обработки. Для реализации своих прав вы можете обратиться к нам через страницу обратной связи.
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
