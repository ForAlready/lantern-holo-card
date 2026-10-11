import fs from 'node:fs';
for(const c of JSON.parse(fs.readFileSync('dist/catalog.json')).filter(c=>c.legacy)){
 const target='../index.html#'+c.id;
 fs.writeFileSync(`dist/cards/${c.id}.html`,`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${c.name} · 光影藏册</title><meta http-equiv="refresh" content="0;url=${target}"><script>location.replace(${JSON.stringify(target)})</script><body><a href="${target}">打开${c.name}</a></body></html>\n`);
}
console.log('Original six card links use the shared viewer');
