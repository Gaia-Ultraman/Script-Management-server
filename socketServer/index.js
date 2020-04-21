var WebSocket = require("ws")
var http=require('http')
var parseParams = require("../utils/url.js").parseParams
let clients = new Map(), managers = new Map();

function SocketServer() {
    const wss = new WebSocket.Server({ port: 8080,maxPayload: 60000 });
    wss.on('connection', function connection(ws, req) {
        let url = req.url.slice(0, req.url.indexOf("?"))
        let params = parseParams(req.url)
        if (!params || params.id === undefined) {
            ws.send(JSON.stringify({ status: 1, message: "参数缺失" }));
            req.destroy()
            return
        }

        if (url === "/client") {
            //WEBSOCKET 连接URL ,id是必传的，其他参数自己随意命名传都行 ws://localhost:8080/client?id=xxx
            //例如 想多传一个 number和name   ws://localhost:8080/client?id=xxx&number=001&name=xxx

            //判断是否连接过，里面是否还有未完成成功发送得命令
            if (clients.has(params.id)) {
                let unDo = clients.get(params.id).unDo
                if (unDo.length) {
                    unDo.forEach(function (obj) {
                        ws.send(JSON.stringify(obj))
                    })
                }
            }
            ws.isClient = true
            ws.unDo = new Array()
            clients.set(params.id, ws)
            console.log("已经连接设备数目:", clients.size)
            //上线消息通知每个控制台
            managers.forEach(ws => { if (ws.isAlive) ws.send(JSON.stringify({ my:true, action: "inline", query: { ...params } })) })

            ws.on('message', function incoming(message) {
                console.log('received: %s', message);
                // ws.send(`你发送的消息是:${message}  ****已经替你转发到所有服务端`)
                managers.forEach(ws => { if (ws.isAlive) ws.send(message) })
            });

            ws.on('close', function out(message) {
                managers.forEach(ws => { if (ws.isAlive) ws.send(JSON.stringify({ my:true, action: "offline", query: { ...params } })) })
            });


        } else if (url === "/manager") {

            managers.set(params.id, ws)
            ws.on('message', function incoming(message) {
                let result = {}
                try {
                    result = JSON.parse(message)
                } catch (err) {
                    console.log("err", err)
                    return
                }

                //LQ的消息格式 //控制台和接口的消息传递
                if (result.my) {
                    //获取所有手机
                    if (result.action == "getAll") {
                        let t=[]
                        clients.forEach(v=>{
                            if(v.isAlive){
                                t.push({...v.params})
                            }
                        })
                        ws.send(JSON.stringify({my:true,data:t,action:result.action}))
                    }
                    //获取图片
                    else if(result.action == "getPic"){
                        result.data.forEach(id=>{
                            if(clients.has(id)){
                                clients.get(id).send(JSON.stringify({
                                    data:{codeType:"device",cmd:"getSnapshot"},
                                    from:{group:"console",id:ws.params.id}
                                }))
                            }
                        })
                    }
                }

                //JW的消息格式
                if (result && result.dis && result.data) {


                    //=============消息转发==========
                    if (result.dis.id == "all") {
                        //发送到全部
                        clients.forEach(ws => { if (ws.isAlive) ws.send(message) })
                    } else {
                        //一台手机响应一个控制台
                        if (managers.has(result.dis.id)) {
                            managers.get(id).send(message)
                        }
                    }
                    // if (result.dis.id instanceof Array) {
                    //     //分组
                    //     result.dis.id.forEach(id => {
                            
                    //     })
                    // }
                }
                console.log('received: %s', message);
                // ws.send(`你发送的消息是:${message}  ****已经替你转发到所有客户端`)

            });

        } else {
            ws.send(JSON.stringify({ status: 1, message: "参数错误" }));
            req.destroy()
        }

        ws.params = params;
        ws.isAlive = true;
        ws.on('pong', heartbeat);
        ws.on('close', function (code, reason) {
            ws.isAlive = false;
        })

    });


    //客户端连接的 3分钟一次的心跳
    function heartbeat() {
        this.isAlive = true;
        console.log("heartbeat!")
    }
    const interval = setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) {
                if (ws.isClient) {
                    //通知控制台某台机子下线
                    managers.forEach(ws => { if (ws.isAlive) ws.send(JSON.stringify({ status: 0, action: "offline", query: { ...ws.params } })) })
                }
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping();
        });
    }, 180 * 1000);


}



module.exports = SocketServer