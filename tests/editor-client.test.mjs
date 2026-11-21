import test from 'node:test';
import assert from 'node:assert/strict';
import {toMarkdown} from '../scripts/editor/convert.js';
import {createAutosave} from '../scripts/editor/autosave.js';
import {markdown} from '../scripts/markdown.mjs';
const wait=ms=>new Promise(r=>setTimeout(r,ms));

test('rich edits retain links, formatting, heading breaks, nested lists and code',()=>{
 const result=toMarkdown('<h1>Hello<br>World</h1><p><strong>Bold</strong> <em>italic</em> <a href="https://example.com/path?q=1">link</a></p><ul><li>Outer<ul><li>Inner</li></ul></li></ul><pre><code class="language-js">const x = 1;</code></pre>');
 const html=markdown(result);
 assert.match(html,/<h1>Hello<br>World<\/h1>/);
 assert.match(html,/<strong>Bold<\/strong> <em>italic<\/em>/);
 assert.match(html,/href="https:\/\/example.com\/path\?q=1"/);
 assert.match(html,/<li>Outer\n<ul>/);
 assert.match(html,/<code class="language-js">const x = 1;/);
});
test('rich blocks preserve captions, tables, details and relative image paths',()=>{
 const result=toMarkdown('<figure><img src="img.jpg" alt="Alt"><figcaption>Caption</figcaption></figure><details class="article-details"><summary>More</summary><p>Hidden <strong>text</strong></p></details><table><thead><tr><th>Name</th></tr></thead><tbody><tr><td>One</td></tr></tbody></table>');
 const html=markdown(result);
 assert.match(html,/<figcaption>Caption<\/figcaption>/);
 assert.match(html,/src="img.jpg"/);
 assert.match(html,/<details class="article-details">/);
 assert.match(html,/<summary>More<\/summary>/);
 assert.match(html,/<strong>text<\/strong>/);
 assert.match(html,/<table>/);
 assert.match(html,/<td>One<\/td>/);
});
test('autosave debounces edits, uses latest body, and updates revision',async()=>{
 const calls=[];
 const save=createAutosave({body:'Original',revision:'r1',delay:30,send:async data=>{calls.push(data);return {revision:'r2'};}});
 save.change('First');await wait(10);save.change('Latest');
 assert.equal(calls.length,0);await wait(45);
 assert.deepEqual(calls,[{body:'Latest',revision:'r1'}]);
 assert.equal(save.dirty,false);
 save.change('Final');await save.flush();
 assert.deepEqual(calls[1],{body:'Final',revision:'r2'});
});
test('edits made during an in-flight save are drained in order',async()=>{
 let release;const calls=[];
 const save=createAutosave({body:'Original',revision:'r1',delay:500,send:async data=>{calls.push(data);if(calls.length===1)await new Promise(r=>release=r);return {revision:'r'+(calls.length+1)};}});
 save.change('First');const first=save.flush();await wait(0);
 save.change('Second');release();await first;
 assert.deepEqual(calls,[{body:'First',revision:'r1'},{body:'Second',revision:'r2'}]);
 assert.equal(save.dirty,false);
});
test('save errors retain dirty content for explicit retry',async()=>{
 let fail=true;const states=[];
 const save=createAutosave({body:'Original',revision:'r1',delay:500,onState:s=>states.push(s),send:async()=>{if(fail)throw new Error('Offline');return {revision:'r2'};}});
 save.change('Unsaved');await assert.rejects(save.flush(),/Offline/);
 assert.equal(save.dirty,true);assert.equal(states.at(-1).state,'error');
 fail=false;await save.flush();assert.equal(save.dirty,false);assert.equal(states.at(-1).state,'saved');
});
test('changing the autosave delay reschedules pending changes',async()=>{
 let calls=0;
 const save=createAutosave({body:'Original',revision:'r1',delay:500,send:async()=>{calls++;return {revision:'r2'};}});
 save.change('New');save.setDelay(10);await wait(30);assert.equal(calls,1);
});

test('new links preserve ampersands and parentheses through rendering',()=>{
 const result=toMarkdown('<p><a href="https://example.com/?a=1&amp;b=2">Query</a> <a href="https://example.com/Test_(thing)">Parentheses</a></p>');
 const html=markdown(result);
 assert.match(html,/href="https:\/\/example.com\/\?a=1&amp;b=2"/);
 assert.match(html,/href="https:\/\/example.com\/Test_\(thing\)"/);
});

test('links containing spaces remain valid after a rich-text save',()=>{
 const html=markdown(toMarkdown('<p><a href="/files/my file.pdf">File</a></p>'));
 assert.match(html,/href="\/files\/my(?: |%20)file.pdf"/);
 assert.doesNotMatch(html,/href="&?lt;|href="</);
});

test('lost responses are reconciled before newer edits are sent',async()=>{
 const calls=[];let lose=true;
 const save=createAutosave({body:'Original',revision:'r1',delay:500,send:async data=>{
  calls.push(data);
  if(lose){lose=false;throw new Error('Response lost');}
  return {revision:data.body==='First'?'r2':'r3'};
 }});
 save.change('First');await assert.rejects(save.flush());save.change('Second');await save.flush();
 assert.deepEqual(calls,[{body:'First',revision:'r1'},{body:'First',revision:'r1'},{body:'Second',revision:'r2'}]);
 assert.equal(save.dirty,false);
});
