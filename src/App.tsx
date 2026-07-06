import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Database, Download, FileOutput, Home, Layers3, Pencil, Radio, Save, Search, Settings, Trash2, UploadCloud } from 'lucide-react'
import { episodes, scheduleRules, sendungen as seedSendungen, type Sendung } from './data/seed'

type Page = 'Dashboard' | 'Sendungen' | 'Episoden' | 'Kalender' | 'Regeln' | 'Publikation' | 'PDF-Import' | 'Einstellungen'

type SendungForm = Omit<Sendung, 'id'> & { id?: string }

const navigation: { label: Page; icon: typeof Home }[] = [
  { label: 'Dashboard', icon: Home },
  { label: 'Sendungen', icon: Radio },
  { label: 'Episoden', icon: Layers3 },
  { label: 'Kalender', icon: CalendarDays },
  { label: 'Regeln', icon: Database },
  { label: 'Publikation', icon: FileOutput },
  { label: 'PDF-Import', icon: UploadCloud },
  { label: 'Einstellungen', icon: Settings },
]

const emptyForm: SendungForm = {
  title: '',
  category: '',
  language: 'de',
  source: 'local',
  active: true,
}

const heute = [
  { time: '08:00', title: 'Heilige Messe', meta: 'Live' },
  { time: '09:00', title: 'Glaubensforum', meta: 'Montag bis Freitag' },
  { time: '10:00', title: 'Lebenshilfe', meta: 'außer Mittwoch' },
  { time: '13:15', title: 'Bei uns zu Gast', meta: 'Montag' },
  { time: '14:00', title: 'Spiritualität', meta: 'Standardplatz' },
  { time: '20:30', title: 'Credo', meta: 'Dienstag bis Freitag' },
]

