import {createServer} from 'node:http';
import {readFile, realpath, stat} from 'node:fs/promises';
import {dirname, extname, join, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createEditorStore, httpError} from './editor-store.mjs';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const run=promisify(execFile);
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.pdf':'application/pdf','.xml':'application/xml','.txt':'text/plain'};

export async function createDevServer({contentDir=join(root,'content'),outDir=join(root,'dist'),rebuild,clientBundle}={}){
 const token=randomBytes(32).toString('hex');
 const store=createEditorStore(contentDir);
 let pending=Promise.resolve();
 const server=createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','same-origin');
  const json=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(value));};
  try{
   const port=server.address().port;
   const allowed=new Set([`localhost:${port}`,`127.0.0.1:${port}`]);
   if(!allowed.has(req.headers.host))throw httpError(403,'Localhost requests only.');
   const origin=`http://${req.headers.host}`;
   const url=new URL(req.url,origin);
   if(req.headers.origin&&req.headers.origin!==origin)throw httpError(403,'Same-origin requests only.');
   if(req.headers['sec-fetch-site']==='cross-site')throw httpError(403,'Same-origin requests only.');
   if(url.pathname==='/__editor/document'){
    if(req.method==='GET')return json(200,{...await store.read(url.searchParams.get('route')||'/'),token});
    if(req.method!=='PUT')throw httpError(405,'Use GET or PUT.');
    if(req.headers.origin!==origin||req.headers['x-editor-token']!==token)throw httpError(403,'Editor authorization required.');
    if(!req.headers['content-type']?.startsWith('application/json'))throw httpError(415,'Send JSON.');
    let raw='';
    for await(const part of req){raw+=part;if(Buffer.byteLength(raw)>1100000)throw httpError(413,'Document is too large.');}
    let payload;try{payload=JSON.parse(raw);}catch{throw httpError(400,'Invalid JSON.');}
    if(!payload||typeof payload.route!=='string')throw httpError(400,'Page route is required.');
    const operation=pending.then(async()=>{
     const saved=await store.save(payload.route,payload);
     try{await rebuild?.();}catch(e){console.error('Preview rebuild failed:',e.message);return {...saved,warning:'Saved to disk, but preview rebuild failed. Check the terminal and retry.'};}
     return saved;
    });
    pending=operation.catch(()=>{});
    return json(200,await operation);
   }
   if(req.method!=='GET'&&req.method!=='HEAD')throw httpError(405,'Use GET.');
   let data,type;
   if(url.pathname==='/__editor/client.js'&&clientBundle){data=clientBundle;type=types['.js'];}
   else if(url.pathname==='/__editor/style.css'){data=await readFile(join(root,'scripts/editor/style.css'));type=types['.css'];}
   else{
    if(url.pathname.startsWith('/__editor/'))throw httpError(404,'Not found.');
    await pending;
    const base=await realpath(outDir);
    let file=resolve(base,'.'+decodeURIComponent(url.pathname));
    if(!file.startsWith(base+sep)&&file!==base)throw httpError(404,'Not found.');
    if((await stat(file)).isDirectory())file=join(file,'index.html');
    file=await realpath(file);
    if(!file.startsWith(base+sep))throw httpError(404,'Not found.');
    type=types[extname(file)]||'application/octet-stream';
    data=await readFile(file);
    if(extname(file)==='.html')data=data.toString().replace('</body>','<link rel="stylesheet" href="/__editor/style.css"><script type="module" src="/__editor/client.js"></script></body>');
   }
   res.writeHead(200,{'Content-Type':type});res.end(req.method==='HEAD'?undefined:data);
  }catch(e){
   const status=e.status||(e.code==='ENOENT'||e.code==='ENOTDIR'?404:e instanceof URIError?400:500);
   if(status===500)console.error(e);
   json(status,{error:status===500?'Unable to save or load. Check the terminal, then retry.':e.message});
  }
 });
 return server;
}

async function start(){
 const port=Number(process.env.PORT||4173);
 if(!Number.isInteger(port)||port<1||port>65535)throw new Error('PORT must be between 1 and 65535.');
 const rebuild=async()=>{const {stdout}=await run(process.execPath,[join(root,'scripts/build.mjs')],{cwd:root});process.stdout.write(stdout);};
 await rebuild();
 const {build}=await import('esbuild');
 const bundle=await build({entryPoints:[join(root,'scripts/editor/client.js')],bundle:true,write:false,platform:'browser',format:'esm',target:'es2022'});
 const server=await createDevServer({rebuild,clientBundle:bundle.outputFiles[0].text});
 server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Port ${port} is busy. Stop the other server or use PORT=4174 npm run dev.`:e.message);process.exitCode=1;});
 server.listen(port,'127.0.0.1',()=>console.log(`Local editor: http://localhost:${port} (click Edit page)`));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))start().catch(e=>{console.error(e);process.exitCode=1;});
