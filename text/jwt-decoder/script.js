(function(){
'use strict';
const jwtInput=document.getElementById('jwt-input');
const codeHeader=document.getElementById('code-header');
const codePayload=document.getElementById('code-payload');
const expiryBadge=document.getElementById('expiry-badge');
const jwtCompareA=document.getElementById('jwt-compare-a');
const jwtCompareB=document.getElementById('jwt-compare-b');
const codeCompare=document.getElementById('code-compare');
const btnClearJwt=document.getElementById('btn-clear-jwt');
const btnCompareJwt=document.getElementById('btn-compare-jwt');

function base64UrlDecode(str){
  str=str.replace(/-/g,'+').replace(/_/g,'/');
  while(str.length%4)str+='=';
  try{return decodeURIComponent(atob(str).split('').map(c=>'%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''));}
  catch(e){return atob(str);}
}

function formatJSON(str){
  try{
    const obj=JSON.parse(str);
    return JSON.stringify(obj,null,2);
  }catch(e){return str;}
}

function timeAgo(ts){
  const d=new Date(ts*1000);
  const now=new Date();
  const diff=now-d;
  const secs=Math.floor(diff/1000);
  if(secs<0)return d.toLocaleString();
  if(secs<60)return secs+'s ago';
  if(secs<3600)return Math.floor(secs/60)+'m ago';
  if(secs<86400)return Math.floor(secs/3600)+'h ago';
  return Math.floor(secs/86400)+'d ago ('+d.toLocaleString()+')';
}

function decodeJWT(token,headerEl,payloadEl,expiryEl){
  const parts=token.trim().split('.');
  if(parts.length!==3){
    if(headerEl)headerEl.textContent='Invalid JWT format';
    if(payloadEl)payloadEl.textContent='';
    if(expiryEl)expiryEl.style.display='none';
    return;
  }
  try{
    const header=formatJSON(base64UrlDecode(parts[0]));
    const payload=formatJSON(base64UrlDecode(parts[1]));
    if(headerEl)headerEl.textContent=header;
    if(payloadEl)payloadEl.textContent=payload;

    if(expiryEl){
      try{
        const obj=JSON.parse(base64UrlDecode(parts[1]));
        if(obj.exp){
          const expTime=new Date(obj.exp*1000);
          const isValid=expTime>new Date();
          expiryEl.style.display='inline-block';
          expiryEl.textContent=isValid?'✅ Valid until '+expTime.toLocaleString():'❌ Expired '+timeAgo(obj.exp);
          expiryEl.className=isValid?'expiry-valid':'expiry-expired';
        }else{
          expiryEl.style.display='none';
        }
      }catch(e){expiryEl.style.display='none';}
    }
  }catch(e){
    if(headerEl)headerEl.textContent='Error: '+e.message;
    if(expiryEl)expiryEl.style.display='none';
  }
}

function updateMainDecoder(){
  const token=jwtInput.value.trim();
  if(!token){codeHeader.textContent='';codePayload.textContent='';expiryBadge.style.display='none';return;}
  decodeJWT(token,codeHeader,codePayload,expiryBadge);
}

jwtInput.addEventListener('input',updateMainDecoder);

btnClearJwt.addEventListener('click',()=>{
  jwtInput.value='';
  updateMainDecoder();
});

document.querySelectorAll('[data-token]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    jwtInput.value=btn.dataset.token;
    updateMainDecoder();
  });
});

btnCompareJwt.addEventListener('click',()=>{
  const a=jwtCompareA.value.trim();
  const b=jwtCompareB.value.trim();
  if(!a||!b){codeCompare.style.display='block';codeCompare.textContent='Paste both tokens first.';return;}
  try{
    const partsA=a.split('.');
    const partsB=b.split('.');
    if(partsA.length!==3||partsB.length!==3){codeCompare.style.display='block';codeCompare.textContent='Invalid JWT format.';return;}
    const payloadA=JSON.parse(base64UrlDecode(partsA[1]));
    const payloadB=JSON.parse(base64UrlDecode(partsB[1]));
    const keys=new Set([...Object.keys(payloadA),...Object.keys(payloadB)]);
    const rows=[];
    keys.forEach(k=>{
      const va=JSON.stringify(payloadA[k]!==undefined?payloadA[k]:'—');
      const vb=JSON.stringify(payloadB[k]!==undefined?payloadB[k]:'—');
      const marker=va===vb?'  =':'≠';
      rows.push(marker+' '+k+': '+va+' → '+vb);
    });
    codeCompare.style.display='block';
    codeCompare.textContent=rows.join('\n');
  }catch(e){codeCompare.style.display='block';codeCompare.textContent='Error: '+e.message;}
});

updateMainDecoder();
})();