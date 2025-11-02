import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express(), server = http.createServer(app),
      io = new Server(server, { cors: { origin: "*" } });

let players = {}, size = 800;

io.on("connection", s => {
  s.on("join", n => {
    players[s.id] = {id:s.id,name:n||"anon",x:Math.random()*size,y:Math.random()*size,
      hp:100,w:"sword",color:"#"+((1<<24)*Math.random()|0).toString(16),kills:0};
    io.emit("state", players);
  });

  s.on("move", d => {
    const p = players[s.id]; if(!p) return;
    p.x = Math.max(0,Math.min(size,p.x+d.x));
    p.y = Math.max(0,Math.min(size,p.y+d.y));
    io.emit("state", players);
  });

  s.on("hit", v => {
    const a = players[s.id]; if(!a) return;
    Object.values(players).forEach(p=>{
      if(p.id!==a.id){
        const dx=p.x-a.x,dy=p.y-a.y,dist=Math.hypot(dx,dy);
        if(dist<50 && p.hp>0){p.hp-=v;if(p.hp<=0){a.kills++;p.hp=100;p.x=Math.random()*size;p.y=Math.random()*size;}}
      }
    });
    io.emit("state", players);
  });

  s.on("disconnect", ()=>{delete players[s.id]; io.emit("state", players);});
});

server.listen(3000, ()=>console.log("Arena Clash server running on 3000"));
