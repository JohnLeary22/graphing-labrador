# Development progress

Last updated: 2026-10-22. Phase 1 and the first vertical slice are built. Everything below is based on what has been run and tested.

## Checks

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm test` | 192 tests pass (graph maths, scoring and units, rewards, diagnostics, store and name, UI, rubric) |
| `npm run build` | Pass (one chunk-size warning: ~750 kB, mostly Recharts) |
| Student lesson played end to end in a browser | Pass, no console errors |

Not yet run: Playwright e2e tests, automated accessibility audit, screen-reader testing, tests on phones/tablets.

## Completed

- Project scaffold, design tokens, dark/light mode, larger-text toggle, reduced-motion support, skip link.
- Demo mode with Demo Student and Demo Teacher entry points and a visible role switch; reset button.
- Layered SVG Labrador component (five characters with a distinct maths motif, 3 expressions, coat colours, 4 hats, 3 neckwear, 2 eyewear, 3 backgrounds).
- Interactive SVG graph engine: coordinate mapping, drag (pointer/touch), keyboard arrow-key movement, snapping, zoom, grid and label toggles, reset, rise/run triangle, live gradient (including undefined), tooltips, click-to-plot, text and table alternative.
- Student: dashboard, world map, lab pages, the complete *Understanding Gradient* lesson (hook, I do, We do, You do, non-example, application with units, 3-question checkpoint, reflection, rewards summary), progress page (constructive language, released teacher feedback), kennel, shop (18 items, confirm, insufficient-funds, owned, history), leaderboard.
- Rewards ledger with idempotent keys: 3 coins first incorrect attempt, 10 coins + 5 XP first correct completion, nothing for repeats; check-in, lesson-complete reward, purchase validation.
- Standard feedback messages, unit-aware equivalent-answer checking, KaTeX maths typesetting with text alternatives.
- Student name entry and Edit Name (the tenth demo student), shared student/teacher marking rubric, redesigned My Labs page.
- Teacher: dashboard (charts, missing work, recent submissions, CSV export with formula-injection guard), students list, student profile (diagnostic summary, skill evidence, misconception evidence with strategy/rationale/follow-up, assign practice, mark for review, notes, interventions, earlier-vs-later attempts, full attempt history), rubric marking with release, lesson library (teacher view), rewards settings and leaderboard switch.
- Misconception catalogue (12 entries). Skill list for the gradient lesson.
- Supabase schema with RLS, idempotent reward function, locked purchase function.
- README with setup, demo, production and deployment checklist.

## Partially complete

- **Labs:** only Slope Lab has a playable lesson. Axis, Vertex, Curve and Vector Lab show an honest "in development" status.
- **Question types:** implemented PLOT_POINT, NUMERIC (with units), MCQ and EXPLAIN_REASONING. Not yet: matching, drag-to-correct mislabelled axes, table-to-graph matching, misleading-scale detection, comparison of two graphs.
- **Demonstration questions:** 11 questions are live (about 6 of the 17 listed). Missing include y/x-intercept questions, distance-time reading, curve vs line, turning points.
- **Lesson state:** the lesson now resumes at the saved stage; a finished lesson can be restarted for revision with no repeat rewards.
- **Reports:** only the attempts CSV export. No printable reports or filters.
- **Differentiation:** optional hints and text/table alternatives exist; no teacher-selectable adaptations, glossary, audio or EAL/D vocabulary support.
- **Characters:** the five Labradors share a base head and differ by colour tag and motif. Distinct personalities in poses and expressions still need illustration work.
- **Accessibility:** built for WCAG 2.2 AA (labels, focus styles, aria-live feedback, keyboard plotting) but not audited.

## Not yet implemented

- Production Supabase adapter, authentication, and server-side scoring (`submit_attempt`).
- Playwright e2e and automated accessibility tests; `npm run test:e2e`.
- Assessment builder, assignment creation, rubric editor, due-date extension, reminders, excuse/reassign actions, parent-contact preview.
- Graph Studio, Missions page, Achievements page, Settings page (theme and text size are in the sidebar).
- Real-world prize approvals workflow, teacher-awarded unlocks, cosmetic graph effects, nameplates, kennel decorations.
- Curriculum validation workflow and official outcome codes.
- Lazy loading of teacher pages to reduce bundle size.

## Known issues and notes

- Demo data and the demo due date use localStorage; clearing site data resets them.
- Playwright click actions on the landing page occasionally time out because of a `stable` check; clicking by script works. Not observed with manual use but not confirmed either.
- Per-question rewards: correct first try 10 coins + 5 XP; first wrong 3 coins + 1 XP; later wrong 0; correct after wrong 5 coins + 2 XP. The lesson has its original 11 questions.
- The student-facing rubric and some later lesson steps were verified by unit tests and page text, not by live screenshots.

## Next up

1. Axis Lab lesson (plotting, reading scales, mislabelled axes) and the matching and error-spotting question types.
2. Playwright e2e for the student and teacher flows.
3. Resume-in-place for lessons.
4. Reports page and assignment creation.
