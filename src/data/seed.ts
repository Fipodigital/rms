export type Sendung = {
  id: string
  title: string
  category: string
  language: 'de' | 'it' | 'multi'
  source: string
  active: boolean
}

export type ScheduleRule = {
  id: string
  title?: string
  weekdays: string[]
  startTime: string
  sendungId: string
  priority: number
  active: boolean
  notes?: string
}

export type Episode = {
  id: string
  sendungId: string
  date: string
  startTime: string
  title: string
  speaker?: string
  seriesTitle?: string
  episodeNumber?: number
  language: 'de' | 'it' | 'multi'
}

const internalSource = 'internal'

export const sendungen: Sendung[] = [
  { id: 'snd_glaubensforum', title: 'Glaubensforum', category: 'Glaube und Katechese', language: 'de', source: internalSource, active: true },
  { id: 'snd_lebenshilfe', title: 'Lebenshilfe', category: 'Lebenshilfe', language: 'de', source: internalSource, active: true },
  { id: 'snd_spiritualitaet', title: 'Spiritualität', category: 'Spiritualität', language: 'de', source: internalSource, active: true },
  { id: 'snd_credo', title: 'Credo', category: 'Glaubenslehre', language: 'de', source: internalSource, active: true },
  { id: 'snd_im_focus', title: 'Im Focus', category: 'Vertiefung', language: 'de', source: internalSource, active: true },
  { id: 'snd_bei_uns_zu_gast', title: 'Bei uns zu Gast', category: 'Interview', language: 'de', source: internalSource, active: true },
  { id: 'snd_buechermagazin', title: 'Büchermagazin', category: 'Bücher', language: 'de', source: internalSource, active: true },
  { id: 'snd_musikmagazin', title: 'Musikmagazin', category: 'Musik', language: 'de', source: internalSource, active: true },
  { id: 'snd_hoamatklang', title: 'Hoamatklång', category: 'Musik und Heimat', language: 'de', source: internalSource, active: true },
  { id: 'snd_jugend_xpect', title: 'Jugend Xpect', category: 'Jugend', language: 'de', source: internalSource, active: true },
  { id: 'snd_radio_vatikan_nachrichten', title: 'Radio Vatikan Nachrichten', category: 'Nachrichten', language: 'de', source: internalSource, active: true },
  { id: 'snd_radio_vatikan_magazin', title: 'Radio Vatikan Magazin', category: 'Nachrichten', language: 'de', source: internalSource, active: true },
  { id: 'snd_rosenkranz', title: 'Rosenkranz', category: 'Gebet', language: 'de', source: internalSource, active: true },
  { id: 'snd_heilige_messe', title: 'Heilige Messe', category: 'Liturgie', language: 'de', source: internalSource, active: true },
  { id: 'snd_angelus', title: 'Angelus', category: 'Gebet', language: 'de', source: internalSource, active: true },
  { id: 'snd_bibelschule', title: 'Bibelschule', category: 'Bibel', language: 'de', source: internalSource, active: true },
  { id: 'snd_standpunkt', title: 'Standpunkt', category: 'Gesellschaft und Glaube', language: 'de', source: internalSource, active: true },
  { id: 'snd_kirche_im_aufbruch', title: 'Kirche im Aufbruch', category: 'Kirche', language: 'de', source: internalSource, active: true },
  { id: 'snd_weltkirche_aktuell', title: 'Weltkirche aktuell', category: 'Weltkirche', language: 'de', source: internalSource, active: true },
  { id: 'snd_loretto_on_air', title: 'Loretto On Air', category: 'Jugend und Kirche', language: 'de', source: internalSource, active: true },
]

export const scheduleRules: ScheduleRule[] = [
  { id: 'rule_mo_fr_0900_glaubensforum', weekdays: ['MO', 'TU', 'WE', 'TH', 'FR'], startTime: '09:00', sendungId: 'snd_glaubensforum', priority: 10, active: true },
  { id: 'rule_mo_tu_th_fr_1000_lebenshilfe', weekdays: ['MO', 'TU', 'TH', 'FR'], startTime: '10:00', sendungId: 'snd_lebenshilfe', priority: 10, active: true },
  { id: 'rule_fr_1300_im_focus', weekdays: ['FR'], startTime: '13:00', sendungId: 'snd_im_focus', priority: 10, active: true },
  { id: 'rule_mo_1315_bei_uns_zu_gast', weekdays: ['MO'], startTime: '13:15', sendungId: 'snd_bei_uns_zu_gast', priority: 10, active: true },
  { id: 'rule_tu_1315_musikmagazin', weekdays: ['TU'], startTime: '13:15', sendungId: 'snd_musikmagazin', priority: 10, active: true },
  { id: 'rule_th_1315_buechermagazin', weekdays: ['TH'], startTime: '13:15', sendungId: 'snd_buechermagazin', priority: 10, active: true },
  { id: 'rule_mo_th_sa_1400_spiritualitaet', weekdays: ['MO', 'TU', 'WE', 'TH', 'SA'], startTime: '14:00', sendungId: 'snd_spiritualitaet', priority: 10, active: true },
  { id: 'rule_tu_fr_2030_credo', weekdays: ['TU', 'WE', 'TH', 'FR'], startTime: '20:30', sendungId: 'snd_credo', priority: 10, active: true },
]

export const episodes: Episode[] = [
  { id: 'ep_2023_11_02_glaubensforum_sterben_auferstehung', sendungId: 'snd_glaubensforum', date: '2023-11-02', startTime: '09:00', title: 'Vom Sterben über das Grab hinaus bis hin zur Auferstehung', speaker: 'Pfr. Christoph Haider', language: 'de' },
  { id: 'ep_2023_11_03_glaubensforum_frau_betet', sendungId: 'snd_glaubensforum', date: '2023-11-03', startTime: '09:00', title: 'Wenn eine Frau für ihren Mann betet', speaker: 'Dr. Margarethe Profunser', language: 'de' },
  { id: 'ep_2023_11_06_glaubensforum_karl_borromaeus', sendungId: 'snd_glaubensforum', date: '2023-11-06', startTime: '09:00', title: 'Ein gutes Wort aus dem Mund des hl. Karl Borromäus', speaker: 'Pfr. Dr. Horst Walter', language: 'de' },
  { id: 'ep_2023_11_08_credo_dogmatik', sendungId: 'snd_credo', date: '2023-11-08', startTime: '20:30', title: 'Radioakademie – Dogmatik', speaker: 'Pfr. Winfried Abel', language: 'de' },
  { id: 'ep_2023_11_20_bei_uns_zu_gast_berufung_1', sendungId: 'snd_bei_uns_zu_gast', date: '2023-11-20', startTime: '13:15', title: 'Wie weit ist der Weg eines Menschen, sich für Gott zur Verfügung zu stellen?', speaker: 'Sr. Christina Blätterbinder SSpS', seriesTitle: 'Berufung', episodeNumber: 1, language: 'de' },
]
