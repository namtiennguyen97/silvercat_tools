(function(){
'use strict';
const urlInput=document.getElementById('url-input');
const queryList=document.getElementById('query-list');
const builtUrl=document.getElementById('built-url');
const partProtocol=document.getElementById('part-protocol');
const partHost=document.getElementById('part-host');
const partPort=document.getElementById('part-port');
const partPath=document.getElementById('part-path');
const partHash=document.getElementById('part-hash');

function parseURL(urlStr){
  try{
    const u=new URL(urlStr);
    partProtocol.textContent=u.protocol.replace(':','');
    partHost.textContent=u.hostname;
    partPort.textContent=u.port||'—';
    partPath.textContent=decodeURIComponent(u.pathname);
    partHash.textContent=u.hash?u.hash.substring(1):'—';
    renderParams(u.searchParams);
    buildCurrentURL();
  }catch(e){
    partProtocol.textContent='Error';
    partHost.textContent=e.message;
    partPort.textContent='—';
    partPath.textContent='—';
    partHash.textContent='—';
  }
}

function renderParams(sp){
  queryList.innerHTML='';
  var has=false;
  sp.forEach(function(val,key){has=true;addParamRow(key,val);});
  if(!has)queryList.innerHTML='<div class="query-empty" data-i18n="url-no-params">Không có query params</div>';
}

function addParamRow(key,val){
  var row=document.createElement('div');row.className='query-row';
  var inpKey=document.createElement('input');inpKey.placeholder='Key';inpKey.value=key;
  var inpVal=document.createElement('input');inpVal.placeholder='Value';inpVal.value=val;
  var btn=document.createElement('button');btn.className='query-remove';btn.textContent='×';btn.title='Remove';
  btn.addEventListener('click',function(){row.remove();buildCurrentURL();if(!queryList.querySelector('.query-row'))queryList.innerHTML='<div class="query-empty" data-i18n="url-no-params">Không có query params</div>';});
  [inpKey,inpVal].forEach(function(el){el.addEventListener('input',buildCurrentURL);});
  row.appendChild(inpKey);row.appendChild(inpVal);row.appendChild(btn);
  if(queryList.querySelector('.query-empty'))queryList.innerHTML='';
  queryList.appendChild(row);
}

function buildCurrentURL(){
  try{
    var u=new URL(urlInput.value);u.search='';
    queryList.querySelectorAll('.query-row').forEach(function(row){
      var inputs=row.querySelectorAll('input');
      if(inputs[0].value.trim())u.searchParams.set(inputs[0].value.trim(),inputs[1].value);
    });
    builtUrl.textContent=u.toString();
  }catch(e){builtUrl.textContent='Invalid URL';}
}

document.getElementById('btn-parse').addEventListener('click',function(){parseURL(urlInput.value);});
urlInput.addEventListener('keydown',function(e){if(e.key==='Enter')parseURL(urlInput.value);});
document.getElementById('btn-add-param').addEventListener('click',function(){if(queryList.querySelector('.query-empty'))queryList.innerHTML='';addParamRow('','');});
document.getElementById('btn-copy-url').addEventListener('click',function(){
  navigator.clipboard.writeText(builtUrl.textContent).then(function(){
    var btn=document.getElementById('btn-copy-url');btn.textContent='Copied!';
    setTimeout(function(){btn.textContent=localStorage.getItem('preferred-lang')==='vi'?'Sao Chép':'Copy';},1500);
  });
});
document.querySelectorAll('[data-url]').forEach(function(btn){
  btn.addEventListener('click',function(){urlInput.value=btn.dataset.url;parseURL(urlInput.value);});
});
parseURL(urlInput.value);
})();