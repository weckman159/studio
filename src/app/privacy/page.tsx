import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Datenschutzerklärung - AutoSphere',
  description: 'Информация о защите персональных данных',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Datenschutzerklärung</h1>
      
      <Card className="p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Datenschutz auf einen Blick</h2>
          <h3 className="text-xl font-semibold mb-3">Allgemeine Hinweise</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen 
            Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, 
            mit denen Sie persönlich identifiziert werden können.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Datenerfassung auf dieser Website</h3>
          <h4 className="font-semibold mb-2">Wer ist verantwortlich für die Datenerfassung?</h4>
          <p className="text-sm leading-relaxed text-muted-foreground mb-4">
            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. 
            Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
          </p>
          
          <h4 className="font-semibold mb-2">Wie erfassen wir Ihre Daten?</h4>
          <p className="text-sm leading-relaxed text-muted-foreground mb-4">
            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen (z.B. bei Registrierung). 
            Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst 
            (z.B. IP-Adresse, Browser-Typ).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Hosting und Content Delivery Networks (CDN)</h2>
          <h3 className="text-xl font-semibold mb-3">Externes Hosting</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Diese Website wird bei Vercel Inc. gehostet. Weitere Informationen finden Sie in der 
            Datenschutzerklärung von Vercel:{' '}
            <a 
              href="https://vercel.com/legal/privacy-policy" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              https://vercel.com/legal/privacy-policy
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Allgemeine Hinweise und Pflichtinformationen</h2>
          
          <h3 className="text-xl font-semibold mb-3">Datenschutz</h3>
          <p className="text-sm leading-relaxed text-muted-foreground mb-4">
            Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. 
            Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen 
            Datenschutzvorschriften sowie dieser Datenschutzerklärung.
          </p>

          <h3 className="text-xl font-semibold mb-3">Ihre Rechte</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
            <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
            <li>Recht auf Löschung (Art. 17 DSGVO)</li>
            <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
            <li>Beschwerderecht bei Aufsichtsbehörde (Art. 77 DSGVO)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Datenerfassung auf dieser Website</h2>
          
          <h3 className="text-xl font-semibold mb-3">Cookies</h3>
          <p className="text-sm leading-relaxed text-muted-foreground mb-4">
            Unsere Website verwendet Cookies. Das sind kleine Textdateien, die auf Ihrem Endgerät 
            gespeichert werden. Einige Cookies sind zwingend erforderlich, andere helfen uns, 
            das Angebot zu verbessern und wirtschaftlich zu betreiben.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">Server-Log-Dateien</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Bei jedem Zugriff werden automatisch Informationen erfasst:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
            <li>Browsertyp und Browserversion</li>
            <li>Verwendetes Betriebssystem</li>
            <li>Referrer URL</li>
            <li>Hostname des zugreifenden Rechners</li>
            <li>Uhrzeit der Serveranfrage</li>
            <li>IP-Adresse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Analyse-Tools und Werbung</h2>
          <h3 className="text-xl font-semibold mb-3">Google Analytics</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Diese Website nutzt Funktionen des Webanalysedienstes Google Analytics. 
            Anbieter ist die Google Ireland Limited („Google"), Gordon House, Barrow Street, 
            Dublin 4, Irland. Google Analytics verwendet Cookies.
          </p>
        </section>

        <section className="border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Stand: {new Date().toLocaleDateString('de-DE')}
          </p>
        </section>
      </Card>
    </div>
  )
}

    