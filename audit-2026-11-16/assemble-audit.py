import collections, csv, html, io, json, pathlib, zipfile

root = pathlib.Path(__file__).parent
inventory = json.loads((root / 'inventory.json').read_text())
with zipfile.ZipFile('/Users/user/Downloads/draftpace.com-Performance-on-Search-2026-11-13.zip') as z:
    pages = list(csv.DictReader(io.StringIO(z.read('Pages.csv').decode('utf-8-sig'))))
gsc = {p['Top pages'].rstrip('/'): p for p in pages}
reviews = []
for file in sorted(root.glob('reviews-*.json')):
    reviews.extend(json.loads(file.read_text()))
counts = collections.Counter(r['url'] for r in reviews)
expected = {r['url'] for r in inventory}
missing = expected - set(counts)
duplicates = [u for u, n in counts.items() if n != 1]
unexpected = set(counts) - expected
if missing or duplicates or unexpected:
    raise SystemExit(json.dumps({'missing': sorted(missing), 'duplicates': duplicates, 'unexpected': sorted(unexpected)}, indent=2))
for review in reviews:
    review['gsc'] = gsc.get(review['url'].rstrip('/'), {'note': 'No row in supplied page export; not proof of zero demand or no indexing.'})
    review['monthly_search_volume'] = 'Unknown: no keyword-volume dataset available.'
    for field in ['title','intent','verdict','priority','findings','research','suggested_title','proposed_outline','image_assessment','recommendation','limitations']:
        if not review.get(field): raise ValueError(f"Missing {field}: {review['url']}")
    if len(review['findings']) < 3: raise ValueError('Fewer than 3 findings: '+review['url'])
(root/'complete-audit.json').write_text(json.dumps(reviews, ensure_ascii=False, indent=2))
def render(value):
    if isinstance(value, dict): return '<dl>'+''.join('<dt>'+html.escape(str(k).replace('_',' ').title())+'</dt><dd>'+render(v)+'</dd>' for k,v in value.items())+'</dl>'
    if isinstance(value, list): return '<ul>'+''.join('<li>'+render(v)+'</li>' for v in value)+'</ul>'
    text=str(value)
    if text.startswith('https://') and ' ' not in text: return '<a href="'+html.escape(text,quote=True)+'">'+html.escape(text)+'</a>'
    return html.escape(text)
sections=[]
for index, r in enumerate(reviews,1):
    sections.append('<article><h2>'+str(index)+'. '+html.escape(r['title'])+'</h2><p><a href="'+html.escape(r['url'])+'">Live article</a></p>'+render({k:v for k,v in r.items() if k not in ('title','url')})+'</article>')
summary=dict(collections.Counter(r['verdict'] for r in reviews))
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Draftpace individual article audit</title><style>body{font:16px/1.65 system-ui;max-width:1100px;margin:32px auto;padding:0 20px;color:#202124}h1{font-size:30px}h2{font-size:23px}article{padding:28px 0;border-top:2px solid #bbb}dt{font-weight:700;margin-top:16px}dd{margin:4px 0 16px 0}li{margin:8px 0}a{color:#125da5;overflow-wrap:anywhere}input{position:sticky;top:0;width:100%;box-sizing:border-box;padding:14px;font:inherit;background:white;border:1px solid #888}p{max-width:85ch}</style><h1>Draftpace: individual review of every article</h1><p>137 articles. Research and text captured November 16, 2026. GSC period: October 14–November 10. Search evidence is general web discovery, not a location-controlled Google ranking capture. Quora blocks the research tool. Monthly keyword volume is unknown. Visual inspection limits are stated per article; image metadata does not establish image provenance. Findings are editorial assessments, not proof of what caused Google's rankings.</p>'''+render(summary)+'''<input aria-label="Search article audits" placeholder="Search title, finding, keyword, or URL" oninput="document.querySelectorAll('article').forEach(a=>a.hidden=!a.textContent.toLowerCase().includes(this.value.toLowerCase()))">'''+''.join(sections)+'</html>'
(root/'article-audit.html').write_text(page)
print(json.dumps({'reviewed':len(reviews),'verdicts':summary,'matched_gsc':sum('Top pages' in r['gsc'] for r in reviews)}))
