(function(){
'use strict';
const uuidList=document.getElementById('uuid-list');
const typeUuid4=document.getElementById('type-uuid4');
const typeUuid7=document.getElementById('type-uuid7');
const typeUlid=document.getElementById('type-ulid');
const countInput=document.getElementById('uuid-count');
const decodeInput=document.getElementById('uuid-decode-input');
const decodeResult=document.getElementById('decode-result');
let currentType='uuid4';

function hex(n,b){return n.toString(16).padStart(b||2,'0');}
function randomBytes(n){const a=new Uint8Array(n);crypto.getRandomValues(a);return Array.from(a);}

function genUuid4(){const b=randomBytes(16);b[6]=(b[6]&0x0f)|0x40;b[8]=(b[8]&0x3f)|0x80;return hex(b[0])+hex(b[1])+hex(b[2])+hex(b[3])+'-'+hex(b[4])+hex(b[5])+'-'+hex(b[6])+hex(b[7])+'-'+hex(b[8])+hex(b[9])+'-'+hex(b[10])+hex(b[11])+hex(b[12])+hex(b[13])+hex(b[14])+hex(b[15]);}

function genUuid7(){
  const ts=BigInt(Date.now());
  const b=randomBytes(10);
  const hi=hex(Number((ts>>BigInt(16))&BigInt(0xFFFFFFFF)),8);
  const mid=hex(Number(ts&BigInt(0xFFFF)),4);
  b[0]=(b[0]&0x0f)|0x70;
  return hi+'-'+mid+'-7'+hex(b[0]).substring(1)+hex(b[1])+'-'+hex(b[2]&0x3f|0x80)+hex(b[3])+'-'+hex(b[4])+hex(b[5])+hex(b[6])+hex(b[7])+hex(b[8])+hex(b[9]);
}

const CROCKFORD='0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function genUlid(){
  const ts=Date.now().toString(16).padStart(12,'0').toUpperCase();
  let r='';for(let i=0;i<14;i++)r+=CROCKFORD[Math.floor(Math.random()*32)];
  return ts+r;
}

function generate(){
  const n=Math.min(Math.max(parseInt(countInput.value,10)||1,1),100);
  uuidList.innerHTML='';
  for(let i=0;i<n;i++){
    let val='';
    if(currentType==='uuid4')val=genUuid4();
    else if(currentType==='uuid7')val=genUuid7();
    else val=genUlid();
    const item=document.createElement('div');item.className='uuid-item';
    const code=document.createElement('code');code.className='uuid-code';code.textContent=val;
    const btn=document.createElement('button');btn.className='copy-single';btn.textContent='📋';btn.title='Copy';
    btn.addEventListener('click',()=>{navigator.clipboard.writeText(val);btn.textContent='✅';setTimeout(()=>{btn.textContent='📋';},1000);});
    item.appendChild(code);item.appendChild(btn);
    uuidList.appendChild(item);
  }
}

function decodeTimestamp(){
  const val=decodeInput.value.trim();
  if(!val){decodeResult.innerHTML='Paste a UUID v7 or ULID above to decode its timestamp';return;}
  try{
    if(val.length===26&&/^[0-9A-HJKMNP-TV-Z]+$/.test(val)){
      const tsHex=val.substring(0,12).toLowerCase();
      const d=new Date(parseInt(tsHex,16));
      decodeResult.innerHTML='✅ ULID → <strong>'+d.toLocaleString()+'</strong> ('+d.toISOString()+')';
      decodeResult.style.color='#22c55e';return;
    }
    const parts=val.split('-');
    if(parts.length===5&&parts[2].length===4&&parts[2].startsWith('7')){
      const tsHi=parseInt(parts[0]+parts[1].substring(0,4),16);
      const d=new Date(tsHi*1000);
      decodeResult.innerHTML='✅ UUID v7 → <strong>'+d.toLocaleString()+'</strong> ('+d.toISOString()+')';
      decodeResult.style.color='#22c55e';return;
    }
    decodeResult.textContent='⚠️ Only UUID v7 and ULID contain embedded timestamps';
    decodeResult.style.color='#f59e0b';
  }catch(e){decodeResult.textContent='Error: '+e.message;decodeResult.style.color='#f87171';}
}

[typeUuid4,typeUuid7,typeUlid].forEach(btn=>{
  btn.addEventListener('click',()=>{
    [typeUuid4,typeUuid7,typeUlid].forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    if(btn===typeUuid4)currentType='uuid4';else if(btn===typeUuid7)currentType='uuid7';else currentType='ulid';
    generate();
  });
});

document.getElementById('btn-generate').addEventListener('click',generate);
document.getElementById('btn-copy-all').addEventListener('click',()=>{
  const codes=uuidList.querySelectorAll('.uuid-code');
  navigator.clipboard.writeText(Array.from(codes).map(c=>c.textContent).join('\n')).then(()=>{
    const btn=document.getElementById('btn-copy-all');btn.textContent='✅ Copied!';
    setTimeout(()=>{btn.textContent='Copy Tất Cả';},1500);
  });
});
document.getElementById('btn-decode').addEventListener('click',decodeTimestamp);
decodeInput.addEventListener('keydown',e=>{if(e.key==='Enter')decodeTimestamp();});
generate();
})();