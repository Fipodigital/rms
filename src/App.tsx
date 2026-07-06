import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Download, Home, Pencil, Radio, Save, Search, Settings, Trash2 } from 'lucide-react'
import { episodes, scheduleRules, sendungen as seedSendungen, type Sendung } from './data/seed'

type Page = 'Dashboard' | 'Sendungen' | 'Kalender' | 'Publikation' | 'Einstellungen'
type Form = Omit<Sendung, 'id'> & { id?: string }
type AppSettings = { organisationName: string; language: 'de' | 'it' | 'en'; logoText: string }

const emptyForm: Form = { title: '', category: '', language: 'de', source: 'local', active: true }
const pages: { label: Page; icon: typeof Home }[] = [
  { label: 'Dashboard', icon: Home },
  { label: 'Sendungen', icon: Radio },
  { label: 'Kalender', icon: CalendarDays },
  { label: 'Publikation', icon: Download },
  { label: 'Einstellungen', icon: Settings },
]
const heute = [
  ['08:00', 'Heilige Messe', 'Live'],
  ['09:00', 'Glaubensforum', 'Montag bis Freitag'],
  ['10:00', 'Lebenshilfe', 'außer Mittwoch'],
  ['13:15', 'Bei uns zu Gast', 'Montag'],
  ['14:00', 'Spiritualität', 'Standardplatz'],
  ['20:30', 'Credo', 'Dienstag bis Freitag'],
]

function makeId(title: string) { return `snd_${title.toLowerCase().replaceAll(' ', '_')}` }
function saveFile(name: string, content: string) { const blob = new Blob([content], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url) }

export function App() {
  const [page, setPage] = useState<Page>('Dashboard')
  const [query, setQuery] = useState('')
  const [form, setForm] = useState<Form>(emptyForm)
  const [notice, setNotice] = useState('')
  const [sendungen, setSendungen] = useState<Sendung[]>(() => JSON.parse(localStorage.getItem('rms.sendungen') || 'null') || seedSendungen)
  const [settings, setSettings] = useState<AppSettings>(() => JSON.parse(localStorage.getItem('rms.settings') || 'null') || { organisationName: 'Radio Maria Südtirol', language: 'de', logoText: 'R' })

  useEffect(() => localStorage.setItem('rms.sendungen', JSON.stringify(sendungen)), [sendungen])
  useEffect(() => localStorage.setItem('rms.settings', JSON.stringify(settings)), [settings])

  const filtered = useMemo(() => sendungen.filter((s) => `${s.title} ${s.category} ${s.source}`.toLowerCase().includes(query.toLowerCase())), [sendungen, query])
  const activeRules = scheduleRules.filter((r) => r.active).length

  function newSendung() { setPage('Sendungen'); setForm(emptyForm); setNotice('') }
  function editSendung(s: Sendung) { setPage('Sendungen'); setForm(s); setNotice('Sendung wird bearbeitet.') }
  function deleteSendung(id: string) { setSendungen(sendungen.filter((s) => s.id !== id)); setNotice('Sendung gelöscht.') }
  function saveSendung() {
    if (!form.title.trim()) { setNotice('Bitte einen Titel eingeben.'); return }
    const item: Sendung = { id: form.id || makeId(form.title), title: form.title.trim(), category: form.category || 'Ohne Kategorie', language: form.language, source: form.source || 'local', active: form.active }
    setSendungen(sendungen.some((s) => s.id === item.id) ? sendungen.map((s) => s.id === item.id ? item : s) : [item, ...sendungen])
    setForm(emptyForm); setNotice('Sendung gespeichert.')
  }
  function exportTxt() { saveFile('rms-programm.txt', ['RADIO MARIA SÜDTIROL', '', ...heute.map((r) => `${r[0]} ${r[1]} - ${r[2]}`)].join('\n')) }
  function exportJson() { saveFile('rms-sendungen.json', JSON.stringify(sendungen, null, 2)) }

  return <main className="app-shell"><aside className="sidebar"><div className="brand-block"><div className="brand-mark">{settings.logoText || 'R'}</div><div><p className="eyebrow">{settings.organisationName}</p><h1>RMS</h1></div></div><nav className="navigation">{pages.map((p) => { const Icon = p.icon; return <button key={p.label} className={page === p.label ? 'nav-item active' : 'nav-item'} onClick={() => setPage(p.label)}><Icon size={18}/><span>{p.label}</span></button> })}</nav><div className="sidebar-card"><p>Sprache</p><strong>{settings.language.toUpperCase()}</strong></div></aside><section className="content-area"><header className="topbar"><div><p className="eyebrow">RMS</p><h2>{page}</h2></div><button className="primary-action" onClick={newSendung}>Neue Sendung</button></header>{page === 'Dashboard' && <Dashboard sendungen={sendungen} activeRules={activeRules} openCalendar={() => setPage('Kalender')} editSendung={editSendung}/>} {page === 'Sendungen' && <Sendungen filtered={filtered} query={query} setQuery={setQuery} form={form} setForm={setForm} saveSendung={saveSendung} deleteSendung={deleteSendung} editSendung={editSendung} notice={notice}/>} {page === 'Kalender' && <Kalender/>} {page === 'Publikation' && <Publikation exportTxt={exportTxt} exportJson={exportJson}/>} {page === 'Einstellungen' && <Einstellungen settings={settings} setSettings={setSettings} reset={() => { localStorage.clear(); location.reload() }}/>}</section></main>
}

