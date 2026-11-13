import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {frontMatter,markdown} from './markdown.mjs';
export const root=dirname(dirname(fileURLToPath(import.meta.url)));
export const base=process.env.SITE_URL || 'https://stella-hwang-personal.pages.dev';
export const writingDir=join(root,'content','writing');

// Each post is content/writing/<slug>.md, or content/writing/<slug>/index.md with its images next to it
// (the shape of a Notion "Markdown & CSV" export). Front matter: title, date (YYYY-MM-DD), description,
// optional summary (shown in lists), sample: true (never emailed), draft: true (not built at all).
function load(){
 if(!existsSync(writingDir))return [];
 return readdirSync(writingDir,{withFileTypes:true}).flatMap(e=>{
  const folder=e.isDirectory();
  if(!folder&&!e.name.endsWith('.md'))return [];
  const file=folder?join(writingDir,e.name,'index.md'):join(writingDir,e.name);
  if(!existsSync(file))return [];
  const slug=folder?e.name:e.name.slice(0,-3);
  const {data,body}=frontMatter(readFileSync(file,'utf8'));
  for(const key of ['title','date','description'])if(!data[key])throw new Error(`${file}: front matter needs "${key}"`);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(data.date))throw new Error(`${file}: date must be YYYY-MM-DD, got "${data.date}"`);
  if(!/^[a-z0-9-]+$/.test(slug))throw new Error(`${file}: use lowercase letters, numbers and dashes in the file or folder name`);
  return data.draft?[]:[{slug,folder:folder?join(writingDir,e.name):null,body,...data}];
 }).sort((a,b)=>b.date.localeCompare(a.date));
}
// Posts, newest first. Used for routes, lists, the RSS feed, and newsletter drafts.
export const posts=load();

// Relative links and images inside a post folder are served from /writing/<slug>/.
const resolver=post=>u=>/^([a-z]+:|\/|#)/i.test(u)?u:`/writing/${post.slug}/${u.replace(/^\.\//,'')}`;
export function renderPost(post){return markdown(post.body,{url:resolver(post)});}

// Article HTML with absolute URLs, for feeds and email.
export async function articleBody(slug){
 const post=posts.find(p=>p.slug===slug);
 return renderPost(post).replace(/(href|src)="\//g,`$1="${base}/`).trim();
}
