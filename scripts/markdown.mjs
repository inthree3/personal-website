// A small Markdown renderer with no dependencies. It covers what Notion exports and what posts here use:
// headings, paragraphs, line breaks, bold, italic, strikethrough, inline code, links, images (a lone image becomes a
// figure, its "title" the caption), ordered and unordered lists (nested by indentation), task lists, blockquotes,
// fenced code, tables, horizontal rules, and raw HTML lines such as <details> and <summary>.

const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const attr=s=>esc(s).replaceAll('"','&quot;');

/** Splits "---" front matter from the body. Values are strings, except true/false. */
export function frontMatter(src){
 src=src.replace(/^﻿/,'').replace(/\r\n?/g,'\n');
 const m=src.match(/^---\n([\s\S]*?)\n---\n?/);
 if(!m)return {data:{},body:src};
 const data={};
 for(const line of m[1].split('\n')){
  const kv=line.match(/^([\w-]+)\s*:\s*(.*)$/);if(!kv)continue;
  let v=kv[2].trim();
  if(/^(["']).*\1$/.test(v))v=v.slice(1,-1);
  data[kv[1]]=v==='true'?true:v==='false'?false:v;
 }
 return {data,body:src.slice(m[0].length)};
}

export function inline(text,opts={}){
 const keep=[];
 const hold=html=>{keep.push(html);return `\u0000${keep.length-1}\u0000`;};
 text=text.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g,(_,__,c)=>hold(`<code>${esc(c.trim())}</code>`));
 // Raw inline tags like <br> pass through; any other < or & is escaped.
 text=text.replace(/<\/?[a-zA-Z][^<>]*>/g,t=>hold(t));
 text=text.replace(/&(?!#?\w+;)/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 const url=u=>attr(opts.url?opts.url(u):u);
 text=text.replace(/!\[([^\]]*)\]\(<?([^)\s>]+)>?(?:\s+"([^"]*)")?\)/g,(_,alt,src,title)=>hold(`<img src="${url(src)}" alt="${attr(alt)}"${title?` title="${attr(title)}"`:''} loading="lazy" decoding="async">`));
 text=text.replace(/\[([^\]]+)\]\(<?([^)\s>]+)>?(?:\s+"([^"]*)")?\)/g,(_,label,href,title)=>{
  const external=/^https?:/.test(href);
  return hold(`<a href="${url(href)}"${title?` title="${attr(title)}"`:''}${external?' rel="noopener"':''}>`)+label+hold('</a>');
 });
 text=text.replace(/(^|[^\w<])(https?:\/\/[^\s<)]+[^\s<).,!?;:'"])/g,(_,pre,u)=>`${pre}${hold(`<a href="${attr(u)}" rel="noopener">${esc(u)}</a>`)}`);
 text=text.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g,'<strong>$1</strong>').replace(/__(?=\S)([\s\S]*?\S)__/g,'<strong>$1</strong>');
 text=text.replace(/(^|[^\w*])\*(?=\S)([\s\S]*?\S)\*(?![\w*])/g,'$1<em>$2</em>').replace(/(^|[^\w_])_(?=\S)([\s\S]*?\S)_(?![\w_])/g,'$1<em>$2</em>');
 text=text.replace(/~~(?=\S)([\s\S]*?\S)~~/g,'<del>$1</del>');
 // Restore held pieces; a held piece may itself contain markers of earlier ones.
 for(let i=0;i<3&&text.includes('\u0000');i++)text=text.replace(/\u0000(\d+)\u0000/g,(_,n)=>keep[n]);
 return text;
}

