import {readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
import {readFileSync,existsSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {root,base,posts,renderPost,articleBody} from './posts.mjs';
import {frontMatter,markdown} from './markdown.mjs';
const source=join(root,'src'),content=join(root,'content'),out=join(root,'dist');
// Buttondown account name for the email subscribe form. The form is hidden until this is set.
const buttondown=process.env.BUTTONDOWN_USERNAME || 'inseon';

const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const day=d=>new Date(d+'T12:00:00Z');
const monthYear=d=>day(d).toLocaleDateString('en-US',{month:'short',year:'numeric',timeZone:'UTC'});
const fullDate=d=>day(d).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'});
const chevron='<svg class="chevron" aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
const downloadIcon='<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/></svg>';

function page(name){
 const file=join(content,name+'.md');
 const {data,body}=frontMatter(readFileSync(file,'utf8'));
 // A <br> in a page's # heading splits it into a dark first line and a grey second line.
 const html=markdown(body).replace(/<h1>([\s\S]*?)<br>([\s\S]*?)<\/h1>/,'<h1>$1<span class="sub">$2</span></h1>');
 return {data,html};
}
// Wraps each <h2> and what follows it in a <section>.
function sections(html){
 return html.split(/(?=<h2>)/).map(s=>s.startsWith('<h2>')?`<section class="section">${s}</section>`:s).join('');
}
function postList(list){
 if(!list.length)return '<p class="empty">No posts yet.</p>';
 return `<ul class="post-list">${list.map(p=>`<li><a href="/writing/${p.slug}/"><span class="post-text"><span class="post-title">${escape(p.title)}</span>${p.summary?`<span class="post-summary">${escape(p.summary)}</span>`:''}</span><time datetime="${p.date}">${monthYear(p.date)}</time>${chevron}</a></li>`).join('')}</ul>`;
}
// Links to PDFs become download buttons; the link title, if any, is the saved file name.
const downloads=html=>html.replace(/<a href="([^"]+\.pdf)"(?: title="([^"]*)")?>([\s\S]*?)<\/a>/g,(_,href,name,label)=>`<a class="button button-outline" href="${href}" download${name?`="${name}"`:''}>${downloadIcon}${label}</a>`);

const subscribe=buttondown?`<form class="subscribe" action="https://buttondown.com/api/emails/embed-subscribe/${buttondown}" method="post" target="_blank"><h2>Get new posts by email</h2><div class="subscribe-row"><label for="subscribe-email" class="visually-hidden">Email address</label><input id="subscribe-email" type="email" name="email" placeholder="you@example.com" autocomplete="email" required><input type="hidden" name="embed" value="1"><button class="button" type="submit">Subscribe</button></div><p class="subscribe-alt">Or follow with <a href="/feed.xml">RSS</a>.</p></form>`:`<p class="subscribe-alt">Follow new posts with <a href="/feed.xml">RSS</a>.</p>`;

// The resume is a single PDF made from targeted-resumes/ (npm run resume). Without it its icon is left out.
const resumeFile=join(source,'resumes','stella-hwang.pdf');
const hasResume=existsSync(resumeFile);
const iconPath={
 github:'M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2a11.500 11.500 0 0 1 6 0C17.300 4.700 18.300 5 18.300 5c.7 1.600.2 2.900.1 3.200.8.800 1.200 1.900 1.200 3.200 0 4.600-2.800 5.600-5.500 5.900.4.400.8 1.100.8 2.200v3.300c0 .3.2.7.8.6A12 12 0 0 0 12 .3',
 linkedin:'M20.400 20.500h-3.600v-5.600c0-1.300 0-3-1.900-3-1.800 0-2.100 1.400-2.100 2.900v5.700H9.300V9h3.400v1.600c.5-.9 1.600-1.900 3.400-1.900 3.600 0 4.300 2.400 4.300 5.500v6.300zM5.300 7.400a2.100 2.100 0 1 1 0-4.100 2.100 2.100 0 0 1 0 4.100zm1.800 13.100H3.600V9h3.500v11.500z'
};
const icon=d=>`<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="${d}"/></svg>`;
const profileLinks=[
 ...(hasResume?[['Resume (PDF)','/resumes/stella-hwang.pdf',downloadIcon,' download="Stella-Hwang-Resume.pdf"']]:[]),
 ['GitHub','https://github.com/inthree3',icon(iconPath.github),' rel="noopener"'],
 ['LinkedIn','https://linkedin.com/in/inseonhwang',icon(iconPath.linkedin),' rel="noopener"']
].map(([label,href,svg,extra])=>`<a href="${href}" aria-label="${label}" title="${label}"${extra}>${svg}</a>`).join('');

const home=page('home');
const [homeHead,homeRest='']=home.html.split(/(?=<h2>)/);
const [homeTitle,homeIntro]=[homeHead.match(/<h1>[\s\S]*?<\/h1>/)?.[0]??'',homeHead.replace(/<h1>[\s\S]*?<\/h1>/,'')];
const homeHtml=`<section class="hero">${homeTitle}</section>
<section class="about"><div class="lead">${homeIntro}</div><div class="profile">${home.data.portrait?`<img class="portrait" src="${home.data.portrait}" alt="${escape(home.data.portrait_alt||'')}" loading="lazy" decoding="async">`:''}<p class="profile-links">${profileLinks}</p></div></section>
${sections(homeRest).replace('<section class="section">','<section class="section topics" id="thinking">')}
<section class="section"><div class="section-heading"><h2>Writing</h2><a href="/writing/">All writing</a></div>${postList(posts.slice(0,3))}</section>`;


const writing=page('writing'),contact=page('contact'),missing=page('404');
const pages=[
 {id:'home',route:'',data:home.data,html:homeHtml},
 {id:'writing',route:'writing/',data:writing.data,html:`<div class="page-head">${writing.html}</div>${postList(posts)}${subscribe}`},
 {id:'contact',route:'contact/',data:contact.data,html:downloads(sections(contact.html))},
 ...posts.map(p=>({id:'writing',route:`writing/${p.slug}/`,post:p,data:{title:`${p.title} | Stella Hwang`,description:p.description,image:p.image,image_alt:p.image_alt},
  html:`<article class="article"><a class="back-link" href="/writing/">${chevron}Back to writing</a><header class="article-head"><h1>${escape(p.title)}</h1><p class="byline"><time datetime="${p.date}">${fullDate(p.date)}</time></p></header><div class="prose">${downloads(renderPost(p))}</div></article>${subscribe}`})),
 {id:'404',route:'404.html',data:missing.data,html:missing.html}
];

const nav=[['home','Home','/'],['writing','Writing','/writing/'],['contact','Contact','/contact/']];
const template=await readFile(join(source,'template.html'),'utf8');
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
await cp(join(source,'assets'),join(out,'assets'),{recursive:true});
if(hasResume)await cp(resumeFile,join(out,'resumes','stella-hwang.pdf'));
// Images and files that sit next to a post's index.md are published under /writing/<slug>/.
for(const p of posts.filter(p=>p.folder))await cp(p.folder,join(out,'writing',p.slug),{recursive:true,filter:f=>!f.endsWith('.md')});

// Width and height for local images, so the page does not jump while they load.
function imageSize(file){
 const b=readFileSync(file);
 if(b.subarray(1,4).toString()==='PNG')return [b.readUInt32BE(16),b.readUInt32BE(20)];
 if(b.subarray(0,3).toString()==='GIF')return [b.readUInt16LE(6),b.readUInt16LE(8)];
 if(b[0]===0xff&&b[1]===0xd8){
  for(let i=2;i<b.length-9;){
   if(b[i]!==0xff){i++;continue;}
   const m=b[i+1];
   if(m>=0xc0&&m<=0xcf&&![0xc4,0xc8,0xcc].includes(m))return [b.readUInt16BE(i+7),b.readUInt16BE(i+5)];
   i+=2+b.readUInt16BE(i+2);
  }
 }
 if(b.subarray(8,12).toString()==='WEBP'){
  const kind=b.subarray(12,16).toString();
  if(kind==='VP8X')return [1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)];
  if(kind==='VP8 ')return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff];
  if(kind==='VP8L'){const n=b.readUInt32LE(21);return [1+(n&0x3fff),1+((n>>14)&0x3fff)];}
 }
 return null;
}
const sized=html=>html.replace(/<img\b[^>]*>/g,tag=>{
 const src=tag.match(/\ssrc="(\/[^"]+)"/)?.[1];
 if(!src||/\swidth=/.test(tag))return tag;
 const file=join(out,decodeURI(src.split(/[?#]/)[0]));
 const size=existsSync(file)&&imageSize(file);
 return size?tag.replace(/^<img/,`<img width="${size[0]}" height="${size[1]}"`):tag;
});

// Link-preview tags (LinkedIn, Slack, X, KakaoTalk...) are written into every page's <head> at build time.
// Image: front matter `image` (path or URL), else a post's first image, else the default portrait.
const defaultImage='/assets/stella-hwang.png';
const absolute=u=>/^https?:/.test(u)?u:base+u;
function meta(p){
 for(const key of ['title','description'])if(!p.data[key])throw new Error(`Page "/${p.route}" needs "${key}" in its front matter`);
 const image=p.data.image||(p.post&&renderPost(p.post).match(/<img\b[^>]*\ssrc="(\/[^"]+)"/)?.[1])||defaultImage;
 const file=!/^https?:/.test(image)&&join(out,decodeURI(image.split(/[?#]/)[0]));
 if(file&&!existsSync(file))throw new Error(`Page "/${p.route}": preview image ${image} does not exist`);
 const size=file&&imageSize(file);
 const url=p.id==='404'?null:`${base}/${p.route}`;
 const tags=[
  ['og:type',p.post?'article':'website'],['og:site_name','Stella Hwang'],['og:title',p.data.title],['og:description',p.data.description],
  ['og:url',url],['og:image',absolute(image)],['og:image:width',size?.[0]],['og:image:height',size?.[1]],['og:image:alt',p.data.image_alt||p.data.title],
  ['article:published_time',p.post?.date],['twitter:card',image===defaultImage?'summary':'summary_large_image']
 ].filter(([,v])=>v!=null&&v!=='');
 return [
  ...(url?[`<link rel="canonical" href="${url}">`]:['<meta name="robots" content="noindex">']),
  ...tags.map(([k,v])=>`<meta ${k.startsWith('twitter:')?'name':'property'}="${k}" content="${escape(v)}">`)
 ].join('\n');
}

for(const p of pages){
 const navigation=nav.map(([id,label,url])=>`<a href="${url}" data-key="${id}"${id===p.id?' aria-current="page"':''}>${label}</a>`).join('\n');
 const html=template.replaceAll('{{title}}',escape(p.data.title)).replaceAll('{{description}}',escape(p.data.description)).replace('{{meta}}',()=>meta(p)).replace('{{page}}',p.id).replace('{{navigation}}',navigation).replace('{{content}}',()=>sized(p.html));
 const target=join(out,p.route.endsWith('.html')?p.route:p.route+'index.html');await mkdir(dirname(target),{recursive:true});await writeFile(target,html);
}
const items=await Promise.all(posts.map(async a=>{const body=await articleBody(a.slug);const url=`${base}/writing/${a.slug}/`;return `<item><title>${escape(a.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${day(a.date).toUTCString()}</pubDate><description>${escape(a.description)}</description><content:encoded><![CDATA[${body}]]></content:encoded></item>`;}));
await writeFile(join(out,'feed.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Stella Hwang: Writing</title><link>${base}/writing/</link><atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/><description>Notes by Stella Hwang.</description><language>en</language>${items.join('')}</channel></rss>\n`);
await writeFile(join(out,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
await writeFile(join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.filter(p=>p.id!=='404').map(p=>`<url><loc>${base}/${p.route}</loc></url>`).join('')}</urlset>\n`);
await writeFile(join(out,'_headers'),`/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self' https://buttondown.com; frame-ancestors 'none'
/resumes/*
  Content-Type: application/pdf
  Content-Disposition: attachment
`);
console.log(`Built ${pages.length} pages and feed.xml from ${posts.length} post${posts.length===1?'':'s'} in dist/.${buttondown?'':' Email form off: set BUTTONDOWN_USERNAME.'}`);
