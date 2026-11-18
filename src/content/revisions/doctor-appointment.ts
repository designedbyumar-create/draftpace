import type { Guide } from "../guides";

export const doctorAppointmentRevision: Partial<Guide> = {
  title: "Doctor visit and appointment checklist: what to bring",
  dek: "You remember the question on the way home. This time, bring it with you: a doctor visit checklist, a free prep sheet, and room for the answers.",
  updatedAt: "2026-11-17",
  metaDescription: "Prepare for a doctor visit with a practical appointment checklist: what to bring, questions to ask, and a free printable sheet for notes and next steps.",
  sources: [
    { name: "AHRQ: 20 Tips To Help Prevent Medical Errors", url: "https://www.ahrq.gov/questions/resources/20-tips.html", retrieved: "2026-11-16", note: "Medicine lists, allergies, questions and understanding the next steps. Retrieval date recorded in UTC." },
    { name: "Institute for Healthcare Improvement: Ask Me 3", url: "https://www.ihi.org/library/tools/ask-me-3-good-questions-your-good-health", retrieved: "2026-11-16", note: "Three questions to understand the problem, action and reason. Retrieval date recorded in UTC." },
  ],
  body: [
    { kind: "paragraphs", paragraphs: [
      "For a doctor appointment, bring your main concern and questions, a current medicine and supplement list, allergies and reactions, dated notes about what changed, and any documents your clinic requested. Add photo ID and insurance details if your clinic uses them. Leave space to write the plan before you leave.",
      "You remember the question in the parking lot. The one you meant to ask before the conversation moved on. A doctor visit checklist cannot give you a longer appointment, but it can stop the important part from depending on what you remember under pressure.",
      "This guide covers preparation for a planned visit, not diagnosis or treatment. It is written for adults, parents and people helping a relative. Clinic instructions come first; insurance and paperwork requirements vary by country and provider. Do not wait for a scheduled visit if you need urgent help.",
    ] },
    { kind: "list", heading: "Only have five minutes? Start here", checkable: true, items: [
      "Write the one concern you most need answered. Put it first, not halfway down the page.",
      "List what you take now: medicines, over-the-counter products, vitamins and supplements. Copy names, doses and frequency from the labels rather than guessing.",
      "Note allergies and what reaction you had. If you are uncertain, say so.",
      "Write what changed and when. Bring the note, the documents your clinic asked for, and something to record the answers on.",
    ] },
    { kind: "paragraphs", paragraphs: ["[Open the free printable appointment sheet](/guides/print/doctor-appointment.html). No email or purchase needed. Keep it on your device or use your browser's print command. It is a blank preparation sheet, not a medical record service."] },
    { kind: "figure", src: "/guides/img/doctor-appointment-sheet-v4.webp", alt: "A blank appointment sheet separates the main concern, dated changes, medicines and allergies, and the agreed next steps.", width: 1200, height: 900, source: "diagram" },
    { kind: "paragraphs", heading: "How to prepare for a doctor appointment without writing your whole history", paragraphs: [
      "Start with the reason you booked. Then add enough detail to make it useful: when it started, how often it happens, what makes it better or worse, and what it stops you doing. 'I have been tired' is a starting point. 'For two weeks, I have needed to rest after the walk I usually manage' gives the conversation somewhere to begin.",
      "That example is invented. It is not a symptom test. You do not need to decide what the problem is before asking for help. Keep observations separate from your guesses, and mark dates as approximate when they are.",
      "The four parts in the illustration are your main concern, what changed, what you take, and room for answers. They fit on one page because the goal is a conversation, not a perfectly assembled archive. For more detail, use the [symptom notes guide](/guides/symptom-notes-for-a-doctor-visit).",
    ] },
    { kind: "list", heading: "What should I bring to a doctor's appointment?", checkable: true, items: [
      "Your questions, with the most important marked. A phone note is fine if you can find it quickly.",
      "Your current medicine and supplement list, including doses and frequency, plus allergies and reactions. Bring labels or bottles if the clinic requests them or the list is uncertain.",
      "Relevant records or results the clinic does not already have. Check before carrying an entire folder or paying for copies.",
      "Photo ID, insurance details, referral or authorization if required. Check the appointment message for location, time and any specific preparation.",
      "Pharmacy contact details, reading glasses or hearing support if used, and a way to write down the plan.",
      "A support person if you want one and the clinic allows it. Agree beforehand whether they will take notes, help explain something, or simply be there.",
    ] },
    { kind: "paragraphs", paragraphs: ["Do not change medicines, stop eating or prepare for tests based on a general checklist. Follow the instructions for your appointment and ask the clinic if anything is unclear. AHRQ recommends bringing information about medicines and speaking up about questions; see its [patient fact sheet](https://www.ahrq.gov/questions/resources/20-tips.html)."] },
    { kind: "scripts", heading: "What to say when the appointment starts", items: [
      { situation: "You have several concerns", line: "I have a few things written down. This is the one I most need help with today. Can we decide what we can cover and what needs another appointment?" },
      { situation: "Worried about forgetting", line: "I made a note because I lose track when I am here. Is it okay if I read the short version?" },
      { situation: "The plan is unclear", line: "Can I say that back to check I have it right? And could you write down what I should do next?" },
    ] },
    { kind: "table", heading: "A filled example: the note, not a diagnosis", intro: "An invented adult follow-up. Notice that it records a question rather than recommending a change in treatment.", columns: ["Part of the page", "Example wording"], rows: [
      ["Main concern", "Since my last visit, I am struggling to keep to the plan. Can we talk through what is getting in the way?"],
      ["What changed", "I changed work hours about two weeks ago. I have missed parts of the routine since then."],
      ["What I want to ask", "Which part should I prioritize? What should I do if I miss it again?"],
      ["What I take", "Attach my current list, checked against the labels today. Do not fill this from memory."],
      ["After the conversation", "Write the agreed plan in the clinician's words. Note who to contact with questions."],
    ] },
    { kind: "compare", heading: "Adjust the checklist for your visit", left: { label: "New doctor or a child's visit", items: ["For a new doctor, ask how to transfer relevant records. Add history and prior results requested by the clinic; see [what to bring to a new doctor](/guides/new-doctor-intake-what-to-bring).", "For a child, bring the current medicine and allergy details and any forms requested. Make room for what the child wants to say, too."] }, right: { label: "Video visit or helping a relative", items: ["For a video appointment, check the link, sound and connection ahead of time. Keep your notes nearby and use a private space where possible.", "When helping a relative, ask what they want you to discuss. Check consent or authorization requirements with the clinic rather than assuming being family is enough."] } },
    { kind: "list", heading: "Before you leave, get the next step out of your head", items: [
      "What do I need to do next, and why? Ask for the plan in language you understand.",
      "If there are tests, when and how should I expect the results? Who do I contact if they do not arrive?",
      "If anything changes, who should I contact and how urgently? Ask the clinician for guidance specific to your situation.",
    ] },
    { kind: "paragraphs", paragraphs: ["The Institute for Healthcare Improvement's [Ask Me 3](https://www.ihi.org/library/tools/ask-me-3-good-questions-your-good-health) is a useful fallback: understand the main problem, what to do and why it matters. You do not have to phrase your own questions perfectly. You need an answer you can use when you get home."] },
    { kind: "faq", heading: "When preparation is not straightforward", items: [
      { q: "What if I have too many questions for one doctor visit?", a: "Bring the full list, but mark the one that matters most. At the start, ask what can realistically be covered and how to arrange the rest. A longer page cannot create more appointment time. A second visit or another contact route may be needed; agree that with the clinic." },
      { q: "Can I prepare for an appointment without a printer?", a: "Yes. Use a phone note, a notebook or a plain sheet of paper. Put your main concern, dated changes, medicines and questions in separate short sections. Leave room for answers. The free printable is a convenience, not a requirement, and you do not need an account to use it." },
      { q: "Should I record the doctor's appointment?", a: "Ask the clinician and anyone present before recording, and check local rules and clinic policy. Do not assume permission. If recording is not an option, take short notes, bring an agreed support person or request written instructions. Keep anything containing personal health information somewhere you control." },
    ] },
    { kind: "paragraphs", heading: "Keep the next visit from starting at zero", paragraphs: [
      "Afterward, date the page and put it somewhere you will actually look next time. A folder works. So does a private note on your device. The useful thing is being able to find what was agreed, not owning a particular system.",
      "If you are keeping track of several people's visits, medicines and questions, the [Draftpace Family Health Binder](/shop/family-health-binder) is an option worth looking at. Check its current features and choose it only if it fits how you work. The checklist and [free appointment sheet](/guides/print/doctor-appointment.html) are yours to use either way.",
      "You do not need to arrive as the most organized person in the waiting room. Bring the question you came for. Leave with the next step written down.",
    ] },
  ],
};
