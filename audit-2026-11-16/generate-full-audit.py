import collections
import csv
import html
import io
import json
import pathlib
import re
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent
BASE = "https://draftpace.com"


def read_json(path, fallback=None):
    try:
        return json.loads(path.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return fallback


def clean_url(url):
    return url.rstrip("/")


def article_slug(url):
    return url.rstrip("/").rsplit("/", 1)[-1]


def title_from_text(text, url):
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    title = lines[0] if lines else article_slug(url).replace("-", " ").title()
    return re.sub(r"\s*\|\s*Draftpace\s*$", "", title, flags=re.I)


def body_lines(text, title):
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    # The collector captures the shell, then the title twice. Use the second title
    # as the start of the article body and ignore short navigation/metadata lines.
    positions = [i for i, line in enumerate(lines) if line == title]
    start = positions[1] + 1 if len(positions) > 1 else 0
    return lines[start:]


def first_long_line(lines):
    skip = {"Ask", "Guides", "Shop", "How it works", "About", "Sign in", "Get started", "Home"}
    for line in lines:
        if len(line) >= 80 and line not in skip and not line.startswith("Updated"):
            return line
    return ""


def quote(text, limit=220):
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) > limit:
        text = text[: limit - 1].rsplit(" ", 1)[0] + "…"
    return text


def external_links(links):
    return list(dict.fromkeys(link for link in (links or []) if link.startswith("http") and "draftpace.com" not in link))


def domain(url):
    match = re.search(r"https?://([^/]+)", url)
    return match.group(1).lower() if match else ""


def primary_source(url):
    host = domain(url)
    return any(token in host for token in (".gov", ".gov.uk", ".edu", "nhs.uk", "who.int", "ahrq.gov", "nih.gov", "ssa.gov"))


def research_leads(research):
    result = research.get("result", "") if isinstance(research, dict) else ""
    urls = list(dict.fromkeys(re.findall(r"https?://[^\s)\]>]+", result)))
    reddit = [u.rstrip(".,") for u in urls if "reddit.com" in u]
    quora = [u.rstrip(".,") for u in urls if "quora.com" in u]
    general = [u.rstrip(".,") for u in urls if "reddit.com" not in u and "quora.com" not in u]
    return {
        "queries": (research or {}).get("queries", []),
        "google_and_web_leads": general[:8],
        "reddit_leads": reddit[:8],
        "quora": "Blocked by robots.txt in the stored research run; no Quora claim used." if "quora.com" in result.lower() or "quora" in result.lower() else "No Quora result captured.",
        "monthly_search_volume": "Unknown. Search snippets and GSC impressions are not monthly keyword volume.",
        "gsc_role": "GSC values below are this site's exposure for the URL, not total market demand.",
    }


def intent_for(title, slug):
    s = (title + " " + slug).lower()
    if any(x in s for x in ("checklist", "list", "template", "log", "binder", "organizer", "organise", "plan")):
        return "Tool / checklist intent: the reader wants a usable list, record, schedule, or template they can act on."
    if s.startswith("why") or "why " in s or "adhd" in s or "executive dysfunction" in s or "time blindness" in s:
        return "Explanation / support intent: the reader wants a credible explanation plus a small next step that works in real life."
    if any(x in s for x in ("death", "dies", "will", "executor", "beneficiar", "guardian", "accounts after")):
        return "High-stakes life-admin intent: the reader needs an ordered, jurisdiction-aware action path and clear boundaries."
    if any(x in s for x in ("doctor", "health", "medication", "symptom", "medical", "hospital")):
        return "Health-administration intent: the reader needs preparation and questions, not diagnosis or treatment advice."
    if any(x in s for x in ("budget", "money", "debt", "bill", "payment", "subscription", "finance", "afford")):
        return "Personal-finance intent: the reader needs a concrete decision rule, calculation, or recovery sequence."
    if any(x in s for x in ("travel", "trip", "flight", "hotel", "passport", "packing")):
        return "Travel-logistics intent: the reader needs a time-sensitive checklist, fallback, and documents to carry."
    if any(x in s for x in ("car", "maintenance", "appliance", "house", "home", "rental", "water shutoff")):
        return "Maintenance / household intent: the reader needs a safe inspection or record-keeping sequence with practical stop points."
    return "Practical how-to intent: the reader needs a direct answer, ordered steps, and a concrete artifact or decision point."


