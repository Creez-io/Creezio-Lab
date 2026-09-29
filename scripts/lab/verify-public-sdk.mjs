#!/usr/bin/env node
/** Check the exact public package URLs, lock and installed projections. */
import {createHash} from 'node:crypto';
import {existsSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bootstrapPublicPackages,pins} from './bootstrap-public-packages.mjs';

const defaultRoot=fileURLToPath(new URL('../../',import.meta.url));
const fail=reason=>{throw new Error(`Public package projection refused: ${reason}`);};
const json=file=>JSON.parse(readFileSync(file,'utf8'));
const sha512=bytes=>`sha512-${createHash('sha512').update(bytes).digest('base64')}`;

export function verifyPublicPackageSource(root=defaultRoot){
  const pack=json(path.join(root,'package.json'));
  const lock=json(path.join(root,'package-lock.json'));
  const selected=[
    {name:'@creezio/sdk',version:'1.4.1',file:pins[11][0],section:'devDependencies',
      exports:['./delivery/context','./delivery/transport','./operations/command-journal']},
    {name:'@creezio/purchase-requests',version:'0.1.3',file:pins[8][0],section:'dependencies',
      exports:['./dist/module/entry.server.js','./dist/ui/contributions.js']},
  ];
  for(const item of selected){
    const pin=pins.find(([name])=>name===item.file);
    if(!pin)fail(`${item.name} pin`);
    const spec=`${pin[1]}${pin[0]}`;
    const entry=lock.packages?.[`node_modules/${item.name}`];
    const bytes=readFileSync(path.join(root,'.creezio','packages',item.file));
    if(pack[item.section]?.[item.name]!==spec||lock.packages?.['']?.[item.section]?.[item.name]!==spec
      ||entry?.resolved!==spec||entry?.version!==item.version||entry?.integrity!==sha512(bytes))
      fail(`${item.name} lock`);
  }
  return selected;
}

export async function verifyPublicPackageProjection(root=defaultRoot){
  await bootstrapPublicPackages(root);
  const selected=verifyPublicPackageSource(root);
  for(const item of selected){
    const installedRoot=path.join(root,'node_modules',...item.name.split('/'));
    if(!existsSync(path.join(installedRoot,'package.json')))fail(`${item.name} absent`);
    const installed=json(path.join(installedRoot,'package.json'));
    if(installed.name!==item.name||installed.version!==item.version)fail(`${item.name} identity`);
    for(const key of item.exports){
      const exportPath=installed.exports?.[key]?.import;
      if(typeof exportPath!=='string'||!exportPath.startsWith('./')||exportPath.includes('..')
        ||!existsSync(path.join(installedRoot,exportPath)))fail(`${item.name} export ${key}`);
    }
  }
  return {status:'verified',packages:selected.map(({name,version})=>({name,version}))};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
  console.log(JSON.stringify(await verifyPublicPackageProjection()));
