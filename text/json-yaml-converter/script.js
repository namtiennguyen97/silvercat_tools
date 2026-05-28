(function(){
'use strict';
const inputEl=document.getElementById('input-json');
const outputEl=document.getElementById('output-yaml');
const inputLabel=document.getElementById('input-label');
const outputLabel=document.getElementById('output-label');
const modeJsonYaml=document.getElementById('mode-json-yaml');
const modeYamlJson=document.getElementById('mode-yaml-json');
const indentSelect=document.getElementById('indent-select');
const btnFormat=document.getElementById('btn-format');
const btnMinify=document.getElementById('btn-minify');
const btnClear=document.getElementById('btn-clear-jy');
const btnCopy=document.getElementById('btn-copy-output');
const btnSwap=document.getElementById('btn-swap-jy');

let currentMode='json2yaml';

function getIndent(){return parseInt(indentSelect.value,10);}

function jsonToYaml(jsonStr){
  try{
    const obj=JSON.parse(jsonStr);
    return yamlStringify(obj,getIndent());
  }catch(e){return 'JSON Error: '+e.message;}
}

function yamlToJson(yamlStr){
  try{
    const obj=yamlParse(yamlStr);
    return JSON.stringify(obj,null,getIndent());
  }catch(e){return 'YAML Error: '+e.message;}
}

function yamlStringify(obj,indent,lvl){
  if(lvl===undefined)lvl=0;
  if(obj===null||obj===undefined)return'null';
  if(typeof obj==='string'){
    if(obj.includes(':')||obj.includes('#')||obj.includes('{')||obj.includes('}')||obj.includes('[')||obj.includes(']')||obj.includes(',')||obj.includes('&')||obj.includes('*')||obj.includes('?')||obj.includes('|')||obj.includes('>')||obj.includes('!')||obj.includes('%')||obj.includes('@')||obj.includes('`'))return'"'+obj.replace(/"/g,'\\"')+'"';
    return obj;
  }
  if(typeof obj==='number'||typeof obj==='boolean')return String(obj);
  if(Array.isArray(obj)){
    if(obj.length===0)return'[]';
    return obj.map(item=>'\n'+' '.repeat(lvl)+'- '+yamlStringify(item,indent,lvl+indent).replace(/\n/g,'\n'+' '.repeat(lvl+indent))).join('');
  }
  if(typeof obj==='object'){
    const keys=Object.keys(obj);
    if(keys.length===0)return'{}';
    return keys.map(key=>{
      const val=yamlStringify(obj[key],indent,lvl+indent);
      if(typeof obj[key]==='object'&&obj[key]!==null&&!Array.isArray(obj[key])){
        return '\n'+' '.repeat(lvl)+key+':'+val;
      }
      if(Array.isArray(obj[key])&&obj[key].length>0){
        return '\n'+' '.repeat(lvl)+key+':'+val;
      }
      return '\n'+' '.repeat(lvl)+key+': '+val;
    }).join('');
  }
  return String(obj);
}

function yamlParse(yamlStr){
  const lines=yamlStr.split('\n').filter(l=>l.trim()&&!l.trim().startsWith('#'));
  const root={};
  const stack=[{obj:root,indent:-1}];
  let lastArray=null;
  let lastArrayIndent=-1;

  lines.forEach(line=>{
    const trimmed=line.trim();
    const indent=line.search(/\S/);
    if(indent<0)return;

    if(trimmed.startsWith('- ')){
      const val=trimmed.substring(2).trim();
      const arrItem=parseYamlValue(val);
      while(stack.length>1&&stack[stack.length-1].indent>=indent)stack.pop();
      const parent=stack[stack.length-1].obj;
      if(!Array.isArray(parent)){
        const keys=Object.keys(parent);
        const lastKey=keys[keys.length-1];
        if(lastKey&&!parent[lastKey])parent[lastKey]=[];
        if(lastKey)parent[lastKey].push(arrItem);
        lastArray=parent[lastKey];
      }else{
        parent.push(arrItem);
        lastArray=parent;
      }
      lastArrayIndent=indent;
    }else{
      const colonIdx=trimmed.indexOf(':');
      if(colonIdx===-1)return;
      const key=trimmed.substring(0,colonIdx).trim();
      const valStr=trimmed.substring(colonIdx+1).trim();
      let val=parseYamlValue(valStr);

      while(stack.length>1&&stack[stack.length-1].indent>=indent)stack.pop();

      const parent=stack[stack.length-1].obj;
      if(valStr===''||val===undefined){
        if(Array.isArray(parent)&&lastArray&&lastArrayIndent===indent){
          const newObj={};
          lastArray.push(newObj);
          stack.push({obj:newObj,indent});
        }else{
          const newObj={};
          parent[key]=newObj;
          stack.push({obj:newObj,indent});
        }
      }else{
        if(Array.isArray(parent)){
          const newObj={};
          newObj[key]=val;
          parent.push(newObj);
          stack.push({obj:newObj,indent});
        }else{
          parent[key]=val;
        }
      }
    }
  });

  return root;
}

function parseYamlValue(v){
  if(!v||v==='')return undefined;
  if(v==='null'||v==='~')return null;
  if(v==='true'||v==='True'||v==='TRUE')return true;
  if(v==='false'||v==='False'||v==='FALSE')return false;
  if(/^\d+$/.test(v))return parseInt(v,10);
  if(/^\d+\.\d+$/.test(v))return parseFloat(v);
  if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))return v.slice(1,-1);
  return v;
}

function convert(){
  const input=inputEl.value.trim();
  if(!input){outputEl.value='';return;}
  if(currentMode==='json2yaml'){
    outputEl.value=jsonToYaml(input);
  }else{
    outputEl.value=yamlToJson(input);
  }
}

inputEl.addEventListener('input',convert);
indentSelect.addEventListener('change',convert);

modeJsonYaml.addEventListener('click',()=>{
  currentMode='json2yaml';
  modeJsonYaml.classList.add('active');
  modeYamlJson.classList.remove('active');
  inputLabel.textContent='JSON Input';
  outputLabel.textContent='YAML Output';
  inputEl.placeholder='{"key": "value"}';
  outputEl.placeholder='key: value';
  convert();
});

modeYamlJson.addEventListener('click',()=>{
  currentMode='yaml2json';
  modeYamlJson.classList.remove('active');
  modeYamlJson.classList.add('active');
  inputLabel.textContent='YAML Input';
  outputLabel.textContent='JSON Output';
  inputEl.placeholder='key: value';
  outputEl.placeholder='{"key": "value"}';
  convert();
});

btnFormat.addEventListener('click',()=>{
  if(currentMode==='json2yaml'){
    try{inputEl.value=JSON.stringify(JSON.parse(inputEl.value),null,getIndent());}
    catch(e){outputEl.value='JSON Error: '+e.message;return;}
  }
  convert();
});

btnMinify.addEventListener('click',()=>{
  try{inputEl.value=JSON.stringify(JSON.parse(inputEl.value));}
  catch(e){outputEl.value='JSON Error: '+e.message;return;}
  convert();
});

btnClear.addEventListener('click',()=>{inputEl.value='';outputEl.value='';});

btnCopy.addEventListener('click',()=>{
  navigator.clipboard.writeText(outputEl.value).then(()=>{
    btnCopy.textContent='Copied!';
    setTimeout(()=>{btnCopy.textContent='Sao Chép';},1500);
  });
});

btnSwap.addEventListener('click',()=>{
  const tmp=inputEl.value;
  inputEl.value=outputEl.value;
  outputEl.value=tmp;
  convert();
});

// Samples
const samples={
  sample1:'{"status":"success","data":{"user":{"id":1,"name":"John Doe","email":"john@example.com","roles":["admin","user"]},"token":"abc123"}}',
  sample2:'version:"3.8"\nservices:\n  app:\n    image:nginx:alpine\n    ports:\n      - "80:80"\n    environment:\n      - NODE_ENV=production\n      - DEBUG=false',
  sample3:'apiVersion:apps/v1\nkind:Deployment\nmetadata:\n  name:my-app\nspec:\n  replicas:3\n  selector:\n    matchLabels:\n      app:my-app'
};

document.querySelectorAll('[data-sample]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const sample=btn.dataset.sample;
    if(samples[sample]){
      inputEl.value=samples[sample];
      if(sample==='sample1'){modeJsonYaml.click();}else{modeYamlJson.click();}
      convert();
    }
  });
});

// i18n update for labels when language changes
window.addEventListener('languageChanged',()=>{
  if(currentMode==='json2yaml'){inputLabel.textContent='JSON Input';outputLabel.textContent='YAML Output';}
  else{inputLabel.textContent='YAML Input';outputLabel.textContent='JSON Output';}
  btnCopy.textContent=btnCopy.textContent==='Copied!'?'Copied!':(localStorage.getItem('preferred-lang')==='vi'?'Sao Chép':'Copy');
});
})();