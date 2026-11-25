// Lightweight render regression checks; no database credentials or browser required.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const ts=require('typescript');
const Module=require('node:module');
const resolve=Module._resolveFilename;
Module._resolveFilename=function(request,...args){return resolve.call(this,request.startsWith('@/')?path.join(__dirname,'..',request.slice(2)):request,...args);};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
require.extensions['.css']=()=>{};
const games=[['FoundationGame',{}],['FractionRace',{}],['FractionTrain',{}],['NumberLineGame',{}],['OppositeNumberGame',{}],['BracketMaskGame',{}],...['aim','match','tower'].map(mode=>['PowerReviewGame',{mode}]),...['bomb','balance'].map(mode=>['OrderBalanceGames',{mode}])];
for(const [name,props] of games){
 const Component=require('../components/'+name+'.tsx').default;
 const html=renderToStaticMarkup(React.createElement(Component,props));
 assert(html.includes('Bắt đầu'),'start action: '+name);
 assert(html.includes('Quay lại'),'back action: '+name);
 assert(html.includes('mission-welcome'),'intro: '+name);
 assert(!html.includes('class="foundation-game"'),'board hidden before start: '+name);
 assert.equal((html.match(/role="dialog"/g)||[]).length,1,'single mission screen: '+name);
}
console.log('PASS: 11 game modes render a focused intro, back/start navigation, no premature board.');
