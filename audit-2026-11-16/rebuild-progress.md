# Article rebuild queue

## Completion Snapshot: 17 November 2026

All 137 guides are now rewritten and integrated locally. The full set has 274 visual explanations, 137 free worksheets, updated search metadata, preserved article URLs, source records and contextual product links. Every page passed its local preview checks. All 3,357 repository tests passed with two workers; the type check passed. The production build passed, including all 351 static routes and the sharing-image conversion fix.

Current per-article status, query targets, GSC evidence, source links and research limitations are in `library-completion-report.html` and `library-completion-report.json`. `rebuild-status.json` is the machine-readable completion index. Nothing has been deployed and no production traffic gains are claimed.

The visual approach was corrected after feedback: live, readable HTML diagrams and actual worksheet previews replaced the staged generated scenes and their branding/disclaimer stamps. The historical entries below describe the earlier versions and are superseded by this snapshot.

## 1. Doctor appointment checklist

- Status: first complete local rewrite; production not deployed.
- Existing URL retained: `/guides/doctor-appointment-prep-checklist`.
- Primary query: `doctor appointment checklist`.
- GSC query evidence: `doctor visit checklist` (25 impressions), `checklist for doctor visit` (2), `doctor appointment checklist` (1). Page: 36 impressions, zero clicks, average position 51.03 in the supplied period.
- Supporting intent phrases: what to bring to a doctor's appointment; how to prepare for a doctor appointment; too many questions for one visit; preparation without a printer. These are editorial intent targets, not verified volume figures.
- Audience: adults, parents and people supporting relatives; planned appointment administration, not clinical decisions.
- Problem: important questions forgotten, scattered records, unclear follow-up.
- Response: five-minute action list, practical packing list, scripts, invented worked example, visit variants, free print sheet, source-linked next-step prompts.
- Conversion: optional Family Health Binder suggestion after help, plus free resource without email gate. No invented product promises.
- Sources: AHRQ patient fact sheet and IHI Ask Me 3 opened during rewrite. NIA fetch failed and was not used as a verified source. Reddit search supplied qualitative language about forgotten questions, not prevalence or volume; Quora remains unavailable.
- Image: built-in image generator; annotated editorial photographic concept. Prompt: real appointment-preparation scene with four exact wording blocks: YOUR MAIN CONCERN / What do you most need answered?; WHAT CHANGED / Dates. Frequency. What helped.; WHAT YOU TAKE / Medicines, supplements, allergies.; SPACE FOR ANSWERS / Next steps. Results. Who to contact. Caption explicitly labels all illustrated health details invented.
- Essential image content repeated in HTML; full-size image available by activation; blank print sheet contains no invented treatment details.
- No fabricated clinician review, first-person experience or usability-study results. Human clinical/editorial sign-off is not completed.
- Validation: 58 focused content tests pass. Playwright checked desktop (1440px) and mobile (390px): no horizontal overflow, annotated image decoded successfully, checklist works using keyboard, print sheet loads, A4 PDF generated. Screenshots are in `first-article-preview/`. Full TypeScript check is blocked by an unrelated existing unused `@ts-expect-error` in `creative/src/theme-registry.ts:8`.

## 2. Four-day homeschool week

- Status: complete local rewrite, not deployed. Existing URL retained.
- GSC: 23 page impressions, zero clicks, position 5.91 in the supplied period; no query-level volume inferred from this page row.
- Primary query retained: `four day homeschool week`. Supporting intent: sample four-day homeschool schedules, finishing a five-day curriculum, year-round pacing, days/hours versus lessons, spare-day choices. These are intent clusters, not measured market volumes.
- Reader: US homeschool parents arranging an elementary-level week. Explicitly not a high-school credit plan or a legal compliance tool.
- Fixed: old claims that a four-day standard year necessarily drops the fifth day's material, that year-round automatically prevents losses, that geography needs only one day, and that co-op attendance automatically replaces a subject.
- Tools: three week-layout options, native radio selection, per-subject lesson calculator with validation/reset, worked arithmetic, launch checklist, troubleshooting routes and plan/record/revisit flow.
- Lesson arithmetic: 180 remaining lessons, 36 weeks and four weekly sessions yield 144 one-lesson slots and 36 lessons left to place. Alternatives: five lessons weekly or 45 weeks at four weekly sessions. This is workload arithmetic, not an attendance certification.
- Sources opened: Sonlight's four-day programme documentation; Beyond the Page's schedule options; official NYC home-school attendance calendar. The full NYSED page failed to fetch and is not presented as checked. Reddit discussions supplied qualitative concerns only; Quora blocked access.
- Images: two built-in generated photographic/editorial illustrations with legible wording. Prompt set: (1) hypothetical five-column week with practice/read/explore and Friday flexible; annotations protect steady practice / rotate longer projects / keep spare day intentional. (2) planning notebook separating PLAN, RECORD, REVISIT, with invented-example disclosure. Images are in `public/guides/img/`; all important text also appears in HTML.
- Free worksheet: `/guides/print/four-day-homeschool.html`; browser-printable and A4 PDF checked. No email gate.
- Product: contextual Homeschooling Companion suggestion after substantive help; explicitly not a curriculum or guarantee of compliance. Verified against local product definition.
- Validation: 68 focused tests passed, including five calculator cases and asset dimensions. ESLint passed. Browser checks at 1440, 768, 390 and 320 pixels passed: no overflow, both images decoded, schedule changes, invalid/empty calculator handling, reset, checkbox keyboard support and printable.
- Social and listing assets updated for both rebuilt guides. Remaining articles are explicitly tracked as not rewritten in `rebuild-status.json`.

## Next in sequence

### Component redesign follow-up

The doctor article now uses a dedicated experience renderer rather than reskinning generic blocks. New components: before/in-room/departure anchor navigation; readiness and packing checklists with native progress, reset and session-only state; conversation selector with arrow-key support and clipboard feedback; a filled example styled as an appointment note; four native expandable visit scenarios with contextual icons; and a three-part departure plan. The original source copy remains in typed blocks. Two annotated AI-generated illustrative photos are available at full size, with substantive information also present in HTML. Image-generation prompt for the second visual: overhead appointment tote, question notebook, current medicine/supplement/allergy list, clinic paperwork, glasses and pen, with legible object labels and illustrative-setup disclosure. No actual health data is collected by the UI.

Focused content tests: 58 passed. Component/page ESLint: passed. Browser checks cover image decoding, overflow, checklist keyboard interaction, conversation arrow keys and selection, visit details, stage link targets, and print worksheet.

1. Used car without service records: safe decision path and maintenance record.
2. Homeschool notice of intent: jurisdiction-specific official requirements.
3. Car maintenance by mileage: time versus mileage decision aid.

Urgent factual corrections in the P0 audit remain a separate priority. The rest of the 137-article library is not marked ready merely because the first article is ready to preview.
