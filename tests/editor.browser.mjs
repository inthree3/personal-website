import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,symlink,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from '@playwright/test';

// Exercise the full dev server against a disposable site, never the author's files.
test('browser editing, links, formatting, autosave, reload, conflicts and mobile', {timeout:60000},async t=>{
 const project=await mkdtemp(join(tmpdir(),'website-editor-browser-'));
 let browser,child;
 t.after(async()=>{await browser?.close();child?.kill();await rm(project,{recursive:true,force:true});});
 const root=new URL('../',import.meta.url).pathname;
 for(const file of ['src','scripts','content','package.json'])await cp(join(root,file),join(project,file),{recursive:true});
 await symlink(join(root,'node_modules'),join(project,'node_modules'));
 child=spawn(process.execPath,['scripts/dev.mjs'],{cwd:project,env:{...process.env,PORT:'4185'},stdio:['ignore','pipe','pipe']});
 let logs='';child.stdout.on('data',b=>logs+=b);child.stderr.on('data',b=>logs+=b);
 const origin='http://127.0.0.1:4185';
 for(let i=0;i<100;i++){if(logs.includes('Local editor:'))break;if(child.exitCode!==null)throw new Error(logs);await new Promise(r=>setTimeout(r,50));}
 assert.match(logs,/Local editor:/);
 browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin);
 await page.getByRole('button',{name:'Edit page',exact:true}).click();
 const editor=page.getByRole('textbox',{name:'Page content'});
 await editor.waitFor();
 const original=await readFile(join(project,'content/home.md'),'utf8');
 // Opening and closing without editing must not rewrite the source.
 await page.getByRole('button',{name:'Done',exact:true}).click();
 await page.getByRole('button',{name:'Edit page',exact:true}).waitFor();
 assert.equal(await readFile(join(project,'content/home.md'),'utf8'),original);
 await page.getByRole('button',{name:'Edit page',exact:true}).click();
 await editor.waitFor();
 await editor.locator('p').first().click();
 await page.keyboard.press('End');
 await page.keyboard.type(' Browser check.');
 await page.getByRole('status').filter({hasText:'Saved to your computer'}).waitFor();
 assert.match(await readFile(join(project,'content/home.md'),'utf8'),/Browser check\./);
 // The server can save even when the browser loses its acknowledgement.
 let dropResponse=true;
 const loseResponse=async intercepted=>{
  if(intercepted.request().method()==='PUT'&&dropResponse){dropResponse=false;await intercepted.fetch();await intercepted.abort('failed');}
  else await intercepted.continue();
 };
 await page.route('**/__editor/document',loseResponse);
 await page.keyboard.type(' Lost response.');
 await page.getByRole('button',{name:'Retry save'}).waitFor();
 await page.unroute('**/__editor/document',loseResponse);
 await page.keyboard.type(' Recovered edit.');
 await page.getByRole('button',{name:'Retry save'}).click();
 await page.getByRole('status').filter({hasText:'Saved to your computer'}).waitFor();
 assert.match(await readFile(join(project,'content/home.md'),'utf8'),/Lost response\. Recovered edit\./);
 // Format inserted text and create a link through the real dialog.
 await editor.click();await page.keyboard.press('ControlOrMeta+End');await page.keyboard.press('Enter');
 await page.getByRole('button',{name:'Bold',exact:true}).click();
 await page.keyboard.type('Strong words');
 await page.getByRole('button',{name:'Bold',exact:true}).click();
 await page.keyboard.type(' ');
 await page.getByRole('button',{name:'Link',exact:true}).click();
 await page.getByLabel('Text',{exact:true}).fill('Example link');
 await page.getByLabel('URL',{exact:true}).fill('https://example.com/');
 await page.getByRole('button',{name:'Apply link'}).click();
 await page.getByRole('status').filter({hasText:'Saved to your computer'}).waitFor();
 const updated=await readFile(join(project,'content/home.md'),'utf8');
 assert.match(updated,/\*\*Strong words\*\*/);
 assert.match(updated,/\[Example link\]\(https:\/\/example.com\/\)/);
 assert.equal(updated.split('---')[1],original.split('---')[1]);
 await page.screenshot({path:'/tmp/local-editor-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Done',exact:true}).click();
 await page.getByRole('button',{name:'Edit page',exact:true}).waitFor();
 await page.getByRole('link',{name:'Example link',exact:true}).waitFor();
 // A second tab must not overwrite a newer save.
 const other=await browser.newPage();await other.goto(origin);
 await other.getByRole('button',{name:'Edit page',exact:true}).click();
 await other.getByRole('textbox',{name:'Page content'}).waitFor();
 await page.getByRole('button',{name:'Edit page',exact:true}).click();
 await editor.waitFor();await editor.click();await page.keyboard.press('ControlOrMeta+End');await page.keyboard.type(' Latest edit');
 await page.getByRole('status').filter({hasText:'Saved to your computer'}).waitFor();
 await other.getByRole('textbox',{name:'Page content'}).click();await other.keyboard.press('ControlOrMeta+End');await other.keyboard.type(' Conflicting edit');
 await other.getByRole('status').filter({hasText:'changed elsewhere'}).waitFor();
 assert.doesNotMatch(await readFile(join(project,'content/home.md'),'utf8'),/Conflicting edit/);
 await other.getByRole('button',{name:'Download your edits'}).waitFor();
 // Mobile toolbar must fit; posts keep their details and images.
 await page.goto(origin+'/writing/presentations-with-llms/');
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Edit page',exact:true}).click();await editor.waitFor();
 const images=await editor.locator('img').count();const details=await editor.locator('details').count();
 await editor.locator('p').first().click();await page.keyboard.press('Home');await page.keyboard.type('Checked. ');
 await page.getByRole('status').filter({hasText:'Saved to your computer'}).waitFor();
 assert.equal(await editor.locator('img').count(),images);assert.equal(await editor.locator('details').count(),details);
 await page.screenshot({path:'/tmp/local-editor-mobile.png',fullPage:true});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile has no horizontal page overflow');
 await page.getByRole('button',{name:'Done',exact:true}).click();
 await page.getByRole('button',{name:'Edit page',exact:true}).waitFor();
 assert.equal(await page.locator('main img').count(),images);assert.equal(await page.locator('main details').count(),details);
 assert.deepEqual(errors,[]);
});
