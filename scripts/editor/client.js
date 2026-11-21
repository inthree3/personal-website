import DOMPurify from 'dompurify';
import {toMarkdown} from './convert.js';
import {createAutosave} from './autosave.js';

const route=location.pathname;
if(/^\/(?:writing\/(?:[a-z0-9-]+\/)?|contact\/|404\.html)?$/.test(route))setup();
function setup(){
 const launcher=document.createElement('button');
 launcher.type='button';launcher.className='local-edit-launcher';launcher.textContent='Edit page';
 document.body.append(launcher);
 launcher.addEventListener('click',async()=>{
  launcher.disabled=true;launcher.textContent='Opening editor…';
  try{
   const response=await fetch('/__editor/document?route='+encodeURIComponent(route));
   const data=await response.json();if(!response.ok)throw new Error(data.error);
   openEditor(data);launcher.remove();
  }catch(e){launcher.disabled=false;launcher.textContent='Retry opening editor';launcher.title=e.message;}
 });
}

function openEditor(data){
 const main=document.querySelector('main');
 document.body.classList.add('local-editing');
 const panel=document.createElement('div');panel.className='local-editor';
 panel.innerHTML=`<div class="local-editor-bar">
 <div class="local-editor-heading"><span>Editing this page</span><button type="button" data-action="done" class="local-editor-done">Done</button></div>
 <div class="local-editor-tools" role="toolbar" aria-label="Text formatting">
 <select aria-label="Text style"><option value="p">Normal text</option><option value="h1">Heading 1</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="h4">Heading 4</option><option value="blockquote">Quote</option></select>
 <button type="button" data-command="bold" aria-label="Bold" title="Bold (⌘/Ctrl+B)"><strong>B</strong></button>
 <button type="button" data-command="italic" aria-label="Italic" title="Italic (⌘/Ctrl+I)"><em>I</em></button>
 <button type="button" data-action="link" title="Insert or edit link (⌘/Ctrl+K)">Link</button>
 <button type="button" data-command="unlink">Unlink</button>
 <button type="button" data-command="insertUnorderedList" aria-label="Bullet list">Bullets</button>
 <button type="button" data-command="insertOrderedList" aria-label="Numbered list">Numbers</button>
 <button type="button" data-command="undo">Undo</button><button type="button" data-command="redo">Redo</button>
 </div>
 <div class="local-editor-save"><label>Autosave after <input type="number" aria-label="Autosave delay in seconds" min="0.1" max="60" step="0.1" value="0.5"> s</label><span role="status" aria-live="polite">Saved</span><button type="button" data-action="retry" hidden>Retry save</button><button type="button" data-action="download" hidden>Download your edits</button></div>
 </div><p class="local-editor-hint">Edit the text below. Changes save to this website on your computer. Select text to format it or add a link.</p><div class="local-editor-document prose" contenteditable="true" role="textbox" aria-label="Page content" aria-multiline="true" spellcheck="true"></div>`;
 main.replaceChildren(panel);
 const editor=panel.querySelector('[contenteditable]');
 // Content comes from the user's existing local source, never from a remote page.
 editor.innerHTML=data.html;
 const initialHTML=editor.innerHTML;
 const status=panel.querySelector('[role=status]');
 const retry=panel.querySelector('[data-action=retry]');
 const download=panel.querySelector('[data-action=download]');
 const delayInput=panel.querySelector('input[type=number]');
 let delay=500;
 try{const value=Number(localStorage.getItem('local-editor-delay'));if(value>=100&&value<=60000)delay=value;}catch{}
 delayInput.value=String(delay/1000);
 let composing=false,range;
 const save=createAutosave({body:data.body,revision:data.revision,delay,
  send:async update=>{
   let response;
   try{response=await fetch('/__editor/document',{method:'PUT',headers:{'Content-Type':'application/json','X-Editor-Token':data.token},body:JSON.stringify({route,...update})});}
   catch{throw new Error('Connection lost. Check that the local server is running, then retry. Your edits are still here.');}
   const result=await response.json();
   if(!response.ok)throw Object.assign(new Error(result.error||'Save failed. Check the terminal and retry.'),{status:response.status});
   return result;
  },
  onState:({state,message})=>{
   status.dataset.state=state;
   status.textContent=message||({pending:'Unsaved changes',saving:'Saving…',saved:'Saved to your computer'})[state];
   retry.hidden=state!=='error'&&state!=='warning';
   download.hidden=state!=='error';
  }
 });
 const changed=()=>{if(!composing)save.change(editor.innerHTML===initialHTML?data.body:toMarkdown(editor.innerHTML));};
 editor.addEventListener('input',changed);
 editor.addEventListener('compositionstart',()=>{composing=true;});
 editor.addEventListener('compositionend',()=>{composing=false;changed();});
 delayInput.addEventListener('change',()=>{
  if(!delayInput.checkValidity())return delayInput.reportValidity();
  delay=Number(delayInput.value)*1000;save.setDelay(delay);
  try{localStorage.setItem('local-editor-delay',String(delay));}catch{}
 });
 // Native editing commands retain browser undo history, selection and IME support.
 function command(name,value){editor.focus();document.execCommand(name,false,value);changed();updateTools();}
 try{document.execCommand('defaultParagraphSeparator',false,'p');}catch{}
 panel.querySelectorAll('[data-command]').forEach(button=>{
  button.addEventListener('mousedown',e=>e.preventDefault());
  button.addEventListener('click',()=>command(button.dataset.command));
 });
 const style=panel.querySelector('select');
 style.addEventListener('change',()=>{restoreSelection();command('formatBlock',style.value);});
 function rememberSelection(){
  const selection=getSelection();
  if(selection.rangeCount&&editor.contains(selection.anchorNode))range=selection.getRangeAt(0).cloneRange();
 }
 function restoreSelection(){
  editor.focus();
  if(range&&editor.contains(range.commonAncestorContainer)){const selection=getSelection();selection.removeAllRanges();selection.addRange(range);}
 }
 function updateTools(){
  const selection=getSelection();if(!selection.anchorNode||!editor.contains(selection.anchorNode))return;
  for(const name of ['bold','italic'])panel.querySelector(`[data-command=${name}]`).setAttribute('aria-pressed',String(document.queryCommandState(name)));
  const anchor=selection.anchorNode.nodeType===1?selection.anchorNode:selection.anchorNode.parentElement;
  const block=anchor.closest('h1,h2,h3,h4,p,blockquote,li');
  style.value=block&&block.tagName!=='LI'?block.tagName.toLowerCase():'p';
 }
 document.addEventListener('selectionchange',()=>{rememberSelection();updateTools();});
 panel.querySelector('[data-action=link]').addEventListener('mousedown',e=>e.preventDefault());
 panel.querySelector('[data-action=link]').addEventListener('click',()=>{rememberSelection();showLink();});
 editor.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();rememberSelection();showLink();}
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='s'){e.preventDefault();save.flush().catch(()=>{});}
 });
 editor.addEventListener('click',e=>{if(e.target.closest('a'))e.preventDefault();});
 editor.addEventListener('paste',e=>{
  e.preventDefault();
  const html=e.clipboardData.getData('text/html');
  if(html)command('insertHTML',DOMPurify.sanitize(html,{FORBID_TAGS:['style','form','input','button','select','textarea'],FORBID_ATTR:['style','id','contenteditable']}));
  else command('insertText',e.clipboardData.getData('text/plain'));
 });
 editor.addEventListener('drop',e=>e.preventDefault());
 retry.addEventListener('click',()=>save.flush({force:true}).catch(()=>{}));
 download.addEventListener('click',()=>{
  const blob=new Blob([toMarkdown(editor.innerHTML)],{type:'text/markdown'}),url=URL.createObjectURL(blob);
  const link=document.createElement('a');link.href=url;link.download='unsaved-page.md';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 const warn=e=>{if(save.dirty){e.preventDefault();e.returnValue='';}};
 window.addEventListener('beforeunload',warn);
 // Start pending saves when the tab is hidden; beforeunload still warns until acknowledged.
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&save.dirty)save.flush().catch(()=>{});});
 const done=panel.querySelector('[data-action=done]');
 done.addEventListener('click',async()=>{
  done.disabled=true;
  try{changed();await save.flush();window.removeEventListener('beforeunload',warn);location.reload();}
  catch{done.disabled=false;}
 });
 function showLink(){
  if(document.querySelector('.local-link-dialog'))return;
  const selection=getSelection();
  const anchor=selection.anchorNode?.nodeType===1?selection.anchorNode:selection.anchorNode?.parentElement;
  const existing=anchor?.closest('a');
  const link=existing&&editor.contains(existing)?existing:null;
  const dialog=document.createElement('dialog');dialog.className='local-link-dialog';
  dialog.innerHTML=`<form><h2>Insert link</h2><label>Text<input name="label" required></label><label>URL<input name="url" placeholder="https://example.com" required></label><p class="local-link-error" role="alert"></p><div><button type="button" data-cancel>Cancel</button><button type="submit">Apply link</button></div></form>`;
  const label=dialog.querySelector('[name=label]'),url=dialog.querySelector('[name=url]');
  label.value=link?.textContent||selection.toString();url.value=link?.getAttribute('href')||'';
  document.body.append(dialog);dialog.showModal();url.focus();
  const close=()=>{dialog.close();dialog.remove();restoreSelection();};
  dialog.querySelector('[data-cancel]').addEventListener('click',close);
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  dialog.querySelector('form').addEventListener('submit',e=>{
   e.preventDefault();const href=url.value.trim();
   if(!/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(href)){
    dialog.querySelector('[role=alert]').textContent='Use https://, http://, mailto:, tel:, a /page/ path, or #section.';return;
   }
   close();
   if(link){const r=document.createRange();r.selectNode(link);const s=getSelection();s.removeAllRanges();s.addRange(r);}
   const element=document.createElement('a');element.setAttribute('href',href);element.textContent=label.value;
   command('insertHTML',element.outerHTML);rememberSelection();
  });
 }
 editor.focus();
}