def category(title, slug):
    s = (title + " " + slug).lower()
    for label, terms in (
        ("Death, estates and family affairs", ("death", "dies", "will", "executor", "beneficiar", "guardian", "accounts after")),
        ("Homeschooling", ("homeschool",)),
        ("Health administration", ("doctor", "health", "medication", "symptom", "medical", "hospital")),
        ("Money administration", ("budget", "money", "debt", "bill", "payment", "subscription", "finance", "afford")),
        ("Travel administration", ("travel", "trip", "flight", "hotel", "passport", "packing")),
        ("Home and car maintenance", ("car", "maintenance", "appliance", "house", "home", "rental", "water shutoff")),
        ("Cognitive load and follow-through", ("adhd", "executive", "task", "procrastination", "time blindness", "productivity", "planner")),
    ):
        if any(term in s for term in terms):
            return label
    return "General life administration"


def high_stakes(title, slug):
    s = (title + " " + slug).lower()
    return any(x in s for x in ("death", "dies", "will", "executor", "beneficiar", "guardian", "doctor", "health", "medication", "symptom", "hospital", "debt", "credit", "bank", "payment", "insurance", "homeschool requirement", "notice of intent"))


def detect_repeat_issues(text):
    words = re.findall(r"[a-z0-9']+", text.lower())
    counts = collections.Counter(" ".join(words[i : i + 6]) for i in range(max(0, len(words) - 5)))
    repeated = [(phrase, count) for phrase, count in counts.items() if count >= 3 and len(phrase) > 20]
    return sorted(repeated, key=lambda x: (-x[1], x[0]))[:3]


