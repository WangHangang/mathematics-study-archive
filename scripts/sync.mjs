import { mkdir, rm, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';

const endpoint='https://academic-portfolio.william-hg1216.chatgpt.site/api/mirror/content';
const response=await fetch(endpoint,{headers:{'user-agent':'mathematics-study-archive-sync'}});
if(!response.ok)throw new Error(`Mirror manifest failed: ${response.status}`);
const data=await response.json();
await rm('mirror-assets',{recursive:true,force:true});await mkdir('mirror-assets',{recursive:true});
const safe=s=>String(s).replace(/[^a-z0-9.-]+/gi,'-').replace(/^-|-$/g,'').toLowerCase();
async function copy(url,slug,label){if(!url)return url;const parsed=new URL(url);if(parsed.origin!==new URL(data.source).origin)return url;const res=await fetch(url);if(!res.ok)throw new Error(`Asset failed ${res.status}: ${url}`);const type=res.headers.get('content-type')||'';const guessed=type.includes('pdf')?'.pdf':type.includes('png')?'.png':type.includes('jpeg')?'.jpg':type.includes('webp')?'.webp':extname(parsed.pathname)||'.bin';const file=`mirror-assets/${safe(slug)}-${label}${guessed}`;await writeFile(file,Buffer.from(await res.arrayBuffer()));return `./${file}`}
for(const d of data.documents||[]){d.pdf=await copy(d.pdf,d.slug,'main');if(d.alternatePdf)d.alternatePdf=await copy(d.alternatePdf,d.slug,'alternate');if(d.cover)d.cover=await copy(d.cover,d.slug,'cover');if(d.latexSources)for(let i=0;i<d.latexSources.length;i++)d.latexSources[i].href=await copy(d.latexSources[i].href,d.slug,`source-${i+1}`)}
await writeFile('content.json',JSON.stringify(data,null,2)+'\n');
