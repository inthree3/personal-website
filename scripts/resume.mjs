// Compiles targeted-resumes/targets/<name>.yaml into targeted-resumes/out/Stella-Hwang-<name>.pdf with Typst.
// Usage: npm run resume -- <name> [--watch]   |   npm run resume -- --all   |   npm run resume (lists targets)
import {readdirSync,mkdirSync,copyFileSync,readFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const dir=join(dirname(fileURLToPath(import.meta.url)),'..','targeted-resumes');
const names=readdirSync(join(dir,'targets')).filter(f=>f.endsWith('.yaml')).map(f=>f.slice(0,-5)).sort();
const args=process.argv.slice(2),watch=args.includes('--watch'),wanted=args.filter(a=>!a.startsWith('--'));
const targets=args.includes('--all')?names:wanted;
if(!targets.length){console.log('Targets:\n'+names.map(n=>'  '+n).join('\n')+'\n\nBuild one: npm run resume -- <name>   Build all: npm run resume -- --all');process.exit(0);}
const unknown=targets.filter(t=>!names.includes(t));
if(unknown.length){console.error(`No target named ${unknown.join(', ')} in targeted-resumes/targets/.`);process.exit(1);}

// Largest font size (10.5pt down to 9pt) that fits one page, then the most extra spacing that still fits.
const pages=(t,size,gap)=>{
 const q=spawnSync('typst',['query','--root',dir,'--input',`target=${t}`,'--input',`size=${size}`,'--input',`gap=${gap}`,join(dir,'resume.typ'),'<pages>','--field','value','--one'],{encoding:'utf8'});
 return q.status===0?Number(q.stdout.trim()):99;
};
function fit(t){
 let size='9.0';
 for(let s=105;s>=90;s--){const c=(s/10).toFixed(1);if(pages(t,c,0)===1){size=c;break;}}
 let gap='0';
 for(let g=1;g<=16;g++){const c=(g/2).toFixed(1);if(pages(t,size,c)===1)gap=c;else break;}
 return {size,gap};
}
// A target with `company: NAME` writes into targeted-resumes/NAME/; others go to targeted-resumes/out/.
const companyOf=t=>readFileSync(join(dir,'targets',`${t}.yaml`),'utf8').match(/^company:\s*(\S+)/m)?.[1];
for(const t of targets){
 const company=companyOf(t),folder=company?join(dir,company):join(dir,'out');
 mkdirSync(folder,{recursive:true});
 const out=join(folder,`Stella-Hwang-${t}.pdf`);
 const {size,gap}=watch?{size:'9.5',gap:'0'}:fit(t);
 const r=spawnSync('typst',[watch?'watch':'compile','--root',dir,'--input',`target=${t}`,'--input',`size=${size}`,'--input',`gap=${gap}`,join(dir,'resume.typ'),out],{stdio:'inherit'});
 if(r.error?.code==='ENOENT'){console.error('Typst is not installed. Run: brew install typst');process.exit(1);}
 if(r.status)process.exit(r.status);
 if(!watch)console.log(`Wrote targeted-resumes/${company||'out'}/Stella-Hwang-${t}.pdf (one page, ${size}pt, +${gap}pt spacing)`);
 if(!watch&&t==='default'){mkdirSync(join(dir,'..','src','resumes'),{recursive:true});copyFileSync(out,join(dir,'..','src','resumes','stella-hwang.pdf'));console.log('Copied to src/resumes/stella-hwang.pdf for the site.');}
}
