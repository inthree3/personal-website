import test from 'node:test';
import assert from 'node:assert/strict';
import {markdown,frontMatter,inline} from '../scripts/markdown.mjs';

test('front matter is split from the body',()=>{
 const {data,body}=frontMatter('---\ntitle: "Hello: world"\ndate: 2026-11-09\nsample: true\n---\n\nText');
 assert.deepEqual(data,{title:'Hello: world',date:'2026-11-09',sample:true});
 assert.equal(body.trim(),'Text');
});

test('inline formatting, links and escaping',()=>{
 assert.equal(inline('**bold** and *it* and `a<b`'),'<strong>bold</strong> and <em>it</em> and <code>a&lt;b</code>');
 assert.equal(inline('[site](https://x.com) & 3 < 4'),'<a href="https://x.com" rel="noopener">site</a> &amp; 3 &lt; 4');
 assert.equal(inline('snake_case_name stays'),'snake_case_name stays');
 assert.equal(inline('line<br>break'),'line<br>break');
});

test('a lone image becomes a figure with its title as caption',()=>{
 assert.equal(markdown('![Alt](/a.png "Caption")'),'<figure><img src="/a.png" alt="Alt" loading="lazy" decoding="async"><figcaption>Caption</figcaption></figure>');
});

test('nested lists, ordered lists and task lists',()=>{
 const html=markdown('- one\n  - nested\n- two\n\n1. first\n2. second\n\n- [x] done\n- [ ] todo');
 assert.match(html,/<ul>\n<li>one\n<ul>\n<li>nested<\/li>\n<\/ul><\/li>\n<li>two<\/li>\n<\/ul>/);
 assert.match(html,/<ol>\n<li>first<\/li>\n<li>second<\/li>\n<\/ol>/);
 assert.match(html,/<li class="task"><input type="checkbox" disabled checked> done<\/li>/);
});

test('code fences are escaped and not parsed',()=>{
 assert.equal(markdown('```\n**not bold** <b>\n```'),'<pre><code>**not bold** &lt;b&gt;</code></pre>');
});

test('raw html blocks wrap parsed markdown',()=>{
 const html=markdown('<details>\n<summary>More</summary>\n\nHidden **text**\n\n</details>');
 assert.equal(html,'<details>\n<summary>More</summary>\n<p>Hidden <strong>text</strong></p>\n</details>');
});

test('tables, quotes, rules and line breaks',()=>{
 assert.match(markdown('| a | b |\n|---|--:|\n| 1 | 2 |'),/<th>a<\/th><th class="align-right">b<\/th>.*<td>1<\/td><td class="align-right">2<\/td>/s);
 assert.equal(markdown('> quoted'),'<blockquote><p>quoted</p></blockquote>');
 assert.equal(markdown('---'),'<hr>');
 assert.equal(markdown('one  \ntwo\\\nthree\nfour'),'<p>one<br>two<br>three\nfour</p>');
});

test('relative URLs can be rewritten for post folders',()=>{
 assert.equal(markdown('![x](img%20one.png)',{url:u=>'/writing/p/'+u}),'<figure><img src="/writing/p/img%20one.png" alt="x" loading="lazy" decoding="async"></figure>');
});
