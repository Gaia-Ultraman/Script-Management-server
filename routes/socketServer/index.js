var WebSocket = require("ws")
var parseParams = require("../../utils/url").parseParams
let clients = new Map(), managers = new Map();

function SocketServer() {
    const wss = new WebSocket.Server({ port: 8080 });
    wss.on('connection', function connection(ws, req) {
        let url = req.url.slice(0, req.url.indexOf("?"))
        let params = parseParams(req.url)
        if (url === "/client") {
            //如果没有传递参数,或者参数没有传够 ws://localhost:8080/client?id=xxx&number=001&name=xxx
            if (!params || params.id === undefined || params.number === undefined || params.name === undefined) {
                ws.send(JSON.stringify({ status: 1, message: "参数缺失" }));
                req.destroy()
                return
            }
            //判断是否连接过，里面是否还有未完成成功发送得命令
            if(clients.has(params.id)){
                let unDo=clients.get(params.id).unDo
                if(unDo.length>0){
                    unDo.forEach(function(obj){
                        ws.send(JSON.stringify(obj))
                    })
                }
            }
            clients.set(params.id, {
                ...params,
                ws: ws,
                unDo: new Array()
            })
            ws.isAlive = true;
            ws.lastTime = new Date().getTime()
            ws.on('pong', heartbeat);

            ws.on('message', function incoming(message) {
                console.log('received: %s', message);
            });

            ws.on('close',function(code, reason){
                ws.isAlive = false;
            })

        } else if (url === "/manager") {
            
        } else {
            req.destroy()
        }

    });

    function heartbeat() {
        this.isAlive = true;
        this.lastTime = new Date().getTime();
        console.log("heartbeat!")
    }

    const interval = setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false || (new Date().getTime() - ws.lastTime)/1000>180*1000){
                return ws.terminate();
            }
        });
    }, 180*1000);
}



module.exports = SocketServer