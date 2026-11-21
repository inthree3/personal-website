import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {request} from 'node:http';
import {createEditorStore} from '../scripts/editor-store.mjs';
import {createDevServer} from '../scripts/dev.mjs';

async function fixture(t){
 const root=await mkdtemp(join(tmpdir(),'site-editor-'));
 t.after(()=>rm(root,{recursive:true,force:true}));
 await mkdir(join(root,'content','writing'),{recursive:true});
 await mkdir(join(root,'dist'),{recursive:true});
 const original='---\ntitle: "Keep: this"\nportrait: /assets/me.jpg\ncustom: true\n---\n\n# Hello\n\nOriginal\n';
 await writeFile(join(root,'content','home.md'),original);
 await writeFile(join(root,'dist','index.html'),'<html><body><main>Hello</main></body></html>');
 return {root,original,store:createEditorStore(join(root,'content'))};
}
test('saves Markdown atomically while preserving original front matter',async t=>{
 const {root,store,original}=await fixture(t);
 const page=await store.read('/');
 assert.match(page.html,/<h1>Hello<\/h1>/);
 const saved=await store.save('/',{body:'# Changed\n\n[Link](https://example.com)',revision:page.revision});
 assert.notEqual(saved.revision,page.revision);
 assert.equal(await readFile(join(root,'content','home.md'),'utf8'),original.split('\n\n')[0]+'\n\n# Changed\n\n[Link](https://example.com)\n');
});
test('stale tabs and external file changes cannot overwrite newer content',async t=>{
 const {root,store}=await fixture(t);
 const first=await store.read('/');
 const results=await Promise.allSettled([
  store.save('/',{body:'First',revision:first.revision}),
  store.save('/',{body:'Second',revision:first.revision})
 ]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 assert.equal(results.find(r=>r.status==='rejected').reason.status,409);
 const current=await store.read('/');
 await writeFile(join(root,'content','home.md'),'External change');
 await assert.rejects(store.save('/',{body:'Lost update',revision:current.revision}),{status:409});
 assert.equal(await readFile(join(root,'content','home.md'),'utf8'),'External change');
});
test('only existing known page and post routes can be edited',async t=>{
 const {root,store}=await fixture(t);
 await mkdir(join(root,'content','writing','a-post'));
 await writeFile(join(root,'content','writing','a-post','index.md'),'---\ntitle: Post\n---\n\n![x](image.jpg)');
 assert.match((await store.read('/writing/a-post/')).html,/src="image.jpg"/);
 for(const route of ['/../package.json','/assets/site.js','/writing/../../home/','/missing/'])await assert.rejects(store.read(route),{status:404});
});
test('dev server injects editing locally and authenticates writes before rebuilding',async t=>{
 const {root,store}=await fixture(t);
 let builds=0;
 const server=await createDevServer({contentDir:join(root,'content'),outDir:join(root,'dist'),rebuild:async()=>{builds++;}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 t.after(()=>new Promise(r=>{server.closeAllConnections();server.close(r);}));
 const origin=`http://127.0.0.1:${server.address().port}`;
 const html=await (await fetch(origin)).text();
 assert.match(html,/\/__editor\/client.js/);
 assert.doesNotMatch(await readFile(join(root,'dist','index.html'),'utf8'),/__editor/);
 const page=await (await fetch(origin+'/__editor/document?route=/')).json();
 const send=(headers,body)=>fetch(origin+'/__editor/document',{method:'PUT',headers:{'content-type':'application/json',...headers},body:JSON.stringify(body)});
 const update={route:'/',body:'Updated',revision:page.revision};
 assert.equal((await send({origin:'https://evil.example','x-editor-token':page.token},update)).status,403);
 assert.equal((await send({origin},update)).status,403);
 assert.equal((await send({origin,'x-editor-token':page.token},update)).status,200);
 assert.equal(builds,1);
 assert.equal((await store.read('/')).body.trim(),'Updated');
 assert.equal((await send({origin,'x-editor-token':page.token},{...update,body:'Stale different edit'})).status,409);
 const hostileStatus=await new Promise((resolve,reject)=>{const req=request(origin+'/__editor/document?route=/',{headers:{host:'evil.example'}},res=>{res.resume();resolve(res.statusCode);});req.on('error',reject);req.end();});
 assert.equal(hostileStatus,403);
 assert.equal((await fetch(origin+'/.git/config')).status,404);
});

test('a repeated successful save can recover a lost acknowledgement',async t=>{
 const {store}=await fixture(t);const first=await store.read('/');
 const update={body:'First edit',revision:first.revision};
 const saved=await store.save('/',update);
 assert.deepEqual(await store.save('/',update),saved);
 await store.save('/',{body:'Later edit',revision:saved.revision});
 await assert.rejects(store.save('/',update),{status:409});
});
