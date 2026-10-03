import test from 'node:test';
import assert from 'node:assert/strict';
import {copyFileSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {temporaryDirectory} from './temporary.mjs';
import {bootstrapPublicPackages,pins} from '../../scripts/lab/bootstrap-public-packages.mjs';
import {verifyPublicPackageProjection,verifyPublicPackageSource} from '../../scripts/lab/verify-public-sdk.mjs';

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
  const bytes=readFileSync(path.join(source,pins[12][0]));
  bytes[0]^=1;
  writeFileSync(path.join(directory,pins[12][0]),bytes);
  await assert.rejects(bootstrapPublicPackages(fixture),/existing creezio-sdk-1\.9\.0\.tgz/);
});

test('npm projects both public release packages selected by the lock',async()=>{
  const report=await verifyPublicPackageProjection(root);
  assert.deepEqual(report.packages,[
    {name:'@creezio/sdk',version:'1.9.0'},
    {name:'@creezio/purchase-requests',version:'0.1.3'},
  ]);
});

test('public source pins and lock use release URLs with archive integrity',t=>{
  const fixture=temporaryDirectory(t,'creezio-public-source-');
  const directory=path.join(fixture,'.creezio','packages');
  mkdirSync(directory,{recursive:true});
  for(const index of [8,12])copyFileSync(path.join(source,pins[index][0]),path.join(directory,pins[index][0]));
  const packageFile=path.join(fixture,'package.json'),lockFile=path.join(fixture,'package-lock.json');
  copyFileSync(path.join(root,'package.json'),packageFile);
  copyFileSync(path.join(root,'package-lock.json'),lockFile);
  assert.deepEqual(verifyPublicPackageSource(fixture).map(item=>item.name),
    ['@creezio/sdk','@creezio/purchase-requests']);
  const pkg=JSON.parse(readFileSync(packageFile,'utf8'));
  pkg.devDependencies['@creezio/sdk']='file:.creezio/packages/creezio-sdk-1.9.0.tgz';
  writeFileSync(packageFile,JSON.stringify(pkg));
  assert.throws(()=>verifyPublicPackageSource(fixture),/@creezio\/sdk lock/);
  copyFileSync(path.join(root,'package.json'),packageFile);
  const lock=JSON.parse(readFileSync(lockFile,'utf8'));
  lock.packages['node_modules/@creezio/purchase-requests'].integrity='sha512-invalid';
  writeFileSync(lockFile,JSON.stringify(lock));
  assert.throws(()=>verifyPublicPackageSource(fixture),/@creezio\/purchase-requests lock/);
});
