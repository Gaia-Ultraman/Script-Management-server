var db = require('./index')

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
        
    })
}

module.exports={getLogs,setLogs}