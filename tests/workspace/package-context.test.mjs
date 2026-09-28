import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

test('host source and an installed SDK resolve one set of React contexts',async()=>{
  const root=fileURLToPath(new URL('../../',import.meta.url));
  const composition=JSON.parse(readFileSync(join(root,'configuration/composition.json'),'utf8'));
  const consumers=composition.modules.map(module=>module.source.kind==='package'
    ?join(root,'node_modules',...module.source.name.split('/')):join(root,module.source.path));
  const peerImports=`
    export * as activitySource from '@creezio/sdk/workspace/components';
    export * as metadataSource from '@creezio/sdk/workspace/metadata';
    export * as toolbarSource from '@creezio/sdk/workspace/toolbar';
    export * as assistantSource from '@creezio/sdk/ui/assistant-provider';`;
  const source=`
    import {activitySource,metadataSource,toolbarSource,assistantSource} from 'module-consumer';
    import * as activityPackage from '@creezio/sdk/workspace/components';
    import * as metadataPackage from '@creezio/sdk/workspace/metadata';
    import * as toolbarPackage from './admin/workspace/page-toolbar-context.tsx';
    import * as assistantPackage from '@creezio/sdk/ui/assistant-provider';
    export const identities={
      activity:activitySource.Workspace===activityPackage.Workspace
        &&activitySource.useWorkspaceActivity===activityPackage.useWorkspaceActivity
        &&activitySource.WorkspacePortal===activityPackage.WorkspacePortal,
      metadata:metadataSource.WorkspaceMetadataProvider===metadataPackage.WorkspaceMetadataProvider
        &&metadataSource.useRegisterWorkspaceMetadata===metadataPackage.useRegisterWorkspaceMetadata,
      toolbar:toolbarSource.PageToolbarProvider===toolbarPackage.PageToolbarProvider
        &&toolbarSource.useRegisterPageToolbar===toolbarPackage.useRegisterPageToolbar,
      assistant:assistantSource.AssistantProvider===assistantPackage.AssistantProvider
        &&assistantSource.useAssistantUiOptional===assistantPackage.useAssistantUiOptional,
    };`;
  assert.ok(consumers.length,'This integration recipe requires installed modules.');
  for(const consumer of consumers){
    // Resolve the SDK from each real module's directory. An independently
    // installed SDK under a module would create different providers and fail.
    const result=await build({stdin:{contents:source,resolveDir:root,sourcefile:'contexts.tsx',loader:'tsx'},
      bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'module-peer-contexts',setup(bundler){
        bundler.onResolve({filter:/^module-consumer$/},()=>({path:'consumer',namespace:'peer-contexts'}));
        bundler.onLoad({filter:/.*/,namespace:'peer-contexts'},()=>({contents:peerImports,loader:'ts',resolveDir:consumer}));
      }}]});
    const url=`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].contents).toString('base64')}`;
    const {identities}=await import(url);
    assert.deepEqual(identities,{activity:true,metadata:true,toolbar:true,assistant:true},consumer);
  }
});
