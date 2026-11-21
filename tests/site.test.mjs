import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {join, extname} from 'node:path';
const root=new URL('../dist/',import.meta.url).pathname;
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]);}
test('all public pages exist',()=>{
 for(const p of ['index.html','writing/index.html','contact/index.html','404.html']) assert.ok(existsSync(join(root,p)),`Missing page: ${p}`);
});
test('every internal link and local asset resolves without JavaScript',()=>{
 assert.ok(existsSync(root),'Build must exist');
 for(const file of walk(root).filter(p=>extname(p)==='.html')){
  const html=readFileSync(file,'utf8');
  for(const [,target]of html.matchAll(/(?:href|src)="([^"#]+)"/g)){
   if(/^(https?:|mailto:|data:)/.test(target))continue;
   assert.ok(target.startsWith('/'),`Use root-relative URL: ${target}`);
   const path=join(root,decodeURI(target.split(/[?#]/)[0]));
   assert.ok(existsSync(path)||existsSync(join(path,'index.html')),`${file}: broken link ${target}`);
  }
 }
});
test('pages retain identity and navigation',()=>{
 assert.ok(existsSync(root),'Build must exist');
 for(const file of walk(root).filter(p=>extname(p)==='.html')){
  const html=readFileSync(file,'utf8');
  assert.ok(html.includes('Stella Hwang')&&html.includes('황인선'));
  assert.ok(html.includes('Skip to content'));
  assert.ok(!/[—·]/.test(html),`${file}: forbidden decorative punctuation`);
  assert.ok(!/guestbook|aria-controls|href="#"/.test(html));
 }
});
test('every page has link-preview tags in the static <head>',()=>{
 for(const file of walk(root).filter(p=>extname(p)==='.html')){
  const head=readFileSync(file,'utf8').split('</head>')[0];
  for(const key of ['og:type','og:title','og:description','og:image','og:site_name'])
   assert.match(head,new RegExp(`<meta property="${key}" content="[^"]+">`),`${file}: missing ${key}`);
  const image=head.match(/property="og:image" content="([^"]+)"/)[1];
  assert.match(image,/^https:\/\//,`${file}: og:image must be an absolute URL`);
  assert.ok(existsSync(join(root,new URL(image).pathname)),`${file}: og:image ${image} is not in the build`);
  if(file.endsWith('404.html'))continue;
  assert.match(head,/<meta property="og:url" content="https:\/\/[^"]+">/,`${file}: missing og:url`);
  assert.ok(!/noindex/.test(head),`${file}: public pages must not be noindex`);
 }
 assert.match(readFileSync(join(root,'writing/presentations-with-llms/index.html'),'utf8'),/property="og:type" content="article"/);
});
test('robots.txt lets crawlers in',()=>{
 assert.ok(!/Disallow: \/\s*$/m.test(readFileSync(join(root,'robots.txt'),'utf8')));
});
