# Tasks - LOOP AI Pipeline, VoC Reports, & Export Refactoring

- [x] Lock Gemini model strictly to `gemini-3.5-flash` with fallbacks in `lib/ai/gemini.ts`.
- [x] Implement multi-model candidate loops (`3.5-flash`, `3.1-flash-lite`, `flash-lite-latest`, `2.5-flash-lite`).
- [x] Handle `503 Service Unavailable / High Demand` as a retryable transient error.
- [x] Update frontend AI Assistant to use toast alerts on failure.
- [x] Find every `.map()` call inside `executive-reports.tsx` and replace with safe optional chaining.
- [x] Ensure `report.contentJson` itself defaults to `{}`.
- [x] Default every VoC array (recommendations, topThemes, positiveThemes, negativeThemes, customerQuotes, businessRisks, priorityActions, trendSpikes, improvements, roadmap) to `[]` in the UI rendering code.
- [x] Update `/api/reports` GET and POST methods to return all required fields even if empty.
- [x] Create backend routes for PDF export at `/api/reports/[id]/pdf` and CSV export at `/api/reports/[id]/csv`.
- [x] Integrate `pdf-lib` to generate a styled document layout.
- [x] Format CSV cells to correctly escape double quotes and wrap in quotes.
- [x] Avoid unsupported font characters (e.g. `✔` and `⚠`) in standard Helvetica PDF drawing.
- [x] Link frontend button event handlers to download generated blobs dynamically.
- [x] Verify page rendering and export downloads in the browser.
- [x] Validate production compile build status.
