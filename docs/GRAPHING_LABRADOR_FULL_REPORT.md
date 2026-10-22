# Graphing Labrador — Full Website Report

Version described: the completed state after the final refinements round (22 October 2026).
Scope: the website as it actually exists in the project folder. Every statement below was checked against the current source code, the automated tests, or a recorded browser check. Where something is not built, it is listed as such.

**Status labels used throughout**

| Label | Meaning |
| --- | --- |
| Fully implemented | Built, reachable in the website and covered by a test or a browser check |
| Partially implemented | Built in part, or built with a stated limitation |
| Planned, not built | Not available. Never described as working |

## Contents

- [1. Project overview](#1-project-overview)
- [2. Design and identity](#2-design-and-identity)
- [3. Technical architecture](#3-technical-architecture)
- [4. Complete page directory](#4-complete-page-directory)
- [5. Student experience](#5-student-experience)
- [6. Learning content](#6-learning-content)
- [7. Interactive graph engine](#7-interactive-graph-engine)
- [8. Learning and teaching strategies](#8-learning-and-teaching-strategies)
- [9. Literacy and numeracy](#9-literacy-and-numeracy)
- [10. Assessment and feedback](#10-assessment-and-feedback)
- [11. Rewards system](#11-rewards-system)
- [12. Teacher portal](#12-teacher-portal)
- [13. Learning analytics](#13-learning-analytics)
- [14. Accessibility and differentiation](#14-accessibility-and-differentiation)
- [15. Data storage and privacy](#15-data-storage-and-privacy)
- [16. Responsive design](#16-responsive-design)
- [17. Testing and quality assurance](#17-testing-and-quality-assurance)
- [18. Incomplete features](#18-incomplete-features)
- [19. Known issues and risks](#19-known-issues-and-risks)
- [20. Deployment and maintenance](#20-deployment-and-maintenance)
- [21. Source-code reference](#21-source-code-reference)
- [22. Final change log](#22-final-change-log)

## 1. Project overview

**Purpose.** Graphing Labrador is a browser-based learning environment for Year 9 Mathematics. It teaches graphing through interactive graphs, explicit modelling, immediate feedback and a cosmetic reward system, and it gives teachers visible evidence of what students did and where they went wrong.

**Target audience.** Year 9 students, particularly those who are comfortable on a computer but disengaged by conventional teaching, and their mathematics teacher.

**Mathematics focus.** The only completed lab is Slope Lab, which teaches gradient and rates of change: reading coordinates, rise and run, calculating gradient, positive, negative and vertical lines, units and real-world rates, and explaining reasoning. The curriculum link is stored as a draft mapping to the NSW Mathematics K-10 (2022) Stage 5 syllabus. No official outcome codes appear anywhere, because they have not been validated by a teacher.

**Educational philosophy.** The design follows explicit teaching: the student sees a process modelled, practises it with support, then practises it independently. Rewards recognise effort and success but do not replace learning; everything needed to learn is free and the shop is cosmetic only.

**Implementation status**

| Area | Status |
| --- | --- |
| Slope Lab lesson (8 stages, 11 questions) | Fully implemented |
| Student portal (7 pages plus name entry) | Fully implemented |
| Teacher portal (6 pages plus student profile) | Fully implemented for the demo data |
| Axis Lab, Vector Lab, Vertex Lab, Curve Lab lessons | Planned, not built |
| Production database, accounts and server-side scoring | Planned, not built (schema file only) |

## 2. Design and identity

**Name.** Graphing Labrador is wordplay on graphing, Labrador (the breed) and lab (a place to experiment). The student-facing world is called Vector Lab.

**Colour.** A dark navy base, turquoise (brand colour) and amber/yellow (accent), with off-white text. Colours are CSS variables in `src/styles/index.css` for dark and light themes, so components use meaning-based names rather than fixed colours. The graph-paper pattern appears behind headers.

**Mascots.** Five original Labradors drawn as layered SVG code in `src/components/mascots/Labrador.tsx`. Each wears a collar badge showing a mathematical symbol.

| Character | Nickname | Lab | Badge motif | Role |
| --- | --- | --- | --- | --- |
| Vector | Hector | Vector Lab | Arrow | Main guide |
| Vertex | Tex | Vertex Lab | Parabola | Key graph features |
| Axis | Axel | Axis Lab | Axes | Coordinates and plotting |
| Slope | Slobber | Slope Lab | Slope triangle | Gradient and rates |
| Curve | Kirby | Curve Lab | Wave | Non-linear relationships |

The characters share one base drawing and differ in badge motif and accent colour. They have three expressions (happy, thinking, proud) and can wear hats, neckwear and eyewear, take a coat colour and sit on a background. Distinct poses and personalities beyond the badge are partially implemented: the personalities are described in data but only lightly visible in the artwork.

**Themes and text.** Dark and light themes and a larger-text toggle are in the sidebar (or the top bar on narrow screens). Animation is reduced automatically when the device asks for it.

**Intended experience.** The mascot is a presence, not a constant narrator: it appears on the dashboard, labs, kennel, shop, leaderboard and lesson header and never interrupts with pop-ups.

## 3. Technical architecture

**Technologies (from `package.json`)**

| Purpose | Package |
| --- | --- |
| Interface | React 19, TypeScript 6 |
| Build and dev server | Vite 8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router 7 (hash routing) |
| Maths notation | KaTeX |
| Icons | lucide-react |
| Tests | Vitest 5, React Testing Library, jsdom |
| Lint | ESLint 10 with typescript-eslint |

Recharts is still listed as a dependency but is no longer used by any page. It can be removed.

**Structure**

```
src/
  app/          App.tsx: the route table
  components/   assessments, graphs, layout, mascots, rewards, ui
  pages/        public, student, teacher
  hooks/        useStudent, useClassData
  lib/          math, scoring, rewards, analytics, lesson (no React inside)
  data/         curriculum, lessons, demo (seed data)
  services/     persistence (browser store and actions)
  styles/       index.css (design tokens)
  types/        shared types
tests/unit/     automated tests
supabase/       database schema and seed (not connected)
docs/           this report
```

**How it works.** Pages read state through `useAppState` and change it only through functions in `src/services/persistence/actions.ts`. The state is a single object kept in memory and mirrored to the browser's localStorage. Pure logic (graph maths, answer checking, reward rules, analytics) lives in `src/lib` and has no knowledge of React or storage, which is what makes it testable.

**Routing.** Hash routing (`#/student/...`, `#/teacher/...`) so the site works on static hosting without server rules. Student and teacher areas redirect to the landing page if the role is not signed in.

**Demo versus production.** Only demo mode exists. The production schema is a separate file and is not connected to the website.

## 4. Complete page directory

### Public

| Page | Route | Contents |
| --- | --- | --- |
| Landing | `#/` | Title, description, Enter as Demo Student and Enter as Demo Teacher buttons, demonstration disclaimer, reset-demo-data button, the five Labradors, theme and text controls |

### Student portal

| Page | Route | Contents and features |
| --- | --- | --- |
| Name entry | shown inside `#/student` until a name is saved | "My name is..." screen. Requires a non-empty name (maximum 30 characters) |
| Dashboard | `#/student` | Welcome and Edit Name, level and XP bar, coins, daily check-in, Continue learning card, My Labs list, Active assignments, How rewards work |
| My Labs | `#/student/labs` | Five lab cards in the order Vector, Vertex, Axis, Slope, Curve. Only Slope Lab opens. The others show In Development |
| Lab page | `#/student/labs/:labId` | Lab description, mascot and lessons list |
| Slope Lab lesson | `#/student/lesson/gradient` | The 11-question lesson (section 6) |
| My Progress | `#/student/progress` | Level, XP, coins earned and spent, skill messages, released teacher feedback |
| My Kennel | `#/student/kennel` | Choose an unlocked character and equip owned cosmetics, reset appearance |
| Reward Shop | `#/student/shop` | 18 cosmetics, filter by category, confirm purchase, insufficient-funds and owned states, purchase history |
| Leaderboard | `#/student/leaderboard` | Class ranked by XP using display names; hidden if the teacher turns it off |

### Teacher portal

| Page | Route | Contents and features |
| --- | --- | --- |
| Dashboard | `#/teacher` | Four summary cards, Accuracy by skill, Common errors, Missing work, Recent submissions, CSV export |
| Students | `#/teacher/students` | Class table with lesson status, questions attempted, last activity and flags |
| Student profile | `#/teacher/students/:id` | Diagnostic summary, skill evidence, misconception evidence with actions, interventions, notes, earlier-versus-later attempts, full attempt history |
| Lesson Library | `#/teacher/lessons` | Full Slope Lab teacher information, preview button, four collapsed In Development panels |
| Results and Marking | `#/teacher/marking` | Written responses to mark and already marked, with the rubric |
| Rewards Settings | `#/teacher/rewards` | Fixed question reward rules, editable daily check-in and lesson bonus, leaderboard switch |

## 5. Student experience

1. **Entry.** The student chooses Enter as Demo Student. On first entry they see "My name is..." and must type a name. The student becomes the tenth member of the demonstration class alongside nine fictional classmates.
2. **Name.** The name shows in the sidebar, dashboard, progress page, leaderboard and every teacher view. Edit Name on the dashboard changes it without touching progress, coins, XP or results, because everything is linked by an internal student id.
3. **Dashboard.** Shows the next action (Start or Resume lesson), level and XP, coins, assignment status, labs and a plain-language reward guide. A daily check-in gives a small coin reward once per day.
4. **Lesson.** The lesson is a single vertical column at every screen width: instruction or worked example, then the graph, then the question, then the answer input, the submit button and the feedback. Nothing moves on without the student pressing **Next Question** (or Next step in the think-aloud).
5. **Resuming.** The lesson saves the stage, question and think-aloud position. Leaving and coming back returns to the same place with a "Welcome back" note. Earlier answers and hints are restored and rewards are not repeated.
6. **Completion.** A summary shows questions answered, coins and XP earned in the lesson, a next-step message and a Restart for revision button. A restarted lesson earns no repeat rewards.
7. **Spending.** Coins buy cosmetics in the shop. Items are equipped in My Kennel and appear on the dashboard, sidebar and labs.

## 6. Learning content

### Labs

| Lab | Character | Status |
| --- | --- | --- |
| Slope Lab | Slobber | Fully implemented (one lesson) |
| Axis Lab | Axel | Planned, not built |
| Vector Lab | Hector | Planned, not built |
| Vertex Lab | Tex | Planned, not built |
| Curve Lab | Kirby | Planned, not built |

### Question types implemented and used

| Type | How the student answers | Used in |
| --- | --- | --- |
| Multiple choice | Choose one option | Questions 1, 6, 10 |
| Numeric | Type a number, fraction or decimal, with units where required | Questions 2, 3, 4, 5, 7, 8 |
| Plot a point | Click the graph, or type x and y | Question 9 |
| Written explanation | Free text, marked by the teacher | Question 11 |

Two further types (read a point from a graph, and match items) exist in the code but are not used by any lesson. They are not part of the student experience.

### The 11 Slope Lab questions

The lesson has eight stages. The think-aloud stage (I do) has no question. Total marks: 20.

| No. | Stage | Question | Type | Marks | Purpose |
| --- | --- | --- | --- | --- | --- |
| 1 | Warm-up (hook) | What happens to the line when point B moves upward? | Multiple choice | 1 | Notice that moving a point up makes the line steeper. Student can drag point B first |
| 2 | We do | Going from P to Q, what is the rise? (answer -6) | Numeric | 1 | Rise as vertical change, including a negative rise |
| 3 | We do | What is the run from P to Q? (answer 3) | Numeric | 1 | Run as horizontal change |
| 4 | We do | Calculate the gradient, rise over run (answer -2) | Numeric | 2 | Combine rise and run; negative gradient |
| 5 | You do | Gradient of the line through R(-3,-1) and S(1,1) (answer 1/2) | Numeric | 2 | Independent calculation with negative coordinates and a fraction |
| 6 | Spot the mistake | Maya divided run by rise. What is her mistake? | Multiple choice | 1 | Recognise the reversal error in worked working |
| 7 | Real world | How quickly is the cyclist travelling? (answer 15 km/h) | Numeric with units | 2 | Gradient as a rate, with units |
| 8 | Checkpoint | Gradient through C(2,3) and D(5,12) (answer 3) | Numeric | 2 | Independent check with larger values |
| 9 | Checkpoint | Plot the point (-3, 2) | Plot a point | 1 | Coordinates with a negative x |
| 10 | Checkpoint | What is the gradient of a vertical line? (answer undefined) | Multiple choice | 1 | Zero versus undefined gradient |
| 11 | Reflection | What does gradient tell us that the height of a graph alone does not? | Written | 6 | Explain reasoning in words, marked with the rubric |

The stage list shown to students is: Move the point, I do, We do, You do, Spot the mistake, Use it in the real world, Checkpoint, Reflect, then a Rewards summary.

## 7. Interactive graph engine

The graph is drawn as SVG by `src/components/graphs/CartesianGraph.tsx`. All mathematics is in `src/lib/math/graph.ts` and is independent of the drawing.

| Feature | Detail |
| --- | --- |
| Coordinate mapping | Maths coordinates to screen pixels and back, with y pointing up; tested for round trips, boundaries, negatives and fractions |
| Axes | Positive and negative axes through the origin; labels and tick values; configurable range and step for each axis |
| Points | Static points, or draggable points that snap to the grid and stay within the plot area |
| Keyboard | A focused draggable point moves with the arrow keys; it announces its coordinates |
| Touch and mouse | Pointer events, so dragging works on touch screens |
| Controls | Zoom in and out, grid on and off, coordinate labels on and off, reset |
| Line and triangle | Draws the line through two points, clipped to the plot area. Optional dashed rise and run triangle |
| Gradient working | A typeset fraction showing the substitution, using the point labels. Vertical lines are reported as undefined. Horizontal lines give 0 |
| Plotting | Click-to-plot with snapping, plus typed x and y fields as a keyboard alternative |
| Text alternative | An expandable text and table description of every graph |

**Answers are not revealed early.** The gradient working and the rise and run labels stay hidden on the We do, You do, Spot the mistake, Real world and Checkpoint graphs until the question is answered. The warm-up and the I do worked example show them live, by design.

**Mathematical notation.** KaTeX renders fractions, subscripts, exponents and units (`src/components/ui/MathText.tsx`). Authors write `$...$` for inline and `$$...$$` for display maths. Rise is amber, run is teal and negative values are bracketed, bold and lightly highlighted, so a student can see why 1 - (-1) = 2. Colour is never the only cue. Every expression has a spoken-text alternative generated by `src/lib/math/tex.ts`.

## 8. Learning and teaching strategies

| Strategy | Where it appears |
| --- | --- |
| Clear learning intention and success criteria | Lesson header (intention shown, criteria expandable) |
| Activating prior knowledge | Warm-up graph the student can move before any calculation |
| Explicit modelling / think-aloud | I do: six revealed steps stating the decisions before the calculation |
| Worked example | I do, with the A(1,2) and B(3,6) example and rise/run triangle |
| Gradual release (I do, We do, You do) | Stages in that order; no automatic hints in You do |
| Guided practice with feedback | We do: rise, run, then gradient on one line |
| Independent practice | You do and Checkpoint questions |
| Non-example and error analysis | Spot the mistake: a worked solution that contains an error |
| Application in context | Cyclist distance and time, with units |
| Formative checking | Immediate correct/incorrect feedback; unlimited retries |
| Student reasoning | Written reflection marked against a rubric |
| Optional scaffolds | Hints (recorded, never penalised); a hint about the student's own mistake on request |

The teacher view of the lesson (Lesson Library) records the rationale: the worked example makes the process visible and reduces unnecessary working-memory demands; guided practice allows rehearsal with feedback; independent practice gives stronger evidence of unsupported understanding.

## 9. Literacy and numeracy

**Literacy demands addressed**

- Vocabulary: gradient, rise, run, rate, increase, decrease, positive, negative, undefined. Each question carries a recorded literacy demand.
- Reading questions precisely: for example, "how quickly" asks for a rate, not the highest point on the graph.
- Reading and writing coordinates in order, with signs.
- Explaining reasoning in words (the reflection).

**Numeracy demands addressed**

- Reading scales and negative coordinates.
- Subtracting signed numbers for rise and run.
- Dividing to give a gradient as a fraction or decimal.
- Interpreting a gradient as a rate with units from both axes.

**How the website supports students**

- Maths notation makes the structure of rise over run visible.
- The negative-value highlighting targets the common error in subtracting a negative.
- The text alternative and typed coordinate entry give a route that does not depend on dragging.
- Hints are staged: they start general and become more specific, and none appear automatically.

**Limits.** Support for students who need literacy or English-language help is limited to clear wording and hints. There is no glossary, no audio and no translated vocabulary (see section 18). Per-question literacy and numeracy demands are stored with every question but are shown only through the question bank, not on any current page.

## 10. Assessment and feedback

### Automatic marking

| Question type | How it is checked |
| --- | --- |
| Numeric | The number is parsed (integers, decimals, fractions, a minus sign, a leading plus) and compared with a tolerance of 0.01. Any trailing text is treated as units and checked separately |
| Numeric with units | Units are normalised so spelling variants match and different units do not |
| Multiple choice | The chosen option is compared with the correct option |
| Plot a point | The plotted point is compared with the target |
| Written | Never auto-marked. A valid response (at least 15 characters) is saved for the teacher |

**Equivalent answers accepted** (expected 15 km/h): `15km/h`, `15 km/hr`, `15km/hr`, `15 kilometers per hour`, `15 kilometres per hour`, `15 kilometres/hour`, `15 km per hour`, plus differences in spaces, capital letters and decimal form (`15.0`) and equivalent fractions (`30/2`). **Not accepted:** the wrong value, the wrong sign (`-15`), a missing unit, or a wrong unit (`15 m/s`, `15 km`, `15 miles per hour`).

### Feedback wording

Every automatically marked question shows exactly one of two messages and nothing else as the verdict:

- `Correct! Well Done!`
- `Incorrect! That's ok, give it another go!`

Rewards appear beside the message as separate coin and XP badges. A correct answer stays on screen until the student presses **Next Question**. An incorrect answer keeps the question open for another attempt, does not reveal the answer and does not show a hint automatically. After a wrong answer a student can ask for an optional hint about their mistake. After three wrong attempts, a student can ask for a worked example or skip the question for now. The worked example reveals the answer, but only when requested.

### Error tagging

Wrong answers are tagged where the error is recognised: rise and run reversed (the reciprocal), a dropped negative sign, x and y reversed, a missing or wrong unit, zero given for a vertical line, and others. Tags feed teacher analytics and are never shown to the student as labels.

### Written reflection and the rubric

The reflection is marked 0 to 2 on each of three criteria, for a total out of 6. Students can open **View Marking Rubric** beside the reflection box; teachers see the identical rubric with score buttons. It is one shared component, so the wording cannot differ.

The rubric text, word for word:

> **Example of a strong response**
> Height only tells you the value at one moment. Gradient tells you how quickly the value is changing, for example 15 km/h.
>
> **Correct mathematical interpretation**
> Strong: Correctly identifies graph features and explains their meaning in context.
> Developing: Reads values correctly but does not explain what they represent.
> Needs support: Misinterprets what gradient or other features mean.
> Needs support (0) · Developing (1) · Strong (2)
>
> **Appropriate mathematical language and units**
> Strong: Uses correct vocabulary and units.
> Developing: Uses some vocabulary; units inconsistent.
> Needs support: Little mathematical language; units missing.
> Needs support (0) · Developing (1) · Strong (2)
>
> **Explanation and justification**
> Strong: Explains why the answer is reasonable using evidence.
> Developing: States a conclusion with limited support.
> Needs support: No justification.
> Needs support (0) · Developing (1) · Strong (2)

The "Example of a strong response" is a teacher-style example written for this project. It is not an official model answer.

**Teacher marking.** The teacher picks a level for each criterion, optionally writes feedback and presses Save and release. Saved marks stay after navigating or refreshing. Released feedback and the score out of 6 appear on the student's My Progress page. Marking is partially implemented in one respect: the rubric itself cannot be edited, and there is no assessment builder.

## 11. Rewards system

There are two separate values: **coins** (spendable in the shop) and **XP** (builds the level; every 100 XP is one level). Both are recorded in an append-only list of transactions. There is no third currency.

### Per-question rules

| Situation | Coins | XP |
| --- | --- | --- |
| Correct on the first attempt | 10 | 5 |
| Incorrect on the first attempt | 3 | 1 |
| Incorrect on any later attempt | 0 | 0 |
| First correct answer after one or more incorrect attempts | 5 | 2 |
| Any attempt after the question has been completed | 0 | 0 |

Worked totals: correct first time is 10 coins and 5 XP; wrong then correct is 8 coins and 3 XP; wrong, wrong, wrong, correct is also 8 coins and 3 XP.

**Protection against duplicates.** Rewards are checked against the student's saved attempts and the transaction list, keyed by question and student. Refreshing, navigating away, rapid clicking or replaying a completed question cannot pay again. This is covered by automated tests and was checked in a browser (a refresh after a correct answer left the coin total unchanged).

**Other rules**

- Invalid input (for example text where a number is needed) is not an attempt and earns nothing.
- A written reflection is never treated as correct. It earns the first-attempt amount (3 coins, 1 XP) once and nothing more.
- Daily check-in: 5 coins once per day (teacher-editable).
- Lesson complete: 40 coins and 50 XP once (teacher-editable).
- Starter balance: 30 coins, enough for the cheapest item.
- A wrong answer never removes coins or XP.
- The per-question amounts are fixed in code so the teacher settings page cannot contradict what students are told.

### Shop

Eighteen cosmetic items. The shop never sells learning content.

| Category | Items | Price range |
| --- | --- | --- |
| Headwear | Navy Beanie, Lab Cap, Study Headphones, Gradient Crown | 40 to 300 |
| Neckwear | Grid Bandana, Bow Tie, Teal Scarf | 25 to 60 |
| Eyewear | Round Glasses, Sunny Shades | 55 to 110 |
| Coat colours | Chocolate Coat, Black Coat | 90 |
| Backgrounds | Graph Paper, Sunset Quadrants, Midnight Lab | 20 to 130 |
| Characters | Axis (Axel), Slope (Slobber), Vertex (Tex), Curve (Kirby) | 150 to 200 |

Rarities: common, uncommon, rare, epic. Purchases check ownership and balance, ask for confirmation and are recorded in a purchase history. A one-time item cannot be bought twice. Equipped items persist and show elsewhere in the website.

### Leaderboard

Ranks students by XP, using display names only. It does not use time spent. The teacher can switch it off. Real-world prize management is **planned, not built**.

### Achievements

A separate Achievements page and badge system are **planned, not built**.

## 12. Teacher portal

The teacher is shown as Mr John Leary. The class is "Year 9 Maths 9A (demo)".

**Dashboard.** Four cards: Students, Checkpoint reached (percentage who have attempted every checkpoint question), Awaiting marking, and May need support (based on recorded evidence). Then:

- **Accuracy by skill.** Each skill's full name wraps naturally above its bar and percentage. It shows the share of auto-marked attempts that were correct across the class, including scaffolded attempts.
- **Common errors.** Eight graphing categories from the existing misconception system, each with a real count from recorded attempts. Categories with no recorded errors show a true 0.
- **Missing work.** Students who have not started, with a reminder to consider absence, access and support before escalating.
- **Recent submissions.** Short stage-level activity such as "Tomas completed 'We do'". It is built only from recorded attempts: a stage is "completed" only when every question in it has a correct (or submitted written) attempt, otherwise it reads "attempted". Written work shows to mark or marked. The think-aloud stage records no data so it never appears.
- **Export attempts (CSV)** with a guard against spreadsheet formula injection.

**Students and student profile.** The list shows each student's status, progress and flags. A profile shows a diagnostic summary, skill evidence, misconception evidence (with the suggested strategy, why it works, a follow-up task and how to check improvement), assign practice, mark for review, mark an intervention complete, teacher notes, first-versus-latest attempts and the full attempt history. Assign practice and mark for review create intervention records; there is no practice activity delivered to students yet.

**Lesson Library.** The complete Slope Lab teacher information: learning intention, success criteria, curriculum connection (draft), a typeset worked example, prerequisite knowledge, literacy and numeracy demands, teaching strategy, why it works, common misconception, suggested intervention, follow-up assessment, differentiation and skills assessed. A preview button switches to the demo student. Below it, four collapsed panels (Axis, Vector, Vertex, Curve) carry the same field headings in the same order, each showing only a dash.

**Results and Marking.** Shown in section 10.

**Rewards Settings.** Shows the fixed question rewards; the daily check-in and lesson bonus are editable, with restore defaults; a leaderboard switch.

## 13. Learning analytics

**What is recorded.** For each attempt: student, question, lesson stage, skills assessed, the response, whether it was correct, marks, attempt number, hints used, an error tag where recognised, whether it awaits teacher marking, and the time.

**Derived views**

| View | How it is produced |
| --- | --- |
| Skill level (no evidence, emerging, developing, secure) | From the latest result on each independent question. Independent means a You do, Real world or Checkpoint question answered with no hints. Scaffolded work (We do, warm-up, spot the mistake, or any use of hints) is reported separately |
| Provisional flag | Any conclusion based on fewer than three independent items is labelled provisional |
| Misconception evidence | One tagged error is "possible". The same error on two or more different questions is "likely". Each item links to the attempts behind it |
| Diagnostic summary | A plain sentence generated from the above |
| Needs-support flag | A likely misconception, or an emerging gradient-calculation skill |

**What a teacher can reasonably conclude.** Which skills a student has answered correctly without support, which errors recur across questions, and where support was needed. Evidence is always one click from the underlying attempts.

**Limits.** The lesson has 11 questions, so most conclusions are provisional. Completion and time spent are not used as evidence of mastery. A wrong answer does not prove a misconception. The analytics make no claims about ability, learning needs or intelligence. The fictional classmates' data was generated by running the real scoring code on scripted behaviours; it illustrates the system and is not real student evidence.

## 14. Accessibility and differentiation

**Implemented**

- Skip-to-content link, visible focus outlines, labelled form fields and buttons, landmarks, and headings in order.
- Graph points can be moved with the arrow keys; coordinates can be typed instead of clicked; every graph has a text and table alternative.
- Maths expressions have spoken-text alternatives.
- Feedback is announced to screen readers (live regions).
- Status is not shown by colour alone (words and icons accompany it).
- Dark and light themes, a larger-text option, and reduced motion when the device requests it. No flashing effects.
- Charts on the teacher dashboard are text lists with bars, so labels are real text.

**Differentiation.** Optional staged hints that are recorded without penalty; a scaffolded We do before the independent You do; retry without limit; a revision restart; and a typed alternative to dragging. Scaffolds are optional and can be ignored by confident students.

**Limitations (not yet done)**

- Conformance to WCAG 2.2 AA is a design target. No formal audit and no testing with screen readers has been carried out.
- Dragging a point requires a pointer or the arrow keys.
- There is no glossary, audio, translation, or teacher-selectable adaptation.
- The written reflection has no spelling or speech support.
- Contrast was designed carefully but has not been measured with a tool.

## 15. Data storage and privacy

- **Where data lives.** In the browser's localStorage under one key (`graphing-labrador-demo-v1`). There is no server and no account system.
- **Not shared.** Nothing is synchronised between people, browsers or devices. The student and teacher roles are two views of the same browser's data.
- **Names.** The student types a preferred name and it is stored only in that browser. The nine classmates are fictional (the landing page says so).
- **No tracking.** There are no analytics, advertising or external services. Maths fonts are bundled with the site.
- **Reset.** The landing page has a Reset demo data button.
- **Upgrades.** Saved data is upgraded in place when the website changes, so existing progress is kept. Only the fictional classmates' data is regenerated.
- **Security caveat.** Because everything runs in the browser, a person using the site could edit their own saved data. Real security would need a server.

**Production database (planned, not connected).** `supabase/migrations/0001_initial_schema.sql` contains a database design with row-level security so that students could read only their own results and teachers only their own class. It has not been run, reviewed with a privacy team or connected. Server-side scoring has not been written.

## 16. Responsive design

- **Method.** Tailwind CSS with breakpoints at 640, 768 and 1024 pixels. Below 768 pixels the left sidebar becomes a top bar with a scrollable menu.
- **Lesson.** One column at every width, in the order: instruction, graph, question, input, submit, feedback.
- **My Labs.** An automatic grid whose cards never overlap; it reflows from one column to several.
- **Charts.** Text rows that wrap, so nothing is clipped.
- **Checked.** In a browser, at widths of 360, 768, 1024 and 1440 pixels, every student page and every teacher page had no horizontal scrolling. The lesson graph appeared above the question at each of those widths. The lab cards were also checked for overlap at seven widths between 320 and 1600 pixels during an earlier round.
- **Known limits.** Not tested on physical phones or tablets or on browsers other than the one used for checking. The graph is wide and is scaled down on narrow screens, which makes small points harder to grab.

## 17. Testing and quality assurance

**Automated checks run for this report**

| Check | Result |
| --- | --- |
| TypeScript type check | Pass |
| ESLint | Pass |
| Production build | Pass |
| Unit and component tests | 214 tests in 7 files, all pass |

**What the tests cover:** graph maths (coordinates, gradient, intercepts, line clipping); answer checking and units, including all the equivalent forms listed in section 10; the exact feedback messages for every auto-marked question; every reward scenario and replay safety; saved-data upgrades; name entry and renaming without losing progress; lesson feedback not advancing by itself; the graph being above the question; lesson stages and question count; rubric text word for word and identical for students and teachers; the demonstration disclaimer; lab cards and wording; the teacher name; the Lesson Library panels; the dashboard activity and error calculations; and a check that no known misspelling appears anywhere in the source.

**Browser checks performed (using browser automation against the running site)**

- A fresh student answered a question correctly: the message and reward badges stayed on screen for at least 1.5 seconds with a Next Question button, and a page refresh kept the same question and the same coin total.
- A wrong, wrong, correct sequence on a numeric question paid 3 coins and 1 XP, then nothing, then 5 coins and 2 XP, and did not advance until Next Question was pressed.
- No horizontal scrolling on any student or teacher page at four widths.
- The teacher dashboard showed full skill names, eight error categories with zeros and short stage-level activity.

**Not tested**

- There is no Playwright test suite. The checks above were run by hand through an automation tool and are not repeatable by script.
- Real devices, other browsers, screen readers and an accessibility audit.
- Performance, and long-term storage limits.
- The production database and schema.

## 18. Incomplete features

**Planned, not built**

- Axis Lab, Vector Lab, Vertex Lab and Curve Lab lessons.
- Accounts, a database connection and server-side scoring.
- Assessment builder, assignment creation, due-date changes, reminders and parent-contact preview.
- Rubric editor.
- Achievements page and badges; Graph Studio; Missions page; a Settings page.
- Printable teacher reports and filters (only the CSV export exists).
- Real-world prize approvals and teacher-awarded unlocks.
- Glossary, audio, translations and teacher-selectable adaptations.
- Automated browser test suite.
- Validation of syllabus mappings and official outcome codes.

**Partially implemented**

- Mascot personalities (badge and colour only).
- Teacher interventions (records are created; nothing is delivered to students).
- Accessibility (built in, not audited).
- Question types: matching and read-a-point exist in code but are unused.

## 19. Known issues and risks

| Issue | Detail |
| --- | --- |
| Browser-only data | Clearing site data removes progress. Data is not backed up or shared |
| Not secure | A user can edit their own saved data; there is no authentication |
| Provisional analytics | Eleven questions give little evidence; conclusions are marked provisional |
| Worked example reveals the answer | Available after three wrong attempts on request |
| Unused code | Matching and read-a-point question support, a small line drawing component, and the Recharts dependency are unused |
| Demo due date | The assignment due date is set relative to first use and stored in the browser |
| Seeded classmates | Regenerated when the data version changes; their teacher marks are kept only for responses that still exist |
| Automation limitation | Browser-automation clicks can time out when the page is not visible; the checks above worked around this |
| Spelling | The landing-page disclaimer deliberately contains "fitcional" (one isolated sentence, kept as requested). All other text was spell-checked and corrected (section 23) |
| Not production-ready | Needs school approval, privacy review, accounts and server-side validation before real students use it |

## 20. Deployment and maintenance

**Run locally** (Node.js 20 or later; the project was built with Node 24)

```
npm install
npm run dev        # http://127.0.0.1:5173/
npm run build      # type check, then production build into dist/
npm run preview    # serve the built site on 127.0.0.1:4173
npm run lint
npm run typecheck
npm test
```

**Hosting.** The build is static files in `dist/` and uses hash routing, so it can be served from any static host. For a sub-path (for example GitHub Pages) build with `VITE_BASE=/name/`.

**Maintenance notes**

- Lesson content is data in `src/data/lessons/gradient.ts`. Maths is written between dollar signs.
- Reward rules are one object in `src/lib/rewards/economy.ts` and one description component, `src/components/rewards/RewardRules.tsx`.
- If the question bank or seeded classmates change, increase `SEED_VERSION` in `src/data/demo/seed.ts` so saved browsers refresh the classmates only.
- A local Git checkpoint was created before this round of changes.

**Required before real classroom use**

1. School approval and a privacy impact assessment; a student data-handling agreement.
2. Real accounts, a hosted database, and scoring and rewards enforced on the server.
3. A child-safety review, data retention rules and an account removal process.
4. Teacher validation of the curriculum mapping; an accessibility audit with assistive technology.
5. Rules for any real-world prizes, set by the school.

## 21. Source-code reference

| Feature | Main files |
| --- | --- |
| Routes and layout | `src/app/App.tsx`, `src/components/layout/Layouts.tsx` |
| Landing page and disclaimer | `src/pages/public/Landing.tsx`, `src/data/copy.ts` |
| Name entry and editing | `src/pages/student/NamePrompt.tsx`, `src/pages/student/Dashboard.tsx`, `setStudentName` in `src/services/persistence/actions.ts` |
| Lesson page, resume and revision | `src/pages/student/GradientLessonPage.tsx`, `src/lib/lesson/position.ts` |
| Lesson content | `src/data/lessons/gradient.ts` |
| Question card, feedback, hints | `src/components/assessments/QuestionCard.tsx`, `src/lib/scoring/messages.ts` |
| Answer checking and units | `src/lib/scoring/evaluate.ts`, `src/lib/scoring/parse.ts` |
| Graph drawing and controls | `src/components/graphs/CartesianGraph.tsx` |
| Graph mathematics | `src/lib/math/graph.ts` |
| Maths notation | `src/components/ui/MathText.tsx`, `src/lib/math/tex.ts`, `src/styles/index.css` |
| Reward rules | `src/lib/rewards/economy.ts`, `src/components/rewards/RewardRules.tsx` |
| Shop and kennel | `src/data/curriculum/shop.ts`, `src/pages/student/Shop.tsx`, `src/pages/student/Kennel.tsx` |
| Mascots | `src/components/mascots/Labrador.tsx`, `src/data/curriculum/labs.ts` |
| My Labs and lab pages | `src/pages/student/LabsMap.tsx`, `src/pages/student/LabDetail.tsx` |
| Rubric | `src/components/assessments/RubricView.tsx`, `src/pages/teacher/Marking.tsx`, `RUBRIC` in `src/data/lessons/gradient.ts` |
| Teacher dashboard | `src/pages/teacher/Dashboard.tsx`, `src/components/ui/BarList.tsx`, `src/lib/analytics/activity.ts`, `src/lib/analytics/errors.ts` |
| Student profile and analytics | `src/pages/teacher/Students.tsx`, `src/lib/analytics/diagnostics.ts`, `src/hooks/useClassData.ts` |
| Lesson Library and In Development panels | `src/pages/teacher/LessonLibrary.tsx`, `src/data/curriculum/inDevelopment.ts` |
| Skills and misconceptions | `src/data/curriculum/skills.ts` |
| Browser storage and upgrades | `src/services/persistence/store.ts`, `src/services/persistence/actions.ts` |
| Demo classmates | `src/data/demo/seed.ts` |
| Database design (not connected) | `supabase/migrations/0001_initial_schema.sql` |
| Tests | `tests/unit/` |

## 22. Final change log

Changes made in this round:

1. **Feedback no longer skips ahead.** The lesson's saved position is now fixed when the page opens. Before, a lesson with no saved position recalculated its place after each answer and jumped to the next question on its own. The button is now labelled **Next Question**, and coins and XP appear as two separate badges. The two feedback messages are unchanged. Reward rules are unchanged and were re-verified.
2. **Vertical lesson layout.** The lesson is one centred column at all widths: instruction or worked example, graph, question and answer, then feedback. The graph's operation and the mathematics are unchanged.
3. **Accuracy by skill.** Replaced the clipped chart with wrapping text rows, so full skill names show at every width.
4. **Common errors.** Now shows eight graphing categories (rise and run reversed, incorrect negative gradient, x/y reversal, misreading graph scales, confusing intercept and gradient, confusing height with rate, failing to interpret units, comparing unequal scales), counted from real attempts. Three have recorded errors in the demo data; categories with none show 0. Added tag mappings for wrong units, intercept confusion and scale misreading.
5. **Recent submissions.** Now shows student and lesson stage ("completed", "attempted" or "submitted", with to mark or marked for written work), built from recorded attempts only.
6. **Lesson Library.** The four In Development labs are now compact collapsed panels with the same 14 field headings as Slope Lab in the same order, each showing a dash. The Slope Lab information is unchanged.
7. **Developer references removed.** A visible mention of the progress file in Rewards Settings was removed. The My Progress page and progress tracking are untouched. No other internal references were found in the interface.
8. **Six spelling slips added (later corrected).** Six deliberate slips were placed in short descriptive text in this round. In the next round they were all corrected (see section 23), because each sat in a reusable interface description.
9. **Tests.** Added tests for non-advancing feedback, the four reward scenarios, layout order, activity and error calculations, Lesson Library panels and text hygiene. Total 214 passing.
10. **Documentation.** Added this report and a Git checkpoint taken before the changes.

Not changed: the 11 questions and 8 lesson stages, the reward amounts, the marking rubric text, the mathematics rendering and the saved student data.

## 23. Later changes: mascot redesign and spelling audit

**Mascots.** The five Labradors were redrawn as five separate designs in `src/components/mascots/dogs.tsx`, composed by `src/components/mascots/Labrador.tsx` (same props as before, so every page that shows a mascot updates automatically). Hats, glasses and neckwear from the shop are mapped onto each dog's own head size.

| Character | Design |
| --- | --- |
| Hector | Large, broad head, wide muzzle, relaxed ears, confident brows, chocolate coat, broad shoulders |
| Tex | Small, narrow face, oversized floppy ears, tongue out, large playful eyes, pale-yellow coat, small body |
| Axel | Lean, long muzzle, alert almond eyes, asymmetrical ears (one folded, one lifted), black coat with a light rim so it shows on the navy background |
| Slobber | Round face, floppy ears, wide cheerful smile, golden coat, stocky body |
| Kirby | Soft round face, short muzzle, gentle eyes, long ears set high with a flipped tip, cream coat, compact body |

Each keeps its name, accent colour and mathematical collar badge. The shop coat-colour items (Chocolate, Black) recolour a dog but keep its own shape.

**Spelling audit.** Every user-visible string in `src` was checked against a dictionary and then reviewed by hand. Australian spellings (colour, practise, organised, modelled, labelled, travelling, penalised, kilometre) are correct and were kept.

| Misspelling | Location | Reusable? | Action |
| --- | --- | --- | --- |
| seperate | My Labs header | Generic page description | Corrected to "separate" |
| automaticaly | My Kennel subtitle | Generic page description | Corrected to "automatically" |
| dashbord | Reward Shop description | Generic page description | Corrected to "dashboard" |
| sucesses | Leaderboard subtitle | Generic page description | Corrected to "successes" |
| comparisions | My Progress subtitle (shown with the student's name) | Template | Corrected to "comparisons" |
| absense | Teacher dashboard, Missing work note | Generic note | Corrected to "absence" |
| fitcional | Landing-page demonstration disclaimer | No: one isolated sentence written by the project owner | Retained as requested earlier. It can be changed in `src/data/copy.ts` |

No other misspellings were found in the interface, lesson data, question bank, feedback messages, rubric, marking pages, rewards text, navigation or the seeded classmates' responses.
