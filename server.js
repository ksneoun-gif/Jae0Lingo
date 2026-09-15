const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
  let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}
  const file=path.resolve(root,'.'+(url==='/'?'/index.html':url));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  if(!['index.html','theme.css','base.css','experience.js','assets/eddie-3d.jpeg'].includes(path.relative(root,file))){res.writeHead(404);return res.end('Not found');}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);});
}).listen(Number(process.env.PORT)||4173,'0.0.0.0',()=>console.log('재오링고 3D: http://localhost:'+(process.env.PORT||4173)));