function createId(title: string) {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return `snd_${slug || Date.now()}`
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function App() {
  const [page, setPage] = useState<Page>('Dashboard')
  const [query, setQuery] = useState('')
  const [sendungen, setSendungen] = useState<Sendung[]>(() => {
    const saved = localStorage.getItem('rms.sendungen')
    return saved ? JSON.parse(saved) as Sendung[] : seedSendungen
  })
  const [form, setForm] = useState<SendungForm>(emptyForm)
  const [message, setMessage] = useState('')

  useEffect(() => {
    localStorage.setItem('rms.sendungen', JSON.stringify(sendungen))
  }, [sendungen])

  const filteredSendungen = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return sendungen
    return sendungen.filter((item) =>
      `${item.title} ${item.category} ${item.source}`.toLowerCase().includes(value),
    )
  }, [query, sendungen])

  const activeSendungen = sendungen.filter((sendung) => sendung.active).length
  const activeRules = scheduleRules.filter((rule) => rule.active).length

  function resetForm() {
    setForm(emptyForm)
    setMessage('')
  }

  function editSendung(sendung: Sendung) {
    setForm(sendung)
    setPage('Sendungen')
    setMessage('Sendung wird bearbeitet.')
  }

  function deleteSendung(id: string) {
    setSendungen((items) => items.filter((item) => item.id !== id))
    if (form.id === id) resetForm()
    setMessage('Sendung gelöscht.')
  }

  function saveSendung() {
    if (!form.title.trim()) {
      setMessage('Bitte einen Titel eingeben.')
      return
    }

    const next: Sendung = {
      id: form.id || createId(form.title),
      title: form.title.trim(),
      category: form.category.trim() || 'Ohne Kategorie',
      language: form.language,
      source: form.source || 'local',
      active: form.active,
    }

    setSendungen((items) => {
      const exists = items.some((item) => item.id === next.id)
      return exists ? items.map((item) => item.id === next.id ? next : item) : [next, ...items]
    })
    setForm(emptyForm)
    setMessage('Sendung gespeichert.')
  }

  function exportProgram() {
    const lines = [
      'RADIO MARIA SÜDTIROL',
      'Programmvorschau',
      '',
      ...heute.map((item) => `${item.time} ${item.title} - ${item.meta}`),
      '',
      'Sendungen',
      ...sendungen.map((item) => `- ${item.title} (${item.category})`),
    ]
    downloadText('rms-programm.txt', lines.join('\n'))
  }

  function exportSendungenJson() {
    downloadText('rms-sendungen.json', JSON.stringify(sendungen, null, 2))
  }

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
              <button className={page === item.label ? 'nav-item active' : 'nav-item'} key={item.label} onClick={() => setPage(item.label)}>
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-card">
          <p>Nächste Ausgabe</p>
          <strong>November-Dezember</strong>
        </div>
      </aside>

      <section className="content-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">RMS</p>
            <h2>{page}</h2>
          </div>
          <button className="primary-action" onClick={() => { setPage('Sendungen'); resetForm() }}>Neue Sendung</button>
        </header>

        {page === 'Dashboard' && (
          <>
            <section className="hero-panel">
              <div>
                <p className="eyebrow">Aktueller Arbeitsstand</p>
                <h3>Programmheft November-Dezember</h3>
                <p>{sendungen.length} Sendungen, {activeRules} Regeln und {episodes.length} Episoden sind vorhanden.</p>
              </div>
              <button className="hero-action" onClick={() => setPage('Kalender')}>Programm bearbeiten</button>
            </section>

            <section className="metric-grid">
              <article className="metric-card"><span>Aktive Sendungen</span><strong>{activeSendungen}</strong><p>im Katalog</p></article>
              <article className="metric-card"><span>Regeln</span><strong>{activeRules}</strong><p>wiederkehrende Sendeplätze</p></article>
              <article className="metric-card"><span>Episoden</span><strong>{episodes.length}</strong><p>erfasst</p></article>
              <article className="metric-card accent"><span>Export</span><strong>TXT</strong><p>funktioniert</p></article>
            </section>

            <section className="main-grid">
              <ProgramPanel openCalendar={() => setPage('Kalender')} />
              <SendungPreview sendungen={sendungen} editSendung={editSendung} />
            </section>
          </>
        )}

        {page === 'Sendungen' && (
          <section className="workspace-grid">
            <article className="panel">
              <div className="panel-header">
                <div><p className="eyebrow">Katalog</p><h3>Sendungen verwalten</h3></div>
                <div className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Suchen" /></div>
              </div>
              <div className="table-list">
                {filteredSendungen.map((sendung) => (
                  <div className="table-row" key={sendung.id}>
                    <div><strong>{sendung.title}</strong><p>{sendung.category} · {sendung.source}</p></div>
                    <div className="row-actions">
                      <button onClick={() => editSendung(sendung)}><Pencil size={16} /> Bearbeiten</button>
                      <button className="danger" onClick={() => deleteSendung(sendung.id)}><Trash2 size={16} /> Löschen</button>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel form-panel">
              <div className="panel-header"><div><p className="eyebrow">Formular</p><h3>{form.id ? 'Sendung bearbeiten' : 'Neue Sendung'}</h3></div></div>
              <label>Titel<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
              <label>Kategorie<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label>
              <label>Quelle<input value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })} /></label>
              <label>Sprache<select value={form.language} onChange={(event) => setForm({ ...form, language: event.target.value as Sendung['language'] })}><option value="de">Deutsch</option><option value="it">Italienisch</option><option value="multi">Mehrsprachig</option></select></label>
              <label className="checkbox"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} /> Aktiv</label>
              <div className="form-actions"><button className="primary-action" onClick={saveSendung}><Save size={16} /> Speichern</button><button className="ghost-action" onClick={resetForm}>Zurücksetzen</button></div>
              {message && <p className="notice">{message}</p>}
            </article>
          </section>
        )}

        {page === 'Episoden' && <EpisodesPage editSendung={editSendung} />}
        {page === 'Kalender' && <CalendarPage />}
        {page === 'Regeln' && <RulesPage />}
        {page === 'Publikation' && <PublicationPage exportProgram={exportProgram} exportSendungenJson={exportSendungenJson} />}
        {page === 'PDF-Import' && <ImportPage />}
        {page === 'Einstellungen' && <SettingsPage resetData={() => { localStorage.removeItem('rms.sendungen'); setSendungen(seedSendungen); setMessage('Daten zurückgesetzt.') }} />}
      </section>
    </main>
  )
}

function ProgramPanel({ openCalendar }: { openCalendar: () => void }) {
  return <article className="panel schedule-panel"><div className="panel-header"><div><p className="eyebrow">Heute</p><h3>Programmvorschau</h3></div><button className="ghost-action" onClick={openCalendar}>Kalender öffnen</button></div><div className="timeline">{heute.map((item) => <div className="timeline-row" key={`${item.time}-${item.title}`}><time>{item.time}</time><div className="timeline-node" /><div><strong>{item.title}</strong><p>{item.meta}</p></div></div>)}</div></article>
}

