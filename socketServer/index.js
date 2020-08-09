var WebSocket = require("ws")
var http = require('http')
var natsort = require('./../utils/sort');
var parseParams = require("../utils/url.js").parseParams
var {setLogs} = require('../db/log')
let clients = new Map(), managers = new Map();

function SocketServer() {
    const wss = new WebSocket.Server({ port: 19294 });
    wss.on('connection', function connection(ws, req) {
        let url = req.url.slice(0, req.url.indexOf("?"))
        let params = parseParams(req.url)
        //URL编码
        for (let key in params) {
            params[key] = decodeURI(params[key])
        }

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
                    clients.get(params.id).unDo = []
                }
            }
            //把客户端传的参数存起来
            ws.params = params
            ws.isClient = true
            ws.unDo = new Array()
            clients.set(params.id, ws)
            console.log("已经连接设备数目:", clients.size)
            //上线消息通知每个控制台
            managers.forEach(ws => { if (ws.isAlive) ws.send(JSON.stringify({ data: { cmd: "online", retMsg: params }, from: { group: "server", id: "ALL" } })) })
            // { my: true, action: "online", query: { ...params } }

            ws.on('message', function incoming(message) {
                // console.log('received: %s', message);
                try {
                    result = JSON.parse(message)
                } catch (err) {
                    console.log("err", err)
                    return
                }

                //手机到控制台
                if (result.dis && result.dis.group == "console") {
                    if (result.dis.id == "all") {
                        managers.forEach(w => w.send(message))
                    } else {
                        let t = managers.get(result.dis.id)
                        if (t && t.isAlive) {
                            t.send(message)
                        }
                    }
                }
                //手机到手机
                else if (result.dis && result.dis.group == "phone") {
                    if (result.dis.id == "all") {
                        clients.forEach(w => w.send(message))
                    } else {
                        let t = clients.get(result.dis.id)
                        if (t && t.isAlive) {
                            t.send(message)
                        }
                    }
                }
                //发送到server
                else if (result.dis && result.dis.group == "server") {
                    //更新名字
                    if (result.data && result.data.cmd == "updateDeviceNumber") {
                        ws.params.name = result.data.retMsg
                    }
                }

                //回应之后把日志存储起来 如果是base64的，把值置空再存
                if(result.data.msgType == "base64"){
                    result.data.retMsg = ''
                }
                setLogs(params.id,params.name,JSON.stringify(result))
            });

            ws.on('close', function out(message) {
                managers.forEach(w => { if (w.isAlive) w.send(JSON.stringify({ data: { cmd: "offline", retMsg: ws.params }, from: { group: "server", id: "ALL" } })) })
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

                //控制台到手机
                if (result.dis && result.dis.group == "phone") {
                    //数组id 
                    if (result.dis.id instanceof Array) {
                        result.dis.id.forEach(id => {
                            let t = clients.get(id)
                            if (t && t.isAlive) {
                                if (result.data.cmd == 'runScript' && result.data.UI != '') {
                                    t.send(message.replace('DEVICENUMBER', t.params.name)) 
                                } else{
                                    t.send(message)
                                }
                            } else {
                                t.unDo.push(message)
                            }
                        })
                    }
                    //所有
                    else if (result.dis.id == "all") {
                        clients.forEach(t => {
                            if (t && t.isAlive) {
                                t.send(message)
                            } else {
                                t.unDo.push(message)
                            }
                        })
                    }
                    //单个id
                    else if (typeof result.dis.id == "string") {
                        let t = clients.get(result.dis.id)
                        if (t && t.isAlive) {
                            t.send(message)
                        } else {
                            t.unDo.push(message)
                        }
                    }

                }
                //控制台发送到server
                else if (result.dis && result.dis.group == "server") {
                    //获取所有在线设备
                    if (result.data.cmd == "getAllOnline") {
                        let data = { cmd: "getAllOnline", retMsg: [] }
                        let tempData=[]
                        clients.forEach(w => {
                            if (w.isAlive) {
                                tempData.push(w.params)
                            }
                        })
                        let sorter=natsort()
                        data.retMsg=tempData.sort(function(a,b){
                            return sorter(a.name,b.name)
                        })
                        
                        ws.send(JSON.stringify({
                            data,
                            from: { group: "server", id: "ALL" }
                        }))
                    }
                }

            });
        } else {
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