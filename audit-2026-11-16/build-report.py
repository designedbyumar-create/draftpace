import html, json, pathlib

root=pathlib.Path(__file__).parent
entries=json.loads((root/'inventory.json').read_text())
sections=[]
for entry in entries:
    slug=entry['url'].rsplit('/',1)[1]
    article=json.loads((root/(slug+'.json')).read_text())
    research_path=root/('research-'+slug+'.json')
    research=json.loads(research_path.read_text()) if research_path.exists() else None
    title=article['text'].splitlines()[0]
    sources=list(dict.fromkeys(x for x in article['links'] if x.startswith('http') and 'draftpace.com' not in x))
    sources_html=''.join('<li><a href="'+html.escape(x,quote=True)+'">'+html.escape(x)+'</a></li>' for x in sources)
    research_text=research['result'] if research and isinstance(research['result'],str) else json.dumps(research,indent=2)
    sections.append('<article><h2>'+html.escape(title)+'</h2><a href="'+html.escape(entry['url'])+'">Live article</a><p><strong>Editorial verdict: pending.</strong> Full text collected; '+('independent search evidence collected.' if research else 'search pending.')+'</p><details><summary>Full article text</summary><pre>'+html.escape(article['text'])+'</pre></details><details><summary>Article source links</summary><ul>'+sources_html+'</ul></details><details><summary>Independent search evidence and limitations</summary><pre>'+html.escape(research_text)+'</pre></details></article>')
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Draftpace article audit evidence</title><style>body{font:16px/1.6 system-ui;margin:32px auto;max-width:1000px;padding:0 20px;color:#222}article{border-top:1px solid #bbb;padding:24px 0}h2{font-size:21px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.6 system-ui}a{color:#165ca0}summary{cursor:pointer;font-weight:600;padding:10px 0}input{box-sizing:border-box;width:100%;padding:12px;font:inherit;position:sticky;top:0;background:white}</style><h1>Draftpace: 137-article evidence inventory</h1><p>Work in progress, November 16, 2026. This is the collected evidence, not a completed editorial audit. Search results are research leads, not verified Google rankings or keyword-volume measurements. Quora access is restricted. Individual verdicts remain pending.</p><input aria-label="Filter articles" placeholder="Find an article by title or content" oninput="document.querySelectorAll('article').forEach(a=>a.hidden=!a.textContent.toLowerCase().includes(this.value.toLowerCase()))">'''+''.join(sections)+'</html>'
(root/'evidence.html').write_text(page)
print('Built evidence inventory for '+str(len(entries))+' articles.')