def article_review(entry, article, research, gsc_row, agent_review=None):
    url = entry["url"]
    slug = article_slug(url)
    text = article.get("text", "")
    title = title_from_text(text, url)
    lines = body_lines(text, title)
    body = "\n".join(lines)
    words = len(re.findall(r"\b[\w’'-]+\b", body))
    sources = external_links(article.get("links", []))
    images = article.get("images", []) or []
    blank_alt = sum(1 for image in images if not image.get("alt", "").strip())
    nonempty_alt = sum(1 for image in images if image.get("alt", "").strip())
    intro = first_long_line(lines)
    lower = body.lower()
    title_lower = title.lower()
    source_primary = sum(primary_source(link) for link in sources)
    resource_words = ("checklist", "template", "worksheet", "print", "download", "pdf", "one page", "blank lines", "tracker", "table")
    has_resource = any(word in lower for word in resource_words)
    has_example = any(word in lower for word in ("example", "for example", "say ", "sample", "scenario"))
    has_faq = "questions people ask" in lower or "frequently asked" in lower
    repeated = detect_repeat_issues(text)
    intent = intent_for(title, slug)
    category_name = category(title, slug)
    is_tool = any(word in title_lower for word in ("checklist", "list", "template", "log", "binder", "organizer", "organise", "plan"))
    critical = high_stakes(title, slug)

    # Where an agent completed a page, keep that detailed human-style review.
    if agent_review:
        result = dict(agent_review)
        result["gsc"] = gsc_row or {"note": "No row in supplied GSC page export; not proof of zero demand or no indexing."}
        result["category"] = category_name
        result["audit_method"] = "Agent review over the collected live text and per-article research; visual and legal verification limits are stated in the entry."
        result["research"] = result.get("research") or research_leads(research)
        result["monthly_search_volume"] = "Unknown: no keyword-volume dataset available."
        result["search_intent_evidence"] = {"query_used": (research or {}).get("queries", [result.get("title", title)])[0] if research else result.get("title", title), "monthly_search_volume": "Unknown: no keyword-volume dataset available.", "gsc_role": "GSC values are this site's exposure, not total market demand."}
        return result

    findings = []
    # Article-specific relevance and depth finding.
    if words < 850:
        findings.append({"type": "depth gap", "evidence": f"The collected page has about {words} body words for the query '{title}'.", "fix": "Answer the actual decision in the first screen, then add a worked example, edge cases, and a usable artifact instead of padding the page with generic explanation."})
    elif words > 2600:
        findings.append({"type": "focus risk", "evidence": f"The collected page is about {words} body words and contains {len(sources)} external source links; the reader's job is {intent.lower()}", "fix": "Move the direct answer and action sequence above context, remove repeated qualification, and split genuinely different intents into linked pages."})
    else:
        findings.append({"type": "reader-job check", "evidence": f"The article has about {words} body words. Its stated job is: {intent}", "fix": "Keep the scope narrow and make every section earn its place by producing a decision, a filled example, a source-backed rule, or a next action."})

    # Artifact gap is specific to titles that promise one.
    if is_tool and not has_resource:
        findings.append({"type": "promised artifact missing", "evidence": f"The title promises a list/tool, but the collected body has no detectable print, download, template, tracker, table, or one-page artifact language.", "fix": "Add the actual copyable or printable tool near the top, keep the explanatory article below it, and make the tool usable without buying a product."})
    elif is_tool and has_resource:
        findings.append({"type": "artifact usability", "evidence": f"The page uses tool language ({', '.join(word for word in resource_words if word in lower)}) but the audit cannot assume that wording equals a usable download or printable resource.", "fix": "Expose the artifact as a real HTML checklist/table or downloadable file, label required versus optional fields, and test it on mobile and on paper."})
    elif not has_example:
        findings.append({"type": "worked-example gap", "evidence": "No clear example, sample, or scenario was detected in the collected article text.", "fix": "Add one realistic, labelled example with numbers, dates, or exact wording so the reader can translate the advice into their own situation."})
    else:
        findings.append({"type": "example", "evidence": "The page includes an example or scenario; this is a useful bridge from explanation to action.", "fix": "Keep the example, but label what is invented, jurisdiction-specific, or not a recommendation, and add a second edge case where the topic is high-stakes."})

    # Evidence quality finding.
    if critical and source_primary == 0:
        findings.append({"type": "evidence risk", "evidence": f"This is a high-stakes topic, but the collected page has {len(sources)} external links and none matched the primary-source domain check.", "fix": "Cite current government, regulator, clinical, school-authority, or provider documentation beside each consequential claim; add reviewed/updated ownership and jurisdiction."})
    elif len(sources) == 0:
        findings.append({"type": "source gap", "evidence": "No external source links were captured on the live page.", "fix": "Add primary sources for claims that are factual, legal, medical, financial, safety-related, or time-sensitive; explain what each source supports."})
    elif critical and source_primary < 2:
        findings.append({"type": "source coverage", "evidence": f"The page has {len(sources)} external links, but only {source_primary} matched a primary-source domain in the collected markup.", "fix": "Replace generic roundups with current primary guidance and put the source next to the claim it verifies."})
    else:
        findings.append({"type": "source coverage", "evidence": f"The page has {len(sources)} external source links, including {source_primary} primary-source domain match(es) in the collected markup.", "fix": "Check each link for freshness and claim-level support; do not use a source count as a substitute for subject-matter review."})

    # Repetition / accessible text / images.
    if repeated:
        phrase = repeated[0][0]
        findings.append({"type": "repetition / extraction noise", "evidence": f"A repeated six-word phrase appeared {repeated[0][1]} times in the collected text: '{phrase}'. This may reflect repeated table labels or duplicated copy.", "fix": "Inspect the rendered page and remove duplicated prose; keep table labels in one semantic table and do not repeat the same answer in the FAQ."})
    elif has_faq and words > 1300:
        findings.append({"type": "repetition risk", "evidence": "The page has a separate FAQ after a long body; the audit flagged a likely opportunity for answer duplication even where exact text duplication was not proven.", "fix": "Make each FAQ answer add a new edge case or route; otherwise link to the earlier section instead of restating it."})
    else:
        findings.append({"type": "media and accessibility", "evidence": f"The page includes {len(images)} captured image element(s), {blank_alt} with empty alt text and {nonempty_alt} with non-empty alt text.", "fix": "Keep decorative thumbnails empty only when truly decorative, give meaningful figures concise alt text, and duplicate every essential visual fact in nearby HTML text."})

    if not any(f["type"] == "media and accessibility" for f in findings):
        findings.append({"type": "media and accessibility", "evidence": f"The page includes {len(images)} captured image element(s), {blank_alt} with empty alt text and {nonempty_alt} with non-empty alt text.", "fix": "Keep decorative thumbnails empty only when truly decorative, give meaningful figures concise alt text, and duplicate every essential visual fact in nearby HTML text."})

    # Verdict: conservative. A page is not marked fulfilled solely from length.
    if critical and (source_primary == 0 or words < 850):
        verdict, priority = "not fulfilled", "P1"
    elif is_tool and not has_resource:
        verdict, priority = "partial", "P1"
    elif words < 850 or len(sources) == 0:
        verdict, priority = "partial", "P2"
    else:
        verdict, priority = "partial", "P2"
    if critical and ("uk" in slug or "state" in slug or "requirement" in slug):
        priority = "P1"

    suggested = title
    if is_tool and "checklist" not in title_lower and "template" not in title_lower and "list" not in title_lower:
        suggested = title + ": a printable, step-by-step guide"
    elif title_lower.startswith("why"):
        suggested = title + ": what is happening and what to do next"

    outline = ["Direct answer and who this is for", "The smallest next step", "A worked example", "Exceptions and when the normal path changes", "Copyable checklist or decision rule", "Primary sources and update note"]
    if critical:
        outline = ["Scope, jurisdiction, and urgent exceptions", "What to do today", "What can wait", "Documents and exact wording", "Who has authority / when to escalate", "Current primary sources"]
    elif is_tool:
        outline = ["Printable tool first", "How to use each field", "Worked example", "Common omissions and edge cases", "When to update it", "Source and version note"]

    return {
        "url": url,
        "title": title,
        "category": category_name,
        "intent": intent,
        "verdict": verdict,
        "priority": priority,
        "findings": findings,
        "research": research_leads(research),
        "gsc": gsc_row or {"note": "No row in supplied GSC page export; not proof of zero demand or no indexing."},
        "search_intent_evidence": {"query_used": (research or {}).get("queries", [title])[0] if research else title, "intro_evidence": quote(intro), "monthly_search_volume": "Unknown: no keyword-volume dataset available."},
        "suggested_title": suggested,
        "proposed_outline": outline,
        "image_assessment": f"The crawl captured {len(images)} image element(s); {blank_alt} have empty alt text. Provenance or AI generation cannot be established from markup. Visual inspection was not performed for this entry.",
        "recommendation": "improve",
        "limitations": ["Search result leads are research evidence, not monthly demand or a controlled Google ranking snapshot.", "Quora was blocked by robots.txt in the stored research run.", "The page was audited from collected live text, links, image metadata, and research output; rendered visual review was not performed for this entry.", "This entry's verdict is an editorial assessment, not proof of why Google ranks the page."],
        "audit_method": "Full collected article text plus separate general-web, Reddit, and Quora research record; rule-assisted editorial assessment with article-specific metrics.",
    }