const isFence=l=>/^\s*(```|~~~)/.test(l);
const isHeading=l=>/^#{1,6}\s/.test(l);
const isRule=l=>/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(l);
const isQuote=l=>/^\s{0,3}>/.test(l);
const isItem=l=>/^\s*([-*+]|\d+[.)])\s+/.test(l);
const ordered=l=>/^\s*\d/.test(l);
const isHtml=l=>/^\s*<\/?(details|summary|div|figure|figcaption|section|aside|table|thead|tbody|tr|td|th|video|iframe|picture|source|p|br|hr|h[1-6]|ul|ol|li|pre|blockquote)\b/i.test(l);
const isTableStart=(l,next)=>/\|/.test(l)&&next!==undefined&&/^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(next);
const indent=l=>l.match(/^\s*/)[0].replace(/\t/g,'    ').length;
const cells=l=>l.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').map(c=>c.trim());

export function markdown(src,opts={}){
 const lines=src.replace(/\r\n?/g,'\n').split('\n');
 const out=[];
 let i=0;
 const blockStart=(l,next)=>isFence(l)||isHeading(l)||isRule(l)||isQuote(l)||isItem(l)||isHtml(l)||isTableStart(l,next);
 while(i<lines.length){
  const line=lines[i];
  if(!line.trim()){i++;continue;}
  if(isFence(line)){
   const mark=line.trim().slice(0,3);const lang=line.trim().slice(3).trim();const code=[];i++;
   while(i<lines.length&&!lines[i].trim().startsWith(mark))code.push(lines[i++]);
   i++;
   out.push(`<pre><code${lang?` class="language-${attr(lang)}"`:''}>${esc(code.join('\n'))}</code></pre>`);continue;
  }
  const h=line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
  if(h){out.push(`<h${h[1].length}>${inline(h[2],opts)}</h${h[1].length}>`);i++;continue;}
  if(isRule(line)){out.push('<hr>');i++;continue;}
  if(isHtml(line)){
   // Raw HTML runs until a blank line, so Markdown can sit inside <details> after a blank line.
   while(i<lines.length&&lines[i].trim())out.push(lines[i++]);
   continue;
  }
  if(isQuote(line)){
   const q=[];
   while(i<lines.length&&lines[i].trim()&&(isQuote(lines[i])||!blockStart(lines[i])))q.push(lines[i++].replace(/^\s{0,3}>\s?/,''));
   out.push(`<blockquote>${markdown(q.join('\n'),opts)}</blockquote>`);continue;
  }
  if(isTableStart(line,lines[i+1])){
   const head=cells(line);const align=cells(lines[i+1]).map(c=>c.startsWith(':')&&c.endsWith(':')?'center':c.endsWith(':')?'right':'');i+=2;
   const rows=[];while(i<lines.length&&lines[i].includes('|')&&lines[i].trim())rows.push(cells(lines[i++]));
   const cell=(tag,c,k)=>`<${tag}${align[k]?` class="align-${align[k]}"`:''}>${inline(c,opts)}</${tag}>`;
   out.push(`<div class="table-wrap"><table><thead><tr>${head.map((c,k)=>cell('th',c,k)).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,k)=>cell('td',c,k)).join('')}</tr>`).join('')}</tbody></table></div>`);
   continue;
  }
  if(isItem(line)){
   const block=[];
   while(i<lines.length){
    const l=lines[i];
    if(l.trim()){if(isItem(l)||indent(l)>indent(line)||(!blockStart(l)&&block.length&&lines[i-1].trim())){block.push(l);i++;continue;}break;}
    // A blank line ends the list unless the next line continues it.
    const next=lines[i+1];
    if(next!==undefined&&next.trim()&&(indent(next)>indent(line)||(isItem(next)&&indent(next)>=indent(line)&&ordered(next)===ordered(line)))){block.push('');i++;continue;}
    break;
   }
   out.push(list(block,opts));continue;
  }
  const para=[];
  while(i<lines.length&&lines[i].trim()&&!(para.length&&blockStart(lines[i],lines[i+1])))para.push(lines[i++]);
  const text=para.map((l,k)=>{
   const last=k===para.length-1;
   if(!last&&(/ {2,}$/.test(l)||/\\$/.test(l)))return l.replace(/\s*\\?\s*$/,'')+'<br>';
   return l.trim();
  }).join('\n').replace(/<br>\n/g,'<br>');
  const lone=text.match(/^!\[([^\]]*)\]\(<?([^)\s>]+)>?(?:\s+"([^"]*)")?\)$/);
  if(lone){
   const img=inline(`![${lone[1]}](${lone[2]})`,opts);
   out.push(`<figure>${img}${lone[3]?`<figcaption>${inline(lone[3],opts)}</figcaption>`:''}</figure>`);
  }else out.push(`<p>${inline(text,opts)}</p>`);
 }
 return out.join('\n');
}

function list(lines,opts){
 const base=indent(lines[0]);
 const ordered=/^\s*\d+[.)]/.test(lines[0]);
 const items=[];
 for(const l of lines){
  if(isItem(l)&&indent(l)<=base)items.push({first:l.replace(/^\s*([-*+]|\d+[.)])\s+/,''),rest:[]});
  else if(items.length)items.at(-1).rest.push(l);
 }
 const start=ordered?parseInt(lines[0].trim(),10):1;
 const html=items.map(({first,rest})=>{
  let task='';
  const t=first.match(/^\[( |x|X)\]\s+/);
  if(t){task=`<input type="checkbox" disabled${t[1]===' '?'':' checked'}> `;first=first.slice(t[0].length);}
  // Lines that continue the first line (no extra indent, not a nested item) are part of it.
  while(rest.length&&rest[0].trim()&&!isItem(rest[0])&&indent(rest[0])<=base+1)first+='\n'+rest.shift().trim();
  const childIndent=Math.min(...rest.filter(r=>r.trim()).map(indent),Infinity);
  const nested=rest.length?markdown(rest.map(r=>r.slice(Math.min(childIndent,indent(r)))).join('\n'),opts):'';
  return `<li${task?' class="task"':''}>${task}${inline(first,opts)}${nested?'\n'+nested:''}</li>`;
 }).join('\n');
 return ordered?`<ol${start!==1?` start="${start}"`:''}>\n${html}\n</ol>`:`<ul>\n${html}\n</ul>`;
}
