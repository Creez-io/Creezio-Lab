#!/usr/bin/env node
/** Restore immutable public file: dependencies before npm ci. No install or build. */
import {createHash,randomUUID} from 'node:crypto';
import {existsSync,lstatSync,mkdirSync,readFileSync,renameSync,unlinkSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const defaultRoot=fileURLToPath(new URL('../../',import.meta.url));
const sdk='https://github.com/creezio/Creezio-D1R2/releases/download/sdk-v1.1.0/';
const module='https://github.com/creezio/Creezio-Extension-Starter/releases/download/module-v0.1.0/';
export const pins=[
  ['creezio-sdk-1.1.0.tgz',sdk,66315,'f874f0ed29a41ec45b8f686884b5e2260b9600d9045588174fff8a7fcdd5eeec'],
  ['creezio-purchase-requests-0.1.0.tgz',module,33672,'800c8e0e9eb61c3b8abeb04d98b4c6eea343bc4af9cc1cfe0be3f633dbafb85c'],
  ['creezio-purchase-requests-0.1.0-validation.tgz',module,49840,'4010b8a59ef9e8a02dc5b4f15e87ed3c24f97eca0e6ef65978996dbc730736ba'],
  ['manifest.json',module,1198,'a0cb2cdb16ba87d007cbdc21db1d209023af94c8d8758a08018ae42ed875b418'],
];
const fail=reason=>{throw new Error(`Public package bootstrap refused: ${reason}`);};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
function safe(file){
  for(let cursor=path.resolve(file);;cursor=path.dirname(cursor)){
    if(lstatSync(cursor,{throwIfNoEntry:false})?.isSymbolicLink())fail('linked path');
    if(cursor===path.dirname(cursor))break;
  }
}
function ensureDirectory(file){safe(file);if(existsSync(file)){
  if(!lstatSync(file).isDirectory())fail('directory collision');
}else mkdirSync(file);}
function allowed(url){
  const parsed=new URL(url);
  if(parsed.protocol!=='https:'||parsed.username||parsed.password||parsed.port||parsed.hash
    ||!['github.com','release-assets.githubusercontent.com','objects.githubusercontent.com'].includes(parsed.hostname))
    fail('download origin');
  return parsed.href;
}
async function download(url,expectedSize){
  for(let hop=0;hop<4;hop++){
    const response=await fetch(allowed(url),{redirect:'manual',signal:AbortSignal.timeout(60_000)});
    if([301,302,303,307,308].includes(response.status)){
      const next=response.headers.get('location');if(!next)fail('redirect');
      url=allowed(new URL(next,url).href);continue;
    }
    if(response.status!==200||!response.body)fail(`http ${response.status}`);
    const stated=response.headers.get('content-length');
    if(stated!==null&&(!/^\d+$/.test(stated)||Number(stated)>expectedSize))fail('size');
    const chunks=[];let size=0;
    for await(const chunk of response.body){size+=chunk.length;if(size>expectedSize)fail('size');chunks.push(Buffer.from(chunk));}
    if(size!==expectedSize)fail('size');
    return Buffer.concat(chunks,size);
  }
  fail('redirect limit');
}
export async function bootstrapPublicPackages(root=defaultRoot){
const directory=path.join(root,'.creezio','packages');
ensureDirectory(path.join(root,'.creezio'));ensureDirectory(directory);
for(const [name,base,size,expected] of pins){
  const target=path.join(directory,name);safe(target);
  if(existsSync(target)){
    const info=lstatSync(target);
    if(!info.isFile()||info.size!==size||hash(readFileSync(target))!==expected)fail(`existing ${name}`);
  }else{
    const bytes=await download(`${base}${name}`,size);
    if(hash(bytes)!==expected)fail(`digest ${name}`);
    const temp=`${target}.tmp-${randomUUID()}`;
    try{writeFileSync(temp,bytes,{flag:'wx'});renameSync(temp,target);}
    finally{if(existsSync(temp))unlinkSync(temp);}
  }
}
const receipt=JSON.parse(readFileSync(path.join(directory,'manifest.json'),'utf8'));
if(receipt.module?.id!=='creezio.purchase-requests'||receipt.module.version!=='0.1.0'
  ||receipt.module.source?.revision!=='527a1bc1446a529ad6e560e3a25dea13a12001e9'
  ||receipt.runtime?.integrity!==`sha256-${pins[1][3]}`
  ||receipt.validation?.integrity!==`sha256-${pins[2][3]}`)fail('receipt identity');
return {status:'verified',files:pins.map(([name])=>name)};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
  console.log(JSON.stringify(await bootstrapPublicPackages()));
