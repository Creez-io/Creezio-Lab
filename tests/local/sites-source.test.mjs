import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,readFileSync,readdirSync,lstatSync,rmdirSync,unlinkSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildOperator,stageSitesMetadata} from '../../scripts/sites/artifacts.mjs';
import {planSitesExport,writeSitesArchive} from '../../scripts/sites/export.mjs';
import {measureRuntimeArtifacts} from '../../scripts/quality/runtime.mjs';
import {sourceIdentity} from '../../scripts/quality/evidence.mjs';
import {planSitesSource,prepareSitesSource,verifySitesSource} from '../../scripts/sites/source.mjs';
import {pins} from '../../scripts/lab/bootstrap-public-packages.mjs';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const digest=bytes=>`sha256-${hash(bytes)}`;
const sourceCli=fileURLToPath(new URL('../../scripts/sites/source.mjs',import.meta.url));
function put(root,relative,body){
  const file=path.join(root,...relative.split('/'));
  mkdirSync(path.dirname(file),{recursive:true});writeFileSync(file,body);return file;
}
function git(root,...args){return execFileSync('git',['-C',root,...args],{encoding:'utf8'}).trim();}
function commit(root,subject){
  git(root,'-c','core.autocrlf=false','add','.');
  git(root,'-c','user.name=Sites Test','-c','user.email=sites@example.invalid','commit','-q','-m',subject);
}
function dispose(root,boundary=root){
  const relative=path.relative(boundary,root);
  assert(!relative.startsWith('..')&&!path.isAbsolute(relative));
  assert(!lstatSync(root).isSymbolicLink());
  for(const name of readdirSync(root)){
    const file=path.join(root,name),stat=lstatSync(file);
    assert(!stat.isSymbolicLink());
    if(stat.isDirectory())dispose(file,boundary);else unlinkSync(file);
  }
  rmdirSync(root);
}
function fixture({previous=false,unknown=false}={}){
  const home=mkdtempSync(path.join(tmpdir(),'creezio-sites-source-'));
  const core=path.join(home,'core'),site=path.join(home,'descriptor'),stage=path.join(home,'stage');
  for(const root of [core,site,stage])mkdirSync(root);
  const hosting=JSON.stringify({project_id:'appgprj_test',d1:'DB',r2:'BUCKET'})+'\n';
  const compositionDigest='sha256-'+'a'.repeat(64);
  put(site,'.openai/hosting.json',hosting);
  const historyFiles=['drizzle/0000_base.sql','drizzle/meta/0000_snapshot.json','drizzle/meta/_journal.json']
    .map((name,index)=>({path:name,digest:digest(Buffer.from(`generation-${index}\n`))}));
  for(const [index,file] of historyFiles.entries())put(site,file.path,`generation-${index}\n`);
  put(site,'db/schema.ts','export const schema={};\n');
  put(site,'drizzle.config.cjs',"module.exports={dialect:'sqlite'};\n");
  put(site,'db/creezio-schema-history.json',JSON.stringify({schemaVersion:1,applicationId:'app',
    compositionDigest,files:historyFiles})+'\n');
  put(core,'.gitignore','dist/\n.quality/\n');
  const sdk=`${pins[11][1]}${pins[11][0]}`,purchase=`${pins[8][1]}${pins[8][0]}`;
  put(core,'package.json',JSON.stringify({name:'example',scripts:{build:'node build.js'},
    dependencies:{'@creezio/purchase-requests':purchase},devDependencies:{'@creezio/sdk':sdk}},null,2)+'\n');
  put(core,'package-lock.json',JSON.stringify({lockfileVersion:3,packages:{'':{
    dependencies:{'@creezio/purchase-requests':purchase},devDependencies:{'@creezio/sdk':sdk}},
    'node_modules/@creezio/purchase-requests':{version:'0.1.3',resolved:purchase},
    'node_modules/@creezio/sdk':{version:'1.4.1',resolved:sdk}}},null,2)+'\n');
  put(core,'scripts/lab/bootstrap-public-packages.mjs','export async function bootstrapPublicPackages() {}\n');
  put(core,'scripts/sites/build.mjs',"import {bootstrapPublicPackages} from '../lab/bootstrap-public-packages.mjs';\nawait bootstrapPublicPackages();\n");
  put(core,'configuration/composition.sites.json','{}\n');
  put(core,'configuration/composition.sites.lock.json','{}\n');
  put(core,'app.js','export default "source";\n');
  git(core,'init','-q');commit(core,'synthetic Core source');
  put(core,'dist/server/index.js','export default "Worker";\n');
  put(core,'dist/client/index.html','<main>Site</main>\n');
  const metadata=stageSitesMetadata(site,core,{projectId:'appgprj_test',compositionDigest});
  const artifact=measureRuntimeArtifacts(core),source=sourceIdentity(core);
  put(core,'.quality/sites-build.json',JSON.stringify({projectId:'appgprj_test',source,
    compositionDigest,artifact,metadata})+'\n');
  put(stage,'.openai/hosting.json',hosting);
  if(previous){
    put(stage,'legacy.txt','retired source\n');
    put(stage,'package.json','{"scripts":{"build":"old"}}\n');
    put(stage,'sites-source-provenance.json',JSON.stringify({schemaVersion:1,projectId:'appgprj_test',
      sourceFiles:[{path:'legacy.txt',sha256:hash(Buffer.from('retired source\n'))},
        {path:'package.json',sha256:'0'.repeat(64)}],generated:[],
      packageDigest:hash(Buffer.from('{"scripts":{"build":"old"}}\n'))})+'\n');
  }
  if(unknown)put(stage,'unowned.txt','preserve me\n');
  git(stage,'init','-q');commit(stage,'staging base');
  return {home,core,site,stage,planFile:path.join(home,'plan.json'),
    receiptFile:path.join(home,'receipt.json'),verificationFile:path.join(home,'verification.json')};
}
test('Sites source plan prepares only attested files and verifies the separate staging commit',()=>{
  const f=fixture({previous:true});
  try{
    mkdirSync(path.join(f.site,'nested'));
    assert.throws(()=>planSitesSource({applicationRoot:f.core,siteRoot:f.site,
      stageRoot:path.join(f.site,'nested')}),/roots must be disjoint/);
    execFileSync(process.execPath,[sourceCli,'plan','--core',f.core,'--site',f.site,
      '--stage',f.stage,'--plan',f.planFile]);
    const plan=JSON.parse(readFileSync(f.planFile,'utf8'));
    assert.deepEqual(plan.removed,['legacy.txt']);
    assert.equal(plan.coreSource.head,git(f.core,'rev-parse','HEAD'));
    assert.equal(plan.stageBase.head,git(f.stage,'rev-parse','HEAD'));
    assert(!plan.files.some(file=>file.path.startsWith('dist/')));
    execFileSync(process.execPath,[sourceCli,'prepare','--plan',f.planFile,
      '--receipt',f.receiptFile]);
    const receipt=JSON.parse(readFileSync(f.receiptFile,'utf8'));
    assert.equal(receipt.projectId,'appgprj_test');
    assert.throws(()=>lstatSync(path.join(f.stage,'legacy.txt')),error=>error.code==='ENOENT');
    const stagedPackage=JSON.parse(readFileSync(path.join(f.stage,'package.json'),'utf8'));
    const stagedLock=JSON.parse(readFileSync(path.join(f.stage,'package-lock.json'),'utf8'));
    assert.match(stagedPackage.scripts.build,/composition\.sites\.json/);
    for(const [section,name] of [['dependencies','@creezio/purchase-requests'],
      ['devDependencies','@creezio/sdk']]){
      assert.equal(stagedPackage[section][name],stagedLock.packages[''][section][name]);
      assert.equal(stagedPackage[section][name],stagedLock.packages[`node_modules/${name}`].resolved);
      assert.match(stagedPackage[section][name],/^https:\/\/github\.com\/creezio\//);
    }
    assert.match(readFileSync(path.join(f.stage,'scripts/sites/build.mjs'),'utf8'),/bootstrapPublicPackages/);
    assert.match(readFileSync(path.join(f.stage,'scripts/lab/bootstrap-public-packages.mjs'),'utf8'),/bootstrapPublicPackages/);
    assert(!plan.files.some(file=>file.path.startsWith('.creezio/')));
    assert.throws(()=>verifySitesSource(f.planFile,f.receiptFile),/committed/);
    commit(f.stage,'new Sites source');
    execFileSync(process.execPath,[sourceCli,'verify','--plan',f.planFile,
      '--receipt',f.receiptFile,'--verification',f.verificationFile]);
    const verified=JSON.parse(readFileSync(f.verificationFile,'utf8'));
    assert.equal(verified.coreSource.head,plan.coreSource.head);
    assert.equal(verified.siteSource.head,git(f.stage,'rev-parse','HEAD'));
    assert.notEqual(verified.siteSource.head,verified.coreSource.head);
    assert.deepEqual(planSitesSource({applicationRoot:f.core,siteRoot:f.site,stageRoot:f.stage}).removed,[]);
    assert.throws(()=>prepareSitesSource(plan,f.planFile,f.receiptFile),/already exists/);
    put(f.stage,'app.js','tampered\n');
    assert.throws(()=>verifySitesSource(f.planFile,f.receiptFile),/not been committed/);
    git(f.stage,'restore','--','app.js');
    git(f.stage,'checkout','--orphan','unrelated');
    commit(f.stage,'unrelated history with identical bytes');
    assert.throws(()=>verifySitesSource(f.planFile,f.receiptFile),/does not descend/);
  }finally{dispose(f.home);}
});
test('Sites source refuses unowned tracked staging files before writing',()=>{
  const f=fixture({unknown:true});
  try{
    assert.throws(()=>planSitesSource({applicationRoot:f.core,siteRoot:f.site,stageRoot:f.stage}),
      /Unknown tracked/);
    assert.equal(readFileSync(path.join(f.stage,'unowned.txt'),'utf8'),'preserve me\n');
  }finally{dispose(f.home);}
});
test('Sites source refuses an ignored local file at a planned destination',()=>{
  const f=fixture();
  try{
    put(f.stage,'.git/info/exclude','app.js\n');
    put(f.stage,'app.js','local data must survive\n');
    assert.equal(git(f.stage,'status','--porcelain'),'');
    assert.throws(()=>planSitesSource({applicationRoot:f.core,siteRoot:f.site,stageRoot:f.stage}),
      /Existing untracked/);
    assert.equal(readFileSync(path.join(f.stage,'app.js'),'utf8'),'local data must survive\n');
  }finally{dispose(f.home);}
});
test('Sites source refuses stale plan and a changed hosting descriptor without staging effects',()=>{
  const f=fixture();
  try{
    const plan=planSitesSource({applicationRoot:f.core,siteRoot:f.site,stageRoot:f.stage});
    writeFileSync(f.planFile,JSON.stringify(plan,null,2)+'\n',{flag:'wx'});
    put(f.site,'.openai/hosting.json',JSON.stringify({project_id:'other',d1:'DB',r2:'BUCKET'})+'\n');
    assert.throws(()=>prepareSitesSource(plan,f.planFile,f.receiptFile));
    assert.equal(git(f.stage,'status','--porcelain'),'');
    assert.equal(lstatSync(f.receiptFile,{throwIfNoEntry:false}),undefined);
  }finally{dispose(f.home);}
});
test('Sites export seals only measured app artifacts and refuses a changed build',()=>{
  const f=fixture();
  try{
    const plan=planSitesExport('app',f.site,{applicationRoot:f.core});
    const archive=path.join(f.home,'application.tar.gz');
    const receipt=path.join(f.home,'application-export.json');
    const result=writeSitesArchive(plan,archive,receipt);
    assert.equal(result.projectId,'appgprj_test');
    assert.deepEqual(result.archive.files.map(file=>file.path).sort(),[
      'dist/.openai/hosting.json','dist/.openai/drizzle/0000_base.sql',
      'dist/.openai/drizzle/meta/0000_snapshot.json','dist/.openai/drizzle/meta/_journal.json',
      'dist/client/index.html','dist/server/index.js'].sort());
    assert.equal(result.archive.sha256,digest(readFileSync(archive)));
    put(f.core,'dist/server/index.js','altered after build\n');
    assert.throws(()=>planSitesExport('app',f.site,{applicationRoot:f.core}),
      /differs from its source receipt/);
  }finally{dispose(f.home);}
});
test('Sites operator export binds its code and DDL history to a separate archive',()=>{
  const f=fixture();
  try{
    put(f.site,'.gitignore','dist/\n');
    const code='export default {fetch(){return new Response("ready")}};\n';
    put(f.site,'operator.mjs',code);
    put(f.site,'operator-provenance.json',JSON.stringify({projectId:'appgprj_test',
      applicationId:'app',compositionDigest:'sha256-'+'a'.repeat(64),
      operatorDigest:digest(Buffer.from(code)),planDigest:'sha256-'+'b'.repeat(64),
      schemaObjects:1})+'\n');
    git(f.site,'init','-q');commit(f.site,'synthetic operator source');
    buildOperator(f.site);
    const plan=planSitesExport('operator',f.site);
    const result=writeSitesArchive(plan,path.join(f.home,'operator.tar.gz'),
      path.join(f.home,'operator-export.json'));
    assert.equal(result.source.operatorDigest,digest(Buffer.from(code)));
    assert.equal(result.archive.files.length,5);
    put(f.site,'dist/server/index.js','changed operator\n');
    assert.throws(()=>planSitesExport('operator',f.site),/differs from its provenance/);
  }finally{dispose(f.home);}
});
