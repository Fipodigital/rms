import { useMemo, useRef, useState, type DragEvent, type PointerEvent } from 'react'
import { AlertTriangle, Pencil, Repeat2, Trash2 } from 'lucide-react'
import './ios-drag.css'

export type PreviewRow = {
  id: string
  date: string
  day: string
  time: string
  title: string
  info: string
  source: 'regel' | 'woche' | 'import'
}

type Props = {
  rows: PreviewRow[]
  onEdit: (row: PreviewRow) => void
  onMove: (row: PreviewRow, targetDate: string) => void
  onDelete: (row: PreviewRow) => void
}

function grouped(rows: PreviewRow[]) {
  return rows.reduce<Record<string, PreviewRow[]>>((acc, row) => {
    const key = `${row.date}|${row.day}`
    acc[key] = [...(acc[key] || []), row]
    return acc
  }, {})
}

function conflictKeys(rows: PreviewRow[]) {
  const counts = rows.reduce<Record<string, number>>((acc, row) => {
    const key = `${row.date}|${row.time}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  return new Set(Object.entries(counts).filter(([, count]) => count > 1).map(([key]) => key))
}

function saveTimeOverride(row: PreviewRow, time: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time) || time === row.time) return
  let manual: PreviewRow[] = []
  let hidden: string[] = []
  try { manual = JSON.parse(localStorage.getItem('rms.manualRows') || '[]') } catch { manual = [] }
  try { hidden = JSON.parse(localStorage.getItem('rms.hiddenGenerated') || '[]') } catch { hidden = [] }
  const changed: PreviewRow = {
    ...row,
    id: row.source === 'regel' ? `time_${Date.now()}` : row.id,
    time,
    source: 'woche',
  }
  if (row.source === 'regel' && !hidden.includes(row.id)) hidden.push(row.id)
  const index = manual.findIndex((item) => item.id === row.id)
  if (index >= 0) manual[index] = changed
  else manual.unshift(changed)
  localStorage.setItem('rms.manualRows', JSON.stringify(manual))
  localStorage.setItem('rms.hiddenGenerated', JSON.stringify(hidden))
  location.reload()
}

export function InteractivePreview({ rows, onEdit, onMove, onDelete }: Props) {
  const [openRow, setOpenRow] = useState<string | null>(null)
  const [dragOverDate, setDragOverDate] = useState<string | null>(null)
  const [touchDragging, setTouchDragging] = useState<PreviewRow | null>(null)
  const pointerStart = useRef<{ id: string; x: number; y: number } | null>(null)
  const touchRow = useRef<PreviewRow | null>(null)
  const lastValidDate = useRef<string | null>(null)
  const groups = grouped(rows)
  const conflicts = useMemo(() => conflictKeys(rows), [rows])

  function startDrag(event: DragEvent<HTMLButtonElement>, row: PreviewRow) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/rms-row', JSON.stringify(row))
  }

  function dropOnDay(event: DragEvent<HTMLElement>, date: string) {
    event.preventDefault()
    setDragOverDate(null)
    const payload = event.dataTransfer.getData('application/rms-row')
    if (!payload) return
    try {
      const row = JSON.parse(payload) as PreviewRow
      if (row.date !== date) onMove(row, date)
    } catch {
      // Ignore invalid external drops.
    }
  }

  function pointerDown(event: PointerEvent<HTMLDivElement>, row: PreviewRow) {
    pointerStart.current = { id: row.id, x: event.clientX, y: event.clientY }
  }

  function pointerUp(event: PointerEvent<HTMLDivElement>, row: PreviewRow) {
    const start = pointerStart.current
    pointerStart.current = null
    if (!start || start.id !== row.id || touchDragging) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) < Math.abs(dy) || Math.abs(dx) < 45) return
    setOpenRow(dx < 0 ? row.id : null)
  }

  function dateUnderPointer(x: number, y: number) {
    const direct = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-preview-date]')?.dataset.previewDate
    if (direct) return direct
    const days = [...document.querySelectorAll<HTMLElement>('[data-preview-date]')]
    const containingY = days.find((day) => {
      const rect = day.getBoundingClientRect()
      return y >= rect.top && y <= rect.bottom
    })
    if (containingY?.dataset.previewDate) return containingY.dataset.previewDate
    let nearest: { date: string; distance: number } | null = null
    for (const day of days) {
      const rect = day.getBoundingClientRect()
      const distance = y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0
      const date = day.dataset.previewDate
      if (date && (!nearest || distance < nearest.distance)) nearest = { date, distance }
    }
    return nearest && nearest.distance < 100 ? nearest.date : null
  }

  function autoScroll(y: number) {
    const edge = 110
    const step = 24
    if (y < edge) window.scrollBy({ top: -step, behavior: 'auto' })
    if (y > window.innerHeight - edge) window.scrollBy({ top: step, behavior: 'auto' })
  }

  function touchDragStart(event: PointerEvent<HTMLSpanElement>, row: PreviewRow) {
    if (event.pointerType === 'mouse') return
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    touchRow.current = row
    lastValidDate.current = row.date
    setTouchDragging(row)
    setOpenRow(null)
    const date = dateUnderPointer(event.clientX, event.clientY)
    if (date) lastValidDate.current = date
    setDragOverDate(date || row.date)
  }

  function touchDragMove(event: PointerEvent<HTMLSpanElement>) {
    if (!touchRow.current) return
    event.preventDefault()
    event.stopPropagation()
    autoScroll(event.clientY)
    const date = dateUnderPointer(event.clientX, event.clientY)
    if (date) {
      lastValidDate.current = date
      setDragOverDate(date)
    }
  }

  function touchDragEnd(event: PointerEvent<HTMLSpanElement>) {
    const row = touchRow.current
    if (!row) return
    event.preventDefault()
    event.stopPropagation()
    const targetDate = dateUnderPointer(event.clientX, event.clientY) || lastValidDate.current
    touchRow.current = null
    lastValidDate.current = null
    setTouchDragging(null)
    setDragOverDate(null)
    if (targetDate && targetDate !== row.date) onMove(row, targetDate)
  }

  return <div className={`timeline preview-scroll interactive-preview${touchDragging ? ' is-touch-dragging' : ''}`}>
    {touchDragging && <div className="touch-drag-banner">Auf den gewünschten Tag ziehen</div>}
    {Object.entries(groups).map(([key, items]) => {
      const [date, day] = key.split('|')
      const activeDrop = dragOverDate === date
      const dayConflictCount = items.filter((row) => conflicts.has(`${row.date}|${row.time}`)).length
      return <section key={key} data-preview-date={date} className={`preview-day${activeDrop ? ' is-drop-target' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragOverDate(date) }} onDragLeave={() => setDragOverDate((current) => current === date ? null : current)} onDrop={(event) => dropOnDay(event, date)}>
        <header><strong>{day}, {date}</strong><span>{items.length}</span>{dayConflictCount > 0 && <span className="day-conflict" title="Zeitkonflikt"><AlertTriangle size={15}/> {dayConflictCount}</span>}</header>
        <div className="preview-day-items">
          {items.map((row) => {
            const hasConflict = conflicts.has(`${row.date}|${row.time}`)
            return <div className={`swipe-row${openRow === row.id ? ' is-open' : ''}${touchDragging?.id === row.id ? ' is-being-dragged' : ''}${hasConflict ? ' has-time-conflict' : ''}`} key={row.id} onPointerDown={(event) => pointerDown(event, row)} onPointerUp={(event) => pointerUp(event, row)}>
              <div className="swipe-actions"><button className="swipe-delete" onClick={() => onDelete(row)} aria-label={`Löschen: ${row.title}`}><Trash2 size={18}/><span>Löschen</span></button></div>
              <button className="preview-item" draggable onDragStart={(event) => startDrag(event, row)} onClick={() => openRow === row.id ? setOpenRow(null) : onEdit(row)}>
                <span className="drag-handle" role="button" aria-label={`Verschieben: ${row.title}`} onPointerDown={(event) => touchDragStart(event, row)} onPointerMove={touchDragMove} onPointerUp={touchDragEnd} onPointerCancel={touchDragEnd}>⋮⋮</span>
                <input className="inline-time-input" type="time" value={row.time} aria-label={`Uhrzeit ändern: ${row.title}`} onClick={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()} onChange={(event) => saveTimeOverride(row, event.target.value)}/>
                <span className="preview-title">{row.title}</span>
                {row.source === 'regel' && <span className="recurring-indicator" title="Wiederkehrende Sendung"><Repeat2 size={14}/></span>}
                {hasConflict && <span className="time-conflict" title="Zwei oder mehr Sendungen beginnen zur gleichen Uhrzeit"><AlertTriangle size={15}/><span>Zeitkonflikt</span></span>}
                {row.info && <em>{row.info}</em>}
                <Pencil className="preview-edit-icon" size={16}/>
              </button>
            </div>
          })}
        </div>
      </section>
    })}
  </div>
}
