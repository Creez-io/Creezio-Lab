#!/usr/bin/env node
/** Verify and restore immutable public archives and receipts. No install or build. */
import {createHash,randomUUID} from 'node:crypto';
import {existsSync,lstatSync,mkdirSync,readFileSync,renameSync,unlinkSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const defaultRoot=fileURLToPath(new URL('../../',import.meta.url));
const sdk='https://github.com/creezio/Creezio-D1R2/releases/download/sdk-v1.1.0/';
const sdk12='https://github.com/creezio/Creezio-D1R2/releases/download/sdk-v1.2.0/';
const sdk141='https://github.com/creezio/Creezio-D1R2/releases/download/sdk-v1.4.1/';
const sdk19='https://github.com/creezio/Creezio-D1R2/releases/download/sdk-v1.9.0/';
const module='https://github.com/creezio/Creezio-Extension-Starter/releases/download/module-v0.1.0/';
const candidate='https://github.com/creezio/Creezio-Extension-Starter/releases/download/module-v0.1.2/';
const current='https://github.com/creezio/Creezio-Extension-Starter/releases/download/module-v0.1.3/';
export const pins=[
  ['creezio-sdk-1.1.0.tgz',sdk,66315,'f874f0ed29a41ec45b8f686884b5e2260b9600d9045588174fff8a7fcdd5eeec'],
  ['creezio-purchase-requests-0.1.0.tgz',module,33672,'800c8e0e9eb61c3b8abeb04d98b4c6eea343bc4af9cc1cfe0be3f633dbafb85c'],
  ['creezio-purchase-requests-0.1.0-validation.tgz',module,49840,'4010b8a59ef9e8a02dc5b4f15e87ed3c24f97eca0e6ef65978996dbc730736ba'],
  ['manifest.json',module,1198,'a0cb2cdb16ba87d007cbdc21db1d209023af94c8d8758a08018ae42ed875b418'],
  ['creezio-purchase-requests-0.1.2.tgz',candidate,34850,'e73d9767ea3e361ed635e91cf2d73b8a0037ee5db17503b2c45100e32fdb14ea'],
  ['creezio-purchase-requests-0.1.2-validation.tgz',candidate,53284,'4d981a292862cd61b7025362ea934d11a85b9d46af9ffe31d6ef372a3b0add6f'],
  ['manifest-0.1.2.json',candidate,1198,'3386c7877b9970f9a743dc59cee2258f770cb8cd0877314bb5f31ae2bbbb50ad'],
  ['creezio-sdk-1.2.0.tgz',sdk12,70423,'34eb5e1a8ff5b2937cdc9e8fe0a41697705208e708f85a90e0308802b430eda8'],
  ['creezio-purchase-requests-0.1.3.tgz',current,38739,'3cc1600d2fa5555be7013105521af2fbd4a0fb92408135465601d22cdd05ea4a'],
  ['creezio-purchase-requests-0.1.3-validation.tgz',current,59898,'fda2bab507a5d7ec7ac58d6360bd720d5b95039872be4f822bd738d8fe21383f'],
  ['manifest-0.1.3.json',current,1198,'04e0ae79297a5f1c41c934b99b4a1e1a0c5a0e69830c8a4bbfbc65d019fe6085'],
  ['creezio-sdk-1.4.1.tgz',sdk141,73013,'3196390908a13cf32290f100584a3edb20931c8b3f56c37c6fab131c3fe4b37d'],
  ['creezio-sdk-1.9.0.tgz',sdk19,88108,'b10cc8ca47bad85d3f22124e0b3da214cea15610330fc650a8c107cba189eb2a'],
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
const next=JSON.parse(readFileSync(path.join(directory,'manifest-0.1.2.json'),'utf8'));
if(next.module?.id!=='creezio.purchase-requests'||next.module.version!=='0.1.2'
  ||next.module.source?.revision!=='3aa49c97a0802fa383c44588f835326f89bb006e'
  ||next.module.source?.integrity!=='sha256-f227f7caa9ad2bf3ddaae48cd07ce2216fc6c806833c0feaef63219ddfcbedd6'
  ||next.runtime?.integrity!==`sha256-${pins[4][3]}`
  ||next.validation?.integrity!==`sha256-${pins[5][3]}`)fail('candidate receipt identity');
const installed=JSON.parse(readFileSync(path.join(directory,'manifest-0.1.3.json'),'utf8'));
if(installed.module?.id!=='creezio.purchase-requests'||installed.module.version!=='0.1.3'
  ||installed.module.source?.revision!=='25144f306d59a81077daf8ab4f07a4a1ddc0951d'
  ||installed.module.source?.integrity!=='sha256-07d5d3b0a3d4a2b360adc7362224eeb18456cb9d50abcc1628d8f701a76f3780'
  ||installed.runtime?.integrity!==`sha256-${pins[8][3]}`
  ||installed.validation?.integrity!==`sha256-${pins[9][3]}`)fail('installed receipt identity');
return {status:'verified',files:pins.map(([name])=>name)};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
  console.log(JSON.stringify(await bootstrapPublicPackages()));
