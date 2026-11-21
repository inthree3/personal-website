import {readFile, realpath, rename, writeFile, unlink} from 'node:fs/promises';
import {join, sep} from 'node:path';
import {createHash, randomUUID} from 'node:crypto';
import {frontMatter, markdown} from './markdown.mjs';

export const httpError=(status,message)=>Object.assign(new Error(message),{status});
const revision=source=>createHash('sha256').update(source).digest('hex');

export function createEditorStore(contentDir){
 let pending=Promise.resolve();
 const acknowledgements=new Map();
 async function fileFor(route){
  const pages={'/':'home.md','/writing/':'writing.md','/contact/':'contact.md','/404.html':'404.md'};
  let candidates=pages[route]?[pages[route]]:[];
  const post=route.match(/^\/writing\/([a-z0-9-]+)\/$/);
  if(post)candidates=[`writing/${post[1]}.md`,`writing/${post[1]}/index.md`];
  const base=await realpath(contentDir);
  for(const candidate of candidates){
   try{
    const path=await realpath(join(contentDir,candidate));
    if(path.startsWith(base+sep))return path;
   }catch(e){if(e.code!=='ENOENT')throw e;}
  }
  throw httpError(404,'This page has no editable source.');
 }
 async function read(route){
  const source=await readFile(await fileFor(route),'utf8');
  const {data,body}=frontMatter(source);
  return {body,html:markdown(body),title:data.title||'Page',revision:revision(source)};
 }
 function save(route,{body,revision:expected}){
  const operation=pending.then(async()=>{
   if(typeof body!=='string'||typeof expected!=='string')throw httpError(400,'Body and revision are required.');
   if(Buffer.byteLength(body)>1024*1024)throw httpError(413,'Document is too large (maximum 1 MB).');
   const file=await fileFor(route);
   const source=await readFile(file,'utf8');
   const current=revision(source),previous=acknowledgements.get(file);
   // A response may be lost after rename. A retry of the same intent is safe
   // only while the exact result is still on disk; later edits still conflict.
   if(previous&&previous.expected===expected&&previous.body===body&&previous.result.revision===current)return previous.result;
   if(current!==expected)throw httpError(409,'The source changed elsewhere. Copy your edits before reloading to avoid losing them.');
   const header=source.match(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/)?.[0]||'';
   const next=header+(header?'\n':'')+body.replace(/^\n+|\n+$/g,'')+'\n';
   const temporary=file+'.'+randomUUID()+'.tmp';
   try{
    await writeFile(temporary,next,{flag:'wx'});
    // Detect external edits made while the temporary file was written.
    if(revision(await readFile(file,'utf8'))!==expected)throw httpError(409,'The source changed elsewhere. Copy your edits before reloading.');
    await rename(temporary,file);
   }finally{await unlink(temporary).catch(e=>{if(e.code!=='ENOENT')throw e;});}
   const result={revision:revision(next)};
   acknowledgements.set(file,{expected,body,result});
   return result;
  });
  pending=operation.catch(()=>{});
  return operation;
 }
 return {read,save};
}
