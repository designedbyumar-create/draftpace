/**
 * The Homeschool Year.
 *
 * The printed half of the product, and a book in its own right: a
 * handbook you read once, working pages you use all year, and check
 * sheets you photocopy. It is designed to be worth buying on its own, so
 * that the Companion complements it rather than the other way round.
 *
 * WHAT IT IS NOT
 *
 * Not a curriculum, not a scheme of work, not a statement of what any
 * child should know. Method and working pages only. The check sheets
 * name a topic and never an age, because the same eight questions suit a
 * seven year old who came to it early and a ten year old who came to it
 * late, and printing a year on the page would tell one of them something
 * untrue.
 *
 * UNDATED THROUGHOUT
 *
 * Every working page has a blank date on it. A dated planner is a
 * product that expires, and a family that starts in February should not
 * be holding something that says January.
 *
 * Plum and ink, matching the Companion. Newsreader for display, IBM Plex
 * Sans for everything a person has to read at length. No em dashes.
 */
import { Document, Page, View, Text, StyleSheet, type DocumentProps } from "@react-pdf/renderer";
import { CHECK_SHEETS, HANDBOOK_SUBTITLE, HANDBOOK_TITLE, METHOD, type Chapter } from "./handbookContent";

const C = {
  paper: "#fbfaf7",
  ink: "#1a1d24",
  body: "#3b3f49",
  muted: "#666b77",
  faint: "#9aa0ab",
  rule: "#ddd8d0",
  ruleSoft: "#eae6de",
  write: "#c9c3ba",
  plum: "#6a4a72",
  plumMid: "#8e6f95",
  plumSoft: "#f1ebf2",
  cream: "#f5f1ea",
};

const HEAD = "Newsreader";
const BODY = "PlexSans";
const M = { top: 62, bottom: 56, side: 58 };

const s = StyleSheet.create({
  page: {
    paddingTop: M.top,
    paddingBottom: M.bottom,
    paddingHorizontal: M.side,
    backgroundColor: C.paper,
    color: C.body,
    fontFamily: BODY,
    fontSize: 9.6,
    lineHeight: 1.6,
  },
  bare: { backgroundColor: C.paper, fontFamily: BODY },
  spine: { position: "absolute", top: 0, left: 0, right: 0, height: 3.5, backgroundColor: C.plum },
  runningHead: {
    position: "absolute",
    top: 30,
    left: M.side,
    right: M.side,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 6.8,
    letterSpacing: 1.2,
    color: C.faint,
    textTransform: "uppercase",
  },
  folioRule: { position: "absolute", bottom: 40, left: M.side, right: M.side, height: 0.5, backgroundColor: C.ruleSoft },
  folio: { position: "absolute", bottom: 25, right: M.side, fontSize: 7.5, color: C.faint },

  eyebrow: { fontSize: 6.8, letterSpacing: 1.5, color: C.plum, textTransform: "uppercase" },
  h1: { fontFamily: HEAD, fontSize: 26, color: C.ink, marginTop: 8, lineHeight: 1.15 },
  standfirst: { fontFamily: HEAD, fontSize: 12, color: C.body, marginTop: 12, lineHeight: 1.5 },
  headRule: { height: 1.2, backgroundColor: C.ink, marginTop: 18, marginBottom: 20 },
  h2: { fontFamily: HEAD, fontSize: 13.5, color: C.ink, marginTop: 18, marginBottom: 6 },
  p: { fontSize: 9.6, color: C.body, marginBottom: 9, lineHeight: 1.65 },

  bullet: { flexDirection: "row", marginBottom: 6 },
  bulletMark: { width: 14 },
  bulletText: { flex: 1, fontSize: 9.6, color: C.body, lineHeight: 1.6 },

  writeLine: { borderBottomWidth: 0.7, borderBottomColor: C.write, height: 26 },
  writeLabel: { fontSize: 7.4, letterSpacing: 0.7, color: C.faint, textTransform: "uppercase", marginTop: 12 },
  tocLabel: { fontSize: 7.4, letterSpacing: 0.7, color: C.plum, textTransform: "uppercase", marginTop: 15, marginBottom: 3 },

  boxLabel: { fontSize: 6.8, letterSpacing: 1.3, color: C.plum, textTransform: "uppercase" },
  box: { borderLeftWidth: 2.5, borderLeftColor: C.plum, backgroundColor: C.plumSoft, paddingVertical: 12, paddingHorizontal: 15 },

  tableHead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.ink, paddingBottom: 5 },
  th: { fontSize: 6.8, letterSpacing: 1, color: C.ink, textTransform: "uppercase" },
  tr: { flexDirection: "row", borderBottomWidth: 0.6, borderBottomColor: C.write, height: 28, alignItems: "center" },
});

