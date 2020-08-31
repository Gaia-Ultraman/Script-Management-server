var WebSocket = require("ws")
let wss=[],messageNumber=0;
for(let i=0;i<100;i++){
    // wss[i]=new WebSocket("ws://jiawei14755.iicp.net/client?id="+i+"&name=xxx");
    wss[i]=new WebSocket(`ws://localhost:19294/client?id=${i}&name=${i>10?'a':'b'}-${i}`);
    wss[i].addEventListener('message', (event) => {
        messageNumber+=1
        console.log(`第${i}台设备接受到消息:${event.data}  消息总数${messageNumber}`);
    });
};

// let serverWs=new WebSocket("ws://localhost:8080/manager?id=666")
// setInterval(()=>{
//     serverWs.send(JSON.stringify({dis:{id:"all"},data:{name:"liqiang666"}}))
// },3000)