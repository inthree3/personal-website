import TurndownService from 'turndown';
import {gfm} from 'turndown-plugin-gfm';

const converter=new TurndownService({headingStyle:'atx',bulletListMarker:'-',codeBlockStyle:'fenced',emDelimiter:'*',strongDelimiter:'**'});
converter.use(gfm);
// Keep blocks whose attributes/structure Markdown cannot fully represent.
converter.addRule('richBlocks',{
 filter:['details','figure','table','video','iframe','picture'],
 replacement:(_,node)=>'\n\n'+node.outerHTML+'\n\n'
});
converter.addRule('lineBreak',{filter:'br',replacement:()=>'<br>'});
converter.addRule('headings',{
 filter:['h1','h2','h3','h4','h5','h6'],
 replacement:(content,node)=>'\n\n'+'#'.repeat(Number(node.nodeName[1]))+' '+content.replace(/\n/g,' ')+'\n\n'
});
// Turndown wraps whitespace destinations in <...>, which this site's small
// renderer doesn't parse. HTML links preserve these destinations verbatim.
const attribute=value=>value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
converter.addRule('whitespaceLinks',{
 filter:node=>node.nodeName==='A'&&/\s/.test(node.getAttribute('href')||''),
 replacement:(content,node)=>`<a href="${attribute(node.getAttribute('href'))}"${node.getAttribute('title')?` title="${attribute(node.getAttribute('title'))}"`:''}>${content}</a>`
});
converter.remove(['script','style','noscript']);
export function toMarkdown(html){return converter.turndown(html);}
