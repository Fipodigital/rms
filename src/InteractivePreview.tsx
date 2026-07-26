import { useRef, useState, type DragEvent, type PointerEvent } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
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

export function InteractivePreview({ rows, onEdit, onMove, onDelete }: Props) {
  const [openRow, setOpenRow] = useState<string | null>(null)
  const [dragOverDate, setDragOverDate] = useState<string | null>(null)
  const [touchDragging, setTouchDragging] = useState<PreviewRow | null>(null)
  const pointerStart = useRef<{ id: string; x: number; y: number } | null>(null)
  const touchRow = useRef<PreviewRow | null>(null)
  const groups = grouped(rows)

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

  function touchDragStart(event: PointerEvent<HTMLSpanElement>, row: PreviewRow) {
    if (event.pointerType === 'mouse') return
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    touchRow.current = row
    setTouchDragging(row)
    setOpenRow(null)
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-preview-date]')
    setDragOverDate(target?.dataset.previewDate || null)
  }

  function touchDragMove(event: PointerEvent<HTMLSpanElement>) {
    if (!touchRow.current) return
    event.preventDefault()
    event.stopPropagation()
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-preview-date]')
    setDragOverDate(target?.dataset.previewDate || null)
  }

  function touchDragEnd(event: PointerEvent<HTMLSpanElement>) {
    const row = touchRow.current
    if (!row) return
    event.preventDefault()
    event.stopPropagation()
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-preview-date]')
    const targetDate = target?.dataset.previewDate
    touchRow.current = null
    setTouchDragging(null)
    setDragOverDate(null)
    if (targetDate && targetDate !== row.date) onMove(row, targetDate)
  }

  return <div className={`timeline preview-scroll interactive-preview${touchDragging ? ' is-touch-dragging' : ''}`}>
    {touchDragging && <div className="touch-drag-banner">Trascina sul giorno desiderato</div>}
    {Object.entries(groups).map(([key, items]) => {
      const [date, day] = key.split('|')
      const activeDrop = dragOverDate === date
      return <section
        key={key}
        data-preview-date={date}
        className={`preview-day${activeDrop ? ' is-drop-target' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setDragOverDate(date) }}
        onDragLeave={() => setDragOverDate((current) => current === date ? null : current)}
        onDrop={(event) => dropOnDay(event, date)}
      >
        <header><strong>{day}, {date}</strong><span>{items.length}</span></header>
        <div className="preview-day-items">
          {items.map((row) => <div
            className={`swipe-row${openRow === row.id ? ' is-open' : ''}${touchDragging?.id === row.id ? ' is-being-dragged' : ''}`}
            key={row.id}
            onPointerDown={(event) => pointerDown(event, row)}
            onPointerUp={(event) => pointerUp(event, row)}
          >
            <div className="swipe-actions">
              <button className="swipe-delete" onClick={() => onDelete(row)} aria-label={`Löschen: ${row.title}`}><Trash2 size={18}/><span>Löschen</span></button>
            </div>
            <button
              className="preview-item"
              draggable
              onDragStart={(event) => startDrag(event, row)}
              onClick={() => openRow === row.id ? setOpenRow(null) : onEdit(row)}
            >
              <span
                className="drag-handle"
                role="button"
                aria-label={`Sposta ${row.title}`}
                onPointerDown={(event) => touchDragStart(event, row)}
                onPointerMove={touchDragMove}
                onPointerUp={touchDragEnd}
                onPointerCancel={touchDragEnd}
              >⋮⋮</span>
              <b>{row.time}</b>
              <span className="preview-title">{row.title}</span>
              {row.info && <em>{row.info}</em>}
              <Pencil className="preview-edit-icon" size={16}/>
            </button>
          </div>)}
        </div>
      </section>
    })}
  </div>
}
