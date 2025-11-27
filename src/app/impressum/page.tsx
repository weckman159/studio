import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Impressum - AutoSphere',
  description: 'Выходные данные согласно § 5 TMG',
}

export default function ImpressumPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Impressum</h1>
      
      <Card className="p-8 space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Angaben gemäß § 5 TMG</h2>
          <div className="space-y-2 text-sm">
            <p><strong>AutoSphere GmbH</strong></p>
            <p>Musterstraße 123</p>
            <p>12345 Berlin</p>
            <p>Deutschland</p>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Vertreten durch</h3>
          <p className="text-sm">Geschäftsführer: Max Mustermann</p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Kontakt</h3>
          <div className="space-y-1 text-sm">
            <p>Telefon: +49 (0) 30 12345678</p>
            <p>E-Mail: <a href="mailto:info@autosphere.de" className="text-primary hover:underline">info@autosphere.de</a></p>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Registereintrag</h3>
          <div className="space-y-1 text-sm">
            <p>Eintragung im Handelsregister</p>
            <p>Registergericht: Amtsgericht Berlin-Charlottenburg</p>
            <p>Registernummer: HRB 123456</p>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Umsatzsteuer-ID</h3>
          <p className="text-sm">
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
            DE123456789
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
          <div className="space-y-1 text-sm">
            <p>Max Mustermann</p>
            <p>Musterstraße 123</p>
            <p>12345 Berlin</p>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">EU-Streitschlichtung</h3>
          <p className="text-sm leading-relaxed">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: {' '}
            <a 
              href="https://ec.europa.eu/consumers/odr/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            <br />
            Unsere E-Mail-Adresse finden Sie oben im Impressum.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Verbraucher­streit­beilegung / Universal­schlichtungs­stelle</h3>
          <p className="text-sm leading-relaxed">
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>
      </Card>
    </div>
  )
}

    