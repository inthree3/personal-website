// Creates a Buttondown draft for each new post after it is live on the site.
// Drafts are never sent automatically: review and send them in Buttondown.
// Posts already handled are recorded in newsletter-drafts.json so they are not created twice.
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {root,base,posts,articleBody} from './posts.mjs';

const recordFile=join(root,'newsletter-drafts.json');
const record=JSON.parse(await readFile(recordFile,'utf8').catch(()=> '{}'));
const pending=posts.filter(p=>!p.sample&&!record[p.slug]);
if(!pending.length){console.log('Newsletter: no new posts.');process.exit(0);}

function apiKey(){
 if(process.env.BUTTONDOWN_API_KEY)return process.env.BUTTONDOWN_API_KEY;
 try{return execFileSync('security',['find-generic-password','-a',process.env.USER,'-s','buttondown-api-key','-w'],{encoding:'utf8'}).trim();}
 catch{return '';}
}
const key=apiKey();
if(!key){console.log('Newsletter: skipped, no Buttondown API key in the keychain (buttondown-api-key).');process.exit(0);}

for(const post of pending){
 const url=`${base}/writing/${post.slug}/`;
 // Only create a draft once the post is reachable, so the email never links to a missing page.
 const live=await fetch(url,{method:'HEAD'}).then(r=>r.ok).catch(()=>false);
 if(!live){console.log(`Newsletter: ${post.slug} is not live yet at ${url}, skipped.`);continue;}
 const body=`<!-- buttondown-editor-mode: fancy -->\n<p><a href="${url}">Read this on the website</a></p>\n${await articleBody(post.slug)}`;
 const res=await fetch('https://api.buttondown.com/v1/emails',{
  method:'POST',
  headers:{Authorization:`Token ${key}`,'Content-Type':'application/json'},
  // The API sends immediately unless status is set, so always ask for a draft.
  body:JSON.stringify({subject:post.title,body,description:post.description,canonical_url:url,status:'draft'})
 });
 const data=await res.json().catch(()=>({}));
 if(!res.ok){console.error(`Newsletter: Buttondown rejected ${post.slug} (${res.status}): ${JSON.stringify(data).slice(0,300)}`);process.exitCode=1;continue;}
 if(data.status!=='draft')console.error(`Newsletter: WARNING ${post.slug} was created with status "${data.status}", check Buttondown now.`);
 record[post.slug]={emailId:data.id,status:data.status,createdAt:new Date().toISOString()};
 await writeFile(recordFile,JSON.stringify(record,null,1)+'\n');
 console.log(`Newsletter: draft created for "${post.title}". Review and send it at https://buttondown.com/emails`);
}
