# RMS Data Model — Sprint 1

Questo documento descrive il modello dati iniziale emerso dal bimestrale reale di Radio Maria Südtirol.

## Principio base

RMS non deve salvare solo un calendario già composto.

Deve distinguere tra:

1. **Sendung** — la trasmissione come entità stabile.
2. **Episode** — il contenuto specifico di una trasmissione.
3. **Rule** — la regola ricorrente di programmazione.
4. **Broadcast** — la messa in onda effettiva in una data precisa.
5. **Exception / Override** — una modifica temporanea alla regola normale.
6. **Asset** — immagini, audio, PDF, link e allegati collegabili a ogni entità.

---

## Sendungen

Una Sendung è una rubrica o trasmissione stabile.

Esempi:

- Glaubensforum
- Lebenshilfe
- Spiritualität
- Credo
- Im Focus
- Bei uns zu Gast
- Büchermagazin
- Musikmagazin
- Hoamatklång
- Jugend Xpect
- Radio Vatikan
- Rosenkranz
- Heilige Messe
- Angelus
- Bibelschule
- Standpunkt
- Kirche im Aufbruch
- Weltkirche aktuell
- Loretto On Air

Campi iniziali:

```ts
Sendung {
  id: string
  title: string
  subtitle?: string
  description?: string
  category?: string
  language: 'de' | 'it' | 'multi'
  source: 'local' | 'radio_maria_austria' | 'radio_vatikan' | 'external' | 'unknown'
  defaultDurationMinutes?: number
  active: boolean
  notes?: string
}
```

---

## Episodes

Un episodio è il contenuto specifico andato in onda dentro una Sendung.

Esempio:

- Sendung: Credo
- Episode: Radioakademie – Dogmatik
- Speaker: Pfr. Winfried Abel
- Air date: 2023-11-08
- Time: 20:30

Campi iniziali:

```ts
Episode {
  id: string
  sendungId: string
  title: string
  subtitle?: string
  speaker?: string
  description?: string
  seriesTitle?: string
  episodeNumber?: number
  language: 'de' | 'it' | 'multi'
  assets?: string[]
  notes?: string
}
```

---

## Rules

Una regola descrive una ricorrenza stabile.

Esempio:

```text
Montag-Freitag 09:00 → Glaubensforum
Samstag 09:00 → Vertiefungskurs des Glaubens
```

Campi iniziali:

```ts
ScheduleRule {
  id: string
  sendungId: string
  weekdays: Weekday[]
  startTime: string
  endTime?: string
  recurrence?: string
  validFrom?: string
  validTo?: string
  priority: number
  active: boolean
  notes?: string
}
```

---

## Broadcasts

Un Broadcast è una messa in onda reale, generata da una regola o inserita manualmente.

```ts
Broadcast {
  id: string
  date: string
  startTime: string
  endTime?: string
  sendungId: string
  episodeId?: string
  sourceRuleId?: string
  overrideId?: string
  status: 'generated' | 'confirmed' | 'manual' | 'cancelled'
  notes?: string
}
```

---

## Overrides

Un override sostituisce, modifica o cancella una regola ricorrente.

Esempi dal PDF:

- Exerzitien vom Sonntagberg, 12-18 novembre 2023.
- Adventtreffen CE Südtirol, 2 dicembre 2023.
- Messe festive e dirette speciali.

```ts
ScheduleOverride {
  id: string
  date: string
  startTime?: string
  endTime?: string
  action: 'replace' | 'cancel' | 'insert'
  targetRuleId?: string
  sendungId?: string
  episodeId?: string
  title?: string
  priority: number
  notes?: string
}
```

---

## Assets

Gli asset devono essere separati dal contenuto, ma collegabili a tutto.

```ts
Asset {
  id: string
  type: 'image' | 'audio' | 'video' | 'pdf' | 'link' | 'document'
  title: string
  url?: string
  storagePath?: string
  altText?: string
  credits?: string
  linkedEntityType?: 'sendung' | 'episode' | 'broadcast' | 'publication'
  linkedEntityId?: string
}
```

---

## Publishing

Il Publishing Engine non deve duplicare dati. Deve leggere Broadcast, Episode, Sendung e Asset e produrre viste diverse:

- TXT
- TXT Affinity
- HTML
- JSON
- JSON MCP
- RDS
- Web
- PDF