function SendungPreview({ sendungen, editSendung }: { sendungen: Sendung[]; editSendung: (sendung: Sendung) => void }) {
  return <article className="panel"><div className="panel-header"><div><p className="eyebrow">Sendungen</p><h3>Katalog</h3></div></div><div className="sendung-list">{sendungen.slice(0, 8).map((sendung) => <button className="sendung-row" key={sendung.id} onClick={() => editSendung(sendung)}><div><strong>{sendung.title}</strong><p>{sendung.category}</p></div><span>{sendung.source}</span></button>)}</div></article>
}

function EpisodesPage({ editSendung }: { editSendung: (sendung: Sendung) => void }) {
  return <article className="panel"><div className="panel-header"><div><p className="eyebrow">Episoden</p><h3>Erfasste Episoden</h3></div></div><div className="table-list">{episodes.map((episode) => { const sendung = seedSendungen.find((item) => item.id === episode.sendungId); return <div className="table-row" key={episode.id}><div><strong>{episode.title}</strong><p>{episode.date} · {episode.startTime} · {sendung?.title || 'Sendung'}</p>{episode.speaker && <p>{episode.speaker}</p>}</div>{sendung && <button className="ghost-action" onClick={() => editSendung(sendung)}>Sendung öffnen</button>}</div> })}</div></article>
}

function CalendarPage() {
  return <article className="panel"><div className="panel-header"><div><p className="eyebrow">Kalender</p><h3>Wochenansicht</h3></div></div><div className="calendar-grid">{['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'].map((day) => <div className="calendar-day" key={day}><strong>{day}</strong>{scheduleRules.filter((rule) => rule.weekdays.includes(day.slice(0,2).toUpperCase().replace('DI','TU').replace('MI','WE').replace('DO','TH').replace('SA','SA').replace('SO','SU'))).slice(0,4).map((rule) => { const sendung = seedSendungen.find((item) => item.id === rule.sendungId); return <p key={rule.id}><b>{rule.startTime}</b> {sendung?.title || rule.title || rule.sendungId}</p> })}</div>)}</div></article>
}

function RulesPage() {
  return <article className="panel"><div className="panel-header"><div><p className="eyebrow">Regeln</p><h3>Wiederkehrende Sendeplätze</h3></div></div><div className="table-list">{scheduleRules.map((rule) => { const sendung = seedSendungen.find((item) => item.id === rule.sendungId); return <div className="table-row" key={rule.id}><div><strong>{rule.startTime} · {sendung?.title || rule.title || rule.sendungId}</strong><p>{rule.weekdays.join(', ')} · Priorität {rule.priority}</p></div><span className="tag">{rule.active ? 'Aktiv' : 'Inaktiv'}</span></div> })}</div></article>
}

function PublicationPage({ exportProgram, exportSendungenJson }: { exportProgram: () => void; exportSendungenJson: () => void }) {
  return <section className="workspace-grid"><article className="panel"><div className="panel-header"><div><p className="eyebrow">Publikation</p><h3>Export erstellen</h3></div></div><div className="export-actions"><button className="primary-action" onClick={exportProgram}><Download size={16} /> TXT für Programmheft</button><button className="ghost-action" onClick={exportSendungenJson}><Download size={16} /> Sendungen JSON</button></div></article><article className="panel"><h3>Nächste Schritte</h3><p className="muted">Affinity-Export, RDS und HTML werden hier ergänzt.</p></article></section>
}

function ImportPage() {
  return <article className="panel"><div className="panel-header"><div><p className="eyebrow">PDF-Import</p><h3>Import vorbereiten</h3></div></div><input type="file" accept="application/pdf" onChange={(event) => alert(event.target.files?.[0] ? `PDF ausgewählt: ${event.target.files[0].name}` : 'Kein PDF ausgewählt')} /><p className="muted">Der echte PDF-Parser wird als nächste Funktion angebunden. Die Dateiauswahl funktioniert bereits.</p></article>
}

function SettingsPage({ resetData }: { resetData: () => void }) {
  return <article className="panel"><div className="panel-header"><div><p className="eyebrow">Einstellungen</p><h3>Lokale Daten</h3></div></div><p className="muted">Neue und bearbeitete Sendungen werden im Browser gespeichert.</p><button className="danger-button" onClick={resetData}>Lokale Änderungen zurücksetzen</button></article>
}