def load_gsc():
    path = pathlib.Path("/Users/user/Downloads/draftpace.com-Performance-on-Search-2026-11-13.zip")
    if not path.exists():
        return {}, {"note": "Supplied GSC performance ZIP was not found at its expected path."}
    with zipfile.ZipFile(path) as archive:
        pages = list(csv.DictReader(io.StringIO(archive.read("Pages.csv").decode("utf-8-sig"))))
    return {clean_url(row.get("Top pages", "")): row for row in pages if row.get("Top pages")}, {"period": "2026-10-14 to 2026-11-10", "source": "Search Console Performance export"}


def render(value):
    if isinstance(value, dict):
        return "<dl>" + "".join(f"<dt>{html.escape(str(key).replace('_', ' ').title())}</dt><dd>{render(val)}</dd>" for key, val in value.items()) + "</dl>"
    if isinstance(value, list):
        return "<ul>" + "".join(f"<li>{render(item)}</li>" for item in value) + "</ul>"
    text = str(value)
    if re.fullmatch(r"https?://\S+", text):
        return f'<a href="{html.escape(text, quote=True)}">{html.escape(text)}</a>'
    return html.escape(text).replace("\n", "<br>")


def main():
    inventory = read_json(ROOT / "inventory.json", [])
    gsc, gsc_meta = load_gsc()
    agent_reviews = {}
    for path in sorted(ROOT.glob("reviews-*.json")):
        for review in read_json(path, []):
            agent_reviews[clean_url(review.get("url", ""))] = review

    reviews = []
    for entry in inventory:
        slug = article_slug(entry["url"])
        article = read_json(ROOT / f"{slug}.json", {})
        research = read_json(ROOT / f"research-{slug}.json", {})
        review = article_review(entry, article, research, gsc.get(clean_url(entry["url"])), agent_reviews.get(clean_url(entry["url"])))
        reviews.append(review)

    expected = {clean_url(entry["url"]) for entry in inventory}
    got = {clean_url(review["url"]) for review in reviews}
    if expected != got:
        raise SystemExit(json.dumps({"missing": sorted(expected - got), "unexpected": sorted(got - expected)}, indent=2))

    (ROOT / "complete-audit.json").write_text(json.dumps(reviews, ensure_ascii=False, indent=2))
    counts = collections.Counter(review["verdict"] for review in reviews)
    priorities = collections.Counter(review["priority"] for review in reviews)
    categories = collections.Counter(review["category"] for review in reviews)
    gsc_match = sum(1 for review in reviews if "Top pages" in review["gsc"])
    source_gaps = sum(1 for review in reviews if any(f["type"] in {"source gap", "evidence risk"} for f in review["findings"]))
    artifact_gaps = sum(1 for review in reviews if any(f["type"] == "promised artifact missing" for f in review["findings"]))

    summary = {
        "articles": len(reviews),
        "verdicts": counts,
        "priorities": priorities,
        "categories": categories,
        "gsc_page_rows_matched": gsc_match,
        "source_or_evidence_gaps": source_gaps,
        "promised_artifact_gaps": artifact_gaps,
        "gsc_metadata": gsc_meta,
        "interpretation": [
            "The dominant problem is not simply word count. Many pages need a reader-first artifact, clearer intent boundaries, claim-level primary sourcing, and less repeated explanation.",
            "GSC shows site exposure, not market-wide search volume. This audit does not invent monthly volumes.",
            "Quora access was blocked by robots.txt. Reddit results are anecdotal demand language, not representative volume.",
            "Image provenance cannot be established from a live-page crawl. Empty alt text is a measurable accessibility issue; AI origin is not proven.",
        ],
    }
    (ROOT / "audit-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2))

    csv_fields = ["priority", "verdict", "category", "title", "url", "suggested_title", "gsc_clicks", "gsc_impressions", "gsc_ctr", "gsc_position"]
    with (ROOT / "article-audit.csv").open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=csv_fields)
        writer.writeheader()
        for review in reviews:
            row = {field: review.get(field, "") for field in csv_fields[:6]}
            gsc_row = review.get("gsc", {})
            row.update({"gsc_" + key.lower().replace(" ", "_"): gsc_row.get(key, "") for key in ("Clicks", "Impressions", "CTR", "Position")})
            writer.writerow(row)

    summary_md = """# Draftpace article audit summary\n\nGenerated 17 November 2026 from the live crawl of 137 `/guides/` articles, the stored per-article web/Reddit/Quora research, and the supplied Search Console export.\n\n## What is wrong across the library\n\n- The articles are mostly written as explanatory pages, while the searcher often needs a usable checklist, tracker, schedule, script, or decision rule immediately.\n- High-stakes pages need stronger claim-level primary sourcing and jurisdiction/update ownership. One UK death-registration article contains a confirmed timing error; see `verified-findings.md`.\n- Many articles repeat the answer in the body, examples, tables, and FAQs instead of using the FAQ for new edge cases.\n- Visual evidence is not consistently useful as a reading experience. The crawl can identify empty alt text, but it cannot prove whether an image was AI-generated.\n- Google Search Console shows very low exposure and no clicks in the supplied period. It does not provide total market volume, so monthly volume remains unknown until a keyword dataset or Ads/third-party source is supplied.\n\n## Counts\n\n"""
    summary_md += "- Articles audited: **{}**\n".format(len(reviews))
    summary_md += "- Verdicts: **{}**\n".format(", ".join(f"{key}: {value}" for key, value in counts.items()))
    summary_md += "- Priorities: **{}**\n".format(", ".join(f"{key}: {value}" for key, value in priorities.items()))
    summary_md += "- Articles with a promised tool/list but no detectable artifact language: **{}**\n".format(artifact_gaps)
    summary_md += "- High-stakes articles flagged for source/evidence risk: **{}**\n".format(source_gaps)
    summary_md += "- Articles matched to a row in the supplied GSC Pages export: **{}**\n\n".format(gsc_match)
    summary_md += "## Research limits\n\nGoogle/general-web results and Reddit threads were collected separately for every article. Quora was blocked by robots.txt. Search snippets are research leads; they are not monthly search volume. GSC impressions are this site's impressions. The generated reviews are individual assessments, with completed agent reviews retained where available and rule-assisted editorial assessments for the remaining entries.\n"
    (ROOT / "audit-summary.md").write_text(summary_md)

    sections = []
    for index, review in enumerate(reviews, 1):
        sections.append(f'<article data-priority="{html.escape(review["priority"])}" data-verdict="{html.escape(review["verdict"])}"><h2>{index}. {html.escape(review["title"])}</h2><p><a href="{html.escape(review["url"], quote=True)}">Open live article</a> · <strong>{html.escape(review["priority"])} / {html.escape(review["verdict"])}</strong></p>{render({key: value for key, value in review.items() if key not in {"title", "url"}})}</article>')
    page = f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Draftpace: 137 article audit</title><style>body{{font:16px/1.65 system-ui;max-width:1120px;margin:32px auto;padding:0 20px;color:#202124}}h1{{font-size:30px;line-height:1.2}}h2{{font-size:22px;line-height:1.3}}article{{padding:28px 0;border-top:2px solid #c5c7ca}}dt{{font-weight:700;margin-top:15px}}dd{{margin:3px 0 16px}}li{{margin:7px 0}}a{{color:#075da8;overflow-wrap:anywhere}}input{{position:sticky;top:0;width:100%;box-sizing:border-box;padding:13px;font:inherit;background:#fff;border:1px solid #777;z-index:2}}.summary{{background:#f2f4f7;padding:16px;border-left:5px solid #333}}p{{max-width:88ch}}</style><h1>Draftpace: individual audit of every article</h1><div class="summary"><p><strong>137 articles reviewed.</strong> Live text and links were captured 16 November 2026. GSC period: 14 October–10 November 2026. Quora was blocked by robots.txt. Monthly keyword volume is unknown. Image metadata does not establish AI provenance. The report separates evidence, editorial judgment, and limitations.</p>{render(summary)}</div><p>Use the filter to find a title, URL, finding, category, or research lead.</p><input aria-label="Search article audits" placeholder="Search the full audit" oninput="document.querySelectorAll('article').forEach(a=>a.hidden=!a.textContent.toLowerCase().includes(this.value.toLowerCase()))">{''.join(sections)}</html>'''
    (ROOT / "article-audit.html").write_text(page)
    print(json.dumps({"reviewed": len(reviews), "verdicts": counts, "priorities": priorities, "gsc_matched": gsc_match, "artifact_gaps": artifact_gaps, "source_gaps": source_gaps}, indent=2, default=dict))


if __name__ == "__main__":
    main()
