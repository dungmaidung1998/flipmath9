const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
require.extensions['.css']=()=>{};
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const Dashboard=require('../components/ClassOverview.tsx').default;
const props={rows:[{id:'s1',name:'An',score:null,submitted:null,prepared:false,mastery:null,diagnosis:null,action:null},{id:'s2',name:'Bình',score:0,submitted:null,prepared:true,mastery:0,diagnosis:null,action:null},{id:'s3',name:'Chi',score:8,submitted:null,prepared:true,mastery:2,diagnosis:null,action:null}],className:'7A1',unitName:'Cộng phân số',updated:'test',errors:[],warnings:[],available:{quiz:true,mastery:true,recommendations:true,errors:true},detailHref:'/gv/phan-tich-lop'};
const html=renderToStaticMarkup(React.createElement(Dashboard,props));
assert(html.includes('0.0/10'),'zero is a real score');
assert(html.includes('Chưa đủ dữ liệu'),'missing mastery must remain distinct');
assert(html.includes('Chưa làm'),'missing attempts must remain distinct');
assert.equal((html.match(/class="bi-metric"/g)||[]).length,4);
assert.equal((html.match(/class="bi-bar-row"/g)||[]).length,5);
assert(!html.includes('Đã học trước'),'quiz completion must not claim pre-class timing');
const failed=renderToStaticMarkup(React.createElement(Dashboard,{...props,available:{quiz:false,mastery:false,recommendations:false,errors:false}}));
assert(!failed.includes('0.0/10'),'failed data must not display a fabricated score');
assert(failed.includes('Không tải được'));
const empty=renderToStaticMarkup(React.createElement(Dashboard,{...props,rows:[]}));
assert(!empty.includes('NaN')&&!empty.includes('Infinity'));
console.log('PASS: four metrics, missing vs zero vs failed, empty class, honest preparation label.');

const Workspace=require('../components/TeacherWorkspace.tsx').default;
for(let index=0;index<3;index++){
 const screen=renderToStaticMarkup(React.createElement(Workspace,{titles:['Overview','Understanding','Students'],index},...['One','Two','Three'].map(x=>React.createElement('p',{key:x},x))));
 assert.equal((screen.match(/hidden=""/g)||[]).length,2,'only one report panel visible');
 assert.equal((screen.match(/aria-current="page"/g)||[]).length,1,'one selected destination');
 assert(screen.includes('Quay lại')&&screen.includes('Tiếp theo'),'consistent navigation');
}
console.log('PASS: one teacher panel visible, one active destination, back/next controls.');