function Dashboard({ sendungen, activeRules, openCalendar, editSendung }: { sendungen: Sendung[]; activeRules: number; openCalendar: () => void; editSendung: (s: Sendung) => void }) { return <><section className="hero-panel"><div><p className="eyebrow">Aktueller Arbeitsstand</p><h3>Programmheft November-Dezember</h3><p>{sendungen.length} Sendungen, {activeRules} Regeln und {episodes.length} Episoden sind vorhanden.</p></div><button className="hero-action" onClick={openCalendar}>Programm bearbeiten</button></section><section className="main-grid"><article className="panel"><div className="panel-header"><div><p className="eyebrow">Heute</p><h3>Programmvorschau</h3></div></div><div className="timeline">{heute.map((r) => <div className="timeline-row" key={r[0]}><time>{r[0]}</time><div className="timeline-node"/><div><strong>{r[1]}</strong><p>{r[2]}</p></div></div>)}</div></article><article className="panel"><div className="panel-header"><div><p className="eyebrow">Sendungen</p><h3>Katalog</h3></div></div><div className="sendung-list">{sendungen.slice(0,8).map((s) => <button className="sendung-row" key={s.id} onClick={() => editSendung(s)}><div><strong>{s.title}</strong><p>{s.category}</p></div><span>{s.source}</span></button>)}</div></article></section></> }
function Sendungen(props: { filtered: Sendung[]; query: string; setQuery: (v: string) => void; form: Form; setForm: (f: Form) => void; saveSendung: () => void; deleteSendung: (id: string) => void; editSendung: (s: Sendung) => void; notice: string }) { const p = props; return <section className="workspace-grid"><article className="panel"><div className="panel-header"><div><p className="eyebrow">Katalog</p><h3>Sendungen verwalten</h3></div><div className="search-box"><Search size={16}/><input value={p.query} onChange={(e) => p.setQuery(e.target.value)} placeholder="Suchen"/></div></div><div className="table-list">{p.filtered.map((s) => <div className="table-row" key={s.id}><div><strong>{s.title}</strong><p>{s.category} · {s.source}</p></div><div className="row-actions"><button onClick={() => p.editSendung(s)}><Pencil size={16}/> Bearbeiten</button><button className="danger" onClick={() => p.deleteSendung(s.id)}><Trash2 size={16}/> Löschen</button></div></div>)}</div></article><article className="panel form-panel"><div className="panel-header"><div><p className="eyebrow">Formular</p><h3>{p.form.id ? 'Sendung bearbeiten' : 'Neue Sendung'}</h3></div></div><label>Titel<input value={p.form.title} onChange={(e) => p.setForm({...p.form, title: e.target.value})}/></label><label>Kategorie<input value={p.form.category} onChange={(e) => p.setForm({...p.form, category: e.target.value})}/></label><label>Quelle<input value={p.form.source} onChange={(e) => p.setForm({...p.form, source: e.target.value})}/></label><label>Sprache<select value={p.form.language} onChange={(e) => p.setForm({...p.form, language: e.target.value as Sendung['language']})}><option value="de">Deutsch</option><option value="it">Italienisch</option><option value="multi">Mehrsprachig</option></select></label><label className="checkbox"><input type="checkbox" checked={p.form.active} onChange={(e) => p.setForm({...p.form, active: e.target.checked})}/> Aktiv</label><button className="primary-action" onClick={p.saveSendung}><Save size={16}/> Speichern</button>{p.notice && <p className="notice">{p.notice}</p>}</article></section> }
function Kalender() { const days = ['MO','TU','WE','TH','FR','SA','SU']; return <article className="panel"><div className="panel-header"><div><p className="eyebrow">Kalender</p><h3>Wochenansicht</h3></div></div><div className="calendar-grid">{days.map((d) => <div className="calendar-day" key={d}><strong>{d}</strong>{scheduleRules.filter((r) => r.weekdays.includes(d)).slice(0,5).map((r) => { const s = seedSendungen.find((x) => x.id === r.sendungId); return <p key={r.id}><b>{r.startTime}</b> {s?.title || r.sendungId}</p> })}</div>)}</div></article> }
function Publikation({ exportTxt, exportJson }: { exportTxt: () => void; exportJson: () => void }) { return <article className="panel"><div className="panel-header"><div><p className="eyebrow">Publikation</p><h3>Export erstellen</h3></div></div><div className="export-actions"><button className="primary-action" onClick={exportTxt}><Download size={16}/> TXT für Programmheft</button><button className="ghost-action" onClick={exportJson}><Download size={16}/> Sendungen JSON</button></div></article> }
function Einstellungen({ settings, setSettings, reset }: { settings: AppSettings; setSettings: (s: AppSettings) => void; reset: () => void }) { return <section className="workspace-grid"><article className="panel form-panel"><div className="panel-header"><div><p className="eyebrow">Allgemein</p><h3>Organisation</h3></div></div><label>Organisationsname<input value={settings.organisationName} onChange={(e) => setSettings({...settings, organisationName: e.target.value})}/></label><label>Sprache der Oberfläche<select value={settings.language} onChange={(e) => setSettings({...settings, language: e.target.value as AppSettings['language']})}><option value="de">Deutsch</option><option value="it">Italiano</option><option value="en">English</option></select></label><label>Logo Text<input value={settings.logoText} onChange={(e) => setSettings({...settings, logoText: e.target.value})} placeholder="RMS"/></label><button className="danger-button" onClick={reset}>Lokale Daten zurücksetzen</button></article><article className="panel"><div className="panel-header"><div><p className="eyebrow">Vorschau</p><h3>Logo</h3></div></div><div className="logo-preview"><span>{settings.logoText || 'R'}</span></div><p className="muted">Organisationsname, Sprache und Logo werden gespeichert.</p></article></section> }
