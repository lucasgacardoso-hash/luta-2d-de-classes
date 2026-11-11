// npm i ws && node server.js
const http=require('http'),fs=require('fs'),path=require('path'),{WebSocketServer}=require('ws');
const srv=http.createServer((q,r)=>fs.readFile(path.join(__dirname,'index.html'),(e,d)=>{r.writeHead(200,{'Content-Type':'text/html'});r.end(d)}));
const wss=new WebSocketServer({server:srv}),rooms={};
wss.on('connection',ws=>{
 ws.on('message',m=>{let d;try{d=JSON.parse(m)}catch{return}
  if(d.t=='create'){let c;do{c=Math.random().toString(36).slice(2,6).toUpperCase()}while(rooms[c]);
   rooms[c]=[ws];ws.room=c;ws.r=0;ws.send(JSON.stringify({t:'role',r:0,room:c}));}
  else if(d.t=='join'){const r=rooms[d.room];
   if(!r)return ws.send('{"t":"none"}');
   if(r.length>=2)return ws.send('{"t":"full"}');
   ws.room=d.room;ws.r=1;r.push(ws);ws.send(JSON.stringify({t:'role',r:1}));
   r.forEach(w=>w.send('{"t":"ready"}'));}
  else(rooms[ws.room]||[]).forEach(w=>w!==ws&&w.readyState==1&&w.send(m.toString()))});
 ws.on('close',()=>{const r=rooms[ws.room];if(!r)return;
  rooms[ws.room]=r.filter(w=>w!==ws);r.forEach(w=>w!==ws&&w.send('{"t":"left"}'));
  if(!rooms[ws.room].length)delete rooms[ws.room]});
});
srv.listen(process.env.PORT||3000,()=>console.log('http://localhost:'+(process.env.PORT||3000)));