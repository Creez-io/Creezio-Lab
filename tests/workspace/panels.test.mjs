import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Workspace,RetainedSubViews} from '@creezio/sdk/workspace/components';

test('retained subviews expose inactive semantics and keep the active view visible',()=>{
  const html=renderToStaticMarkup(createElement(RetainedSubViews,{active:'details',views:[
    {id:'overview',content:createElement('input',{defaultValue:'draft-one'})},
    {id:'details',content:createElement('input',{defaultValue:'draft-two'})}]}));
  assert.match(html,/data-subview="details"/);
  assert.match(html,/draft-two/);
  assert.doesNotMatch(html,/draft-one/);
});

test('workspace renders a safe pending state before a matching projection',()=>{
  const access={audience:'admin',origin:'https://creezio.example',
    getSnapshot:()=>({phase:'loading',session:null,pending:null}),subscribe:()=>()=>{}};
  const html=renderToStaticMarkup(createElement(Workspace,{access,projection:null,views:[],
    navigation:[],client:{},contextId:'application'}));
  assert.match(html,/Vérification de l’accès au workspace/);
  assert.doesNotMatch(html,/role="tabpanel"/);
});