function Sheet({ section, children }: { section: string; children: React.ReactNode }) {
  return (
    <>
      <View style={s.spine} fixed />
      <View style={s.runningHead} fixed>
        <Text>{HANDBOOK_TITLE}</Text>
        <Text>{section}</Text>
      </View>
      {children}
      <View style={s.folioRule} fixed />
      <Text style={s.folio} fixed render={({ pageNumber }) => String(pageNumber)} />
    </>
  );
}

/** Ruled space to write in. The whole point of the second half of the book. */
function Lines({ count, label }: { count: number; label?: string }) {
  return (
    <View>
      {label && <Text style={s.writeLabel}>{label}</Text>}
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={s.writeLine} />
      ))}
    </View>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <View style={{ marginTop: 4 }}>
      {items.map((item, i) => (
        <View key={i} style={s.bullet} wrap={false}>
          {/* Drawn, not typed. The obvious character here is an em dash
              and this repo does not use them anywhere a person reads. */}
          <View style={s.bulletMark}>
            <View style={{ width: 7, height: 1, backgroundColor: C.plumMid, marginTop: 7 }} />
          </View>
          <Text style={s.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

/** A part divider. The one place in the book that spends ink. */
function Divider({ part, title, blurb, size }: { part: string; title: string; blurb: string; size: Size }) {
  return (
    <Page size={size} style={s.bare}>
      <View style={{ flex: 1, backgroundColor: C.plum, paddingHorizontal: M.side, paddingTop: 150 }}>
        <Text style={{ fontSize: 7, letterSpacing: 2.4, color: "#d9c9dd", textTransform: "uppercase" }}>
          Part {part}
        </Text>
        <Text style={{ fontFamily: HEAD, fontSize: 40, color: "#ffffff", marginTop: 16, lineHeight: 1.1 }}>{title}</Text>
        <View style={{ width: 90, height: 1.5, backgroundColor: "#b79dbd", marginTop: 26 }} />
        <Text style={{ fontFamily: HEAD, fontSize: 12.5, color: "#e6d9e9", marginTop: 22, lineHeight: 1.55, maxWidth: 330 }}>
          {blurb}
        </Text>
      </View>
    </Page>
  );
}

function MethodChapter({ chapter, size }: { chapter: Chapter; size: Size }) {
  return (
    <Page size={size} style={s.page}>
      <Sheet section={chapter.title}>
        <Text style={s.eyebrow}>Chapter {chapter.number}</Text>
        <Text style={s.h1}>{chapter.title}</Text>
        <Text style={s.standfirst}>{chapter.standfirst}</Text>
        <View style={s.headRule} />
        {chapter.sections.map((section) => (
          <View key={section.heading} wrap={false}>
            <Text style={s.h2}>{section.heading}</Text>
            {section.paragraphs.map((paragraph, i) => (
              <Text key={i} style={s.p}>
                {paragraph}
              </Text>
            ))}
            {section.list && <Bullets items={section.list} />}
          </View>
        ))}
      </Sheet>
    </Page>
  );
}

type Size = "LETTER" | "A4";

export function HomeschoolHandbook({ size }: { size: Size }): React.ReactElement<DocumentProps> {
  return (
    <Document
      title={HANDBOOK_TITLE}
      author="Draftpace"
      subject={HANDBOOK_SUBTITLE}
      creator="Homeschooling Companion by Draftpace"
      producer="Homeschooling Companion by Draftpace"
    >
      {/* ------------------------------------------------------- cover */}
      <Page size={size} style={s.bare}>
        <View style={{ flex: 1, backgroundColor: C.cream, paddingHorizontal: 58, paddingTop: 64, paddingBottom: 56 }}>
          <View style={s.spine} fixed />
          <Text style={{ fontSize: 7, letterSpacing: 2.2, color: C.plum, textTransform: "uppercase" }}>Draftpace</Text>

          {/* The mark: a term of weeks, one of them picked out. */}
          <View style={{ marginTop: 74, flexDirection: "row", flexWrap: "wrap", width: 300 }}>
            {Array.from({ length: 36 }, (_, i) => (
              <View
                key={i}
                style={{
                  width: 26,
                  height: 26,
                  marginRight: 6,
                  marginBottom: 6,
                  borderWidth: i === 14 ? 0 : 0.8,
                  borderColor: C.plum,
                  opacity: i === 14 ? 1 : 0.32,
                  backgroundColor: i === 14 ? C.plum : "transparent",
                }}
              />
            ))}
          </View>

          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <View style={{ height: 1.5, backgroundColor: C.ink, marginBottom: 20 }} />
            <Text style={{ fontFamily: HEAD, fontSize: 52, lineHeight: 1.02, color: C.ink }}>
              The{"\n"}Homeschool{"\n"}Year
            </Text>
            <Text style={{ fontFamily: HEAD, fontSize: 13, color: C.body, marginTop: 20, lineHeight: 1.5, maxWidth: 320 }}>
              {HANDBOOK_SUBTITLE}
            </Text>
            <Text style={{ fontSize: 9, color: C.muted, marginTop: 26 }}>
              Undated, so it starts whenever you do.
            </Text>
          </View>
        </View>
      </Page>

      {/* ------------------------------------------------ how to use it */}
      <Page size={size} style={s.page}>
        <Sheet section="How to use this">
          <Text style={s.eyebrow}>Before anything else</Text>
          <Text style={s.h1}>Two halves, used differently.</Text>
          <View style={s.headRule} />
          <Text style={s.p}>
            The first half of this book is meant to be read once, probably in an evening, and then left alone. It is
            about how to run a week, what to write down, and how to tell whether anything landed. It contains no
            curriculum and tells you nothing about what your child ought to know.
          </Text>
          <Text style={s.p}>
            The second half is meant to be printed, written on, and printed again. The working pages are undated on
            purpose. Print the ones you use, ignore the ones you do not, and photocopy the check sheets as often as you
            like.
          </Text>

          <Text style={s.h2}>What this book will not do</Text>
          <Text style={s.p}>
            It will not tell you what to teach. That is your decision and this book is written by people who do not
            know your child. Where it suggests anything at all, it says so plainly and gives you a way to ignore it.
          </Text>
          <Text style={s.p}>
            It will not tell you whether you are behind. There is nothing to be behind. Families using four different
            curricula in the same street are on four different sequences, and all four are fine.
          </Text>

          <View style={[s.box, { marginTop: 20 }]}>
            <Text style={s.boxLabel}>If you also have the Companion</Text>
            <Text style={{ fontSize: 9.6, color: C.ink, marginTop: 6, lineHeight: 1.6 }}>
              Everything in the second half of this book has a place in the app: the daily log, the observations, the
              subjects and the check results. Use whichever suits the day. A week written on paper and typed up on
              Sunday is exactly as good as a week entered live, and some weeks paper is the only thing that will
              happen.
            </Text>
          </View>
        </Sheet>
      </Page>

      {/* ---------------------------------------------------- contents */}
      <Page size={size} style={s.page}>
        <Sheet section="Contents">
          <Text style={s.eyebrow}>Contents</Text>
          <Text style={s.h1}>What is in here.</Text>
          <View style={s.headRule} />

          <Text style={s.tocLabel}>Part one, the handbook</Text>
          {METHOD.map((chapter) => (
            <View
              key={chapter.number}
              style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4.5, borderBottomWidth: 0.5, borderBottomColor: C.ruleSoft }}
            >
              <Text style={{ fontSize: 10, color: C.ink }}>
                {chapter.number}   {chapter.title}
              </Text>
            </View>
          ))}

          <Text style={s.tocLabel}>Part two, the working pages</Text>
          {[
            "The year at a glance",
            "A week at a time",
            "The daily log",
            "One subject, over a term",
            "The reading log",
            "Things worth remembering",
            "Days schooled",
          ].map((line) => (
            <View
              key={line}
              style={{ paddingVertical: 4.5, borderBottomWidth: 0.5, borderBottomColor: C.ruleSoft }}
            >
              <Text style={{ fontSize: 10, color: C.ink }}>{line}</Text>
            </View>
          ))}

          <Text style={s.tocLabel}>Part three, the check sheets</Text>
          {CHECK_SHEETS.map((sheet) => (
            <View
              key={sheet.topicKey}
              style={{ paddingVertical: 4.5, borderBottomWidth: 0.5, borderBottomColor: C.ruleSoft }}
            >
              <Text style={{ fontSize: 10, color: C.ink }}>
                {sheet.subject}   {sheet.title}
              </Text>
            </View>
          ))}
        </Sheet>
      </Page>

      <Divider
        part="one"
        title="The handbook"
        blurb="Six short chapters about running a homeschool week, keeping records worth having, and finding out honestly whether anything landed."
        size={size}
      />

      {METHOD.map((chapter) => (
        <MethodChapter key={chapter.number} chapter={chapter} size={size} />
      ))}

      <Divider
        part="two"
        title="The working pages"
        blurb="Undated, so they start whenever you do. Print what you use and ignore the rest. Nothing here has to be filled in for anything else to work."
        size={size}
      />

      {/* --------------------------------------------- year at a glance */}
      <Page size={size} style={s.page}>
        <Sheet section="The year at a glance">
          <Text style={s.eyebrow}>Working page</Text>
          <Text style={s.h1}>The year at a glance</Text>
          <View style={s.headRule} />
          <Text style={s.p}>
            One line per month. Write the shape of it: terms, breaks, anything already fixed. Fill in the months as you
            reach them rather than all at once in September.
          </Text>
          <View style={{ marginTop: 10 }}>
            {Array.from({ length: 12 }, (_, i) => (
              <View key={i} style={{ flexDirection: "row", height: 30, borderBottomWidth: 0.7, borderBottomColor: C.write }}>
                {/* One rule across the row, divided by a tick, so the two
                    halves cannot drift off each other's baseline. */}
                <View style={{ width: 78, borderRightWidth: 0.7, borderRightColor: C.ruleSoft }} />
                <View style={{ flex: 1 }} />
              </View>
            ))}
          </View>
        </Sheet>
      </Page>

      {/* ------------------------------------------------ weekly plan */}
      <Page size={size} style={s.page}>
        <Sheet section="A week at a time">
          <Text style={s.eyebrow}>Working page, print as many as you need</Text>
          <Text style={s.h1}>A week at a time</Text>
          <View style={s.headRule} />
          <View style={{ flexDirection: "row", marginBottom: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={s.writeLabel}>Week beginning</Text>
              <View style={s.writeLine} />
            </View>
            <View style={{ flex: 1, marginLeft: 18 }}>
              <Text style={s.writeLabel}>Who this is for</Text>
              <View style={s.writeLine} />
            </View>
          </View>
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Spare day"].map((day) => (
            <View key={day} wrap={false} style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 8.4, letterSpacing: 0.8, color: C.plum, textTransform: "uppercase", marginTop: 8 }}>
                {day}
              </Text>
              <View style={s.writeLine} />
              <View style={s.writeLine} />
            </View>
          ))}
          <Text style={{ fontSize: 8.4, color: C.muted, marginTop: 12, lineHeight: 1.55 }}>
            The spare day is the point of this page. Leave it empty when you plan, and it will be there for the week
            that needs it.
          </Text>
        </Sheet>
      </Page>

      {/* -------------------------------------------------- daily log */}
      <Page size={size} style={s.page}>
        <Sheet section="The daily log">
          <Text style={s.eyebrow}>Working page, print as many as you need</Text>
          <Text style={s.h1}>The daily log</Text>
          <View style={s.headRule} />
          <Text style={s.p}>
            What actually happened, written the same day. Three columns, because those are the three things worth
            having later: when, what, and how it went.
          </Text>
          <View style={[s.tableHead, { marginTop: 12 }]}>
            <Text style={[s.th, { width: 62 }]}>Date</Text>
            <Text style={[s.th, { width: 86 }]}>Subject</Text>
            <Text style={[s.th, { flex: 1 }]}>What we did</Text>
            <Text style={[s.th, { width: 84 }]}>How it went</Text>
          </View>
          {Array.from({ length: 16 }, (_, i) => (
            <View key={i} style={s.tr}>
              {/* Column rules, faint. Without them the eye loses which
                  column it is in halfway across the page. */}
              <View style={{ width: 62, height: "100%", borderRightWidth: 0.5, borderRightColor: C.ruleSoft }} />
              <View style={{ width: 86, height: "100%", borderRightWidth: 0.5, borderRightColor: C.ruleSoft }} />
              <View style={{ flex: 1, height: "100%", borderRightWidth: 0.5, borderRightColor: C.ruleSoft }} />
              <View style={{ width: 84 }} />
            </View>
          ))}
          <Text style={{ fontSize: 8.4, color: C.muted, marginTop: 12, lineHeight: 1.55 }}>
            For the last column, one word is enough: easy, about right, or difficult. Anything longer will stop getting
            written by the second week.
          </Text>
        </Sheet>
      </Page>

      {/* ---------------------------------------------- subject record */}
      <Page size={size} style={s.page}>
        <Sheet section="One subject, over a term">
          <Text style={s.eyebrow}>Working page, one per subject</Text>
          <Text style={s.h1}>One subject, over a term</Text>
          <View style={s.headRule} />
          <View style={{ flexDirection: "row", marginBottom: 6 }}>
            <View style={{ flex: 1 }}>
              <Text style={s.writeLabel}>Subject</Text>
              <View style={s.writeLine} />
            </View>
            <View style={{ flex: 1, marginLeft: 18 }}>
              <Text style={s.writeLabel}>What we are using</Text>
              <View style={s.writeLine} />
            </View>
          </View>
          <Lines count={2} label="Where we started" />
          <Lines count={5} label="What we covered" />
          <Lines count={3} label="What went well" />
          <Lines count={3} label="What we are coming back to" />
          <Lines count={2} label="Work kept, and where" />
        </Sheet>
      </Page>

      {/* ------------------------------------------------ reading log */}
      <Page size={size} style={s.page}>
        <Sheet section="The reading log">
          <Text style={s.eyebrow}>Working page, and the one they will fill in themselves</Text>
          <Text style={s.h1}>The reading log</Text>
          <View style={s.headRule} />
          <Text style={s.p}>
            Every book, finished or abandoned. Abandoned books belong on the list: a child who is allowed to stop is a
            child who keeps starting.
          </Text>
          <View style={[s.tableHead, { marginTop: 12 }]}>
            <Text style={[s.th, { flex: 1 }]}>Book</Text>
            <Text style={[s.th, { width: 110 }]}>Started</Text>
            <Text style={[s.th, { width: 110 }]}>Finished or stopped</Text>
          </View>
          {Array.from({ length: 17 }, (_, i) => (
            <View key={i} style={s.tr}>
              <View style={{ flex: 1, height: "100%", borderRightWidth: 0.5, borderRightColor: C.ruleSoft }} />
              <View style={{ width: 110, height: "100%", borderRightWidth: 0.5, borderRightColor: C.ruleSoft }} />
              <View style={{ width: 110 }} />
            </View>
          ))}
        </Sheet>
      </Page>

      {/* ------------------------------------------- things to remember */}
      <Page size={size} style={s.page}>
        <Sheet section="Things worth remembering">
          <Text style={s.eyebrow}>Working page</Text>
          <Text style={s.h1}>Things worth remembering</Text>
          <View style={s.headRule} />
          <Text style={s.p}>
            The page you will be glad of in three years. Not what was taught: what happened. The day something finally
            landed, the thing they said about it, the week that was hard and why.
          </Text>
          <Text style={s.p}>
            Write these the day they happen. Nobody has ever successfully reconstructed one in December.
          </Text>
          <View style={{ marginTop: 10 }}>
            {Array.from({ length: 7 }, (_, i) => (
              <View key={i} wrap={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                  <View style={{ width: 70, borderBottomWidth: 0.7, borderBottomColor: C.write, height: 22 }} />
                  <View style={{ flex: 1, borderBottomWidth: 0.7, borderBottomColor: C.write, height: 22, marginLeft: 12 }} />
                </View>
                <View style={s.writeLine} />
              </View>
            ))}
          </View>
        </Sheet>
      </Page>

      {/* ---------------------------------------------- days schooled */}
      <Page size={size} style={s.page}>
        <Sheet section="Days schooled">
          <Text style={s.eyebrow}>Working page, for anybody who has to count</Text>
          <Text style={s.h1}>Days schooled</Text>
          <View style={s.headRule} />
          <Text style={s.p}>
            Some places require a number of days and some require none at all. If yours does, mark them here as you go.
            Reconstructing a year of attendance in June is genuinely impossible.
          </Text>
          <View style={{ marginTop: 8 }}>
            {Array.from({ length: 12 }, (_, row) => (
              <View key={row} style={{ flexDirection: "row", alignItems: "center", marginBottom: 7 }}>
                <View style={{ width: 68, borderBottomWidth: 0.7, borderBottomColor: C.write, height: 20, marginRight: 10 }} />
                {Array.from({ length: 16 }, (_, i) => (
                  <View
                    key={i}
                    style={{ width: 15, height: 15, borderWidth: 0.7, borderColor: C.write, marginRight: 4.5 }}
                  />
                ))}
                <View style={{ width: 34, borderBottomWidth: 0.7, borderBottomColor: C.write, height: 20, marginLeft: 6 }} />
              </View>
            ))}
          </View>
          <Text style={{ fontSize: 8.4, color: C.muted, marginTop: 10 }}>
            Month on the left, one box per day schooled, running total on the right.
          </Text>
        </Sheet>
      </Page>

      <Divider
        part="three"
        title="The check sheets"
        blurb="Eight questions each, photocopiable, and undated. They name the topic they cover and never an age, because the same questions suit a child who came to it early and one who came to it late."
        size={size}
      />

      {CHECK_SHEETS.map((sheet) => (
        <Page key={sheet.topicKey} size={size} style={s.page}>
          <Sheet section={`${sheet.subject}, ${sheet.title}`}>
            <Text style={s.eyebrow}>Check sheet, {sheet.subject}</Text>
            <Text style={s.h1}>{sheet.title}</Text>
            <View style={{ flexDirection: "row", marginTop: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.writeLabel}>Who</Text>
                <View style={s.writeLine} />
              </View>
              <View style={{ width: 130, marginLeft: 18 }}>
                <Text style={s.writeLabel}>Date</Text>
                <View style={s.writeLine} />
              </View>
            </View>
            <Text style={{ fontSize: 8.8, color: C.muted, marginTop: 12, lineHeight: 1.55 }}>{sheet.note}</Text>

            <View style={{ marginTop: 14 }}>
              {sheet.questions.map((question, i) => (
                <View key={i} wrap={false} style={{ marginBottom: 9 }}>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ width: 18, fontSize: 9.4, color: C.plumMid }}>{i + 1}</Text>
                    <Text style={{ flex: 1, fontSize: 9.6, color: C.ink, lineHeight: 1.5 }}>{question}</Text>
                  </View>
                  <View style={{ borderBottomWidth: 0.7, borderBottomColor: C.write, height: 20, marginLeft: 18 }} />
                </View>
              ))}
            </View>

            <View style={[s.box, { marginTop: 8 }]}>
              <Text style={s.boxLabel}>Reading this</Text>
              <Text style={{ fontSize: 8.8, color: C.ink, marginTop: 5, lineHeight: 1.55 }}>
                Four answers is the fewest that tells you anything. Below that the honest conclusion is that you do not
                know yet. Above it: mostly right means move on when ready, mostly missed means go over it again, and a
                split means more practice rather than going back.
              </Text>
              {/*
                The answers are NOT here.
                
                They were, for one draft, in a box at the foot of the page
                the child is reading from. Every answer key in every
                workbook ever printed lives somewhere else for exactly this
                reason, and putting one here defeats the entire page.
              */}
              <Text style={{ fontSize: 8.4, color: C.muted, marginTop: 7, lineHeight: 1.5 }}>
                {sheet.answers
                  ? "Answers are at the back, so this page can be handed over as it is."
                  : "This one has no answer key on purpose. You are the one who can tell whether the thinking was there."}
              </Text>
            </View>
          </Sheet>
        </Page>
      ))}

      {/* ------------------------------------------------ blank sheet */}
      <Page size={size} style={s.page}>
        <Sheet section="Your own check">
          <Text style={s.eyebrow}>Check sheet, blank</Text>
          <Text style={s.h1}>Your own check</Text>
          <View style={s.headRule} />
          <Text style={s.p}>
            You know the material and you know the child, so your eight questions will be better than anybody
            else&rsquo;s. Write them once and this page can be photocopied for the rest of the year.
          </Text>
          <View style={{ flexDirection: "row", marginTop: 6 }}>
            <View style={{ flex: 1 }}>
              <Text style={s.writeLabel}>Topic</Text>
              <View style={s.writeLine} />
            </View>
            <View style={{ flex: 1, marginLeft: 18 }}>
              <Text style={s.writeLabel}>Who, and when</Text>
              <View style={s.writeLine} />
            </View>
          </View>
          <View style={{ marginTop: 8 }}>
            {Array.from({ length: 8 }, (_, i) => (
              <View key={i} wrap={false} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                  <Text style={{ width: 18, fontSize: 9.4, color: C.plumMid }}>{i + 1}</Text>
                  <View style={{ flex: 1, borderBottomWidth: 0.7, borderBottomColor: C.write, height: 22 }} />
                </View>
                <View style={{ borderBottomWidth: 0.7, borderBottomColor: C.write, height: 20, marginLeft: 18 }} />
              </View>
            ))}
          </View>
        </Sheet>
      </Page>

      {/* ------------------------------------------------- answer key */}
      <Page size={size} style={s.page}>
        <Sheet section="Answers">
          <Text style={s.eyebrow}>For the parent, at the back on purpose</Text>
          <Text style={s.h1}>Answers</Text>
          <View style={s.headRule} />
          <Text style={s.p}>
            Kept away from the question pages so that a check sheet can be handed over exactly as it is printed. Two of
            the sheets have no answers here, because the useful part of them is the reasoning and you are the only one
            who can judge it.
          </Text>
          {CHECK_SHEETS.filter((sheet) => sheet.answers).map((sheet) => (
            <View key={sheet.topicKey} wrap={false} style={{ marginTop: 14 }}>
              <Text style={{ fontSize: 10.5, color: C.ink }}>
                {sheet.subject}, {sheet.title}
              </Text>
              <View style={{ marginTop: 5 }}>
                {sheet.answers!.map((answer, i) => (
                  <View key={i} style={{ flexDirection: "row", marginBottom: 2.5 }}>
                    <Text style={{ width: 18, fontSize: 8.8, color: C.plumMid }}>{i + 1}</Text>
                    <Text style={{ flex: 1, fontSize: 8.8, color: C.body, lineHeight: 1.5 }}>{answer}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
          <View style={[s.box, { marginTop: 20 }]}>
            <Text style={s.boxLabel}>Where an answer says the parent decides</Text>
            <Text style={{ fontSize: 8.8, color: C.ink, marginTop: 5, lineHeight: 1.55 }}>
              Those questions are the ones worth the most. A child can produce a correct number without understanding
              anything, and the questions that ask them to explain are the only ones that show the difference. There is
              no key for them because there is no single right wording, only whether the idea was there.
            </Text>
          </View>
        </Sheet>
      </Page>

      {/* -------------------------------------------------- colophon */}
      <Page size={size} style={s.page}>
        <Sheet section="About this book">
          <Text style={s.eyebrow}>Last page</Text>
          <Text style={s.h1}>About this book.</Text>
          <View style={s.headRule} />
          <Text style={s.p}>
            The Homeschool Year is one half of the Homeschooling Companion. The other half is an app that does the
            remembering: what you did, what you noticed, and what came back from a check, kept per child and printable
            as a record.
          </Text>
          <Text style={s.p}>
            Neither half needs the other. This book works with a pencil and nothing else, and the app works if you
            never print a page. Most families end up using both, on different days, for different reasons.
          </Text>
          <Text style={s.p}>
            Nothing in this book was generated. Every sentence and every question in it was written by a person, and
            there is no model involved anywhere in this product.
          </Text>
          <Text style={s.p}>
            It contains no legal advice. What you are required to keep depends on where you live, changes, and is worth
            checking at the source rather than taking from a book.
          </Text>
          <View style={[s.box, { marginTop: 18 }]}>
            <Text style={s.boxLabel}>One thing to remember</Text>
            <Text style={{ fontFamily: HEAD, fontSize: 13, color: C.ink, marginTop: 7, lineHeight: 1.5 }}>
              There is nothing to be behind. You are teaching one child, at their pace, and the only comparison worth
              anything is with where they were last term.
            </Text>
          </View>
          <Text style={{ fontSize: 8.4, color: C.faint, marginTop: 24 }}>
            The Homeschool Year. Draftpace. Undated by design.
          </Text>
        </Sheet>
      </Page>
    </Document>
  );
}
