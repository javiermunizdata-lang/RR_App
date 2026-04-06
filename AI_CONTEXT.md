# AI Context - Madrid RR App

## Project Overview
- **Objective**: Multi-user Round Robin (RR) ticket assignment tool with smart balancing and multi-timezone support.
- **Architecture**: Vanilla ES Modules (Modular JS). No build tool.
- **Persistence**: Real-time Firebase Firestore + LocalStorage fallback.
- **Deployment**: GitHub Pages (Personal/Public repo).

## File Structure
- `index.html`: Entry structure and CDN imports.
- `main.js`: App orchestration and global event handlers (`window.app`).
- `state.js`: Global state object, `addLog`, `saveState`, `initializeTeamConfig`.
- `ui.js`: Rendering logic (Overview, History Table, Logs, Timezones).
- `assignment.js`: RR logic, workload balancing rules.
- `team.js`: Drag-and-drop, break management, member pool handling.
- `persistence.js`: Cloud sync (Firebase) and data merge strategy.
- `security.js`: Alphanumeric sanitization and length limits (centralized).
- `utils.js`: Timezone conversions, formatting, and HTML escaping.
- `config.js`: Business rules, turns, members, and API configurations.

## Critical Business Rules
1. **Ticket Formats**: 
   - **Number**: 11 chars (INC + 8 digits), e.g., `INC12345678`.
   - **UCN**: Max 15 chars, Alphanumeric only, no spaces.
   - **Customer/Notes**: Max 30 chars, Alphanumeric + spaces.
2. **Shift Windows**:
   - **Early**: 14:00 - 23:00 (Madrid).
   - **Late**: 16:00 - 01:00 (Madrid).
3. **Balancing Logic**: 
   - From 16:00 Madrid, if Late Shift tickets < 50% Early Shift tickets, assign strictly to Late until balanced.
   - Otherwise, global RR among all available members (not on break).
4. **NC (Network Control)**:
   - Position 0 in each team is the NC slot. Automatically tagged with "NC Point" in the UI during its activation window.
5. **Security**: 
   - Every input field (UCN, Customer, Note, Ticket) uses `oninput` for real-time sanitization (no symbols allowed).
   - Content Security Policy (CSP) active in `index.html`.

## Timezone Support
- Primary Toggle: Madrid / NY in header.
- Sync: Automatically updates the clock, shift status, shift headers (hours), and log timestamps in real-time.
- Utils: Uses `Intl.DateTimeFormat` with specific timezone offsets.

## UI Design System
- **Layout**: Columnar grid, stabilized to prevent horizontal overflow on smaller screens.
- **NC Badges**: Rendered as top-left corner tag on member cards to avoid shifting layout.
- **Logs**: Table view with history of all edits, assignments, and resets.

## Operational Notes
- To update AI assistance: Update THIS file but keep it local (ignored by Git).
- Deployment focus: Keep it modular to avoid large merge conflicts.
- Performance: `updateDisplay` is sensitive; avoid calling and re-rendering unnecessary DOM fragments during typing.
