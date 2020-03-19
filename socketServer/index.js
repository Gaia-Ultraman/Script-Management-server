var WebSocket = require("ws")
var parseParams = require("../utils/url.js").parseParams
let clients = new Map(), managers = new Map();

function SocketServer() {
    const wss = new WebSocket.Server({ port: 8080 });
    wss.on('connection', function connection(ws, req) {
        let url = req.url.slice(0, req.url.indexOf("?"))
        let params = parseParams(req.url)
        if (url === "/client") {
            //WEBSOCKET 连接URL ,id是必传的，其他参数自己随意命名传都行 ws://localhost:8080/client?id=xxx
            //例如 想多传一个 number和name   ws://localhost:8080/client?id=xxx&number=001&name=xxx
            if (!params || params.id === undefined) {
                ws.send(JSON.stringify({ status: 1, message: "参数缺失" }));
                req.destroy()
                return
            }
            //判断是否连接过，里面是否还有未完成成功发送得命令
            if (clients.has(params.id)) {
                let unDo = clients.get(params.id).unDo
                if (unDo.length > 0) {
                    unDo.forEach(function (obj) {
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
            ws.on('pong', heartbeat);

            ws.on('message', function incoming(message) {
                console.log('received: %s', message);
                ws.send(`你发送的消息是:${message}`)
            });

            ws.on('close', function (code, reason) {
                ws.isAlive = false;
            })

        } else if (url === "/manager") {
            
        } else {
            ws.send(JSON.stringify({ status: 1, message: "参数缺失" }));
            req.destroy()
        }

    });


    //客户端连接的 3分钟一次的心跳
    function heartbeat() {
        this.isAlive = true;
        console.log("heartbeat!")
    }
    const interval = setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, 180 * 1000);


}



module.exports = SocketServer