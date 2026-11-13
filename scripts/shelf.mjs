// The home page illustration: a two-level shelf drawn in thin lines. Each labeled container is a link.
// Hovering or focusing one lifts what is inside it and dims the others (see .shelf in style.css).
// Drawn on a 1000 x 470 grid; strokes keep a constant width at any size (vector-effect in CSS).

const side=(x,top,bottom,d=20)=>`<path class="dash" d="M${x} ${top}l${d} -8V${bottom-8}l-${d} 8"/>`;
const lines=(x,y,widths,gap=11)=>`<path class="ink-line" d="${widths.map((w,i)=>`M${x} ${y+i*gap}h${w}`).join('')}"/>`;
const item=(key,href,label,body)=>`<a class="item item-${key}" href="${href}" aria-label="${label}"><g class="item-body">${body}</g></a>`;

export function shelf(){
 const room=(top,bottom,backTop,backBottom)=>`
  <path class="wall" d="M18 ${top}H982L800 ${backTop}H200Z"/>
  <path class="wall" d="M18 ${top}L200 ${backTop}V${backBottom}L18 ${bottom}Z"/>
  <path class="wall" d="M982 ${top}L800 ${backTop}V${backBottom}L982 ${bottom}Z"/>
  <rect class="back" x="200" y="${backTop}" width="600" height="${backBottom-backTop}"/>`;

 const writing=item('writing','/writing/','Writing',`
  <g class="lift">
   <rect class="paper" x="108" y="112" width="188" height="70"/>${lines(124,128,[96,140,120])}
   <rect class="paper" x="96" y="124" width="196" height="64"/>${lines(112,140,[120,80])}
  </g>
  <rect class="paper" x="78" y="152" width="262" height="10"/>
  <rect class="face" x="70" y="160" width="262" height="55"/>${side(332,160,215)}
  <text x="201" y="194">Writing</text>`);

 const resume=item('resume','/resume/','Resume',`
  <path class="paper" d="M560 215V122H618l10 -10h62l10 10h80V215Z"/>
  <g class="lift">
   <rect class="paper" x="576" y="100" width="188" height="110"/>${lines(592,116,[70])}${lines(592,134,[150,128,140],10)}
  </g>
  <rect class="face" x="560" y="142" width="220" height="73"/>${side(780,142,215)}
  <text x="670" y="185">Resume</text>`);

 const thinking=item('thinking','/#thinking','Currently thinking about',`
  <g class="lift">
   <rect class="paper tilt-l" x="88" y="318" width="74" height="74"/>
   <rect class="paper" x="140" y="304" width="74" height="74"/>${lines(152,320,[40,50])}
   <rect class="paper tilt-r" x="192" y="318" width="74" height="74"/>
  </g>
  <rect class="paper" x="68" y="362" width="242" height="10"/>
  <rect class="face" x="60" y="370" width="242" height="70"/>${side(302,370,440)}
  <text x="181" y="411">Thinking about</text>`);

 const contact=item('contact','/contact/','Contact',`
  <g class="lift">
   <rect class="paper" x="646" y="312" width="188" height="96"/>
   <path class="ink-line" d="M646 312l94 46 94 -46"/>
  </g>
  <rect class="face" x="620" y="366" width="240" height="74"/>${side(860,366,440)}
  <text x="740" y="409">Contact</text>`);

 return `<figure class="shelf-figure"><svg class="shelf" viewBox="0 0 1000 470" role="group" aria-label="Sections of this site">
 <rect class="frame" x="10" y="10" width="980" height="450"/>
 <rect class="frame" x="18" y="18" width="964" height="434"/>
 ${room(18,225,70,200)}
 ${room(239,452,285,425)}
 <rect class="frame" x="18" y="225" width="964" height="14"/>
 <g aria-hidden="true">
  <rect class="paper" x="414" y="78" width="62" height="137"/>${side(476,78,215,16)}
  <rect class="paper" x="492" y="104" width="34" height="111"/>${side(526,104,215,12)}
  <rect class="paper" x="350" y="296" width="54" height="144"/>${side(404,296,440,16)}
  <rect class="paper" x="452" y="410" width="132" height="30"/>${side(584,410,440,14)}
  <rect class="paper" x="462" y="384" width="112" height="26"/>${side(574,384,410,12)}
  <rect class="paper" x="446" y="362" width="120" height="22"/>${side(566,362,384,12)}
  <path class="ink-line" d="M472 425h40M480 397h30M462 373h36"/>
 </g>
 ${writing}${resume}${thinking}${contact}
</svg></figure>`;
}
