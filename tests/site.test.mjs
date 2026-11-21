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
