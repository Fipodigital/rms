# RMS Media Platform

RMS Media Platform è il progetto per gestire il palinsesto e la pubblicazione multicanale di Radio Maria Südtirol.

L'obiettivo non è ricreare un vecchio database FileMaker, ma costruire una piattaforma editoriale moderna basata su dati strutturati, regole ricorrenti e canali di publishing.

## Visione

Un solo dato deve poter alimentare più uscite:

- programma stampato;
- export TXT per Affinity Publisher;
- HTML;
- JSON;
- JSON MCP;
- RDS;
- sito web;
- API future.

## Architettura concettuale

```text
Media Assets
     ↓
Sendungen
     ↓
Regeln
     ↓
Scheduling Engine
     ↓
Publishing Engine
     ↓
TXT · Affinity · HTML · JSON · MCP · RDS · Web
```

## Dataset iniziale

Il primo dataset reale è tratto dal bimestrale `programm.pdf` di Radio Maria Südtirol, numero 6/2023, novembre-dicembre 2023.

Da quel documento sono stati ricavati:

- trasmissioni ricorrenti;
- regole settimanali;
- eccezioni;
- eventi speciali;
- episodi specifici.

## Stack previsto

- React
- Vite
- TypeScript
- Tailwind CSS
- Supabase

## Stato

Sprint 1: reverse engineering del palinsesto reale e definizione del modello dati iniziale.
