var sqlite3 = require('sqlite3')
var moment = require('moment')
var db = new sqlite3.Database("dataBase.db",function(err){
    if(err){
        console.log("数据库创建或打开失败!")
    }
})
// db.run('CREATE TABLE Logs ( deviceId varchar(255),name varchar(255),data text,createTime text )',function(err){
//     console.log('err:',err)
// })
// for(let i=0;i<100;i++){
//     db.run(`INSERT INTO Logs VALUES ('${15654}', 'number${i}', 'data字段','${moment()}')`)
// }

// db.run('CREATE TABLE Logs (id int,name varchar(255),data text)')

// db.run(`INSERT INTO Logs VALUES (1, 'number', 'data字段')`,function(err){
//     console.log('err:',err)
// })

// db.run('DELETE FROM Logs',function(err){
//     console.log("GET",err)
// })

function getLogs(deviceId,limit,cb){
    db.all(`SELECT * from Logs WHERE deviceId ='${deviceId}' LIMIT ${limit}`,function(err, row){
        if(err){
            cb(null)
        }else{
            cb(row)
        }
    })
}


function setLogs(...args){
    db.run(`INSERT INTO Logs VALUES ('${args[0]}', '${args[1]}', '${args[2]}' ,'${moment()}')`,function(err){
        console.log("setLogs err",err)
    })
}

module.exports={getLogs,setLogs}