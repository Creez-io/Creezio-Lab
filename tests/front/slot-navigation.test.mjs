import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {currentProtectedSlot,protectedSlotNavigation} from '../../app/front/slot-navigation.ts';

// Lab's default composition intentionally leaves Pages inactive. Exercise the
// selected Core front profile without changing the Lab composition or generated files.
const composition=JSON.parse(readFileSync(new URL('../../configuration/composition.front-chatgpt-like.json',import.meta.url),'utf8'));
const lock=JSON.parse(readFileSync(new URL('../../configuration/composition.front-chatgpt-like.lock.json',import.meta.url),'utf8'));
const pages=JSON.parse(readFileSync(new URL('../../extensions/native/pages-navigation/module/manifest.json',import.meta.url),'utf8'));
const moduleId=pages.identity.id;
const view=pages.contracts.ui.views.find(item=>item.id==='editorial-nav');
const slot=pages.contracts.ui.slots.find(item=>item.id==='published-navigation');
const viewId=`${moduleId}:${view.id}`,slotId=`${moduleId}:${slot.id}`;
assert.ok(composition.modules.some(item=>item.moduleId===moduleId));
assert.ok(lock.modules.some(item=>item.moduleId===moduleId));
const session={id:'session-app',principalId:'owner',audience:'app'};
const state={phase:'authenticated',pending:null,session};
const projection={sessionId:session.id,principalId:session.principalId,audience:'app',
  contextId:'application',compositionDigest:lock.compositionIntegrity,
  viewIds:[viewId],slotIds:[slotId]};
const scope={active:true,authorized:true,visible:true,contextId:'application',
  compositionDigest:lock.compositionIntegrity,slotId,viewId};

test('selected protected slot uses its declared view ID and live projection',()=>{
  assert.equal(slot.view.moduleId,moduleId);
  assert.equal(slot.view.id,view.id);
  assert.equal(currentProtectedSlot(state,projection,scope),true);
  assert.equal(currentProtectedSlot(state,projection,{...scope,active:false}),false);
  assert.equal(currentProtectedSlot(state,{...projection,viewIds:[]},scope),false);
  assert.equal(currentProtectedSlot(state,{...projection,slotIds:[]},scope),false);
  assert.equal(currentProtectedSlot({...state,session:{...session,id:'other'}},projection,scope),false);
});

test('protected slot keeps local panel state and routes through the current host only',()=>{
  const calls=[];let current=true;
  const local={back:()=>true,forward:()=>true,readPanelState:()=>({draft:'kept'}),
    savePanelState:value=>{calls.push(['state',value]);return true;},
    open:()=>{throw Error('local slot route used');},visit:()=>{throw Error('local slot route used');}};
  const navigation=protectedSlotNavigation(local,{isCurrent:()=>current,
    open:(...args)=>{calls.push(['open',...args]);return true;},
    visit:(...args)=>{calls.push(['visit',...args]);return true;}});
  assert.equal(navigation.open('creezio.pages-navigation:front',{slug:'/aide'}),true);
  assert.equal(navigation.visit('/pages?slug=%2Faide',{replace:true}),true);
  assert.deepEqual(navigation.readPanelState(),{draft:'kept'});
  assert.equal(navigation.savePanelState({draft:'new'}),true);
  current=false;
  assert.equal(navigation.open('creezio.pages-navigation:front',{}),false);
  assert.equal(navigation.visit('/pages'),false);
  assert.deepEqual(calls,[['open','creezio.pages-navigation:front',{slug:'/aide'},undefined],
    ['visit','/pages?slug=%2Faide',{replace:true}],['state',{draft:'new'}]]);
});
