import test from 'node:test';
import assert from 'node:assert/strict';
import {copyFileSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {temporaryDirectory} from './temporary.mjs';
import {bootstrapPublicPackages,pins} from '../../scripts/lab/bootstrap-public-packages.mjs';
import {verifyPublicPackageProjection} from '../../scripts/lab/verify-public-sdk.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const source=path.join(root,'.creezio','packages');

test('public package bootstrap reuses the exact immutable archives and receipt',async t=>{
  const fixture=temporaryDirectory(t,'creezio-public-packages-');
  const directory=path.join(fixture,'.creezio','packages');
  mkdirSync(directory,{recursive:true});
  for(const [name] of pins)copyFileSync(path.join(source,name),path.join(directory,name));
  const report=await bootstrapPublicPackages(fixture);
  assert.deepEqual(report.files,pins.map(([name])=>name));
});

test('public package bootstrap refuses an existing archive with changed bytes',async t=>{
  const fixture=temporaryDirectory(t,'creezio-public-packages-');
  const directory=path.join(fixture,'.creezio','packages');
  mkdirSync(directory,{recursive:true});
  const bytes=readFileSync(path.join(source,pins[0][0]));
  bytes[0]^=1;
  writeFileSync(path.join(directory,pins[0][0]),bytes);
  await assert.rejects(bootstrapPublicPackages(fixture),/existing creezio-sdk-1\.1\.0\.tgz/);
});

test('npm projects both public file packages selected by the lock',async()=>{
  const report=await verifyPublicPackageProjection(root);
  assert.deepEqual(report.packages,[
    {name:'@creezio/sdk',version:'1.1.0'},
    {name:'@creezio/purchase-requests',version:'0.1.2'},
  ]);
});
