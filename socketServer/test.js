var WebSocket = require("ws")
let wss=[];
for(let i=0;i<100;i++){
    wss[i]=new WebSocket("ws://localhost:8080/client?id="+i+"&name=xxx");
    wss[i].addEventListener('message', (event) => {
        console.log(`第${i}台设备接受到消息:${event.data}`);
    });
};

// let serverWs=new WebSocket("ws://localhost:8080/manager?id=666")
// setInterval(()=>{
//     serverWs.send(JSON.stringify({dis:{id:"all"},data:{name:"liqiang666"}}))
// },3000)