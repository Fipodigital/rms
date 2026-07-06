import { CalendarDays, Database, FileOutput, Home, Layers3, Radio, Settings, Sparkles, UploadCloud } from 'lucide-react'
import { episodes, scheduleRules, sendungen } from './data/seed'

const navigation = [
  { label: 'Dashboard', icon: Home, active: true },
  { label: 'Sendungen', icon: Radio },
  { label: 'Episoden', icon: Layers3 },
  { label: 'Kalender', icon: CalendarDays },
  { label: 'Regeln', icon: Database },
  { label: 'Publishing', icon: FileOutput },
  { label: 'Import PDF', icon: UploadCloud },
  { label: 'Einstellungen', icon: Settings },
]

const todaySchedule = [
  { time: '08:00', title: 'Heilige Messe', meta: 'Live · wechselnder Ort' },
  { time: '09:00', title: 'Glaubensforum', meta: 'Regel: Montag-Freitag' },
  { time: '10:00', title: 'Lebenshilfe', meta: 'Episode wird zugeordnet' },
  { time: '13:15', title: 'Bei uns zu Gast', meta: 'Interview / lokale Sendung' },
  { time: '14:00', title: 'Spiritualität', meta: 'Standard-Slot' },
  { time: '20:30', title: 'Credo', meta: 'Abendprogramm' },
]

export function App() {
  const activeRules = scheduleRules.filter((rule) => rule.active).length
  const activeSendungen = sendungen.filter((sendung) => sendung.active).length

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">R</div>
          <div>
            <p className="eyebrow">Radio Maria Südtirol</p>
            <h1>RMS</h1>
          </div>
        </div>

        <nav className="navigation" aria-label="Hauptnavigation">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <button className={item.active ? 'nav-item active' : 'nav-item'} key={item.label}>
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-card">
          <Sparkles size={20} />
          <p>Dataset real aus programm.pdf</p>
          <strong>Nov-Dez 2023</strong>
        </div>
      </aside>

      <section className="content-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">Media Publishing Platform</p>
            <h2>Dashboard</h2>
          </div>
          <button className="primary-action">Neue Sendung</button>
        </header>

        <section className="hero-panel">
          <div>
            <p className="eyebrow">Sprint 1</p>
            <h3>Palinsesto reale, non dati finti.</h3>
            <p>
              RMS sta già usando trasmissioni, regole ricorrenti ed episodi campione ricavati dal bimestrale reale.
            </p>
          </div>
          <div className="hero-status">
            <span className="status-dot" />
            Scheduling Engine vorbereitet
          </div>
        </section>

        <section className="metric-grid">
          <article className="metric-card">
            <span>Sendungen</span>
            <strong>{activeSendungen}</strong>
            <p>trasmissioni attive nel catalogo iniziale</p>
          </article>
          <article className="metric-card">
            <span>Regeln</span>
            <strong>{activeRules}</strong>
            <p>regole settimanali già modellate</p>
          </article>
          <article className="metric-card">
            <span>Episoden</span>
            <strong>{episodes.length}</strong>
            <p>episodi reali collegati al PDF</p>
          </article>
          <article className="metric-card accent">
            <span>Publishing</span>
            <strong>7</strong>
            <p>canali previsti: TXT, Affinity, HTML, JSON, MCP, RDS, Web</p>
          </article>
        </section>

        <section className="main-grid">
          <article className="panel schedule-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Heute</p>
                <h3>Programmvorschau</h3>
              </div>
              <button className="ghost-action">Kalender öffnen</button>
            </div>

            <div className="timeline">
              {todaySchedule.map((item) => (
                <div className="timeline-row" key={`${item.time}-${item.title}`}>
                  <time>{item.time}</time>
                  <div className="timeline-node" />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Sendungen</p>
                <h3>Katalog</h3>
              </div>
            </div>

            <div className="sendung-list">
              {sendungen.slice(0, 8).map((sendung) => (
                <div className="sendung-row" key={sendung.id}>
                  <div>
                    <strong>{sendung.title}</strong>
                    <p>{sendung.category}</p>
                  </div>
                  <span>{sendung.source}</span>
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>
    </main>
  )
}
