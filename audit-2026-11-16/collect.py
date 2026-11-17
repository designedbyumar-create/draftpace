import concurrent.futures, json, pathlib, urllib.request, xml.etree.ElementTree as ET
from html.parser import HTMLParser

root = pathlib.Path(__file__).parent
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts=[]; self.skip=0; self.images=[]; self.links=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag in ('script','style'): self.skip+=1
        if tag=='img': self.images.append(a)
        if tag=='a' and a.get('href'): self.links.append(a['href'])
    def handle_endtag(self, tag):
        if tag in ('script','style'): self.skip=max(0,self.skip-1)
    def handle_data(self, data):
        if not self.skip and data.strip(): self.parts.append(data.strip())

tree=ET.parse('/private/tmp/draftpace-sitemap.xml')
urls=[n.text for n in tree.findall('.//{*}loc') if '/guides/' in n.text][8:]
def fetch(url):
    slug=url.rsplit('/',1)[1]
    try:
        with urllib.request.urlopen(url,timeout=30) as response: html=response.read().decode()
        p=Page(); p.feed(html)
        record={'url':url,'text':'\n'.join(p.parts),'images':p.images,'links':p.links}
        (root/(slug+'.json')).write_text(json.dumps(record,ensure_ascii=False,indent=2))
        return {'url':url,'status':'downloaded','characters':len(record['text'])}
    except Exception as e: return {'url':url,'status':'failed','error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: results=list(pool.map(fetch,urls))
(root/'inventory.json').write_text(json.dumps(results,indent=2))
print(json.dumps({'total':len(results),'downloaded':sum(x['status']=='downloaded' for x in results),'failed':[x for x in results if x['status']=='failed']}))
