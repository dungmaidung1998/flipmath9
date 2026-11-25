import fs from 'node:fs';
import path from 'node:path';
const source=path.resolve('../dfle-engine/src'),target=path.resolve('lib/dfle');
const changed=fs.readdirSync(source).filter(n=>n.endsWith('.js')&&fs.existsSync(path.join(target,n))&&fs.readFileSync(path.join(source,n),'utf8').replaceAll('\r\n','\n')!==fs.readFileSync(path.join(target,n),'utf8').replaceAll('\r\n','\n'));
if(changed.length){console.error('Engine/web khác nhau:',changed.join(', '));process.exitCode=1;}else console.log('Engine/web đồng bộ.');
