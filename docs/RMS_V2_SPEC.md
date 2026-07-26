# RMS v2 Functional Specification

## Vision
The calendar is the primary editor of the radio schedule. The database supports the editor, not vice versa.

## Core entities
- Show definition
- Recurring rule
- Occurrence
- Exception

## Principles
- Default UI language: German.
- Calendar-first workflow.
- Mobile-first (iPad/iPhone/Desktop).
- Pointer-based drag, not HTML5 drag.
- Undo for all destructive operations.

## Editing recurring shows
When editing a recurring occurrence ask:
1. Nur diese Sendung
2. Diese und alle zukünftigen Sendungen
3. Gesamte Serie

## Calendar
- Organisieren mode.
- Drag, duplicate, delete.
- Direct time editing.
- Auto-scroll while dragging.

## Ordering
Items are ordered by:
1. Time
2. Priority
3. Title

## Conflict detection
Detect duplicate start times.
Resolution priority:
1. Single occurrence
2. Exception
3. Recurring rule

## Validation
Before export check:
- duplicate times
- missing titles
- inconsistent recurring rules
- orphan exceptions

## Future
Health dashboard with warnings, errors and publication readiness.