# AI Context - Madrid RR App

## Project Summary
- Single-page web app for ticket assignment by round-robin with workload balancing.
- Main entrypoint: `index.html`.
- Hosting target: GitHub Pages (`main` branch, root).
- Persistence: Firebase Firestore (with `localStorage` fallback if cloud unavailable).

## Current Stack
- Plain HTML/CSS/JavaScript (no build system).
- Firebase CDN SDK (compat):
  - `firebase-app-compat.js`
  - `firebase-firestore-compat.js`
- Local browser state + cloud sync in Firestore document.

## Important Business Rules
1. Ticket format:
- `Ticket Number`: `INC` + 8 digits (`^INC\d{8}$`), e.g. `INC00000000`.
- `UCN`: 6 letters + 6 digits (`^[A-Z]{6}\d{6}$`), e.g. `ZZZZZZ000000`.

2. Shift windows (Madrid time):
- Early: 14:00-23:00.
- Laters: 16:00-01:00.
- Laters never receives before 16:00.
- Early never receives after 23:00.

3. Balancing rule:
- From 16:00 onward, if `Laters total < 50% of Early total`, assignment goes only to Laters until threshold is reached.
- After reaching threshold, assignment chooses lowest individual load globally; ties are resolved by RR.

4. NC slot rule:
- NC is a position (`NC_POSITION_INDEX = 0`) in each shift list.
- The NC slot can be locked/unlocked by time windows.
- Badge `NC Point` appears on the blocked NC slot.

5. Break state:
- Per-person ON/OFF switch (OFF means on break, excluded from assignment).

## Current UI Structure
- Top tabs:
  - `Overview`: Assign Ticket + Team Management.
  - `Tickets Table`: table with `Shift`, `Name`, `Ticket`, `UCN`, `Time`.
- Extra actions in Overview:
  - `Create Handover Email` (mailto with required to/cc/subject/body format).
  - `Reset Data` (clear tickets + restore default team order/config + clear breaks).

## Persistence Model
### Local key
- `ticketAssignmentState`.

### Firestore
- Collection: `rrApp`
- Document: `currentState`
- Fields:
  - `tickets`
  - `rrIndex`
  - `teamConfig`
  - `teamOrder`
  - `breaks`
  - `updatedAt`

## Firestore Notes
- If console shows `Missing or insufficient permissions`, Firestore rules/auth are blocking writes.
- For quick open access (temporary):
  - allow read/write on `/rrApp/{docId}`.
- Recommended hardening later: Firebase Auth + restrictive rules.

## Key Functions (index.html)
- App init and persistence:
  - `initializeState()`
  - `setupCloudPersistence()`
  - `loadStateFromCloud()`
  - `saveStateToCloud()`
  - `saveState()`
- Assignment logic:
  - `getActivePersonsForAssignment()`
  - `getLowestLoadCandidates()`
  - `getNextPerson()`
  - `assignTicket()`
- Team management:
  - `moveMember()`
  - `toggleBreak()`
  - `getTeamMembers()`
- Views:
  - `switchAppView()`
  - `updateTicketsTable()`
- Utility:
  - `getMadridTimeParts()`
  - `getMadridDateShort()`
  - `createHandoverEmail()`
  - `resetAllData()`

## Operational Checklist
1. If data does not persist:
- Check app status message.
- Check Firestore rules and project id.
- Verify Firebase config values in `index.html`.

2. Before large UI changes:
- Keep Team Management as 2 columns side-by-side in Overview.
- Keep NC slot card heights aligned.

3. Deployment:
- Commit and push to `main`.
- GitHub Pages serves `index.html` automatically.

## Known Decisions
- `RR_App.html` removed to avoid duplicate source.
- Excel integration removed; app uses Firestore/local persistence only.
